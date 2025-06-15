import dbConnect from "@/lib/db/mongodb";
import { createTradeOrder, executeTrade } from "@/lib/services/tradingService";
import Token from "@/models/Token";
import TradeLog from "@/models/TradeLog";
import TradingPermission from "@/models/TradingPermission";
import { ethers } from "ethers";

// Constant values for risk management
const RISK_MANAGEMENT = {
  DEFAULT_STOP_LOSS: -15, // 15% stop loss
  TAKE_PROFIT_FIRST: 20, // 20% first take profit
  TAKE_PROFIT_SECOND: 50, // 50% second take profit
  MAX_POSITION_SIZE_PERCENT: 5, // 5% of available funds max
  TRAILING_STOP_ACTIVATION: 15, // Activate trailing stop after 15% profit
  TRAILING_STOP_DISTANCE: 10, // 10% trailing distance
};

// Capitalization blocks for token analysis
const CAPITALIZATION_BLOCKS = {
  MICRO: { min: 0, max: 100000 }, // $0 - $100k
  SMALL: { min: 100000, max: 1000000 }, // $100k - $1M
  MEDIUM: { min: 1000000, max: 10000000 }, // $1M - $10M
  LARGE: { min: 10000000, max: Infinity }, // $10M+
};

// Options for trading strategies based on token analysis
const TRADING_OPTIONS = {
  OPTION_A: {
    // Dev Sell
    name: "DEV_SELL",
    negativeSentimentThreshold: 0.3,
    profitTargets: {
      low: { min: 10, max: 20 },
      medium: { min: 20, max: 30 },
      high: { min: 30, max: 40 },
    },
  },
  OPTION_B: {
    // Dev Rebuy
    name: "DEV_REBUY",
    negativeSentimentThreshold: 0.4,
    profitTargets: {
      low: { min: 15, max: 25 },
      medium: { min: 25, max: 35 },
      high: { min: 35, max: 45 },
    },
  },
  OPTION_C: {
    // No Sell
    name: "NO_SELL",
    negativeSentimentThreshold: 0.5,
    profitTargets: {
      low: { min: 20, max: 30 },
      medium: { min: 30, max: 40 },
      high: { min: 40, max: 50 },
    },
  },
  OPTION_D: {
    // Dev Burn
    name: "DEV_BURN",
    negativeSentimentThreshold: 0.6,
    profitTargets: {
      low: { min: 25, max: 35 },
      medium: { min: 35, max: 45 },
      high: { min: 45, max: 55 },
    },
  },
};

/**
 * Main function to analyze a batch of new tokens and execute trades
 * @param {Array} newTokens - Array of new tokens to analyze
 */
export async function analyzeAndTradeNewTokens(newTokens) {
  try {
    console.log(
      `Analyzing ${newTokens.length} new tokens for trading opportunities`
    );
    await dbConnect();

    // Get all active trading permissions
    const permissions = await TradingPermission.find({ active: true }).lean();

    if (permissions.length === 0) {
      console.log("No active trading permissions found");
      return;
    }

    console.log(`Found ${permissions.length} active trading permissions`);

    // Analyze each token
    for (const token of newTokens) {
      try {
        // Fetch additional token data for analysis
        const tokenData = await fetchTokenData(token.mint_address);

        if (!tokenData) {
          console.log(
            `Skipping token ${token.mint_address}: Could not fetch data`
          );
          continue;
        }

        // Enrich our token object with fetched data
        const enrichedToken = {
          ...token,
          marketData: tokenData,
        };

        // Analyze the token
        const analysis = analyzeToken(enrichedToken);

        if (!analysis.recommended) {
          console.log(
            `Skipping token ${token.mint_address}: Not recommended for trading`
          );
          continue;
        }

        console.log(
          `Token ${token.mint_address} passed analysis with strategy: ${analysis.strategy}`
        );

        // Execute trades for all eligible users
        for (const permission of permissions) {
          try {
            await executeTradeForUser(permission, enrichedToken, analysis);
          } catch (error) {
            console.error(
              `Failed to execute trade for user ${permission.userId} and token ${token.mint_address}:`,
              error
            );
            // Continue with next permission
          }
        }
      } catch (error) {
        console.error(`Error analyzing token ${token.mint_address}:`, error);
        // Continue with next token
      }
    }

    console.log("Token analysis and trading completed");
    return true;
  } catch (error) {
    console.error("Error in analyzeAndTradeNewTokens:", error);
    throw error;
  }
}

