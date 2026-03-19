// Solana token account closure utility
// Equivalent to solana_account_closure.rs

import {
  createCloseAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

class SolanaTokenTransfer {
  constructor() {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    this.connection = new Connection(rpcUrl, "confirmed");

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not set");
    }

    this.owner = this.parseKeypair(privateKey);
  }

  parseKeypair(privateKey) {
    try {
      const bytes = bs58.decode(privateKey);
      return Keypair.fromSecretKey(bytes);
    } catch {
      throw new Error("Unable to parse private key");
    }
  }

  async getHolder(tokenMint) {
    const largest = await this.connection.getTokenLargestAccounts(tokenMint);

    if (largest.value.length === 0) {
      throw new Error("No token accounts found for this mint");
    }

    return largest.value[0].address;
  }

  async transferAndClose(mintAddress) {
    const mint = new PublicKey(mintAddress);
    const destAccount = await this.getHolder(mint);

    console.log("🔄 Starting token transfer process...");
    console.log("Owner:", this.owner.publicKey.toString());
    console.log("Receiver:", destAccount.toString());
    console.log("Token Mint:", mint.toString());
    console.log("-".repeat(50));

    // Get source account (ATA)
    const sourceAccount = await getAssociatedTokenAddress(
      mint,
      this.owner.publicKey
    );

    console.log("Source Account:", sourceAccount.toString());
    console.log("Destination Account:", destAccount.toString());

    // Check source account exists
    const sourceInfo = await this.connection.getAccountInfo(sourceAccount);
    if (!sourceInfo) {
      throw new Error("❌ Source token account does not exist");
    }

    // Get balance
    const balanceInfo = await this.connection.getTokenAccountBalance(
      sourceAccount
    );
    const tokenAmount = balanceInfo.value.uiAmount || 0;
    const rawAmount = BigInt(balanceInfo.value.amount);
    const decimals = balanceInfo.value.decimals;

    console.log("Source Balance:", tokenAmount, "tokens");

    // Transfer if balance > 0
    if (rawAmount > 0n) {
      await this.transferTokens(
        sourceAccount,
        destAccount,
        mint,
        rawAmount,
        decimals
      );
    }

    // Close account
    await this.closeAccount(sourceAccount);
    console.log("\n🎉 Process completed!");
  }

  async transferTokens(source, dest, mint, amount, decimals) {
    // Check destination exists
    const destInfo = await this.connection.getAccountInfo(dest);
    if (!destInfo) {
      throw new Error(
        `❌ Destination token account does not exist!\nExpected: ${dest.toString()}`
      );
    }

    console.log("✅ Destination account exists");
    console.log(
      "🚀 Transferring",
      Number(amount) / Math.pow(10, decimals),
      "tokens..."
    );

    // Create transfer instruction
    const transferIx = createTransferCheckedInstruction(
      source,
      mint,
      dest,
      this.owner.publicKey,
      Number(amount),
      decimals,
      [],
      TOKEN_PROGRAM_ID
    );

    await this.sendTransaction([transferIx], "Transfer");
    console.log("✅ Transfer confirmed successfully!");
  }

  async closeAccount(account) {
    console.log("🔒 Closing source token account...");

    const closeIx = createCloseAccountInstruction(
      account,
      this.owner.publicKey,
      this.owner.publicKey,
      [],
      TOKEN_PROGRAM_ID
    );

    await this.sendTransaction([closeIx], "Account closure");
    console.log("✅ Token account closed successfully!");
    console.log("💰 SOL rent returned to owner");
  }

  async sendTransaction(instructions, description) {
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = this.owner.publicKey;

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.owner]
    );

    console.log(`${description} Transaction:`, signature);
  }
}

export async function transferAndClose(tokenMint) {
  console.log("[+] Target Token Mint:", tokenMint);

  const transfer = new SolanaTokenTransfer();
  await transfer.transferAndClose(tokenMint);
}
