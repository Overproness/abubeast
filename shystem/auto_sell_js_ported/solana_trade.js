// Solana Trade - JavaScript Port
// Port of solana_trade.rs

const {
  Connection,
  Keypair,
  VersionedTransaction,
  TransactionMessage,
  PublicKey,
  SystemProgram,
} = require("@solana/web3.js");
const { getAssociatedTokenAddress } = require("@solana/spl-token");
const bs58 = require("bs58");
const axios = require("axios");

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

class SolanaTrader {
  constructor(config) {
    if (!config.heliusKey) {
      throw new Error("HELIUS_KEY environment variable must be set");
    }

    const rpcUrl = `${HELIUS_RPC_URL}${config.heliusKey}`;
    this.rpcClient = new Connection(rpcUrl, "confirmed");
    this.keypair = Keypair.fromSecretKey(bs58.decode(config.solanaPrivateKey));
    this.heliusApiKey = config.heliusKey;

    console.log(
      `✅ SolanaTrader initialized with wallet: ${this.keypair.publicKey.toString()}`
    );
  }

  async getBalance(tokenMint = null) {
    try {
      if (!tokenMint) {
        // Get SOL balance
        const balance = await this.rpcClient.getBalance(this.keypair.publicKey);
        return balance / 1_000_000_000;
      } else {
        // Get SPL token balance
        const mintPubkey = new PublicKey(tokenMint);
        const tokenAccounts =
          await this.rpcClient.getParsedTokenAccountsByOwner(
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
    tokenMint,
    outputMint,
    sellPercentage,
    slippageBps,
    highPriority,
    useJito,
    jitoTipLamports
  ) {
    try {
      // 1. Get Balance
      const balance = await this.getBalance(tokenMint);
      if (balance <= 0) {
        return {
          success: false,
          signature: null,
          error: "Zero balance",
        };
      }

      // 2. Calculate Amount
      const decimals = await this.getTokenDecimals(tokenMint);
      const amountToSellUi = balance * (sellPercentage / 100.0);
      const amountU64 = Math.floor(amountToSellUi * Math.pow(10, decimals));

      if (amountU64 === 0) {
        return {
          success: false,
          signature: null,
          error: "Calculated sell amount is 0",
        };
      }

      console.log(
        `Input_mint ${tokenMint} Selling ${amountToSellUi} tokens (${amountU64} raw) -> Output: ${outputMint}`
      );

      // 3. Get Quote
      const quote = await this.getQuote(
        tokenMint,
        outputMint,
        amountU64,
        slippageBps
      );

      // 4. Get Swap Transaction
      const swapResp = await this.getSwap(quote);

      // 5. Add Tip & Sign
      const requestedTip = jitoTipLamports || 200_000;
      const finalTip = Math.max(requestedTip, 200_000);

      const transaction = await this.addTipAndSign(swapResp, finalTip);

      // 6. Broadcast
      const sig = await this.broadcastWithSender(transaction);
      console.log(`Signature: ${sig}`);

      await this.confirmTransaction(sig);

      return {
        success: true,
        signature: sig,
        error: null,
      };
    } catch (error) {
      console.error(`Sell error: ${error.message}`);
      return {
        success: false,
        signature: null,
        error: error.message,
      };
    }
  }

  async getQuote(inputMint, outputMint, amount, slippageBps) {
    console.log("Request Jupiter quote");

    const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    const response = await axios.get(url);
    const quoteJson = response.data;

    console.log(`Received quote from Jupiter: ${JSON.stringify(quoteJson)}`);

    // Check for Jupiter errors
    if (quoteJson.error) {
      const errorMsg = quoteJson.error;
      const errorCode = quoteJson.errorCode || "Unknown Code";
      throw new Error(
        `Jupiter Refused Quote: ${errorMsg} [Code: ${errorCode}]`
      );
    }

    // Inject missing fields required by Swap Endpoint
    if (!quoteJson.inputMint) {
      quoteJson.inputMint = inputMint;
    }
    if (!quoteJson.outputMint) {
      quoteJson.outputMint = outputMint;
    }
    if (!quoteJson.inAmount) {
      quoteJson.inAmount = amount.toString();
    }
    if (!quoteJson.swapMode) {
      quoteJson.swapMode = "ExactIn";
    }

    return quoteJson;
  }

  async getSwap(quote) {
    console.log("Request Jupiter swap");

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

    const response = await axios.post(url, payload);

    if (response.status !== 200) {
      throw new Error(`Jupiter API Error: ${response.statusText}`);
    }

    return response.data;
  }

  async addTipAndSign(swapResponse, tipLamports) {
    console.log("Create transaction for Sender");

    // Decode the swap transaction
    const swapTransactionBuf = Buffer.from(
      swapResponse.swapTransaction,
      "base64"
    );
    const originalTx = VersionedTransaction.deserialize(swapTransactionBuf);

    // Extract message
    const message = originalTx.message;

    // Deserialize to get instructions
    const addressTableLookups = message.addressTableLookups || [];

    // Fetch address lookup tables
    const lookupTableAccounts = [];
    for (const lookup of addressTableLookups) {
      const accountInfo = await this.rpcClient.getAccountInfo(
        lookup.accountKey
      );
      if (accountInfo) {
        lookupTableAccounts.push({
          key: lookup.accountKey,
          state: accountInfo,
        });
      }
    }

    // Decompile message to get instructions
    const decompiledInstructions = TransactionMessage.decompile(message, {
      addressLookupTableAccounts: lookupTableAccounts,
    });

    // Add tip instruction
    const tipAccount =
      TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];
    console.log(`Adding Jito Tip: ${tipLamports} lamports to ${tipAccount}`);

    const transferIx = SystemProgram.transfer({
      fromPubkey: this.keypair.publicKey,
      toPubkey: new PublicKey(tipAccount),
      lamports: tipLamports,
    });

    decompiledInstructions.instructions.push(transferIx);

    // Recompile message
    const newMessage = new TransactionMessage({
      payerKey: decompiledInstructions.payerKey,
      recentBlockhash: decompiledInstructions.recentBlockhash,
      instructions: decompiledInstructions.instructions,
    }).compileToV0Message(lookupTableAccounts);

    // Create new versioned transaction
    const newTx = new VersionedTransaction(newMessage);
    newTx.sign([this.keypair]);

    return newTx;
  }

  async broadcastWithSender(transaction) {
    console.log("Send to Sender");

    const serialized = transaction.serialize();
    const base64Tx = Buffer.from(serialized).toString("base64");

    const payload = {
      jsonrpc: "2.0",
      id: Date.now().toString(),
      method: "sendTransaction",
      params: [
        base64Tx,
        { encoding: "base64", skipPreflight: true, maxRetries: 0 },
      ],
    };

    const response = await axios.post(SENDER_ENDPOINT, payload);
    const respJson = response.data;

    console.log(`Sender Response: ${JSON.stringify(respJson)}`);

    // Handle error
    if (respJson.message) {
      const code = respJson.code || "unknown";
      throw new Error(`Sender API Error [${code}]: ${respJson.message}`);
    }

    if (respJson.error) {
      throw new Error(`Sender API Error: ${JSON.stringify(respJson.error)}`);
    }

    return respJson.result;
  }

  async confirmTransaction(signature) {
    console.log("Wait for confirmation");

    const startTime = Date.now();
    while (Date.now() - startTime < 30000) {
      try {
        const status = await this.rpcClient.getSignatureStatus(signature);

        if (status && status.value) {
          const confirmationStatus = status.value.confirmationStatus;
          if (
            confirmationStatus === "confirmed" ||
            confirmationStatus === "finalized"
          ) {
            console.log(`✅ Transaction Confirmed: ${signature}`);
            return;
          }
        }
      } catch (error) {
        // Ignore errors during confirmation check
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.warn(`⚠️ Transaction confirmation timeout: ${signature}`);
  }
}

module.exports = { SolanaTrader };
