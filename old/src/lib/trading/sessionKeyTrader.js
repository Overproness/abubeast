/**
 * Session Key Trader - Executes trades using decrypted session keys
 * Replaces hardcoded private keys with per-user session keys
 */

import dbConnect from "@/lib/db/mongodb";
import {
  decryptSecretKey,
  getMasterEncryptionKey,
} from "@/lib/session-keys/sessionKeyUtils";
import SessionKey from "@/models/SessionKey";
import TradeLog from "@/models/TradeLog";
import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

const TIP_ACCOUNTS = [
  "4ACfpUFoaSD9bfPdeu6DBt89gB6ENTeHBXCAi87NhDEE",
  "D2L6yPZ2FmmmTKPgzaMKdhu6EWZcTpLy1Vhx8uvZe7NZ",
  "9bnz4RShgq1hAnLnZbP8kbgBg1kEmcJBYQq3gQbmnSta",
  "5VY91ws6B2hMmBFRsXkoAAdsPHBJwRfBht4DXox3xkwn",
  "2nyhqdwKcJZR2vcqCyrYsaPVdAnFoJjiksCXJ7hfEYgD",
];

export class SessionKeyTrader {
  constructor(sessionKey, heliusApiKey) {
    this.sessionKey = sessionKey;
    this.heliusApiKey = heliusApiKey || process.env.HELIUS_API_KEY;

    if (!this.heliusApiKey) {
      throw new Error("HELIUS_API_KEY is required");
    }

    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`;
    this.connection = new Connection(rpcUrl, "confirmed");

    // Decrypt and initialize keypair
    this.keypair = this.decryptSessionKey(sessionKey);

    console.log(
      `[SessionKeyTrader] Initialized for wallet: ${this.keypair.publicKey.toString()}`
    );
  }

  decryptSessionKey(sessionKey) {
    try {
      const masterKey = getMasterEncryptionKey();
      const decrypted = decryptSecretKey(
        sessionKey.encryptedPrivateKey,
        sessionKey.iv,
        sessionKey.authTag,
        masterKey
      );

      return Keypair.fromSecretKey(bs58.decode(decrypted));
    } catch (error) {
      console.error("[SessionKeyTrader] Failed to decrypt session key:", error);
      throw new Error("Failed to decrypt session key");
    }
  }

  async checkPermissions(action, amount) {
    // Check if session key is valid
    if (!this.sessionKey.isValid()) {
      throw new Error("Session key has expired or is inactive");
    }

    // Check action permissions
    const permissions = this.sessionKey.permissions;

    if (action === "buy" && !permissions.canTrade && !permissions.canSwap) {
      throw new Error("Session key does not have trading/swap permissions");
    }

    if (action === "sell" && !permissions.canTrade && !permissions.canSwap) {
      throw new Error("Session key does not have trading/swap permissions");
    }

    // Check spending limits
    if (!this.sessionKey.canSpend(amount)) {
      throw new Error(`Amount ${amount} exceeds session key limits`);
    }

    return true;
  }

  async getBalance(tokenMint = null) {
    try {
      if (!tokenMint || tokenMint === WRAPPED_SOL_MINT) {
        const balance = await this.connection.getBalance(
          this.keypair.publicKey
        );
        return balance / 1_000_000_000;
      } else {
        const mintPubkey = new PublicKey(tokenMint);
        const tokenAccounts =
          await this.connection.getParsedTokenAccountsByOwner(
            this.keypair.publicKey,
            { mint: mintPubkey }
          );

        if (tokenAccounts.value.length === 0) {
          return 0.0;
        }

        let totalBalance = 0;
        for (const account of tokenAccounts.value) {
          const amount =
            account.account.data.parsed.info.tokenAmount.uiAmount || 0;
          totalBalance += amount;
        }

        return totalBalance;
      }
    } catch (error) {
      console.error(
        `[SessionKeyTrader] Error getting balance: ${error.message}`
      );
      throw error;
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
      console.error(
        `[SessionKeyTrader] Error getting token decimals: ${error.message}`
      );
      throw error;
    }
  }

  async buyToken(inputMint, outputMint, amount, slippageBps = 500) {
    try {
      console.log(`[SessionKeyTrader] Buying ${outputMint} with ${amount} SOL`);

      // Check permissions
      await this.checkPermissions("buy", amount);

      // Get quote from Jupiter
      const quoteResponse = await this.getQuote(
        inputMint,
        outputMint,
        amount,
        slippageBps
      );

      if (!quoteResponse) {
        throw new Error("Failed to get quote from Jupiter");
      }

      // Get swap transaction
      const swapResponse = await this.getSwapTransaction(quoteResponse);

      // Send transaction
      const signature = await this.sendTransaction(
        swapResponse.swapTransaction
      );

      // Record usage
      await this.recordTrade("buy", inputMint, outputMint, amount, signature);

      console.log(`[SessionKeyTrader] Buy successful: ${signature}`);
      return { success: true, signature };
    } catch (error) {
      console.error(`[SessionKeyTrader] Buy failed: ${error.message}`);
      await this.recordTrade(
        "buy",
        inputMint,
        outputMint,
        amount,
        null,
        error.message
      );
      return { success: false, error: error.message };
    }
  }

  async sellToken(inputMint, outputMint, percentage = 100, slippageBps = 500) {
    try {
      console.log(`[SessionKeyTrader] Selling ${percentage}% of ${inputMint}`);

      // Get token balance
      const balance = await this.getBalance(inputMint);
      if (balance === 0) {
        throw new Error("No tokens to sell");
      }

      const amountToSell = balance * (percentage / 100);
      const decimals = await this.getTokenDecimals(inputMint);
      const amountLamports = Math.floor(amountToSell * Math.pow(10, decimals));

      // Check permissions (estimate SOL value)
      const estimatedValue = amountToSell * 0.000001; // Rough estimate
      await this.checkPermissions("sell", estimatedValue);

      // Get quote from Jupiter
      const quoteResponse = await this.getQuote(
        inputMint,
        outputMint,
        amountLamports,
        slippageBps,
        true
      );

      if (!quoteResponse) {
        throw new Error("Failed to get quote from Jupiter");
      }

      // Get swap transaction
      const swapResponse = await this.getSwapTransaction(quoteResponse);

      // Send transaction
      const signature = await this.sendTransaction(
        swapResponse.swapTransaction
      );

      // Record usage
      await this.recordTrade(
        "sell",
        inputMint,
        outputMint,
        amountToSell,
        signature
      );

      console.log(`[SessionKeyTrader] Sell successful: ${signature}`);
      return { success: true, signature };
    } catch (error) {
      console.error(`[SessionKeyTrader] Sell failed: ${error.message}`);
      await this.recordTrade(
        "sell",
        inputMint,
        outputMint,
        0,
        null,
        error.message
      );
      return { success: false, error: error.message };
    }
  }

  async getQuote(
    inputMint,
    outputMint,
    amount,
    slippageBps = 500,
    exactOut = false
  ) {
    try {
      const params = {
        inputMint,
        outputMint,
        amount,
        slippageBps,
      };

      if (exactOut) {
        params.swapMode = "ExactOut";
      }

      const response = await axios.get("https://quote-api.jup.ag/v6/quote", {
        params,
      });

      return response.data;
    } catch (error) {
      console.error(`[SessionKeyTrader] Quote error: ${error.message}`);
      return null;
    }
  }

  async getSwapTransaction(quoteResponse) {
    try {
      const response = await axios.post("https://quote-api.jup.ag/v6/swap", {
        quoteResponse,
        userPublicKey: this.keypair.publicKey.toString(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      });

      return response.data;
    } catch (error) {
      console.error(
        `[SessionKeyTrader] Swap transaction error: ${error.message}`
      );
      throw error;
    }
  }

  async sendTransaction(swapTransaction) {
    try {
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign the transaction
      transaction.sign([this.keypair]);

      // Send via Helius for faster execution
      const rawTransaction = transaction.serialize();
      const response = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`,
        {
          jsonrpc: "2.0",
          id: "helius-send",
          method: "sendTransaction",
          params: [
            Buffer.from(rawTransaction).toString("base64"),
            {
              encoding: "base64",
              skipPreflight: true,
              maxRetries: 3,
            },
          ],
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error(
        `[SessionKeyTrader] Send transaction error: ${error.message}`
      );
      throw error;
    }
  }

