// Alternative Solana trading implementation with WebSocket support
// Equivalent to solana_function.rs

import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";
import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config();

const DEFAULT_SOLANA_RPC_URL = "https://rpc.shyft.to/?api_key=YC65T1SP6NMXDI6X";
const DEFAULT_SOLANA_WSS_URL = "wss://rpc.shyft.to/?api_key=YC65T1SP6NMXDI6X";
const JUPITER_API_URL = "https://lite-api.jup.ag/swap/v1";
const SOL_MINT_ADDRESS = "So11111111111111111111111111111111111111112";

export class TokenBalance {
  constructor(amount, decimals, balanceFormatted) {
    this.amount = amount;
    this.decimals = decimals;
    this.balanceFormatted = balanceFormatted;
  }
}

export class SolanaWebSocketClient {
  constructor(wssUrl = DEFAULT_SOLANA_WSS_URL) {
    this.wssUrl = wssUrl;
    this.subscriptionId = null;
    this.ws = null;
  }

  async subscribeSignature(signature) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wssUrl);

      this.ws.on("open", () => {
        const request = {
          jsonrpc: "2.0",
          id: 1,
          method: "signatureSubscribe",
          params: [signature, { commitment: "confirmed" }],
        };

        this.ws.send(JSON.stringify(request));
      });

      this.ws.on("message", (data) => {
        const response = JSON.parse(data.toString());
        if (response.result) {
          this.subscriptionId = response.result;
          console.log(
            `Subscribed to signature ${signature} with ID ${this.subscriptionId}`
          );
          resolve(this.subscriptionId);
        }
      });

      this.ws.on("error", reject);
    });
  }

  async waitForSignatureNotification(timeoutMs) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          data: null,
          error: "Timeout waiting for signature notification",
        });
      }, timeoutMs);

      this.ws.on("message", (data) => {
        clearTimeout(timeout);
        const notification = JSON.parse(data.toString());

        if (notification.method === "signatureNotification") {
          resolve({
            success: true,
            data: notification.params.result,
            error: null,
          });
        }
      });
    });
  }

  async unsubscribeSignature() {
    if (this.subscriptionId && this.ws) {
      const request = {
        jsonrpc: "2.0",
        id: 2,
        method: "signatureUnsubscribe",
        params: [this.subscriptionId],
      };

      this.ws.send(JSON.stringify(request));
      this.subscriptionId = null;
      this.ws.close();
      console.log("Unsubscribed from signature updates");
    }
  }
}

export class SolanaClient {
  constructor(
    rpcUrl = DEFAULT_SOLANA_RPC_URL,
    wssUrl = DEFAULT_SOLANA_WSS_URL
  ) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.wssClient = new SolanaWebSocketClient(wssUrl);
  }

  async getBalance(pubkey) {
    return await this.connection.getBalance(pubkey);
  }

  async getTokenBalance(tokenAccount) {
    const balance = await this.connection.getTokenAccountBalance(tokenAccount);
    return new TokenBalance(
      parseFloat(balance.value.amount),
      balance.value.decimals,
      balance.value.uiAmount
    );
  }

  async sendTransaction(transaction) {
    const signature = await this.connection.sendTransaction(transaction);
    return signature;
  }

  async getTransactionStatus(signatureStr) {
    const status = await this.connection.getSignatureStatus(signatureStr);

    if (status.value) {
      return {
        confirmed: status.value.confirmationStatus === "confirmed",
        finalized: status.value.confirmationStatus === "finalized",
        err: status.value.err !== null,
        slot: status.value.slot,
      };
    }
    return null;
  }
}

export class JupiterClient {
  constructor() {
    this.baseUrl = JUPITER_API_URL;
  }

