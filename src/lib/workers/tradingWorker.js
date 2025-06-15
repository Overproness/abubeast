import dbConnect from "@/lib/db/mongodb";
import Token from "@/models/Token";
import TradeLog from "@/models/TradeLog";
import TradeOrder from "@/models/TradeOrder";
import TradingPermission from "@/models/TradingPermission";
import { LiFi } from "@lifi/sdk";
import { ethers } from "ethers";
import { analyzeAndTradeNewTokens } from "../services/tokenAnalyzerService";
import {
  executeTrade,
  getUserTradingSettings,
} from "../services/tradingService";

// Initialize LiFi SDK
const lifi = new LiFi({
  integrator: "AbuBeast",
});

/**
 * Main worker function to check for new tokens and execute automated trades
 */
export async function monitorAndTradeNewTokens() {
  try {
    console.log("Starting trading worker process");
    await dbConnect();

    // Find new tokens that haven't been analyzed yet
    const unanalyzedTokens = await Token.find({ analyzed: { $ne: true } })
      .sort({ added_at: -1 })
      .limit(50)
      .lean();

    if (unanalyzedTokens.length === 0) {
      console.log("No new unanalyzed tokens found");

      // Also check for eligible analyzed tokens for users who might have
      // connected after the tokens were analyzed
      await checkForMissedTradingOpportunities();
      return;
    }

    console.log(`Found ${unanalyzedTokens.length} unanalyzed tokens`);

    // Analyze tokens and execute trades for eligible users
    await analyzeAndTradeNewTokens(unanalyzedTokens);

    // Mark tokens as analyzed
    await Promise.all(
      unanalyzedTokens.map(async (token) => {
        await Token.findOneAndUpdate(
          { _id: token._id },
          { analyzed: true, analyzed_at: new Date() }
        );
      })
    );

    console.log("Completed token analysis and trading");
  } catch (error) {
    console.error("Trading worker error:", error);
  }
}

/**
 * Check for missed trading opportunities for recently connected users
 */
async function checkForMissedTradingOpportunities() {
  try {
    // Find trading permissions created in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const newPermissions = await TradingPermission.find({
      active: true,
      createdAt: { $gte: oneDayAgo },
    }).lean();

    if (newPermissions.length === 0) {
      return;
    }

    console.log(
      `Found ${newPermissions.length} new trading permissions to check for opportunities`
    );

    // Get recently analyzed tokens with positive recommendations
    const recentTokens = await Token.find({
      analyzed: true,
      "analysis.recommended": true,
      analyzed_at: { $gte: oneDayAgo },
    })
      .limit(20)
      .lean();

    if (recentTokens.length === 0) {
      return;
    }

    console.log(`Found ${recentTokens.length} recent recommended tokens`);

    // For each new permission, check if we should trade these tokens
    for (const permission of newPermissions) {
      // Process the permission for the recent tokens
      await processPermissionForTrading(permission, recentTokens);
    }
  } catch (error) {
    console.error("Error checking for missed trading opportunities:", error);
  }
}

/**
 * Process trading permission for eligible tokens
 */
async function processPermissionForTrading(permission, newTokens) {
  try {
    const userId = permission.userId;
    const walletAddress = permission.walletAddress;

    // Get user's trading settings
    const settings = await getUserTradingSettings(userId, walletAddress);

    // Filter tokens based on user's settings
    const matchingTokens = filterTokensBySettings(newTokens, settings);

    if (matchingTokens.length === 0) {
      return;
    }

    console.log(
      `Found ${matchingTokens.length} matching tokens for wallet ${walletAddress}`
    );

    // Check daily investment limit
    const dailySpent = await getDailySpentAmount(userId, walletAddress);
    const remainingBudget = settings.maxDailyInvestment - dailySpent;

    if (remainingBudget <= 0) {
      console.log(`Daily investment limit reached for wallet ${walletAddress}`);
      return;
    }

    // Determine investment amount for each token
    const tokensToTrade = [];
    let budgetRemaining = remainingBudget;

    for (const token of matchingTokens) {
      // Skip if already traded this token with this wallet
      const alreadyTraded = await hasAlreadyTraded(
        userId,
        walletAddress,
        token.mint_address
      );
      if (alreadyTraded) continue;

      // Determine amount to invest in this token
      const investAmount = Math.min(
        settings.maxInvestmentPerToken,
        budgetRemaining
      );

      if (investAmount < 10) {
        // Skip if investment amount is too small
        continue;
      }

      tokensToTrade.push({
        token,
        amount: investAmount,
      });

      budgetRemaining -= investAmount;

      if (budgetRemaining <= 0) break;
    }

    // Execute trades for each token
    for (const { token, amount } of tokensToTrade) {
      try {
        await executeAutomatedTrade(
          userId,
          walletAddress,
          token,
          amount,
          settings
        );
      } catch (error) {
        console.error(
          `Error executing trade for token ${token.mint_address}:`,
          error
        );
        // Continue with next token
      }
    }
  } catch (error) {
    console.error(
      `Error processing permission for wallet ${permission.walletAddress}:`,
      error
    );
    throw error;
  }
}

