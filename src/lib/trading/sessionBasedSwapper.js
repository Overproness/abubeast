/**
 * Session-Based Swapper Service
 * Adapts the swappers_js_ported logic to use SessionKeyTrader
 * instead of hardcoded private keys
 */

import dbConnect from "@/lib/db/mongodb";
import { SessionKeyTrader } from "@/lib/trading/sessionKeyTrader";
import SessionKey from "@/models/SessionKey";
import TradeLog from "@/models/TradeLog";
import TradingSettings from "@/models/TradingSettings";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

export class SessionBasedSwapper {
  constructor() {
    this.heliusApiKey = process.env.HELIUS_API_KEY;
    if (!this.heliusApiKey) {
      throw new Error("HELIUS_API_KEY is required");
    }
  }

  /**
   * Execute buy trade for a user using their session key
   * @param {Object} params - Trade parameters
   * @param {string} params.userId - User ID
   * @param {string} params.walletAddress - User's wallet address
   * @param {string} params.tokenMint - Token to buy
   * @param {number} params.amountInSol - Amount of SOL to spend
   * @param {number} params.slippage - Slippage tolerance
   * @param {Object} params.tokenData - Additional token data for logging
   * @returns {Promise<Object>} Trade result
   */
  async buyTokenForUser({
    userId,
    walletAddress,
    tokenMint,
    amountInSol,
    slippage,
    tokenData = {},
  }) {
    console.log(`[SessionBasedSwapper] Buying token for user ${userId}`);
    console.log(`  Token: ${tokenMint}`);
    console.log(`  Amount: ${amountInSol} SOL`);
    console.log(`  Slippage: ${slippage}%`);

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
      if (!settings) {
        throw new Error("Trading settings not found for user");
      }

      // Check if bot is enabled
      if (!settings.botEnabled) {
        throw new Error("Trading bot is not enabled for this user");
      }

      // Check if user can trade today
      if (!settings.canTradeToday()) {
        throw new Error("Daily trading limit reached");
      }

      // Check if trade amount is within limits
      if (!settings.canTradeAmount(amountInSol)) {
        throw new Error(
          `Trade amount ${amountInSol} SOL exceeds limits (min: ${settings.perTradeLimits.minInvestment}, max: ${settings.perTradeLimits.maxInvestment})`
        );
      }

      // Initialize trader with session key
      const trader = new SessionKeyTrader(sessionKey, this.heliusApiKey);

      // Check permissions and limits
      await trader.checkPermissions("buy", amountInSol);

      // Check SOL balance
      const solBalance = await trader.getBalance();
      console.log(`[SessionBasedSwapper] User SOL balance: ${solBalance}`);

      if (solBalance < amountInSol) {
        throw new Error(
          `Insufficient SOL balance: ${solBalance} < ${amountInSol}`
        );
      }

      // Execute the buy
      console.log(`[SessionBasedSwapper] Executing buy transaction...`);
      const result = await trader.buyToken(
        WRAPPED_SOL_MINT, // Input token (SOL)
        tokenMint, // Output token
        amountInSol,
        null, // minAmountOut (let Jupiter calculate)
        slippage,
        true, // highPriority
        false // useJito
      );

      if (!result.success) {
        throw new Error(result.error || "Buy transaction failed");
      }

      console.log(
        `[SessionBasedSwapper] Buy successful! Signature: ${result.signature}`
      );

      // Record trade in settings
      settings.recordTrade(amountInSol);
      await settings.save();

      // Update session key usage
      sessionKey.usageStats.transactionsCount++;
      sessionKey.usageStats.totalVolume += amountInSol;
      sessionKey.usageStats.lastUsedAt = new Date();
      sessionKey.usageStats.dailySpent += amountInSol;
      sessionKey.auditLog.push({
        action: "used",
        timestamp: new Date(),
        details: {
          type: "buy",
          tokenMint,
          amountInSol,
          signature: result.signature,
        },
      });
      await sessionKey.save();

      // Log trade
      const tradeLog = new TradeLog({
        userId,
        walletAddress,
        sessionKeyId: sessionKey._id,
        tradeType: "buy",
        tokenIn: WRAPPED_SOL_MINT,
        tokenOut: tokenMint,
        amountIn: amountInSol,
        amountOut: result.amountOut,
        signature: result.signature,
        slippage,
        tokenData: {
          name: tokenData.name || "Unknown",
          symbol: tokenData.symbol || "Unknown",
          price: tokenData.price || 0,
          liquidity: tokenData.liquidity || 0,
          marketCap: tokenData.marketCap || 0,
        },
        status: "completed",
        completedAt: new Date(),
      });
      await tradeLog.save();

      return {
        success: true,
        signature: result.signature,
        amountOut: result.amountOut,
        tradeLogId: tradeLog._id,
      };
    } catch (error) {
      console.error(`[SessionBasedSwapper] Buy failed:`, error);

      // Log failed trade
      try {
        await dbConnect();
        const tradeLog = new TradeLog({
          userId,
          walletAddress,
          tradeType: "buy",
          tokenIn: WRAPPED_SOL_MINT,
          tokenOut: tokenMint,
          amountIn: amountInSol,
          slippage,
          status: "failed",
          error: error.message,
        });
        await tradeLog.save();
      } catch (logError) {
        console.error("[SessionBasedSwapper] Failed to log error:", logError);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute multiple buys for multiple users
   * @param {Object} params - Batch parameters
   * @param {Array} params.users - Array of user trade configs
   * @param {string} params.tokenMint - Token to buy
   * @param {Object} params.tokenData - Token data
   * @returns {Promise<Array>} Array of results
   */
  async buyTokenForMultipleUsers({ users, tokenMint, tokenData }) {
    console.log(
      `[SessionBasedSwapper] Batch buying token ${tokenMint} for ${users.length} users`
    );

    const results = [];

    for (const user of users) {
      try {
        const result = await this.buyTokenForUser({
          userId: user.userId,
          walletAddress: user.walletAddress,
          tokenMint,
          amountInSol: user.amountInSol,
          slippage: user.slippage,
          tokenData,
        });

        results.push({
          userId: user.userId,
          ...result,
        });

        // Small delay between trades to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `[SessionBasedSwapper] Failed for user ${user.userId}:`,
          error
        );
        results.push({
          userId: user.userId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Check if token passes user's filters
   * @param {Object} tokenData - Token data
   * @param {Object} settings - User's trading settings
   * @returns {Object} Filter result with reason
   */
  checkTokenFilters(tokenData, settings) {
    const filters = settings.tokenFilters;

    // Check liquidity
    if (tokenData.liquidity < filters.minLiquidity) {
      return {
        passed: false,
        reason: `Liquidity too low: ${tokenData.liquidity} < ${filters.minLiquidity}`,
      };
    }

    // Check market cap
    if (tokenData.marketCap > filters.maxMarketCap) {
      return {
        passed: false,
        reason: `Market cap too high: ${tokenData.marketCap} > ${filters.maxMarketCap}`,
      };
    }

    // Check token age
    if (tokenData.age && tokenData.age > filters.maxTokenAge) {
      return {
        passed: false,
        reason: `Token too old: ${tokenData.age}s > ${filters.maxTokenAge}s`,
      };
    }

    // Check LP burn
    if (filters.requireLpBurn) {
      const lpBurn = parseFloat(tokenData.lpBurn) || 0;
      if (lpBurn < filters.minLpBurnPercent) {
        return {
          passed: false,
          reason: `LP burn too low: ${lpBurn}% < ${filters.minLpBurnPercent}%`,
        };
      }
    }

    // Check mint authority
    if (filters.blockMintAuthority && tokenData.mintAuthority) {
      return {
        passed: false,
        reason: "Token has mint authority (blocked by filter)",
      };
    }

    // Check freeze authority
    if (filters.blockFreezeAuthority && tokenData.freezeAuthority) {
      return {
        passed: false,
        reason: "Token has freeze authority (blocked by filter)",
      };
    }

    return {
      passed: true,
      reason: "All filters passed",
    };
  }

  /**
   * Calculate investment amount based on strategy
   * @param {Object} settings - User's trading settings
   * @param {Object} tokenData - Token data
   * @returns {number} Amount in SOL
   */
  calculateInvestmentAmount(settings, tokenData) {
    const { minInvestment, maxInvestment } = settings.perTradeLimits;

    // Start with base amount based on strategy
    let amount;
    switch (settings.strategy) {
      case "conservative":
        amount = minInvestment * 1.5;
        break;
      case "aggressive":
        amount = maxInvestment * 0.8;
        break;
      case "moderate":
      default:
        amount = (minInvestment + maxInvestment) / 2;
    }

    // Adjust based on token liquidity (higher liquidity = more investment)
    if (tokenData.liquidity) {
      const liquidityFactor = Math.min(tokenData.liquidity / 10000, 1.5);
      amount *= liquidityFactor;
    }

    // Ensure within limits
    amount = Math.max(minInvestment, Math.min(amount, maxInvestment));

    // Ensure doesn't exceed remaining daily budget
    const remaining =
      settings.dailyLimits.maxSpending - settings.stats.todaySpent;
    amount = Math.min(amount, remaining);

    return amount;
  }
}
