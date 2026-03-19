/**
 * Trading Bot Engine
 * Central orchestrator for automated token trading
 * Coordinates token monitoring, buying, and selling across all users
 */

import dbConnect from "@/lib/db/mongodb";
import SessionKey from "@/models/SessionKey";
import TradeLog from "@/models/TradeLog";
import TradingSettings from "@/models/TradingSettings";
import { SessionBasedAutoSell } from "./sessionBasedAutoSell";
import { SessionBasedSwapper } from "./sessionBasedSwapper";

export class TradingBotEngine {
  constructor() {
    this.swapper = new SessionBasedSwapper();
    this.autoSell = new SessionBasedAutoSell();
    this.isRunning = false;
    this.activeMonitors = new Map(); // tokenMint -> monitor interval
    this.processingQueue = [];
    this.maxConcurrentTrades = 5;
    this.activeTrades = 0;
  }

  /**
   * Start the trading bot engine
   */
  async start() {
    if (this.isRunning) {
      console.log("[TradingBotEngine] Already running");
      return;
    }

    console.log("[TradingBotEngine] Starting...");
    this.isRunning = true;

    // Start position monitoring loop
    this.startPositionMonitoring();

    console.log("[TradingBotEngine] Started successfully");
  }

  /**
   * Stop the trading bot engine
   */
  async stop() {
    if (!this.isRunning) {
      console.log("[TradingBotEngine] Not running");
      return;
    }

    console.log("[TradingBotEngine] Stopping...");
    this.isRunning = false;

    // Stop all monitors
    for (const [tokenMint, intervalId] of this.activeMonitors) {
      clearInterval(intervalId);
    }
    this.activeMonitors.clear();

    console.log("[TradingBotEngine] Stopped");
  }

  /**
   * Process a new token detected by the monitoring system
   * @param {Object} tokenData - Token data from monitoring
   */
  async processNewToken(tokenData) {
    console.log(
      `[TradingBotEngine] Processing new token: ${tokenData.symbol} (${tokenData.address})`
    );

    try {
      await dbConnect();

      // Get all users with active trading bots
      const activeSettings = await TradingSettings.find({
        botEnabled: true,
      }).populate("userId");

      if (activeSettings.length === 0) {
        console.log("[TradingBotEngine] No active trading bots found");
        return;
      }

      console.log(
        `[TradingBotEngine] Found ${activeSettings.length} active bots`
      );

      // Filter users based on their token filters
      const eligibleUsers = [];

      for (const settings of activeSettings) {
        // Check if user can trade today
        if (!settings.canTradeToday()) {
          console.log(
            `[TradingBotEngine] User ${settings.userId._id} reached daily limit`
          );
          continue;
        }

        // Check token filters
        const filterResult = this.swapper.checkTokenFilters(
          tokenData,
          settings
        );
        if (!filterResult.passed) {
          console.log(
            `[TradingBotEngine] Token filtered for user ${settings.userId._id}: ${filterResult.reason}`
          );
          continue;
        }

        // Get user's active session key
        const wallets = settings.userId.wallets || [];
        const solanaWallet = wallets.find((w) => w.type === "phantom");

        if (!solanaWallet) {
          console.log(
            `[TradingBotEngine] User ${settings.userId._id} has no Solana wallet`
          );
          continue;
        }

        const sessionKey = await SessionKey.findOne({
          userId: settings.userId._id,
          walletAddress: solanaWallet.address.toLowerCase(),
          active: true,
          expiresAt: { $gt: new Date() },
        });

        if (!sessionKey) {
          console.log(
            `[TradingBotEngine] User ${settings.userId._id} has no active session key`
          );
          continue;
        }

        // Calculate investment amount
        const amountInSol = this.swapper.calculateInvestmentAmount(
          settings,
          tokenData
        );

        if (amountInSol === 0) {
          console.log(
            `[TradingBotEngine] Calculated amount is 0 for user ${settings.userId._id}`
          );
          continue;
        }

        eligibleUsers.push({
          userId: settings.userId._id.toString(),
          walletAddress: solanaWallet.address,
          amountInSol,
          slippage: settings.perTradeLimits.slippage,
          settings,
        });
      }

      console.log(
        `[TradingBotEngine] ${eligibleUsers.length} users eligible to buy`
      );

      if (eligibleUsers.length === 0) {
        return;
      }

      // Add to processing queue
      this.processingQueue.push({
        tokenData,
        users: eligibleUsers,
      });

      // Process queue
      this.processQueue();
    } catch (error) {
      console.error(`[TradingBotEngine] Error processing new token:`, error);
    }
  }

