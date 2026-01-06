/**
 * Auto-Sell Engine - Integrated Version
 * Handles automated emergency sells based on triggers
 * Integrated from shystem/auto_sell_js_ported
 */

import fsSync from "fs";
import path from "path";
import { TradeLogger } from "./logger.js";
import { SolanaTrader } from "./solanaTrader.js";

const SWAP_TO_SOL = "So11111111111111111111111111111111111111112";

export class AutoSellEngine {
  constructor(config) {
    this.config = config;
    this.trader = null;
    this.sellHistory = [];
    this.dataDir = path.resolve(config.dataDir || "./data/trades");
    this.recentSells = new Map(); // token_mint -> timestamp

    // Create data directory
    if (!fsSync.existsSync(this.dataDir)) {
      fsSync.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize trade logger
    const csvPath = path.join(this.dataDir, "trades.csv");
    try {
      this.tradeLogger = new TradeLogger(csvPath);
    } catch (error) {
      console.error(`Failed to initialize trade logger: ${error}`);
      throw error;
    }

    console.log("✅ AutoSellEngine initialized");
    console.log(`  Sell percentage: ${config.sellPercentage}%`);
    console.log(`  Slippage: ${config.slippage}%`);
    console.log(`  High priority: ${config.highPriority}`);
    console.log(`  Use Jito: ${config.useJito}`);
    console.log(`  Trade logging: enabled (${csvPath})`);
  }

  async initializeTrader() {
    if (!this.trader) {
      this.trader = new SolanaTrader(this.config);
      console.log("✅ Solana trader initialized");
    }
  }

  async executeSell(
    userId,
    walletAddress,
    sessionKey,
    tokenMint,
    triggerType,
    triggerDetails
  ) {
    // Get keypair from session key for this user
    const { getKeypairFromSessionKey } = await import("./sessionKeyTrading.js");
    const keypair = getKeypairFromSessionKey(sessionKey);

    if (!keypair) {
      return {
        success: false,
        error: "Invalid or expired session key",
        tokenMint,
        triggerType,
      };
    }
    const currentTime = Math.floor(Date.now() / 1000);

    // Check for duplicate sells within cooldown period
    if (this.recentSells.has(tokenMint)) {
      const lastSellTime = this.recentSells.get(tokenMint);
      if (currentTime - lastSellTime < 30) {
        console.warn(
          `⏰ Skipping duplicate sell for token ${tokenMint.substring(
            0,
            8
          )}... ` + `(last sell was ${currentTime - lastSellTime} seconds ago)`
        );
        return {
          success: false,
          tokenMint,
          triggerType,
          triggerDetails,
          timestamp: currentTime,
          transactionSignature: null,
          error: "Duplicate sell attempt within cooldown period",
          balanceSold: 0.0,
          solReceived: null,
        };
      }
    }
    this.recentSells.set(tokenMint, currentTime);

    const result = {
      success: false,
      tokenMint,
      triggerType,
      triggerDetails,
      timestamp: currentTime,
      transactionSignature: null,
      error: null,
      balanceSold: 0.0,
      solReceived: null,
    };

    try {
      await this.initializeTrader();
    } catch (error) {
      result.error = `Failed to initialize trader: ${error.message}`;
      return result;
    }

    console.warn(
      "================================================================================"
    );
    console.warn("🚨 EXECUTING EMERGENCY SELL");
    console.warn(`   Token: ${tokenMint.substring(0, 8)}...`);
    console.warn(`   Trigger: ${triggerType}`);
    console.warn(`   Details: ${JSON.stringify(triggerDetails)}`);
    console.warn(
      "================================================================================"
    );

    try {
      // Get token balance for user's wallet
      const balance = await this.trader.getBalance(walletAddress, tokenMint);
      console.log(`💰 Current balance: ${balance} tokens`);

      if (balance <= 0) {
        result.error = "No token balance to sell";
        console.error("❌ No token balance to sell");
        return result;
      }

      // Calculate amount to sell
      const sellPercentage = this.config.sellPercentage || 100;
      let amountToSell;

      if (sellPercentage >= 100) {
        amountToSell = balance;
        console.log(`📊 Selling 100% (${balance} tokens)`);
      } else {
        amountToSell = (balance * sellPercentage) / 100;
        console.log(`📊 Selling ${sellPercentage}% (${amountToSell} tokens)`);
      }

      // Execute sell with user's session key
      console.log("🔄 Executing swap via Jupiter...");
      const txSignature = await this.trader.sellToken(
        keypair,
        tokenMint,
        SWAP_TO_SOL,
        amountToSell,
        this.config.slippage || 1000,
        this.config.highPriority || false,
        this.config.useJito || false
      );

      result.success = true;
      result.transactionSignature = txSignature;
      result.balanceSold = amountToSell;

      console.log("✅ SELL EXECUTED SUCCESSFULLY");
      console.log(`   Transaction: ${txSignature}`);
      console.log(`   Amount sold: ${amountToSell} tokens`);

      // Get final balancewalletAddress,
      const finalBalance = await this.trader.getBalance(tokenMint);
      console.log(`💰 Remaining balance: ${finalBalance} tokens`);

      // Log trade
      await this.tradeLogger.logTrade({
        timestamp: currentTime,
        token: tokenMint,
        action: "SELL",
        trigger: triggerType,
        balanceSold: amountToSell,
        balanceRemaining: finalBalance,
        signature: txSignature,
        details: JSON.stringify(triggerDetails),
      });

      // Record history
      this.sellHistory.push(result);

      return result;
    } catch (error) {
      result.error = error.message;
      console.error(`❌ SELL FAILED: ${error.message}`);
      return result;
    }
  }

  async removeToken(tokenMint) {
    console.log(
      `🗑️  Removing token from auto-sell: ${tokenMint.substring(0, 8)}...`
    );
    this.recentSells.delete(tokenMint);
    return true;
  }

  getSellHistory(limit = 100) {
    return this.sellHistory.slice(-limit);
  }

  getRecentSells() {
    const now = Math.floor(Date.now() / 1000);
    const recent = [];

    for (const [tokenMint, timestamp] of this.recentSells.entries()) {
      if (now - timestamp < 3600) {
        // Last hour
        recent.push({ tokenMint, timestamp, secondsAgo: now - timestamp });
      }
    }

    return recent;
  }
}

// Singleton instance
let autoSellEngineInstance = null;

export function getAutoSellEngine(config = null) {
  if (!autoSellEngineInstance && config) {
    autoSellEngineInstance = new AutoSellEngine(config);
  }
  return autoSellEngineInstance;
}

export async function initializeAutoSellEngine(config) {
  if (!autoSellEngineInstance) {
    autoSellEngineInstance = new AutoSellEngine(config);
    await autoSellEngineInstance.initializeTrader();
  }
  return autoSellEngineInstance;
}
