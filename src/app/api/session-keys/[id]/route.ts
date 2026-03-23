import { getAuthUser } from "@/lib/auth";
import { decryptSecretKey } from "@/lib/session-keys";
import dbConnect from "@/lib/mongodb";
import SessionKey from "@/models/session-key";
import {
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { getConnection, isRpcTimeoutError } from "@/lib/solana-rpc";

const SOL_MINT = "So11111111111111111111111111111111111111112";
// Minimum token value in SOL to bother selling
const SELL_THRESHOLD_SOL = 0.0001;
// A well-known burn address for dust disposal (the System Program address — tokens sent here are unrecoverable)
const DUST_RECEIVER = new PublicKey("11111111111111111111111111111112");

interface TokenAccount {
  pubkey: PublicKey;
  mint: string;
  rawAmount: string;
  decimals: number;
  uiAmount: number;
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

/** Poll for transaction confirmation (avoids flaky WebSocket subscriptions on public RPCs) */
async function pollConfirmation(
  connection: Connection,
  signature: string,
  lastValidBlockHeight: number
): Promise<string> {
  const POLL_INTERVAL_MS = 2_000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value } = await connection.getSignatureStatuses([signature]);
    const status = value?.[0];
    if (status) {
      if (status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }
      if (
        status.confirmationStatus === "confirmed" ||
        status.confirmationStatus === "finalized"
      ) {
        return signature;
      }
    }
    const blockHeight = await connection.getBlockHeight("confirmed");
    if (blockHeight > lastValidBlockHeight) {
      throw new Error(
        `Transaction ${signature.slice(0, 12)}… expired: block height exceeded`
      );
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

async function fetchTokenPrices(
  mints: string[]
): Promise<{ solPriceUsd: number; prices: Record<string, number> }> {
  const ids = [...new Set([...mints, SOL_MINT])].join(",");
  const res = await fetch(`https://api.jup.ag/price/v2?ids=${ids}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Jupiter price API error");
  const json = (await res.json()) as {
    data: Record<string, { price: string }>;
  };
  const solPriceUsd = parseFloat(json.data[SOL_MINT]?.price ?? "0");
  const prices: Record<string, number> = {};
  for (const m of mints) {
    prices[m] = parseFloat(json.data[m]?.price ?? "0");
  }
  return { solPriceUsd, prices };
}

/** Swap a token to SOL via Jupiter. Returns tx signature. */
async function swapTokenToSol(
  connection: Connection,
  sessionKeypair: Keypair,
  mint: string,
  rawAmount: string
): Promise<string> {
  // 1. Get quote
  const quoteUrl = new URL("https://quote-api.jup.ag/v6/quote");
  quoteUrl.searchParams.set("inputMint", mint);
  quoteUrl.searchParams.set("outputMint", SOL_MINT);
  quoteUrl.searchParams.set("amount", rawAmount);
  quoteUrl.searchParams.set("slippageBps", "300"); // 3% slippage

  const quoteRes = await fetch(quoteUrl.toString());
  if (!quoteRes.ok) throw new Error(`Jupiter quote failed: ${quoteRes.status}`);
  const quote = await quoteRes.json();

  // 2. Get swap transaction
  const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: sessionKeypair.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
    }),
  });
  if (!swapRes.ok) throw new Error(`Jupiter swap failed: ${swapRes.status}`);
  const { swapTransaction } = (await swapRes.json()) as { swapTransaction: string };

  // 3. Deserialize, sign, send
  const txBuf = Buffer.from(swapTransaction, "base64");
  const vTx = VersionedTransaction.deserialize(txBuf);
  vTx.sign([sessionKeypair]);

  // Get blockhash BEFORE sending for accurate confirmation tracking
  const { lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const sig = await connection.sendRawTransaction(vTx.serialize(), {
    skipPreflight: false,
    maxRetries: 2,
  });
  return await pollConfirmation(connection, sig, lastValidBlockHeight);
}

/** Send + confirm a legacy Transaction with retry logic. */
async function sendAndConfirm(
  connection: Connection,
  tx: Transaction,
  signers: Keypair[],
  maxAttempts = 3
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = signers[0].publicKey;
      tx.sign(...signers);
      const sig = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        maxRetries: 2,
      });
      return await pollConfirmation(connection, sig, lastValidBlockHeight);
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        console.warn(`sendAndConfirm attempt ${attempt}/${maxAttempts} failed, retrying…`);
      }
    }
  }
  throw lastErr;
}

// ────────────────────────────────────────────────────────────────────
// DELETE handler
// ────────────────────────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid session key ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const sessionKey = await SessionKey.findOne({
      _id: id,
      userId: authUser.userId,
      status: { $in: ["pending", "active"] },
    });

    if (!sessionKey) {
      return NextResponse.json(
        { error: "Session key not found or already revoked" },
        { status: 404 }
      );
    }

    const logs: string[] = [];
    const swapSignatures: string[] = [];
    const closeSignatures: string[] = [];
    let solDrainSignature: string | null = null;
    let drainError: string | null = null;

    try {
      const failedRpcUrls = new Set<string>();
      const MAX_RPC_RETRIES = 3;
      let rpcAttempt = 0;
      let currentRpcUrl = "";

      // Retry the entire drain with a different RPC if we hit a timeout
      while (rpcAttempt < MAX_RPC_RETRIES) {
        rpcAttempt++;
        try {
      const connection = await getConnection("confirmed", failedRpcUrls);
      currentRpcUrl = connection.rpcEndpoint;

      const sessionKeypair = Keypair.fromSecretKey(
        decryptSecretKey({
          encryptedData: sessionKey.encryptedData,
          iv: sessionKey.iv,
          authTag: sessionKey.authTag,
        })
      );
      const userWallet = new PublicKey(sessionKey.walletAddress);

      // ── Step 1: Discover all SPL token accounts ───────────────────────
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        sessionKeypair.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const allTokens: TokenAccount[] = tokenAccounts.value.map(
        ({ pubkey, account }) => {
          const info = account.data.parsed.info;
          return {
            pubkey,
            mint: info.mint as string,
            rawAmount: info.tokenAmount.amount as string,
            decimals: info.tokenAmount.decimals as number,
            uiAmount: info.tokenAmount.uiAmount as number,
          };
        }
      );

      logs.push(`Found ${allTokens.length} token account(s)`);

      // ── Step 2: Price lookup ──────────────────────────────────────────
      const nonEmptyTokens = allTokens.filter(
        (t) => t.rawAmount !== "0" && t.uiAmount > 0
      );

      let tokensToSell: TokenAccount[] = [];
      let dustTokens: TokenAccount[] = [];
      // Token accounts that already have zero balance — just need closing
      const emptyAccounts = allTokens.filter(
        (t) => t.rawAmount === "0" || t.uiAmount === 0
      );

      if (nonEmptyTokens.length > 0) {
        try {
          const { solPriceUsd, prices } = await fetchTokenPrices(
            nonEmptyTokens.map((t) => t.mint)
          );

          if (solPriceUsd > 0) {
            for (const token of nonEmptyTokens) {
              const usdVal = token.uiAmount * (prices[token.mint] ?? 0);
              const solVal = usdVal / solPriceUsd;
              if (solVal >= SELL_THRESHOLD_SOL) {
                tokensToSell.push(token);
              } else {
                dustTokens.push(token);
              }
            }
          } else {
            // Can't determine values — treat all as dust
            dustTokens = nonEmptyTokens;
          }
        } catch {
          // Price API failed — treat everything as dust
          dustTokens = nonEmptyTokens;
        }
      }

      logs.push(
        `Tokens to sell: ${tokensToSell.length}, dust: ${dustTokens.length}, empty: ${emptyAccounts.length}`
      );

      // ── Step 3: Sell valuable tokens via Jupiter ──────────────────────
      for (const token of tokensToSell) {
        try {
          const sig = await swapTokenToSol(
            connection,
            sessionKeypair,
            token.mint,
            token.rawAmount
          );
          swapSignatures.push(sig);
          logs.push(`Sold ${token.mint.slice(0, 8)}… → SOL (${sig.slice(0, 12)}…)`);
        } catch (err) {
          console.error(`Swap failed for ${token.mint}:`, err);
          logs.push(`Swap failed for ${token.mint.slice(0, 8)}…`);
          // If swap failed, treat as dust so we still close the account
          dustTokens.push(token);
        }
      }

      // ── Step 4 & 5: Close all token accounts ─────────────────────────
      // After selling, previously-sold accounts should now have 0 balance.
      // Combine: sold accounts + empty accounts + dust accounts
      const allAccountsToClose = [...tokensToSell, ...emptyAccounts, ...dustTokens];
      // Deduplicate by pubkey
      const seen = new Set<string>();
      const uniqueToClose = allAccountsToClose.filter((t) => {
        const k = t.pubkey.toBase58();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      for (const token of uniqueToClose) {
        try {
          // First attempt: close directly
          const closeTx = new Transaction().add(
            createCloseAccountInstruction(
              token.pubkey,
              sessionKeypair.publicKey, // SOL rent goes back to session key
              sessionKeypair.publicKey  // authority
            )
          );
          const sig = await sendAndConfirm(connection, closeTx, [sessionKeypair]);
          closeSignatures.push(sig);
        } catch {
          // Close failed — likely has dust balance. Transfer dust out first.
          try {
            // Get a fresh view of the account balance
            const acctInfo = await connection.getParsedAccountInfo(token.pubkey);
            const currentAmount =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (acctInfo.value?.data as any)?.parsed?.info?.tokenAmount?.amount ?? "0";

            if (currentAmount !== "0") {
              const mintPubkey = new PublicKey(token.mint);
              const dustAta = await getAssociatedTokenAddress(
                mintPubkey,
                DUST_RECEIVER,
                true // allowOwnerOffCurve — needed for system program address
              );

              // Build combined tx: transfer dust + close account
              const dustTx = new Transaction();

              // Check if the dust receiver ATA exists
              const dustAtaInfo = await connection.getAccountInfo(dustAta);
              if (!dustAtaInfo) {
                // We can't create an ATA owned by the system program.
                // Instead, just burn by transferring to a random throwaway.
                // Use a known "null" token account trick: transfer to self is 0, doesn't help.
                // Best effort: just transfer to the user's ATA (they can ignore it)
                const userAta = await getAssociatedTokenAddress(
                  mintPubkey,
                  userWallet
                );
                const userAtaInfo = await connection.getAccountInfo(userAta);
                if (userAtaInfo) {
                  dustTx.add(
                    createTransferInstruction(
                      token.pubkey,
                      userAta,
                      sessionKeypair.publicKey,
                      BigInt(currentAmount)
                    )
                  );
                }
              } else {
                dustTx.add(
                  createTransferInstruction(
                    token.pubkey,
                    dustAta,
                    sessionKeypair.publicKey,
                    BigInt(currentAmount)
                  )
                );
              }

              // Now close the account
              dustTx.add(
                createCloseAccountInstruction(
                  token.pubkey,
                  sessionKeypair.publicKey,
                  sessionKeypair.publicKey
                )
              );

              const sig = await sendAndConfirm(connection, dustTx, [sessionKeypair]);
              closeSignatures.push(sig);
              logs.push(`Dust-transferred & closed ${token.mint.slice(0, 8)}…`);
            }
          } catch (innerErr) {
            console.error(`Failed to close account for ${token.mint}:`, innerErr);
            logs.push(`Failed to close ${token.mint.slice(0, 8)}…`);
          }
        }
      }

      // ── Step 6: Drain all remaining SOL to user wallet ────────────────
      // We must transfer exactly (balance - txFee) so the account ends at 0 lamports
      // and gets deleted. Leaving any amount between 0 and rent-exempt minimum fails.
      const balanceLamports = await connection.getBalance(
        sessionKeypair.publicKey
      );

      // Standard fee for a single-signer legacy transaction is 5000 lamports
      const TX_FEE_LAMPORTS = 5000;

      if (balanceLamports > TX_FEE_LAMPORTS) {
        const transferLamports = balanceLamports - TX_FEE_LAMPORTS;
        const solTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: sessionKeypair.publicKey,
            toPubkey: userWallet,
            lamports: transferLamports,
          })
        );
        solDrainSignature = await sendAndConfirm(connection, solTx, [
          sessionKeypair,
        ]);
        logs.push(
          `Drained ${(transferLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL to wallet`
        );
      } else {
        logs.push("No SOL to drain (balance too low to cover fee)");
      }
      // Drain succeeded — break out of the retry loop
      break;
        } catch (rpcErr) {
          if (isRpcTimeoutError(rpcErr) && rpcAttempt < MAX_RPC_RETRIES) {
            failedRpcUrls.add(currentRpcUrl);
            console.warn(
              `RPC timeout on attempt ${rpcAttempt}/${MAX_RPC_RETRIES}, blacklisting ${currentRpcUrl} and retrying…`
            );
            // Clear partial state for retry
            logs.length = 0;
            swapSignatures.length = 0;
            closeSignatures.length = 0;
            solDrainSignature = null;
            continue;
          }
          throw rpcErr; // Not a timeout or out of retries — propagate
        }
      } // end while
    } catch (err) {
      console.error("Session key drain error:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      // Sanitize: don't leak full HTML error pages to the client
      drainError = /<!DOCTYPE|<html/i.test(rawMsg)
        ? "RPC node returned a gateway error — funds may still be in the session key. Try again later."
        : rawMsg;
    }

    sessionKey.status = "revoked";
    await sessionKey.save();

    return NextResponse.json({
      success: true,
      logs,
      ...(swapSignatures.length > 0 && { swapSignatures }),
      ...(closeSignatures.length > 0 && { closeSignatures }),
      ...(solDrainSignature && { solDrainSignature }),
      ...(drainError && { drainWarning: drainError }),
    });
  } catch (error) {
    console.error("Session key revoke error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
