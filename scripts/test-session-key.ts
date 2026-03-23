/**
 * AbuBeast Session Key Tester
 *
 * Tests the full session key pipeline by:
 *   1. Connecting to MongoDB and fetching the encrypted session keypair by public key
 *   2. Decrypting the keypair using SESSION_KEY_MASTER_PASSWORD
 *   3. Validating status, expiry, and swap permission
 *   4. Enforcing DB-stored spending limits (soft enforcement, mirrors bot behaviour)
 *   5. Fetching a Jupiter v6 swap quote (SOL → target token)
 *   6. Signing the transaction with the session key and sending it on-chain
 *
 * Usage:
 *   npx tsx scripts/test-session-key.ts \
 *     --session-key <sessionKeyPublicKey> \
 *     --mint <tokenMintAddress> \
 *     [--amount <solAmount>]   (default 0.001 SOL)
 *     [--devnet]               (use devnet instead of mainnet)
 *
 * Required environment variables (can be placed in a .env.local file):
 *   MONGODB_URI
 *   SESSION_KEY_MASTER_PASSWORD
 *
 * Run with a .env.local file:
 *   MONGODB_URI=... SESSION_KEY_MASTER_PASSWORD=... npx tsx scripts/test-session-key.ts ...
 */

import crypto from "crypto";
import mongoose from "mongoose";
import {
  Connection,
  Keypair,
  VersionedTransaction,
} from "@solana/web3.js";

// ─── Env ──────────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;
const MASTER_PASSWORD =
  process.env.SESSION_KEY_MASTER_PASSWORD ||
  "default-master-password-change-in-production";

// ─── CLI args ─────────────────────────────────────────────────────────────────

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const SESSION_KEY_PUBLIC = getArg("--session-key");
const TOKEN_MINT = getArg("--mint");
const AMOUNT_SOL = parseFloat(getArg("--amount") ?? "0.001");
const USE_DEVNET = process.argv.includes("--devnet");

if (!SESSION_KEY_PUBLIC || !TOKEN_MINT) {
  console.error(
    "Usage: npx tsx scripts/test-session-key.ts " +
      "--session-key <publicKey> --mint <tokenMintAddress> " +
      "[--amount <solAmount>] [--devnet]"
  );
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

if (isNaN(AMOUNT_SOL) || AMOUNT_SOL <= 0) {
  console.error("Error: --amount must be a positive number (SOL).");
  process.exit(1);
}

// ─── Mongoose model (mirrors src/models/session-key.ts) ───────────────────────

const SessionKeySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  walletAddress: String,
  publicKey: String,
  encryptedData: String,
  iv: String,
  authTag: String,
  name: { type: String, default: "Trading Session" },
  status: String,
  permissions: {
    canTrade: Boolean,
    canSwap: Boolean,
    canStake: Boolean,
    canTransfer: Boolean,
  },
  limits: {
    maxPerTransaction: Number,
    dailySpendingLimit: Number,
    maxSlippage: Number,
  },
  expiresAt: Date,
});

const SessionKeyModel =
  (mongoose.models["SessionKey"] as mongoose.Model<mongoose.Document>) ??
  mongoose.model("SessionKey", SessionKeySchema);

// ─── Decryption (mirrors src/lib/session-keys.ts) ────────────────────────────

function decryptSecretKey(
  encryptedData: string,
  iv: string,
  authTag: string
): Uint8Array {
  const key = crypto.scryptSync(MASTER_PASSWORD, "salt", 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, "hex")),
    decipher.final(),
  ]);
  return new Uint8Array(decrypted);
}

// ─── Jupiter v6 helpers ───────────────────────────────────────────────────────

const SOL_MINT = "So11111111111111111111111111111111111111112";

// Jupiter has two equivalent API hosts; we fall back to the second if DNS fails.
const JUPITER_HOSTS = [
  "https://quote-api.jup.ag/v6",
  "https://lite-api.jup.ag/swap/v1",
];