/**
 * Fetch extended token data for analysis
 * @param {string} tokenAddress - Token contract address
 */
async function fetchTokenData(tokenAddress) {
  try {
    // Try to get token from our database first
    const tokenFromDb = await Token.findOne({
      mint_address: tokenAddress,
    }).lean();

    if (tokenFromDb && tokenFromDb.processed && tokenFromDb.marketData) {
      return tokenFromDb.marketData;
    }

    // If not in database or not processed, fetch from external API
    const apiKey = process.env.MOBULA_API_KEY || "";

    console.log(`Fetching token data for ${tokenAddress} from external API`);

    const response = await fetch(
      `https://production-api.mobula.io/api/1/market/data?asset=${tokenAddress}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${apiKey}`,
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch data for ${tokenAddress}: ${response.status}`
      );

      // Add additional error handling to check if the error is due to the token not existing
      if (response.status === 404) {
        console.log(`Token ${tokenAddress} not found in external API`);
        // Create a record to avoid repeated lookups for non-existent tokens
        await Token.findOneAndUpdate(
          { mint_address: tokenAddress },
          {
            processed: true,
            last_updated: new Date().toISOString(),
            processingNotes: "Token not found in external API",
          },
          { upsert: false } // Only update if document exists
        );
      }

      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching token data for ${tokenAddress}:`, error);
    return null;
  }
}

/**
 * Analyzes a token and determines if it's a good trading opportunity
 * @param {Object} token - Token data with market information
 * @returns {Object} Analysis results
 */
function analyzeToken(token) {
  try {
    // Default result if analysis fails
    const defaultResult = {
      recommended: false,
      reason: "Insufficient data for analysis",
      strategy: null,
      riskLevel: "unknown",
      stopLoss: RISK_MANAGEMENT.DEFAULT_STOP_LOSS,
      takeProfits: [
        RISK_MANAGEMENT.TAKE_PROFIT_FIRST,
        RISK_MANAGEMENT.TAKE_PROFIT_SECOND,
      ],
    };

    // Validate that we have required data
    if (
      !token.marketData ||
      !token.marketData.price ||
      !token.marketData.market_cap
    ) {
      return defaultResult;
    }

    // Extract key metrics
    const { market_cap, price, volume_24h } = token.marketData;

    // Determine capitalization block
    let capBlock;
    if (market_cap <= CAPITALIZATION_BLOCKS.MICRO.max) {
      capBlock = "MICRO";
    } else if (market_cap <= CAPITALIZATION_BLOCKS.SMALL.max) {
      capBlock = "SMALL";
    } else if (market_cap <= CAPITALIZATION_BLOCKS.MEDIUM.max) {
      capBlock = "MEDIUM";
    } else {
      capBlock = "LARGE";
    }

    // Analyze liquidity - use volume as a proxy
    const liquidityScore = calculateLiquidityScore(volume_24h, market_cap);

    // Analyze token contract (simulate dev analysis)
    const devAnalysis = simulateDevAnalysis(token);

    // Determine trading strategy based on dev behavior and market cap
    const tradingStrategy = determineTradingStrategy(devAnalysis, capBlock);

    // Get appropriate options based on trading strategy
    const options = getOptionsForStrategy(tradingStrategy);

    // Determine risk level based on capitalization and liquidity
    const riskLevel = determineRiskLevel(capBlock, liquidityScore);

    // Calculate profit targets based on risk level and strategy
    const profitTargets = calculateProfitTargets(options, riskLevel);

    // Determine overall recommendation
    const isRecommended =
      devAnalysis.negativeSentiment < options.negativeSentimentThreshold &&
      liquidityScore > getLiquidityThreshold(capBlock);

    return {
      recommended: isRecommended,
      reason: isRecommended
        ? "Passed all checks"
        : "Failed sentiment or liquidity check",
      strategy: tradingStrategy,
      capBlock,
      riskLevel,
      liquidityScore,
      devAnalysis,
      profitTargets,
      stopLoss: RISK_MANAGEMENT.DEFAULT_STOP_LOSS,
      takeProfits: [profitTargets.low, profitTargets.high],
    };
  } catch (error) {
    console.error("Error in token analysis:", error);
    return {
      recommended: false,
      reason: `Analysis error: ${error.message}`,
      strategy: null,
      riskLevel: "unknown",
      stopLoss: RISK_MANAGEMENT.DEFAULT_STOP_LOSS,
      takeProfits: [
        RISK_MANAGEMENT.TAKE_PROFIT_FIRST,
        RISK_MANAGEMENT.TAKE_PROFIT_SECOND,
      ],
    };
  }
}

