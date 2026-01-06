// Auto-Sell Engine - JavaScript Port
// Port of auto_sell_engine.rs

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { SolanaTrader } = require("./solana_trade");
const { TradeLogger } = require("./monitor/logger");

const SWAP_TO_SOL = "So11111111111111111111111111111111111111112";

class AutoSellEngine {
  constructor(config) {
    this.config = config;
    this.trader = null;
    this.sellHistory = [];
    this.dataDir = path.resolve(config.dataDir);
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

    console.log("AutoSellEngine initialized");
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

  async executeSell(tokenMint, triggerType, triggerDetails) {
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
    console.warn(`   Details: ${triggerDetails}`);
    console.warn(
      "================================================================================"
    );

    // Check balance
    try {
      const balance = await this.trader.getBalance(tokenMint);
      result.balanceSold = balance;

      console.log(`Current token balance: ${balance}`);

      if (balance < 0.01) {
        result.error = `Balance too small to sell (${balance}), likely dust from previous transaction`;
        console.warn(
          `❌ Balance too small to sell for token ${tokenMint.substring(
            0,
            8
          )}... (${balance})`
        );
        return result;
      }
    } catch (error) {
      result.error = `Error checking balance: ${error.message}`;
      console.error(`❌ Error checking balance: ${error.message}`);
      return result;
    }

    // Execute sell
    console.log("🔄 Initiating sell transaction...");

    // Capture pre-sell SOL balance
    let preSolBalance = 0;
    try {
      preSolBalance = await this.trader.getBalance(null);
    } catch (error) {
      console.warn(`Failed to read pre-sell SOL balance: ${error.message}`);
    }

    try {
      const txResult = await this.trader.sellToken(
        tokenMint,
        SWAP_TO_SOL,
        this.config.sellPercentage,
        Math.floor(this.config.slippage * 100), // Convert to basis points
        this.config.highPriority,
        this.config.useJito,
        this.config.jitoTipLamports
      );

      if (txResult.success) {
        result.success = true;
        result.transactionSignature = txResult.signature;

        console.warn(
          "================================================================================"
        );
        console.warn("✅ EMERGENCY SELL SUCCESSFUL!");
        console.warn(`   Transaction: ${result.transactionSignature}`);
        console.warn(
          "================================================================================"
        );

        // Calculate SOL received
        let postSolBalance = preSolBalance;
        try {
          postSolBalance = await this.trader.getBalance(null);
        } catch (error) {
          console.warn(
            `Failed to read post-sell SOL balance: ${error.message}`
          );
        }

        let solReceived = postSolBalance - preSolBalance;
        if (solReceived < 0) {
          solReceived = 0;
        }

        console.log(
          `Pre-sell SOL: ${preSolBalance} SOL, Post-sell SOL: ${postSolBalance} SOL, Received: ${solReceived} SOL`
        );

        result.solReceived = solReceived;

        // Log trade to CSV
        try {
          await this.tradeLogger.logTrade(
            tokenMint,
            result.balanceSold,
            solReceived
          );
        } catch (error) {
          console.error(
            `Failed to log successful trade to CSV: ${error.message}`
          );
        }
      } else {
        result.error = txResult.error;
        console.error(`❌ Sell Logic Failed (Trade Error): ${result.error}`);

        // Log failed trade
        try {
          await this.tradeLogger.logTrade(tokenMint, result.balanceSold, 0.0);
        } catch (error) {
          console.error(`Failed to log failed trade to CSV: ${error.message}`);
        }
      }
    } catch (error) {
      result.error = error.message;
      console.error(
        `❌ Sell Logic Failed (Network/System Error): ${error.message}`
      );

      // Log failed trade
      try {
        await this.tradeLogger.logTrade(tokenMint, result.balanceSold, 0.0);
      } catch (error) {
        console.error(`Failed to log failed trade to CSV: ${error.message}`);
      }
    }

    this.sellHistory.push(result);
    await this.saveSellHistory();

    return result;
  }

  async saveSellHistory() {
    try {
      const historyFile = path.join(this.dataDir, "sell_history.json");
      const json = JSON.stringify(this.sellHistory, null, 2);
      await fs.writeFile(historyFile, json);
    } catch (error) {
      console.error(`Failed to save sell history: ${error.message}`);
    }
  }

  async getSellHistory(limit = 50) {
    const start = Math.max(0, this.sellHistory.length - limit);
    return this.sellHistory.slice(start);
  }

  async getStatistics() {
    const totalSells = this.sellHistory.length;
    const successfulSells = this.sellHistory.filter((s) => s.success).length;
    const failedSells = totalSells - successfulSells;

    const successRate =
      totalSells > 0 ? (successfulSells / totalSells) * 100 : 0;

    const triggerCounts = {};
    for (const sell of this.sellHistory) {
      triggerCounts[sell.triggerType] =
        (triggerCounts[sell.triggerType] || 0) + 1;
    }

    return {
      total_sells: totalSells,
      successful_sells: successfulSells,
      failed_sells: failedSells,
      success_rate: successRate,
      trigger_counts: triggerCounts,
      recent_sells: await this.getSellHistory(10),
    };
  }
}

module.exports = { AutoSellEngine };