  /**
   * Process the buy queue with concurrency control
   */
  async processQueue() {
    if (this.activeTrades >= this.maxConcurrentTrades) {
      console.log(
        `[TradingBotEngine] Max concurrent trades reached (${this.maxConcurrentTrades})`
      );
      return;
    }

    if (this.processingQueue.length === 0) {
      return;
    }

    const item = this.processingQueue.shift();
    this.activeTrades++;

    try {
      await this.executeBuysForToken(item.tokenData, item.users);
    } catch (error) {
      console.error(`[TradingBotEngine] Error executing buys:`, error);
    } finally {
      this.activeTrades--;
      // Process next item in queue
      if (this.processingQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * Execute buy trades for multiple users for a token
   * @param {Object} tokenData - Token data
   * @param {Array} users - Array of eligible users
   */
  async executeBuysForToken(tokenData, users) {
    console.log(
      `[TradingBotEngine] Executing buys for ${users.length} users for token ${tokenData.symbol}`
    );

    const results = await this.swapper.buyTokenForMultipleUsers({
      users,
      tokenMint: tokenData.address,
      tokenData: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        price: tokenData.price,
        liquidity: tokenData.liquidity,
        marketCap: tokenData.marketCap,
      },
    });

    // Log results
    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;

    console.log(
      `[TradingBotEngine] Buy results: ${successful} successful, ${failed} failed`
    );

    // Start monitoring positions for users who bought successfully
    for (const result of results) {
      if (result.success) {
        this.monitorPosition({
          userId: result.userId,
          tokenMint: tokenData.address,
          buyPrice: tokenData.price,
        });
      }
    }
  }

  /**
   * Monitor a user's position for auto-sell triggers
   * @param {Object} params - Position parameters
   */
  async monitorPosition({ userId, tokenMint, buyPrice }) {
    const monitorKey = `${userId}_${tokenMint}`;

    // Don't create duplicate monitors
    if (this.activeMonitors.has(monitorKey)) {
      return;
    }

    console.log(
      `[TradingBotEngine] Starting position monitor for user ${userId}, token ${tokenMint}`
    );

    // Check position every 30 seconds
    const intervalId = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(intervalId);
        this.activeMonitors.delete(monitorKey);
        return;
      }

      try {
        await dbConnect();

        // Get user's wallet
        const settings = await TradingSettings.findOne({ userId }).populate(
          "userId"
        );
        if (!settings || !settings.autoSell.enabled) {
          // Stop monitoring if auto-sell disabled
          clearInterval(intervalId);
          this.activeMonitors.delete(monitorKey);
          return;
        }

        const wallets = settings.userId.wallets || [];
        const solanaWallet = wallets.find((w) => w.type === "phantom");

        if (!solanaWallet) {
          clearInterval(intervalId);
          this.activeMonitors.delete(monitorKey);
          return;
        }

        // Get current token price (you'd integrate with a price API here)
        // For now, we'll check if user still has the token
        const sessionKey = await SessionKey.findOne({
          userId,
          walletAddress: solanaWallet.address.toLowerCase(),
          active: true,
          expiresAt: { $gt: new Date() },
        });

        if (!sessionKey) {
          // No session key, stop monitoring
          clearInterval(intervalId);
          this.activeMonitors.delete(monitorKey);
          return;
        }

        // TODO: Get current price from price API
        // For now, we'll use a placeholder
        const currentPrice = buyPrice; // Replace with actual price

        // Check auto-sell conditions
        const sellResult = await this.autoSell.monitorAndAutoSell({
          userId,
          walletAddress: solanaWallet.address,
          tokenMint,
          buyPrice,
          currentPrice,
        });

        if (sellResult && sellResult.success) {
          console.log(
            `[TradingBotEngine] Auto-sell executed for user ${userId}, token ${tokenMint}`
          );
          // Stop monitoring after sell
          clearInterval(intervalId);
          this.activeMonitors.delete(monitorKey);
        }
      } catch (error) {
        console.error(`[TradingBotEngine] Position monitoring error:`, error);
      }
    }, 30000); // 30 seconds