/**
 * Calculate liquidity score based on volume and market cap
 * @param {number} volume24h - 24-hour trading volume
 * @param {number} marketCap - Market capitalization
 */
function calculateLiquidityScore(volume24h, marketCap) {
  if (!volume24h || !marketCap) return 0;

  // Liquidity score is the ratio of daily volume to market cap
  // Higher values indicate better liquidity
  const ratio = volume24h / marketCap;

  // Normalize to a 0-100 scale
  return Math.min(100, Math.round(ratio * 1000));
}

/**
 * Simulate developer analysis (in real system, would be more sophisticated)
 * @param {Object} token - Token data
 */
function simulateDevAnalysis(token) {
  // In a real system, this would analyze contract code, transactions, etc.
  // For this example, we'll simulate the analysis

  // Use token address to generate a deterministic but seemingly random value
  const addressSum = token.mint_address
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  // Generate values between 0 and 1 based on the address
  const negativeSentiment = (addressSum % 100) / 100;
  const sellPressure = ((addressSum * 31) % 100) / 100;
  const devActivity = ((addressSum * 17) % 100) / 100;

  const devWalletProportion = Math.min(0.8, ((addressSum * 13) % 100) / 100);
  const tokenAge = Math.floor((addressSum % 10) * 24); // in hours

  return {
    negativeSentiment,
    sellPressure,
    devActivity,
    devWalletProportion,
    tokenAge,
    hasLock: devWalletProportion < 0.5, // Simulate if dev tokens are locked
    renounced: addressSum % 7 === 0, // Simulate if contract is renounced
  };
}

/**
 * Determine trading strategy based on dev analysis and market cap
 * @param {Object} devAnalysis - Developer behavior analysis
 * @param {string} capBlock - Market cap classification
 */
function determineTradingStrategy(devAnalysis, capBlock) {
  // Higher negativeSentiment means more concerning dev behavior
  if (devAnalysis.negativeSentiment >= 0.6) {
    return TRADING_OPTIONS.OPTION_D.name; // DEV_BURN
  } else if (devAnalysis.negativeSentiment >= 0.5) {
    return TRADING_OPTIONS.OPTION_C.name; // NO_SELL
  } else if (devAnalysis.negativeSentiment >= 0.4) {
    return TRADING_OPTIONS.OPTION_B.name; // DEV_REBUY
  } else {
    return TRADING_OPTIONS.OPTION_A.name; // DEV_SELL
  }
}

/**
 * Get appropriate options based on the determined trading strategy
 * @param {string} strategy - Trading strategy name
 */
function getOptionsForStrategy(strategy) {
  switch (strategy) {
    case TRADING_OPTIONS.OPTION_A.name:
      return TRADING_OPTIONS.OPTION_A;
    case TRADING_OPTIONS.OPTION_B.name:
      return TRADING_OPTIONS.OPTION_B;
    case TRADING_OPTIONS.OPTION_C.name:
      return TRADING_OPTIONS.OPTION_C;
    case TRADING_OPTIONS.OPTION_D.name:
      return TRADING_OPTIONS.OPTION_D;
    default:
      return TRADING_OPTIONS.OPTION_A; // Default to Option A
  }
}

/**
 * Determine risk level based on capitalization and liquidity
 * @param {string} capBlock - Market cap classification
 * @param {number} liquidityScore - Token liquidity score
 */
function determineRiskLevel(capBlock, liquidityScore) {
  // Smaller market cap = higher risk
  // Lower liquidity = higher risk

  if (capBlock === "MICRO") {
    return "high"; // Micro cap is always high risk
  } else if (capBlock === "SMALL") {
    return liquidityScore > 50 ? "medium" : "high";
  } else if (capBlock === "MEDIUM") {
    return liquidityScore > 70 ? "low" : "medium";
  } else {
    return "low"; // Large cap is generally lower risk
  }
}

/**
 * Calculate profit targets based on strategy and risk level
 * @param {Object} options - Trading options
 * @param {string} riskLevel - Risk level (low, medium, high)
 */