/**
 * Execute an automated trade for a token
 */
async function executeAutomatedTrade(
  userId,
  walletAddress,
  token,
  amountUSD,
  settings
) {
  try {
    // Determine network and stable coin to use for trade
    const { chainId, stableToken } = determineTradeNetwork(token);

    // Create trade info
    const tradeInfo = {
      fromChainId: chainId,
      toChainId: chainId,
      fromTokenAddress: stableToken.address,
      toTokenAddress: token.mint_address,
      amount: ethers.utils
        .parseUnits(amountUSD.toString(), stableToken.decimals)
        .toString(),
      amountUSD,
      dailyTotalUSD:
        (await getDailySpentAmount(userId, walletAddress)) + amountUSD,
    };

    // Execute the trade
    const wallet = {
      address: walletAddress,
      networkType: "ethereum", // Determine based on the token
    };

    const tradeResult = await executeTrade(userId, tradeInfo, wallet);

    // Create stop loss and take profit orders
    await createStopLossOrder(
      userId,
      walletAddress,
      token.mint_address,
      tradeResult.toAmount,
      settings.stopLossPercentage,
      chainId
    );

    await createTakeProfitOrder(
      userId,
      walletAddress,
      token.mint_address,
      tradeResult.toAmount,
      settings.takeProfitPercentage,
      chainId
    );

    console.log(`Successfully executed trade for token ${token.mint_address}`);
    return tradeResult;
  } catch (error) {
    console.error(`Error in executeAutomatedTrade:`, error);
    throw error;
  }
}

// Helper functions
async function getEligibleNewTokens() {
  // This would be implemented to fetch new tokens from your database
  // that match criteria for automated trading
  // ...
}

function filterTokensBySettings(tokens, settings) {
  // Filter tokens based on user settings
  // ...
}

async function getDailySpentAmount(userId, walletAddress) {
  // Calculate how much the user has spent today
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const logs = await TradeLog.find({
    userId,
    walletAddress: walletAddress.toLowerCase(),
    timestamp: { $gte: oneDayAgo },
    tradeType: "buy",
    automated: true,
  }).lean();

  return logs.reduce((total, log) => {
    return total + (log.gasCostUSD || 0);
  }, 0);
}

async function hasAlreadyTraded(userId, walletAddress, tokenAddress) {
  // Check if already traded this token
  const exists = await TradeLog.findOne({
    userId,
    walletAddress: walletAddress.toLowerCase(),
    toToken: tokenAddress,
    automated: true,
  }).lean();

  return !!exists;
}

function determineTradeNetwork(token) {
  // Determine which network and stable coin to use
  // ...
}

async function createStopLossOrder(
  userId,
  walletAddress,
  tokenAddress,
  amount,
  percentage,
  chainId
) {
  // Create a stop loss order
  // ...
}

async function createTakeProfitOrder(
  userId,
  walletAddress,
  tokenAddress,
  amount,
  percentage,
  chainId
) {
  // Create a take profit order
  // ...
}

/**
 * Monitor and execute existing trade orders (stop-loss, take-profit)
 */
export async function monitorAndExecuteTradeOrders() {
  try {
    console.log("Starting order monitoring process");
    await dbConnect();

    // Get all active trade orders
    const activeOrders = await TradeOrder.find({ status: "active" }).lean();

    if (activeOrders.length === 0) {
      console.log("No active trade orders found");
      return;
    }

    console.log(`Found ${activeOrders.length} active trade orders`);

    // Check each order against current price
    for (const order of activeOrders) {
      try {
        // Get current token price
        const currentPrice = await getTokenCurrentPrice(
          order.tokenAddress,
          order.chainId
        );

        if (!currentPrice) continue;

        let shouldExecute = false;

        // Check if price condition is met
        if (
          order.orderType === "stop_loss" &&
          order.triggerCondition === "<=" &&
          currentPrice <= order.targetPrice
        ) {
          shouldExecute = true;
        } else if (
          order.orderType === "take_profit" &&
          order.triggerCondition === ">=" &&
          currentPrice >= order.targetPrice
        ) {
          shouldExecute = true;
        }

        if (shouldExecute) {
          await executeTradeOrder(order, currentPrice);
        }
      } catch (error) {
        console.error(`Error processing order ${order._id}:`, error);
        // Continue with next order
      }
    }

    console.log("Completed order monitoring process");
  } catch (error) {
    console.error("Order monitoring error:", error);
  }
}

async function getTokenCurrentPrice(tokenAddress, chainId) {
  // Get current price for a token
  // ...
}

async function executeTradeOrder(order, currentPrice) {
  // Execute a trade order
  // ...
}