  async getQuote(inputMint, outputMint, amount, slippageBps) {
    const url = `${this.baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to get quote: ${response.status}`);
    }
  }

  async getSwapTransaction(quote, userPublicKey) {
    const payload = {
      quoteResponse: quote,
      userPublicKey: userPublicKey,
      wrapAndUnwrapSol: true,
    };

    const response = await axios.post(`${this.baseUrl}/swap`, payload);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to get swap transaction: ${response.status}`);
    }
  }
}

export class Wallet {
  constructor(privateKey = null) {
    const pk = privateKey || process.env.PRIVATE_KEY;
    if (!pk) {
      throw new Error("PRIVATE_KEY not found");
    }

    this.keypair = this.loadKeypair(pk);
  }

  loadKeypair(privateKey) {
    try {
      // Try base58
      const bytes = bs58.decode(privateKey);
      return Keypair.fromSecretKey(bytes);
    } catch {
      try {
        // Try hex
        const key = privateKey.startsWith("0x")
          ? privateKey.slice(2)
          : privateKey;
        const bytes = Buffer.from(key, "hex");
        return Keypair.fromSecretKey(bytes);
      } catch {
        throw new Error("Invalid private key format");
      }
    }
  }

  publicKey() {
    return this.keypair.publicKey;
  }

  signTransaction(transaction) {
    transaction.sign([this.keypair]);
    return transaction;
  }
}

export class SolanaTraderAlt {
  constructor(rpcUrl = null, wssUrl = null) {
    this.wallet = new Wallet();
    this.solana = new SolanaClient(rpcUrl, wssUrl);
    this.jupiter = new JupiterClient();
  }

  async getBalance(tokenMint = null) {
    if (!tokenMint || tokenMint === SOL_MINT_ADDRESS) {
      const balance = await this.solana.getBalance(this.wallet.publicKey());
      return balance / 1_000_000_000;
    } else {
      try {
        const mintPubkey = new PublicKey(tokenMint);
        const ata = await getAssociatedTokenAddress(
          mintPubkey,
          this.wallet.publicKey()
        );
        const balance = await this.solana.getTokenBalance(ata);
        return balance.balanceFormatted || 0;
      } catch {
        return 0;
      }
    }
  }

  async waitForConfirmationWss(txid, timeoutDuration, waitForFinalized) {
    console.log(
      `Waiting for ${
        waitForFinalized ? "finalized" : "confirmed"
      } confirmation of transaction ${txid}`
    );

    // Subscribe to signature updates
    await this.solana.wssClient.subscribeSignature(txid);

    // Wait for notification
    const notification =
      await this.solana.wssClient.waitForSignatureNotification(timeoutDuration);

    if (!notification.success) {
      return {
        success: false,
        confirmed: false,
        finalized: false,
        error: notification.error,
        signature: txid,
      };
    }

    // Check if transaction failed
    if (notification.data.err) {
      return {
        success: false,
        confirmed: false,
        finalized: false,
        error: `Transaction failed: ${JSON.stringify(notification.data.err)}`,
        signature: txid,
      };
    }

    // Transaction confirmed
    const result = {
      success: !waitForFinalized,
      confirmed: true,
      finalized: false,
      error: null,
      signature: txid,
    };

    // If we need finalized status, poll RPC
    if (waitForFinalized) {
      for (let i = 0; i < 30; i++) {
        const status = await this.solana.getTransactionStatus(txid);
        if (status && status.finalized) {
          result.finalized = true;
          result.success = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!result.finalized) {
        result.error = "Transaction confirmed but not finalized within timeout";
      }
    }

    // Unsubscribe
    await this.solana.wssClient.unsubscribeSignature();

    return result;
  }

  async executeSwap(
    inputMint,
    outputMint,
    amount,
    slippageBps,
    waitForFinalized
  ) {
    // 1. Get quote
    const quote = await this.jupiter.getQuote(
      inputMint,
      outputMint,
      amount,
      slippageBps
    );

    // 2. Get swap transaction
    const swapData = await this.jupiter.getSwapTransaction(
      quote,
      this.wallet.publicKey().toString()
    );

    // 3. Decode and sign transaction
    const swapTxBytes = Buffer.from(swapData.swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTxBytes);
    const signedTransaction = this.wallet.signTransaction(transaction);

    // 4. Send transaction
    const txid = await this.solana.sendTransaction(signedTransaction);
    console.log("Swap transaction sent:", txid);

    // 5. Wait for confirmation
    const confirmation = await this.waitForConfirmationWss(
      txid,
      120000,
      waitForFinalized
    );

    if (confirmation.success) {
      console.log("Swap transaction confirmed:", txid);
      return txid;
    } else {
      console.error("Swap transaction failed:", confirmation.error);
      return null;
    }
  }

  async buyToken(tokenMint, solAmount, slippage, waitForFinalized) {
    const amount = Math.floor(solAmount * 1_000_000_000);
    return await this.executeSwap(
      SOL_MINT_ADDRESS,
      tokenMint,
      amount,
      Math.floor(slippage * 100),
      waitForFinalized
    );
  }

  async sellToken(tokenMint, sellPercentage, slippage, waitForFinalized) {
    if (sellPercentage < 0 || sellPercentage > 100) {
      throw new Error("Sell percentage must be between 0 and 100");
    }

    // Get token balance with retries
    await new Promise((resolve) => setTimeout(resolve, 2000));
    let balance = 0;

    for (let attempt = 0; attempt < 5; attempt++) {
      balance = await this.getBalance(tokenMint);
      if (balance > 0) break;

      if (attempt < 4) {
        console.log(`Balance not ready, retrying... (attempt ${attempt + 1})`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    if (balance <= 0) {
      throw new Error("Failed to get token balance or balance is zero");
    }

    // Get token decimals
    const mintPubkey = new PublicKey(tokenMint);
    const supply = await this.solana.connection.getTokenSupply(mintPubkey);
    const decimals = supply.value.decimals;

    const amountInUnits = Math.floor(
      (balance * Math.pow(10, decimals) * sellPercentage) / 100
    );

    if (amountInUnits === 0) {
      throw new Error("Amount to sell is zero");
    }

    console.log(
      `Selling ${sellPercentage}% of ${tokenMint} balance (${amountInUnits} tokens)`
    );

    return await this.executeSwap(
      tokenMint,
      SOL_MINT_ADDRESS,
      amountInUnits,
      Math.floor(slippage * 100),
      waitForFinalized
    );
  }
}