function calculateProfitTargets(options, riskLevel) {
  const targets = options.profitTargets;

  // Get the appropriate target range based on risk level
  const targetRange = targets[riskLevel] || targets.medium;

  // Calculate specific profit targets within the range
  const low = Math.floor(getRandomInRange(targetRange.min, targetRange.max));
  const medium = Math.floor(low * 1.5); // 50% higher than low
  const high = Math.floor(low * 2.5); // 150% higher than low

  return { low, medium, high };
}

/**
 * Get a random number within a range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
function getRandomInRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Get liquidity threshold based on capitalization block
 * @param {string} capBlock - Market cap classification
 */
function getLiquidityThreshold(capBlock) {
  switch (capBlock) {
    case "MICRO":
      return 30; // Require higher liquidity for micro caps
    case "SMALL":
      return 25;
    case "MEDIUM":
      return 20;
    case "LARGE":
      return 15; // Large caps can have lower liquidity ratio
    default:
      return 25;
  }
}

/**
 * Execute a trade for a specific user based on token analysis
 * @param {Object} permission - User's trading permission
 * @param {Object} token - Analyzed token
 * @param {Object} analysis - Token analysis results
 */
async function executeTradeForUser(permission, token, analysis) {
  try {
    const userId = permission.userId;
    const walletAddress = permission.walletAddress;

    // Get user's trading settings
    const userSettings = await getUserTradingSettings(userId, walletAddress);

    // Check if user wants to trade this type of token
    if (!isTokenEligibleForUserSettings(token, analysis, userSettings)) {
      console.log(
        `Token ${token.mint_address} not eligible for user ${userId} based on settings`
      );
      return;
    }

    // Check if already traded this token
    const alreadyTraded = await hasAlreadyTraded(
      userId,
      walletAddress,
      token.mint_address
    );
    if (alreadyTraded) {
      console.log(`User ${userId} already traded token ${token.mint_address}`);
      return;
    }

    // Determine investment amount based on risk level and user settings
    const investmentAmount = calculateInvestmentAmount(
      analysis.riskLevel,
      userSettings.maxInvestmentPerToken,
      userSettings.tradingStrategy
    );

    if (investmentAmount <= 0) {
      console.log(
        `Skipping trade for user ${userId}: Investment amount too small`
      );
      return;
    }

    // Check daily limit
    const dailySpent = await getDailySpentAmount(userId, walletAddress);
    if (dailySpent + investmentAmount > userSettings.maxDailyInvestment) {
      console.log(
        `Skipping trade for user ${userId}: Daily investment limit reached`
      );
      return;
    }

    // Determine network and stablecoin for trade
    const { chainId, stableToken } = determineTradeNetwork(token);

    // Create trade info
    const tradeInfo = {
      fromChainId: chainId,
      toChainId: chainId,
      fromTokenAddress: stableToken.address, // Use stablecoin as source
      toTokenAddress: token.mint_address,
      amount: convertToTokenAmount(investmentAmount, stableToken.decimals),
      amountUSD: investmentAmount,
      dailyTotalUSD: dailySpent + investmentAmount,
    };

    // Determine wallet network type
    const networkType = chainId === 1 ? "ethereum" : "solana"; // Simplified; improve based on chainId

    // Execute the trade
    const wallet = {
      address: walletAddress,
      networkType,
    };

    // Perform the trade
    console.log(
      `Executing trade for user ${userId}: ${investmentAmount}$ on token ${token.mint_address}`
    );
    const tradeResult = await executeTrade(userId, tradeInfo, wallet);

    // Create stop loss and take profit orders
    await createRiskManagementOrders(
      userId,
      walletAddress,
      token,
      tradeResult,
      analysis,
      chainId,
      userSettings.tradingStrategy
    );

    console.log(
      `Successfully executed trade for user ${userId} on token ${token.mint_address}`
    );
    return tradeResult;
  } catch (error) {
    console.error(`Error executing trade for user:`, error);
    throw error;
  }
}

/**
 * Create stop loss and take profit orders for risk management
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 * @param {Object} token - Token data
 * @param {Object} tradeResult - Result of the trade execution
 * @param {Object} analysis - Token analysis
 * @param {number} chainId - Chain ID
 * @param {string} tradingStrategy - User's trading strategy
 */
