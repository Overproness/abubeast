// Solana trading implementation with Jupiter and Helius integration
// Equivalent to solana_trade.rs

import {
  AddressLookupTableAccount,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

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

export class TxResult {
  constructor(success, signature = null, error = null) {
    this.success = success;
    this.signature = signature;
    this.error = error;
    this.buyResult = null;
    this.sellResult = null;
    this.totalTime = null;
  }

  static success(signature) {
    return new TxResult(true, signature, null);
  }

  static failure(error) {
    return new TxResult(false, null, error);
  }
}

export class SolanaTrader {
  constructor() {
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (!heliusApiKey) {
      throw new Error("HELIUS_API_KEY environment variable is missing");
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is missing");
    }

    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    this.connection = new Connection(rpcUrl, "confirmed");
    this.heliusApiKey = heliusApiKey;
    this.keypair = this.parseKeypair(privateKey);
  }

  parseKeypair(privateKey) {
    try {
      // Try base58 format
      const decoded = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decoded);
    } catch {
      try {
        // Try JSON array format
        const bytes = JSON.parse(privateKey);
        return Keypair.fromSecretKey(new Uint8Array(bytes));
      } catch {
        try {
          // Try hex format
          const key = privateKey.startsWith("0x")
            ? privateKey.slice(2)
            : privateKey;
          const bytes = Buffer.from(key, "hex");
          return Keypair.fromSecretKey(bytes);
        } catch {
          throw new Error("Invalid Private Key Format");
        }
      }
    }
  }

  async getBalance(tokenMint = null) {
    const pubkey = this.keypair.publicKey;

    if (tokenMint && tokenMint !== WRAPPED_SOL_MINT) {
      // Fetch SPL Token Balance
      try {
        const mintPubkey = new PublicKey(tokenMint);
        const tokenAccounts =
          await this.connection.getParsedTokenAccountsByOwner(pubkey, {
            mint: mintPubkey,
          });

        if (tokenAccounts.value.length === 0) {
          return 0;
        }

        let totalAmount = 0;
        for (const account of tokenAccounts.value) {
          const uiAmount =
            account.account.data.parsed.info.tokenAmount.uiAmount;
          totalAmount += uiAmount || 0;
        }
        return totalAmount;
      } catch (error) {
        console.error("Error getting token balance:", error.message);
        return 0;
      }
    } else {
      // Fetch Native SOL Balance
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1_000_000_000;
    }
  }

  async getTokenDecimals(mintStr) {
    if (mintStr === WRAPPED_SOL_MINT) {
      return 9;
    }

    try {
      const mintPubkey = new PublicKey(mintStr);
      const supply = await this.connection.getTokenSupply(mintPubkey);
      return supply.value.decimals;
    } catch (error) {
      console.error("Error getting token decimals:", error.message);
      return 9; // Default to 9
    }
  }

  async getQuote(inputMint, outputMint, amount, slippageBps) {
    console.log(`Getting Jupiter quote for ${inputMint} -> ${outputMint}`);

    const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.error) {
        throw new Error(`Jupiter Refused Quote: ${data.error}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  }

  async getSwapTransaction(quote) {
    console.log("Getting swap transaction from Jupiter");

    const url = "https://lite-api.jup.ag/swap/v1/swap";

    const payload = {
      quoteResponse: quote,
      userPublicKey: this.keypair.publicKey.toString(),
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 1_000_000,
          priorityLevel: "veryHigh",
        },
      },
    };

    try {
      const response = await axios.post(url, payload);

      if (!response.data.swapTransaction) {
        throw new Error("No swap transaction in response");
      }

      return response.data.swapTransaction;
    } catch (error) {
      throw new Error(`Jupiter API Error: ${error.message}`);
    }
  }

  async addTipAndSign(swapTransactionBase64, tipLamports) {
    // Deserialize the transaction
    const txBytes = Buffer.from(swapTransactionBase64, "base64");
    const originalTx = VersionedTransaction.deserialize(txBytes);

    // Add tip instruction
    const tipAccountStr =
      TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];
    const tipAccount = new PublicKey(tipAccountStr);

    console.log(
      `Adding tip: ${tipLamports} lamports to ${tipAccount.toString()}`
    );

    const transferIx = SystemProgram.transfer({
      fromPubkey: this.keypair.publicKey,
      toPubkey: tipAccount,
      lamports: tipLamports,
    });

    // Get address lookup table accounts from original transaction
    const addressLookupTableAccounts = [];
    for (const lookup of originalTx.message.addressTableLookups) {
      const accountInfo = await this.connection.getAccountInfo(
        lookup.accountKey
      );
      if (accountInfo) {
        const lookupTable = new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(accountInfo.data),
        });
        addressLookupTableAccounts.push(lookupTable);
      }
    }

    // Create new message with tip
    const instructions = [transferIx];

    const messageV0 = new TransactionMessage({
      payerKey: this.keypair.publicKey,
      recentBlockhash: originalTx.message.recentBlockhash,
      instructions: instructions,
    }).compileToV0Message(addressLookupTableAccounts);

    // Create and sign transaction
    const newTx = new VersionedTransaction(messageV0);
    newTx.sign([this.keypair]);

    return newTx;
  }

  async broadcastWithSender(transaction) {
    console.log("Broadcasting via Helius Sender");

    const txBytes = transaction.serialize();
    const base64Tx = Buffer.from(txBytes).toString("base64");

    const senderEndpoints = [
      `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`,
      `https://ewr-sender.helius-rpc.com/fast/?api-key=${this.heliusApiKey}`,
    ];

    const payload = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "sendTransaction",
      params: [
        base64Tx,
        {
          encoding: "base64",
          skipPreflight: true,
          maxRetries: 0,
        },
      ],
    };

    let lastError = null;

    // Try each endpoint with retries
    for (const [idx, endpoint] of senderEndpoints.entries()) {
      console.log(
        `Trying Helius endpoint ${idx + 1}/${senderEndpoints.length}`
      );

      for (let retry = 0; retry < 3; retry++) {
        try {
          const response = await axios.post(endpoint, payload, {
            timeout: 20000,
          });

          if (response.data.error) {
            lastError = `Sender API Error: ${JSON.stringify(
              response.data.error
            )}`;
            console.warn(lastError);
            continue;
          }

          if (response.data.result) {
            console.log("Transaction sent successfully:", response.data.result);
            return response.data.result;
          }

          lastError = "No result in response";
          console.warn(lastError);
        } catch (error) {
          lastError = `Network error (attempt ${retry + 1}/3): ${
            error.message
          }`;
          console.warn(lastError);

          if (retry < 2) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
    }

    throw new Error(`All Helius endpoints failed. Last error: ${lastError}`);
  }

  async confirmTransaction(signature) {
    console.log("Waiting for confirmation:", signature);

    const startTime = Date.now();
    const timeout = 30000; // 30 seconds

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.connection.getSignatureStatus(signature);

        if (status.value) {
          const confirmationStatus = status.value.confirmationStatus;
          if (
            confirmationStatus === "confirmed" ||
            confirmationStatus === "finalized"
          ) {
            console.log("✅ Transaction Confirmed:", signature);
            return true;
          }
        }
      } catch (error) {
        // Ignore errors and keep trying
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.warn("Confirmation timed out for", signature);
    return false;
  }

  async executeSwap(
    inputMint,
    outputMint,
    amountRaw,
    slippageBps,
    jitoTipLamports
  ) {
    try {
      // 1. Get Quote
      const quote = await this.getQuote(
        inputMint,
        outputMint,
        amountRaw,
        slippageBps
      );

      // 2. Get Swap Transaction
      const swapTxBase64 = await this.getSwapTransaction(quote);

      // 3. Add Tip & Sign
      const finalTip = Math.max(jitoTipLamports, 1000);
      const signedTx = await this.addTipAndSign(swapTxBase64, finalTip);

      // 4. Broadcast
      const signature = await this.broadcastWithSender(signedTx);
      console.log("Sent! Signature:", signature);

      // 5. Confirm
      const confirmed = await this.confirmTransaction(signature);

      if (confirmed) {
        return TxResult.success(signature);
      } else {
        return new TxResult(false, signature, "Confirmation Timeout");
      }
    } catch (error) {
      return TxResult.failure(error.message);
    }
  }

  async buyToken(
    tokenMint,
    solAmount,
    slippage,
    waitForFinalized,
    highPriority
  ) {
    console.log(`Buying ${tokenMint} with ${solAmount} SOL`);

    const amountLamports = Math.floor(solAmount * 1_000_000_000);

    // Check balance
    const currentSol = await this.getBalance();
    if (currentSol < solAmount + 0.002) {
      return TxResult.failure(
        `Insufficient SOL. Have ${currentSol}, need ${solAmount}`
      );
    }

    const tip = highPriority ? 200_000 : 100_000;

    return await this.executeSwap(
      WRAPPED_SOL_MINT,
      tokenMint,
      amountLamports,
      Math.floor(slippage * 100),
      tip
    );
  }

  async sellToken(
    tokenMint,
    sellPercentage,
    slippage,
    waitForFinalized,
    highPriority
  ) {
    console.log(`Selling ${sellPercentage}% of ${tokenMint}`);

    // 1. Get balance
    const balance = await this.getBalance(tokenMint);
    if (balance <= 0) {
      return TxResult.failure("Zero Balance");
    }

    // 2. Calculate amount
    const decimals = await this.getTokenDecimals(tokenMint);
    const amountToSell = balance * (sellPercentage / 100);
    const amountRaw = Math.floor(amountToSell * Math.pow(10, decimals));

    if (amountRaw === 0) {
      return TxResult.failure("Calculated amount is 0");
    }

    const tip = highPriority ? 200_000 : 100_000;

    return await this.executeSwap(
      tokenMint,
      WRAPPED_SOL_MINT,
      amountRaw,
      Math.floor(slippage * 100),
      tip
    );
  }

  async executeBuyPhase(tokenMint, buyAmountSol, maxPriceImpact, highPriority) {
    return await this.buyToken(
      tokenMint,
      buyAmountSol,
      maxPriceImpact / 100,
      false,
      highPriority
    );
  }

  async executeSellPhase(tokenMint, sellPercentage, highPriority) {
    return await this.sellToken(
      tokenMint,
      sellPercentage,
      1.0, // 1% default slippage
      false,
      highPriority
    );
  }

  async executeStrategyWithMonitoring(
    tokenMint,
    buyAmountSol,
    sellPercentage,
    maxPriceImpact,
    highPriority
  ) {
    const startTime = Date.now();
    console.log("=== Starting Strategy (Helius Sender) ===");

    const result = {
      success: false,
      buyResult: null,
      sellResult: null,
      totalTime: 0,
      error: null,
    };

    // Buy phase
    console.log(">>> BUY PHASE");
    const buyResult = await this.buyToken(
      tokenMint,
      buyAmountSol,
      1.0,
      false,
      highPriority
    );
    result.buyResult = {
      success: buyResult.success,
      signature: buyResult.signature,
      error: buyResult.error,
    };

    if (!buyResult.success) {
      result.error = `Buy Failed: ${buyResult.error}`;
      result.totalTime = (Date.now() - startTime) / 1000;
      return result;
    }

    // Wait for balance update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Sell phase
    console.log(">>> SELL PHASE");
    const sellResult = await this.sellToken(
      tokenMint,
      sellPercentage,
      1.0,
      false,
      highPriority
    );
    result.sellResult = {
      success: sellResult.success,
      signature: sellResult.signature,
      error: sellResult.error,
    };

    if (sellResult.success) {
      result.success = true;
      console.log("Strategy Completed Successfully");
    } else {
      result.error = `Sell Failed: ${sellResult.error}`;
    }

    result.totalTime = (Date.now() - startTime) / 1000;
    return result;
  }
}
