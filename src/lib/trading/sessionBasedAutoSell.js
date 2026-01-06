/**
 * Session-Based Auto-Sell Service
 * Adapts the auto_sell_js_ported logic to use SessionKeyTrader
 * instead of hardcoded private keys
 */

import dbConnect from "@/lib/db/mongodb";
import { SessionKeyTrader } from "@/lib/trading/sessionKeyTrader";
import SessionKey from "@/models/SessionKey";
import TradeLog from "@/models/TradeLog";
import TradingSettings from "@/models/TradingSettings";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

export class SessionBasedAutoSell {
  constructor() {
    this.heliusApiKey = process.env.HELIUS_API_KEY;
    if (!this.heliusApiKey) {
      throw new Error("HELIUS_API_KEY is required");
    }
    this.recentSells = new Map(); // Track recent sells to prevent duplicates
  }

  /**
   * Execute emergency sell for a user
   * @param {Object} params - Sell parameters
   * @param {string} params.userId - User ID
   * @param {string} params.walletAddress - User's wallet address
   * @param {string} params.tokenMint - Token to sell
   * @param {string} params.triggerType - Reason for sell (dev_sell, whale_sell, rug_pull, stop_loss, take_profit)
   * @param {Object} params.triggerDetails - Details about the trigger
   * @param {number} params.sellPercentage - Percentage of holdings to sell (1-100)
   * @returns {Promise<Object>} Sell result
   */
  async sellTokenForUser({
    userId,
    walletAddress,
    tokenMint,
    triggerType,
    triggerDetails = {},
    sellPercentage = 100,
  }) {
    console.log(`[SessionBasedAutoSell] Selling token for user ${userId}`);
    console.log(`  Token: ${tokenMint}`);
    console.log(`  Trigger: ${triggerType}`);
    console.log(`  Sell percentage: ${sellPercentage}%`);

    const currentTime = Math.floor(Date.now() / 1000);
    const cooldownKey = `${userId}_${tokenMint}`;

    // Check for duplicate sells within cooldown period (30 seconds)
    if (this.recentSells.has(cooldownKey)) {
      const lastSellTime = this.recentSells.get(cooldownKey);
      if (currentTime - lastSellTime < 30) {
        console.warn(
          `[SessionBasedAutoSell] Duplicate sell attempt within cooldown for ${tokenMint}`
        );
        return {
          success: false,
          error: "Duplicate sell attempt within cooldown period",
        };
      }
    }

    this.recentSells.set(cooldownKey, currentTime);

    try {
      await dbConnect();

      // Get user's active session key
      const sessionKey = await SessionKey.findOne({
        userId,
        walletAddress: walletAddress.toLowerCase(),
        active: true,
        expiresAt: { $gt: new Date() },
      });

      if (!sessionKey) {
        throw new Error("No active session key found for user");
      }

      // Check if session key has trading permissions
      if (!sessionKey.permissions.canTrade && !sessionKey.permissions.canSwap) {
        throw new Error("Session key does not have trading permissions");
      }

      // Get user's trading settings
      const settings = await TradingSettings.findOne({ userId });
      if (!settings || !settings.autoSell.enabled) {
        console.log(
          `[SessionBasedAutoSell] Auto-sell not enabled for user ${userId}`
        );
        return {
          success: false,
          error: "Auto-sell is not enabled",
        };
      }

      // Initialize trader with session key
      const trader = new SessionKeyTrader(sessionKey, this.heliusApiKey);

      // Check permissions (selling doesn't have amount until we check balance)
      await trader.checkPermissions("sell", 0);

      // Get token balance
      const tokenBalance = await trader.getBalance(tokenMint);
      console.log(`[SessionBasedAutoSell] User token balance: ${tokenBalance}`);

      if (tokenBalance === 0) {
        console.log(
          `[SessionBasedAutoSell] No tokens to sell for ${tokenMint}`
        );
        return {
          success: false,
          error: "No tokens to sell",
        };
      }

      // Calculate amount to sell based on percentage
      const amountToSell = (tokenBalance * sellPercentage) / 100;

      if (amountToSell === 0) {
        return {
          success: false,
          error: "Calculated sell amount is zero",
        };
      }

      // Get slippage from settings
      const slippage = settings.perTradeLimits.slippage || 5;

      // Execute the sell
      console.log(
        `[SessionBasedAutoSell] Executing sell transaction for ${amountToSell} tokens...`
      );
      const result = await trader.sellToken(
        tokenMint, // Input token
        WRAPPED_SOL_MINT, // Output token (SOL)
        amountToSell,
        null, // minAmountOut (let Jupiter calculate)
        slippage,
        true, // highPriority
        false // useJito
      );

      if (!result.success) {
        throw new Error(result.error || "Sell transaction failed");
      }

      console.log(
        `[SessionBasedAutoSell] Sell successful! Signature: ${result.signature}`
      );
      console.log(`[SessionBasedAutoSell] Received: ${result.amountOut} SOL`);

      // Find the original buy trade to calculate profit/loss
      const buyTrade = await TradeLog.findOne({
        userId,
        walletAddress,
        tradeType: "buy",
        tokenOut: tokenMint,
        status: "completed",
      }).sort({ completedAt: -1 });

      let profitLoss = 0;
      let profitLossPercent = 0;

      if (buyTrade) {
        profitLoss = result.amountOut - buyTrade.amountIn;
        profitLossPercent = (profitLoss / buyTrade.amountIn) * 100;
        console.log(
          `[SessionBasedAutoSell] P/L: ${profitLoss.toFixed(
            4
          )} SOL (${profitLossPercent.toFixed(2)}%)`
        );

        // Update buy trade with sell info
        buyTrade.sellInfo = {
          soldAt: new Date(),
          sellPrice: result.amountOut / amountToSell,
          amountSold: amountToSell,
          solReceived: result.amountOut,
          profitLoss,
          profitLossPercent,
          triggerType,
        };
        await buyTrade.save();
      }

      // Update settings stats
      if (profitLoss > 0) {
        settings.stats.totalProfit += profitLoss;
      } else {
        settings.stats.totalLoss += Math.abs(profitLoss);
      }

      // Update win rate
      const totalTrades = settings.stats.totalTrades;
      if (totalTrades > 0) {
        const wins = profitLoss > 0 ? 1 : 0;
        settings.stats.winRate =
          (settings.stats.winRate * (totalTrades - 1) + wins * 100) /
          totalTrades;
      }

      await settings.save();

      // Update session key usage
      sessionKey.usageStats.transactionsCount++;
      sessionKey.usageStats.lastUsedAt = new Date();
      sessionKey.auditLog.push({
        action: "used",
        timestamp: new Date(),
        details: {
          type: "sell",
          tokenMint,
          amountSold: amountToSell,
          solReceived: result.amountOut,
          signature: result.signature,
          triggerType,
          triggerDetails,
        },
      });
      await sessionKey.save();

      // Log sell trade
      const tradeLog = new TradeLog({
        userId,
        walletAddress,
        sessionKeyId: sessionKey._id,
        tradeType: "sell",
        tokenIn: tokenMint,
        tokenOut: WRAPPED_SOL_MINT,
        amountIn: amountToSell,
        amountOut: result.amountOut,
        signature: result.signature,
        slippage,
        profitLoss,
        profitLossPercent,
        triggerType,
        triggerDetails,
        status: "completed",
        completedAt: new Date(),
      });
      await tradeLog.save();

      return {
        success: true,
        signature: result.signature,
        amountSold: amountToSell,
        solReceived: result.amountOut,
        profitLoss,
        profitLossPercent,
        tradeLogId: tradeLog._id,
      };
    } catch (error) {
      console.error(`[SessionBasedAutoSell] Sell failed:`, error);

      // Log failed sell
      try {
        await dbConnect();
        const tradeLog = new TradeLog({
          userId,
          walletAddress,
          tradeType: "sell",
          tokenIn: tokenMint,
          tokenOut: WRAPPED_SOL_MINT,
          triggerType,
          triggerDetails,
          status: "failed",
          error: error.message,
        });
        await tradeLog.save();
      } catch (logError) {
        console.error("[SessionBasedAutoSell] Failed to log error:", logError);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Monitor a position and trigger auto-sell if conditions are met
   * @param {Object} params - Monitor parameters
   * @param {string} params.userId - User ID
   * @param {string} params.walletAddress - User's wallet address
   * @param {string} params.tokenMint - Token to monitor
   * @param {number} params.buyPrice - Price when bought
   * @param {number} params.currentPrice - Current price
   * @returns {Promise<Object|null>} Sell result if triggered, null otherwise
   */
  async monitorAndAutoSell({
    userId,
    walletAddress,
    tokenMint,
    buyPrice,
    currentPrice,
  }) {
    try {
      await dbConnect();

      const settings = await TradingSettings.findOne({ userId });
      if (!settings || !settings.autoSell.enabled) {
        return null;
      }

      const autoSell = settings.autoSell;

      // Calculate profit/loss percentage
      const plPercent = ((currentPrice - buyPrice) / buyPrice) * 100;

      // Check take profit
      if (
        autoSell.takeProfitEnabled &&
        plPercent >= autoSell.takeProfitPercent
      ) {
        console.log(
          `[SessionBasedAutoSell] Take profit triggered for ${tokenMint}: ${plPercent.toFixed(
            2
          )}% >= ${autoSell.takeProfitPercent}%`
        );
        return await this.sellTokenForUser({
          userId,
          walletAddress,
          tokenMint,
          triggerType: "take_profit",
          triggerDetails: {
            buyPrice,
            currentPrice,
            profitPercent: plPercent,
            targetPercent: autoSell.takeProfitPercent,
          },
          sellPercentage: 100,
        });
      }

      // Check stop loss
      if (autoSell.stopLossEnabled && plPercent <= -autoSell.stopLossPercent) {
        console.log(
          `[SessionBasedAutoSell] Stop loss triggered for ${tokenMint}: ${plPercent.toFixed(
            2
          )}% <= -${autoSell.stopLossPercent}%`
        );
        return await this.sellTokenForUser({
          userId,
          walletAddress,
          tokenMint,
          triggerType: "stop_loss",
          triggerDetails: {
            buyPrice,
            currentPrice,
            lossPercent: plPercent,
            stopLossPercent: autoSell.stopLossPercent,
          },
          sellPercentage: 100,
        });
      }

      return null;
    } catch (error) {
      console.error(
        `[SessionBasedAutoSell] Monitor failed for ${tokenMint}:`,
        error
      );
      return null;
    }
  }

  /**
   * Trigger emergency sell based on events (dev sell, whale sell, rug pull)
   * @param {Object} params - Emergency parameters
   * @param {string} params.userId - User ID
   * @param {string} params.walletAddress - User's wallet address
   * @param {string} params.tokenMint - Token address
   * @param {string} params.eventType - Event type (dev_sell, whale_sell, rug_pull)
   * @param {Object} params.eventData - Event data
   * @returns {Promise<Object>} Sell result
   */
  async emergencySell({
    userId,
    walletAddress,
    tokenMint,
    eventType,
    eventData,
  }) {
    console.log(
      `[SessionBasedAutoSell] Emergency sell triggered for user ${userId}`
    );
    console.log(`  Event: ${eventType}`);

    try {
      await dbConnect();

      const settings = await TradingSettings.findOne({ userId });
      if (!settings || !settings.autoSell.enabled) {
        console.log(`[SessionBasedAutoSell] Auto-sell not enabled`);
        return {
          success: false,
          error: "Auto-sell not enabled",
        };
      }

      const emergencySettings = settings.autoSell.emergencySell;

      // Validate event triggers emergency sell
      let shouldSell = false;
      let reason = "";

      switch (eventType) {
        case "dev_sell":
          if (
            eventData.percentSold >= emergencySettings.devSellThreshold &&
            emergencySettings.rugPullDetection
          ) {
            shouldSell = true;
            reason = `Developer sold ${eventData.percentSold}% (threshold: ${emergencySettings.devSellThreshold}%)`;
          }
          break;

        case "whale_sell":
          if (eventData.percentSold >= emergencySettings.largeSellThreshold) {
            shouldSell = true;
            reason = `Whale sold ${eventData.percentSold}% (threshold: ${emergencySettings.largeSellThreshold}%)`;
          }
          break;

        case "rug_pull":
          if (emergencySettings.rugPullDetection) {
            shouldSell = true;
            reason = "Rug pull detected";
          }
          break;

        default:
          return {
            success: false,
            error: "Unknown event type",
          };
      }

      if (!shouldSell) {
        console.log(
          `[SessionBasedAutoSell] Event doesn't meet threshold for emergency sell`
        );
        return {
          success: false,
          error: "Event doesn't meet threshold",
        };
      }

      console.log(`[SessionBasedAutoSell] Emergency sell reason: ${reason}`);

      // Execute emergency sell
      return await this.sellTokenForUser({
        userId,
        walletAddress,
        tokenMint,
        triggerType: eventType,
        triggerDetails: {
          ...eventData,
          reason,
        },
        sellPercentage: settings.autoSell.sellPercentage,
      });
    } catch (error) {
      console.error(`[SessionBasedAutoSell] Emergency sell failed:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