async function createRiskManagementOrders(
  userId,
  walletAddress,
  token,
  tradeResult,
  analysis,
  chainId,
  tradingStrategy
) {
  try {
    // Create stop loss order
    const stopLossPercent = getStopLossPercent(
      tradingStrategy,
      analysis.riskLevel
    );
    await createTradeOrder(userId, {
      walletAddress,
      tokenAddress: token.mint_address,
      orderType: "stop_loss",
      targetPrice: calculatePriceWithPercentage(
        token.marketData.price,
        -stopLossPercent
      ),
      amount: tradeResult.toAmount,
      triggerCondition: "<=", // Trigger when price falls below target
      chainId,
    });

    // Create first take profit order (partial sell)
    const firstTakeProfit = analysis.takeProfits[0];
    const firstSellPercentage = 50; // Sell 50% at first take profit
    await createTradeOrder(userId, {
      walletAddress,
      tokenAddress: token.mint_address,
      orderType: "take_profit",
      targetPrice: calculatePriceWithPercentage(
        token.marketData.price,
        firstTakeProfit
      ),
      amount: calculatePercentage(tradeResult.toAmount, firstSellPercentage),
      triggerCondition: ">=", // Trigger when price rises above target
      chainId,
      sellPercentage: firstSellPercentage,
    });

    // Create second take profit order (full sell)
    const secondTakeProfit = analysis.takeProfits[1];
    const secondSellPercentage = 100; // Sell 100% (remaining) at second take profit
    await createTradeOrder(userId, {
      walletAddress,
      tokenAddress: token.mint_address,
      orderType: "take_profit",
      targetPrice: calculatePriceWithPercentage(
        token.marketData.price,
        secondTakeProfit
      ),
      amount: calculatePercentage(
        tradeResult.toAmount,
        secondSellPercentage - firstSellPercentage
      ),
      triggerCondition: ">=", // Trigger when price rises above target
      chainId,
      sellPercentage: secondSellPercentage - firstSellPercentage,
    });

    // If user has opted for trailing stop, create a trailing stop order
    if (tradingStrategy === "aggressive" || tradingStrategy === "custom") {
      await createTradeOrder(userId, {
        walletAddress,
        tokenAddress: token.mint_address,
        orderType: "trailing_stop",
        targetPrice: null, // Will be determined dynamically
        trailingDistance: RISK_MANAGEMENT.TRAILING_STOP_DISTANCE,
        activationThreshold: calculatePriceWithPercentage(
          token.marketData.price,
          RISK_MANAGEMENT.TRAILING_STOP_ACTIVATION
        ),
        amount: tradeResult.toAmount,
        chainId,
      });
    }
  } catch (error) {
    console.error("Error creating risk management orders:", error);
    throw error;
  }
}

/**
 * Get appropriate stop loss percentage based on trading strategy and risk level
 */
function getStopLossPercent(tradingStrategy, riskLevel) {
  // Default stop loss is 15%
  let stopLoss = RISK_MANAGEMENT.DEFAULT_STOP_LOSS;

  // Adjust based on strategy
  switch (tradingStrategy) {
    case "conservative":
      stopLoss = -10; // Tighter stop loss
      break;
    case "moderate":
      stopLoss = -15; // Default
      break;
    case "aggressive":
      stopLoss = -20; // Wider stop loss
      break;
  }

  // Adjust further based on risk level
  if (riskLevel === "high") {
    stopLoss -= 5; // Even wider for high risk
  } else if (riskLevel === "low") {
    stopLoss += 5; // Tighter for low risk
  }

  return stopLoss;
}

/**
 * Calculate price with percentage change
 * @param {number} price - Base price
 * @param {number} percentage - Percentage change
 */
function calculatePriceWithPercentage(price, percentage) {
  return price * (1 + percentage / 100);
}

/**
 * Calculate a percentage of an amount
 * @param {string|number} amount - Original amount
 * @param {number} percentage - Percentage to calculate
 */
function calculatePercentage(amount, percentage) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return ((numAmount * percentage) / 100).toString();
}

/**
 * Check if a token is eligible for a user's trading settings
 * @param {Object} token - Token data
 * @param {Object} analysis - Token analysis
 * @param {Object} userSettings - User's trading settings
 */
