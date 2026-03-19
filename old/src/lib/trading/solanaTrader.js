/**
 * Solana Trader - Integrated Version
 * Handles Solana token trading with Jupiter aggregator
 * Integrated from shystem/auto_sell_js_ported
 */

import {
  Connection,
  Keypair,
  VersionedTransaction,
  TransactionMessage,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import bs58 from 'bs58';
import axios from 'axios';

const SENDER_ENDPOINT = "http://ewr-sender.helius-rpc.com/fast";
const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=";
const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

const TIP_ACCOUNTS = [
  "4ACfpUFoaSD9bfPdeu6DBt89gB6ENTeHBXCAi87NhDEE",
  "D2L6yPZ2FmmmTKPgzaMKdhu6EWZcTpLy1Vhx8uvZe7NZ",
  "9bnz4RShgq1hAnLnZbP8kbgBg1kEmcJBYQq3gQbmnSta",
  "5VY91ws6B2hMmBFRsXkoAAdsPHBJwRfBht4DXox3xkwn",
  "2nyhqdwKcJZR2vcqCyrYsaPVdAnFoJjiksCXJ7hfEYgD",
  "2q5pghRs6arqVjRvT5gfgWfWcHWmw1ZuCzphgd5KfWGJ",
  "wyvPkWjVZz1M8fHQnMMCDTQDbkManefNNhweYk5WkcF",
  "3KCKozbAaF75qEU33jtzozcJ29yJuaLJTy2jFdzUY8bT",
  "4vieeGHPYPG2MmyPRcYjdiDmmhN3ww7hsFNap8pVN3Ey",
  "4TQLFNWK8AovT1gFvda5jfw2oJeRMKEmw7aH6MGBJ3or",
];

export class SolanaTrader {
  constructor(config) {
    if (!config.heliusKey) {
      throw new Error("HELIUS_KEY environment variable must be set");
    }

    const rpcUrl = `${HELIUS_RPC_URL}${config.heliusKey}`;
    this.rpcClient = new Connection(rpcUrl, "confirmed");
    this.heliusApiKey = config.heliusKey;
    
    // Session-based: keypair is provided per-transaction, not stored
    this.keypair = null;

    console.log(`✅ SolanaTrader initialized (session-based mode)`);
  }
  
  /**
   * Set keypair for current transaction (from session key)
   */
  setKeypair(keypair) {
    this.keypair = keypair;
  }

  async getBalance(walletPublicKey, tokenMint = null) {
    try {
      const publicKey = typeof walletPublicKey === 'string' 
        ? new PublicKey(walletPublicKey) 
        : walletPublicKey;
        
      if (!tokenMint) {
        // Get SOL balance
        const balance = await this.rpcClient.getBalance(publicKey);
        return balance / 1_000_000_000;
      } else {
        // Get SPL token balance
        const mintPubkey = new PublicKey(tokenMint);
        const tokenAccounts = await this.rpcClient.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: mintPubkey }
        );

        if (tokenAccounts.value.length === 0) {
          return 0.0;
        }

        let totalBalance = 0;
        for (const account of tokenAccounts.value) {
          const amount = account.account.data.parsed.info.tokenAmount.uiAmount || 0;
          totalBalance += amount;
        }

        return totalBalance;
      }
    } catch (error) {
      console.error(`Error getting balance: ${error.message}`);
      throw error;
    }
  }

  async getTokenDecimals(mintStr) {
    if (mintStr === WRAPPED_SOL_MINT) {
      return 9;
    }

    try {
      const mintPubkey = new PublicKey(mintStr);
      const supply = await this.rpcClient.getTokenSupply(mintPubkey);
      return supply.value.decimals;
    } catch (error) {
      console.error(`Error getting token decimals: ${error.message}`);
      throw error;
    }
  }

  async sellToken(
    keypair,
    tokenMint,
    outputMint,
    amount,
    slippageBps = 1000,
    highPriority = false,
    useJito = false
  ) {
    console.log("\n🔄 Starting sell operation...");
    console.log(`   Input: ${tokenMint.substring(0, 8)}...`);
    console.log(`   Output: ${outputMint.substring(0, 8)}...`);
    console.log(`   Amount: ${amount}`);
    console.log(`   Slippage: ${slippageBps / 100}%`);
    console.log(`   High Priority: ${highPriority}`);
    console.log(`   Use Jito: ${useJito}`);

    // Get token decimals
    const inputDecimals = await this.getTokenDecimals(tokenMint);
    const amountLamports = Math.floor(amount * Math.pow(10, inputDecimals));

    console.log(`   Amount (lamports): ${amountLamports}`);

    // Get quote from Jupiter
    console.log("\n📊 Fetching quote from Jupiter...");
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?` +
      `inputMint=${tokenMint}&` +
      `outputMint=${outputMint}&` +
      `amount=${amountLamports}&` +
      `slippageBps=${slippageBps}`;

    const quoteResponse = await axios.get(quoteUrl);
    const quoteData = quoteResponse.data;

    console.log(`✅ Quote received`);
    console.log(`   Out amount: ${quoteData.outAmount}`);
    console.log(`   Price impact: ${quoteData.priceImpactPct}%`);

    // Get swap transaction
    console.log("\n🔨 Building swap transaction...");
    const swapPayload = {
      quoteResponse: quoteData,
      userPublicKey: keypair.publicKey.toString(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: highPriority ? 100000 : 1000,
    };

    const swapResponse = await axios.post(
      "https://quote-api.jup.ag/v6/swap",
      swapPayload
    );

    const { swapTransaction } = swapResponse.data;
    const transactionBuf = Buffer.from(swapTransaction, "base64");
    let transaction = VersionedTransaction.deserialize(transactionBuf);

    // Add Jito tip if enabled
    if (useJito) {
      console.log("💰 Adding Jito tip...");
      const tipAccount = TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];
      const tipAmount = highPriority ? 10000 : 1000;

      const tipInstruction = SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(tipAccount),
        lamports: tipAmount,
      });

      const message = TransactionMessage.decompile(transaction.message);
      message.instructions.push(tipInstruction);

      const recompiledMessage = message.compileToV0Message();
      transaction = new VersionedTransaction(recompiledMessage);
    }

    // Sign transaction with user's session key
    transaction.sign([keypair]);

    // Send transaction
    console.log("\n📤 Sending transaction...");
    const signature = await this.sendTransaction(transaction, useJito);

    console.log(`✅ Transaction sent: ${signature}`);
    console.log(`   View on Solscan: https://solscan.io/tx/${signature}`);

    return signature;
  }

  async buyToken(
    keypair,
    inputMint,
    tokenMint,
    amountSol,
    slippageBps = 1000,
    highPriority = false,
    useJito = false
  ) {
    console.log("\n🔄 Starting buy operation...");
    console.log(`   Input: ${inputMint.substring(0, 8)}...`);
    console.log(`   Output: ${tokenMint.substring(0, 8)}...`);
    console.log(`   Amount SOL: ${amountSol}`);

    const inputDecimals = await this.getTokenDecimals(inputMint);
    const amountLamports = Math.floor(amountSol * Math.pow(10, inputDecimals));

    // Get quote
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?` +
      `inputMint=${inputMint}&` +
      `outputMint=${tokenMint}&` +
      `amount=${amountLamports}&` +
      `slippageBps=${slippageBps}`;

    const quoteResponse = await axios.get(quoteUrl);
    const quoteData = quoteResponse.data;

    console.log(`✅ Quote received - Out amount: ${quoteData.outAmount}`);

    // Get swap transaction
    const swapPayload = {
      quoteResponse: quoteData,
      userPublicKey: keypair.publicKey.toString(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: highPriority ? 100000 : 1000,
    };

    const swapResponse = await axios.post(
      "https://quote-api.jup.ag/v6/swap",
      swapPayload
    );

    const { swapTransaction } = swapResponse.data;
    const transactionBuf = Buffer.from(swapTransaction, "base64");
    let transaction = VersionedTransaction.deserialize(transactionBuf);

    if (useJito) {
      const tipAccount = TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];
      const tipAmount = highPriority ? 10000 : 1000;

      const tipInstruction = SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(tipAccount),
        lamports: tipAmount,
      });

      const message = TransactionMessage.decompile(transaction.message);
      message.instructions.push(tipInstruction);

      const recompiledMessage = message.compileToV0Message();
      transaction = new VersionedTransaction(recompiledMessage);
    }

    // Sign with user's session key
    transaction.sign([keypair]);

    const signature = await this.sendTransaction(transaction, useJito);
    console.log(`✅ Buy transaction sent: ${signature}`);

    return signature;
  }

  async sendTransaction(transaction, useJito = false) {
    const serialized = transaction.serialize();

    if (useJito) {
      // Send via Jito
      const jitoUrl = "https://mainnet.block-engine.jito.wtf/api/v1/transactions";
      const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
        params: [bs58.encode(serialized), { encoding: "base58" }],
      };

      const response = await axios.post(jitoUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.error) {
        throw new Error(`Jito error: ${JSON.stringify(response.data.error)}`);
      }

      return response.data.result;
    } else {
      // Send via Helius
      const signature = await this.rpcClient.sendRawTransaction(serialized, {
        skipPreflight: true,
        maxRetries: 2,
      });

      return signature;
    }
  }

  async confirmTransaction(signature, timeout = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.rpcClient.getSignatureStatus(signature);

        if (status?.value?.confirmationStatus === "confirmed" ||
            status?.value?.confirmationStatus === "finalized") {
          return true;
        }

        if (status?.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
      } catch (error) {
        console.warn(`Error checking transaction status: ${error.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Transaction confirmation timeout");
  }
}