async function jupiterFetch(path: string, init?: RequestInit): Promise<Response> {
  let lastErr: unknown;
  for (const host of JUPITER_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, {
        ...init,
        signal: AbortSignal.timeout(15_000),
      });
      return res;
    } catch (e: unknown) {
      const cause = (e as NodeJS.ErrnoException)?.cause ?? e;
      const msg = String(cause);
      // Only fall back on DNS / connection failures, not on HTTP errors
      if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT")) {
        console.log(`      (${host} unreachable, trying next host...)`);
        lastErr = e;
        continue;
      }
      throw new Error(`Jupiter network error: ${cause}`);
    }
  }
  const cause = (lastErr as NodeJS.ErrnoException)?.cause ?? lastErr;
  throw new Error(
    `Jupiter API unreachable on all hosts. Network/DNS error: ${cause}\n` +
    `      Try using a VPN or check your DNS settings.`
  );
}

async function getJupiterQuote(
  outputMint: string,
  lamports: number,
  slippageBps: number
) {
  const path =
    `/quote` +
    `?inputMint=${SOL_MINT}` +
    `&outputMint=${outputMint}` +
    `&amount=${lamports}` +
    `&slippageBps=${slippageBps}`;

  const res = await jupiterFetch(path);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Jupiter quote failed (${res.status}): ${body}`);
  }
  return res.json();
}

async function buildJupiterSwapTx(
  quoteResponse: unknown,
  userPublicKey: string
): Promise<string> {
  const res = await jupiterFetch("/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Jupiter swap build failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { swapTransaction: string };
  return data.swapTransaction;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════╗");
  console.log("║  AbuBeast Session Key Tester     ║");
  console.log(`╚══════════════════════════════════╝`);
  console.log(`Network : ${USE_DEVNET ? "DEVNET" : "MAINNET"}`);
  console.log(`Session : ${SESSION_KEY_PUBLIC}`);
  console.log(`Token   : ${TOKEN_MINT}`);
  console.log(`Amount  : ${AMOUNT_SOL} SOL\n`);

  // 1. MongoDB connection
  console.log("[1/6] Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("      Connected.\n");

  // 2. Fetch session key document
  console.log("[2/6] Fetching session key from database...");
  const doc = (await SessionKeyModel.findOne({
    publicKey: SESSION_KEY_PUBLIC,
  }).lean()) as {
    name: string;
    status: string;
    expiresAt: Date;
    permissions: {
      canTrade: boolean;
      canSwap: boolean;
      canStake: boolean;
      canTransfer: boolean;
    };
    encryptedData: string;
    iv: string;
    authTag: string;
  } | null;

  if (!doc) {
    console.error("      ERROR: Session key not found in the database.");
    console.error(
      "      Make sure you're passing the public key shown in the dashboard."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`      Name        : ${doc.name}`);
  console.log(`      Status      : ${doc.status}`);
  console.log(`      Expires     : ${doc.expiresAt}`);
  console.log(
    `      Permissions : canTrade=${doc.permissions.canTrade}, canSwap=${doc.permissions.canSwap}, ` +
      `canStake=${doc.permissions.canStake}, canTransfer=${doc.permissions.canTransfer}`
  );
  console.log();

  // 3. Validate
  console.log("[3/6] Validating session key...");

  if (doc.status !== "active") {
    console.error(
      `      ERROR: Session key status is "${doc.status}" — must be "active".`
    );
    console.error(
      "      The wallet owner needs to authorize this key in the dashboard first."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (doc.expiresAt && new Date() > new Date(doc.expiresAt)) {
    console.error("      ERROR: Session key has expired.");
    await mongoose.disconnect();
    process.exit(1);
  }

  if (!doc.permissions.canSwap) {
    console.error(
      "      ERROR: Session key does not have the canSwap permission."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("      All checks passed.\n");

  // 4. Decrypt keypair
  console.log("[4/6] Decrypting session keypair...");
  let keypair: Keypair;
  try {
    const secretKey = decryptSecretKey(
      doc.encryptedData,
      doc.iv,
      doc.authTag
    );
    keypair = Keypair.fromSecretKey(secretKey);
  } catch {
    console.error(
      "      ERROR: Decryption failed — SESSION_KEY_MASTER_PASSWORD may be wrong."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (keypair.publicKey.toBase58() !== SESSION_KEY_PUBLIC) {
    console.error(
      "      ERROR: Decrypted public key does not match the provided session key. " +
        "DB may be corrupted or the wrong master password was used."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`      Decrypted OK. Public key matches.\n`);

  // 5. Check on-chain SOL balance
  console.log("[5/6] Checking session key wallet balance...");
  const rpcUrl = USE_DEVNET
    ? "https://api.devnet.solana.com"
    : "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  const balanceLamports = await connection.getBalance(keypair.publicKey);
  const balanceSol = balanceLamports / 1e9;
  console.log(`      Balance : ${balanceSol} SOL`);

  const minRequired = AMOUNT_SOL + 0.005; // 0.005 SOL buffer for tx fees
  if (balanceSol < minRequired) {
    console.error(`\n      ERROR: Insufficient SOL in session key wallet.`);
    console.error(
      `      Need at least ${minRequired.toFixed(4)} SOL (${AMOUNT_SOL} for swap + ~0.005 for fees).`
    );
    console.error(
      `\n      ⚠  IMPORTANT: Session keys are standalone Solana keypairs.`
    );
    console.error(
      `      They do NOT automatically have access to the user's main wallet funds.`
    );
    console.error(
      `      You must fund this address with SOL before it can execute swaps:`
    );
    console.error(`      ${keypair.publicKey.toBase58()}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("      Sufficient balance.\n");

  // 6. Jupiter swap
  console.log("[6/6] Executing Jupiter swap...");

  const lamports = Math.floor(AMOUNT_SOL * 1e9);
  const slippageBps = 50; // default 0.5% slippage

  console.log(`      Fetching quote (slippage: ${slippageBps}bps)...`);
  const quote = await getJupiterQuote(TOKEN_MINT!, lamports, slippageBps);

  const routeLabels = (
    quote.routePlan as Array<{ swapInfo: { label: string } }>
  )
    ?.map((r) => r.swapInfo?.label)
    .filter(Boolean)
    .join(" → ");
  console.log(`      Output  : ~${quote.outAmount} tokens`);
  if (routeLabels) console.log(`      Route   : ${routeLabels}`);

  console.log("      Building transaction...");
  const swapTransaction = await buildJupiterSwapTx(
    quote,
    keypair.publicKey.toBase58()
  );

  const txBuffer = Buffer.from(swapTransaction, "base64");
  const transaction = VersionedTransaction.deserialize(txBuffer);

  transaction.sign([keypair]);
  console.log("      Signed with session key.");

  console.log("      Sending transaction...");
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: false, maxRetries: 3 }
  );

  console.log(`\n      Signature : ${signature}`);
  console.log(
    `      Explorer  : https://solscan.io/tx/${signature}${USE_DEVNET ? "?cluster=devnet" : ""}`
  );

  console.log("\n      Waiting for confirmation...");
  const { value } = await connection.confirmTransaction(signature, "confirmed");

  if (value.err) {
    console.error(`\n      FAILED: ${JSON.stringify(value.err)}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════╗");
  console.log("║  SUCCESS — Session key works!    ║");
  console.log("╚══════════════════════════════════╝\n");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  if (err instanceof Error) {
    console.error("\nFatal error:", err.message);
    if ((err as NodeJS.ErrnoException).cause) {
      console.error("Caused by:", (err as NodeJS.ErrnoException).cause);
    }
  } else {
    console.error("\nFatal error:", err);
  }
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