function isTokenEligibleForUserSettings(token, analysis, userSettings) {
  // Check if token matches user's allowedTokens setting
  switch (userSettings.allowedTokens) {
    case "verified":
      // Only allow verified tokens (has name, symbol, etc.)
      if (!token.name || !token.symbol) return false;
      break;
    case "trending":
      // Check if token has significant volume (would use external API in real implementation)
      if (
        !token.marketData ||
        !token.marketData.volume_24h ||
        token.marketData.volume_24h < 10000
      ) {
        return false;
      }
      break;
    case "whitelisted":
      // Check if token is in a whitelist (simplified)
      if (token.mint_address.charAt(0) !== "0") return false; // Just an example check
      break;
    case "all":
      // Allow all tokens
      break;
    default:
      return false;
  }

  // Check if token risk level matches user's trading strategy
  if (
    userSettings.tradingStrategy === "conservative" &&
    analysis.riskLevel === "high"
  ) {
    return false;
  }

  return true;
}

/**
 * Calculate investment amount based on risk level and settings
 * @param {string} riskLevel - Risk level of the token
 * @param {number} maxInvestment - Max investment amount
 * @param {string} tradingStrategy - User's trading strategy
 */
function calculateInvestmentAmount(riskLevel, maxInvestment, tradingStrategy) {
  // Start with user's max investment setting
  let amount = maxInvestment;

  // Adjust based on risk level
  switch (riskLevel) {
    case "high":
      amount *= tradingStrategy === "aggressive" ? 1.0 : 0.5; // Full amount for aggressive, half for others
      break;
    case "medium":
      amount *= 0.75; // 75% of max
      break;
    case "low":
      amount *= tradingStrategy === "conservative" ? 1.0 : 0.9; // Full amount for conservative
      break;
  }

  // Ensure a minimum amount
  return Math.max(10, Math.min(maxInvestment, amount));
}

/**
 * Get user's trading settings
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 */
async function getUserTradingSettings(userId, walletAddress) {
  try {
    const response = await fetch(
      `/api/internal/trading-settings?userId=${userId}&wallet=${walletAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.INTERNAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      // Return default settings
      return {
        strategy: "moderate",
        maxInvestmentPerToken: 100,
        maxDailyInvestment: 500,
        stopLossPercentage: 15,
        takeProfitPercentage: 25,
        allowedTokens: "verified",
        tradingStrategy: "moderate",
      };
    }

    const data = await response.json();
    return data.settings;
  } catch (error) {
    console.error("Error fetching trading settings:", error);
    // Return default settings on error
    return {
      strategy: "moderate",
      maxInvestmentPerToken: 100,
      maxDailyInvestment: 500,
      stopLossPercentage: 15,
      takeProfitPercentage: 25,
      allowedTokens: "verified",
      tradingStrategy: "moderate",
    };
  }
}

/**
 * Check if user has already traded this token
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 * @param {string} tokenAddress - Token address
 */
async function hasAlreadyTraded(userId, walletAddress, tokenAddress) {
  try {
    const existingTrade = await TradeLog.findOne({
      userId,
      walletAddress: walletAddress.toLowerCase(),
      toToken: tokenAddress,
      automated: true,
    }).lean();

    return !!existingTrade;
  } catch (error) {
    console.error("Error checking if already traded:", error);
    return false;
  }
}

/**
 * Calculate total amount spent today
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 */
async function getDailySpentAmount(userId, walletAddress) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {
    const logs = await TradeLog.find({
      userId,
      walletAddress: walletAddress.toLowerCase(),
      timestamp: { $gte: oneDayAgo },
      automated: true,
    }).lean();

    return logs.reduce((sum, log) => {
      // Add up the value in USD of all trades
      return sum + (log.fromAmountUSD || 0);
    }, 0);
  } catch (error) {
    console.error("Error calculating daily spent amount:", error);
    return 0;
  }
}

/**
 * Determine which network and stablecoin to use for the trade
 * @param {Object} token - Token data
 */
function determineTradeNetwork(token) {
  // This is a simplified implementation
  // In a real system, you would determine the chain from the token address

  // For now, assume Ethereum and USDT
  return {
    chainId: 1, // Ethereum
    stableToken: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT address
      decimals: 6,
    },
  };
}

/**
 * Convert USD amount to token amount with proper decimals
 * @param {number} amountUSD - Amount in USD
 * @param {number} decimals - Token decimals
 */
function convertToTokenAmount(amountUSD, decimals) {
  // Convert to string with proper decimal representation
  return ethers.parseUnits(amountUSD.toString(), decimals).toString();
}
