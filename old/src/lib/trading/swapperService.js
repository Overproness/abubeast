/**
 * Advanced Swapper Service
 * Multi-account Jupiter swap execution with worker processes
 * Integrated from shystem/swappers_js_ported
 */

import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import axios from 'axios';

export class SwapperService {
  constructor(config) {
    this.heliusApiKey = config.heliusApiKey || process.env.HELIUS_API_KEY;
    this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`;
    this.connection = new Connection(this.rpcUrl, 'confirmed');
    
    console.log('✅ SwapperService initialized (session-based mode)');
  }

  /**
   * Get Jupiter quote
   */
  async getQuote(inputMint, outputMint, amount, slippageBps = 1000) {
    try {
      const quoteUrl = `https://quote-api.jup.ag/v6/quote?` +
        `inputMint=${inputMint}&` +
        `outputMint=${outputMint}&` +
        `amount=${amount}&` +
        `slippageBps=${slippageBps}`;

      const response = await axios.get(quoteUrl);
      return response.data;
    } catch (error) {
      console.error(`Error getting quote: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute swap using user's session key
   */
  async executeSwap(sessionKey, inputMint, outputMint, amount, slippageBps = 1000) {
    // Get keypair from session key
    const { getKeypairFromSessionKey } = await import('./sessionKeyTrading.js');
    const keypair = getKeypairFromSessionKey(sessionKey);
    
    if (!keypair) {
      throw new Error('Invalid or expired session key');
    }

    console.log(`\n🔄 Executing swap for user wallet: ${keypair.publicKey.toString().substring(0, 8)}...`);
    console.log(`   Input: ${inputMint.substring(0, 8)}...`);
    console.log(`   Output: ${outputMint.substring(0, 8)}...`);
    console.log(`   Amount: ${amount}`);

    try {
      // Get quote
      const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps);
      
      console.log(`📊 Quote received:`);
      console.log(`   Out amount: ${quote.outAmount}`);
      console.log(`   Price impact: ${quote.priceImpactPct}%`);

      // Get swap transaction
      const swapPayload = {
        quoteResponse: quote,
        userPublicKey: keypair.publicKey.toString(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 10000,
      };

      const swapResponse = await axios.post(
        "https://quote-api.jup.ag/v6/swap",
        swapPayload
      );

      const { swapTransaction } = swapResponse.data;
      const transactionBuf = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(transactionBuf);

      // Sign transaction
      transaction.sign([keypair]);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: true,
          maxRetries: 2,
        }
      );

      console.log(`✅ Swap executed: ${signature}`);
      console.log(`   View: https://solscan.io/tx/${signature}`);

      return {
        success: true,
        signature,
        inputMint,
        outputMint,
        wallet: keypair.publicKey.toString(),
      };
    } catch (error) {
      console.error(`❌ Swap failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        inputMint,
        outputMint,
        amount,
      };
    }
  }

  /**
   * Buy token with SOL
   */
  async buyToken(accountName, tokenMint, solAmount, slippageBps = 1000) {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const amountLamports = Math.floor(solAmount * 1e9);

    return this.executeSwap(
      accountName,
      SOL_MINT,
      tokenMint,
      amountLamports,
      slippageBps
    );
  }

  /**
   * Sell token for SOL
   */
  async sellToken(accountName, tokenMint, amount, slippageBps = 1000) {
    const SOL_MINT = "So11111111111111111111111111111111111111112";

    return this.executeSwap(
      accountName,
      tokenMint,
      SOL_MINT,
      amount,
      slippageBps
    );
  }

  /** using session key
   */
  async buyToken(sessionKey, tokenMint, solAmount, slippageBps = 1000) {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const amountLamports = Math.floor(solAmount * 1e9);

    return this.executeSwap(
      sessionKey,
      SOL_MINT,
      tokenMint,
      amountLamports,
      slippageBps
    );
  }

  /**
   * Sell token for SOL using session key
   */
  async sellToken(sessionKey, tokenMint, amount, slippageBps = 1000) {
    const SOL_MINT = "So11111111111111111111111111111111111111112";

    return this.executeSwap(
      sessionKey,
      tokenMint,
      SOL_MINT,
      amount,
      slippageBps
    );
  }
}