    this.activeMonitors.set(monitorKey, intervalId);
  }

  /**
   * Start monitoring all existing positions
   */
  async startPositionMonitoring() {
    console.log("[TradingBotEngine] Starting position monitoring...");

    try {
      await dbConnect();

      // Get all active buy trades without sells
      const openPositions = await TradeLog.find({
        tradeType: "buy",
        status: "completed",
        "sellInfo.soldAt": { $exists: false },
      });

      console.log(
        `[TradingBotEngine] Found ${openPositions.length} open positions to monitor`
      );

      for (const position of openPositions) {
        this.monitorPosition({
          userId: position.userId.toString(),
          tokenMint: position.tokenOut,
          buyPrice: position.tokenData?.price || 0,
        });
      }
    } catch (error) {
      console.error(
        `[TradingBotEngine] Error starting position monitoring:`,
        error
      );
    }
  }

  /**
   * Handle emergency sell event for all affected users
   * @param {Object} params - Emergency parameters
   * @param {string} params.tokenMint - Token address
   * @param {string} params.eventType - Event type
   * @param {Object} params.eventData - Event data
   */
  async handleEmergencyEvent({ tokenMint, eventType, eventData }) {
    console.log(
      `[TradingBotEngine] Emergency event: ${eventType} for token ${tokenMint}`
    );

    try {
      await dbConnect();

      // Find all users with open positions in this token
      const openPositions = await TradeLog.find({
        tradeType: "buy",
        tokenOut: tokenMint,
        status: "completed",
        "sellInfo.soldAt": { $exists: false },
      }).distinct("userId");

      console.log(
        `[TradingBotEngine] Found ${openPositions.length} users with open positions`
      );

      // Execute emergency sells
      for (const userId of openPositions) {
        const settings = await TradingSettings.findOne({ userId }).populate(
          "userId"
        );
        if (!settings) continue;

        const wallets = settings.userId.wallets || [];
        const solanaWallet = wallets.find((w) => w.type === "phantom");
        if (!solanaWallet) continue;

        const result = await this.autoSell.emergencySell({
          userId: userId.toString(),
          walletAddress: solanaWallet.address,
          tokenMint,
          eventType,
          eventData,
        });

        if (result.success) {
          console.log(
            `[TradingBotEngine] Emergency sell successful for user ${userId}`
          );
          // Stop monitoring this position
          const monitorKey = `${userId}_${tokenMint}`;
          if (this.activeMonitors.has(monitorKey)) {
            clearInterval(this.activeMonitors.get(monitorKey));
            this.activeMonitors.delete(monitorKey);
          }
        }

        // Small delay between emergency sells
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(
        `[TradingBotEngine] Error handling emergency event:`,
        error
      );
    }
  }

  /**
   * Get bot status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeMonitors: this.activeMonitors.size,
      queueLength: this.processingQueue.length,
      activeTrades: this.activeTrades,
      maxConcurrentTrades: this.maxConcurrentTrades,
    };
  }
}

// Global singleton instance
let botEngineInstance = null;

/**
 * Get or create the global bot engine instance
 * @returns {TradingBotEngine}
 */
export function getTradingBotEngine() {
  if (!botEngineInstance) {
    botEngineInstance = new TradingBotEngine();
  }
  return botEngineInstance;
}