  async recordTrade(
    type,
    inputMint,
    outputMint,
    amount,
    signature,
    error = null
  ) {
    try {
      await dbConnect();

      // Record in session key usage stats
      await this.sessionKey.recordUsage(amount);

      // Create trade log
      await TradeLog.create({
        userId: this.sessionKey.userId,
        sessionKeyId: this.sessionKey._id,
        walletAddress: this.sessionKey.walletAddress,
        tradeType: type,
        inputToken: inputMint,
        outputToken: outputMint,
        inputAmount: amount,
        signature: signature,
        status: signature ? "completed" : "failed",
        error: error,
        timestamp: new Date(),
      });

      console.log(
        `[SessionKeyTrader] Trade recorded: ${type} ${signature || "failed"}`
      );
    } catch (error) {
      console.error(
        `[SessionKeyTrader] Failed to record trade: ${error.message}`
      );
    }
  }
}

export async function createTraderForUser(userId) {
  try {
    await dbConnect();

    // Find active session key for user
    const sessionKey = await SessionKey.findOne({
      userId,
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (!sessionKey) {
      return null;
    }

    // Check if trading is allowed
    if (!sessionKey.permissions?.canTrade && !sessionKey.permissions?.canSwap) {
      return null;
    }

    return new SessionKeyTrader(sessionKey);
  } catch (error) {
    console.error(
      `[SessionKeyTrader] Failed to create trader for user: ${error.message}`
    );
    return null;
  }
}
