import mongoose from "mongoose";

/**
 * TradingSettings Model
 * Stores user preferences for automated trading bot
 */
const tradingSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Bot activation status
    botEnabled: {
      type: Boolean,
      default: false,
    },
    // Trading strategy
    strategy: {
      type: String,
      enum: ["conservative", "moderate", "aggressive", "custom"],
      default: "moderate",
    },
    // Per-trade limits
    perTradeLimits: {
      minInvestment: {
        type: Number,
        default: 0.01, // Minimum SOL to invest per token
      },
      maxInvestment: {
        type: Number,
        default: 0.1, // Maximum SOL to invest per token
      },
      slippage: {
        type: Number,
        default: 5, // Slippage tolerance in percentage
      },
    },
    // Daily limits
    dailyLimits: {
      maxTrades: {
        type: Number,
        default: 10, // Maximum trades per day
      },
      maxSpending: {
        type: Number,
        default: 1.0, // Maximum SOL to spend per day
      },
    },
    // Token filtering criteria
    tokenFilters: {
      minLiquidity: {
        type: Number,
        default: 1000, // Minimum liquidity in USD
      },
      maxMarketCap: {
        type: Number,
        default: 1000000, // Maximum market cap in USD
      },
      maxTokenAge: {
        type: Number,
        default: 3600, // Maximum age of token in seconds (1 hour)
      },
      requireLpBurn: {
        type: Boolean,
        default: false, // Require LP to be burned
      },
      minLpBurnPercent: {
        type: Number,
        default: 0, // Minimum LP burn percentage
      },
      blockMintAuthority: {
        type: Boolean,
        default: true, // Block tokens with mint authority
      },
      blockFreezeAuthority: {
        type: Boolean,
        default: true, // Block tokens with freeze authority
      },
    },
    // Auto-sell settings
    autoSell: {
      enabled: {
        type: Boolean,
        default: true,
      },
      // Take profit settings
      takeProfitEnabled: {
        type: Boolean,
        default: true,
      },
      takeProfitPercent: {
        type: Number,
        default: 50, // Sell when profit reaches 50%
      },
      // Stop loss settings
      stopLossEnabled: {
        type: Boolean,
        default: true,
      },
      stopLossPercent: {
        type: Number,
        default: 20, // Sell when loss reaches 20%
      },
      // Emergency sell triggers
      emergencySell: {
        devSellThreshold: {
          type: Number,
          default: 5, // Sell if dev sells more than 5% of supply
        },
        largeSellThreshold: {
          type: Number,
          default: 10, // Sell if any whale sells more than 10%
        },
        rugPullDetection: {
          type: Boolean,
          default: true,
        },
      },
      // Percentage to sell on emergency
      sellPercentage: {
        type: Number,
        default: 100, // Sell 100% of holdings on emergency
      },
    },
    // Risk management
    riskManagement: {
      maxPositionSize: {
        type: Number,
        default: 0.5, // Max % of portfolio in a single token
      },
      diversificationMin: {
        type: Number,
        default: 3, // Minimum number of different tokens
      },
      cooldownPeriod: {
        type: Number,
        default: 300, // Seconds between buying same token again
      },
    },
    // Usage tracking
    stats: {
      totalTrades: {
        type: Number,
        default: 0,
      },
      todayTrades: {
        type: Number,
        default: 0,
      },
      todaySpent: {
        type: Number,
        default: 0,
      },
      lastTradeAt: {
        type: Date,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
      // Performance metrics
      totalProfit: {
        type: Number,
        default: 0,
      },
      totalLoss: {
        type: Number,
        default: 0,
      },
      winRate: {
        type: Number,
        default: 0,
      },
    },
    // Notifications
    notifications: {
      onBuy: {
        type: Boolean,
        default: true,
      },
      onSell: {
        type: Boolean,
        default: true,
      },
      onEmergency: {
        type: Boolean,
        default: true,
      },
      onProfit: {
        type: Boolean,
        default: true,
      },
      onLoss: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Reset daily stats if needed
tradingSettingsSchema.methods.resetDailyStatsIfNeeded = function () {
  const now = new Date();
  const lastReset = this.stats.lastResetDate;

  // Check if it's a new day
  if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
    this.stats.todayTrades = 0;
    this.stats.todaySpent = 0;
    this.stats.lastResetDate = now;
    return true;
  }
  return false;
};

// Check if user can trade today
tradingSettingsSchema.methods.canTradeToday = function () {
  this.resetDailyStatsIfNeeded();

  if (!this.botEnabled) return false;
  if (this.stats.todayTrades >= this.dailyLimits.maxTrades) return false;
  if (this.stats.todaySpent >= this.dailyLimits.maxSpending) return false;

  return true;
};

// Check if specific trade amount is allowed
tradingSettingsSchema.methods.canTradeAmount = function (amount) {
  this.resetDailyStatsIfNeeded();

  if (amount < this.perTradeLimits.minInvestment) return false;
  if (amount > this.perTradeLimits.maxInvestment) return false;
  if (this.stats.todaySpent + amount > this.dailyLimits.maxSpending)
    return false;

  return true;
};

// Record a trade
tradingSettingsSchema.methods.recordTrade = function (amount) {
  this.resetDailyStatsIfNeeded();

  this.stats.totalTrades++;
  this.stats.todayTrades++;
  this.stats.todaySpent += amount;
  this.stats.lastTradeAt = new Date();
};

// Get default settings for a strategy
tradingSettingsSchema.statics.getDefaultsForStrategy = function (strategy) {
  const defaults = {
    conservative: {
      perTradeLimits: {
        minInvestment: 0.01,
        maxInvestment: 0.05,
        slippage: 3,
      },
      dailyLimits: {
        maxTrades: 5,
        maxSpending: 0.5,
      },
      tokenFilters: {
        minLiquidity: 5000,
        maxMarketCap: 500000,
        requireLpBurn: true,
        minLpBurnPercent: 50,
        blockMintAuthority: true,
        blockFreezeAuthority: true,
      },
      autoSell: {
        takeProfitPercent: 30,
        stopLossPercent: 15,
      },
    },
    moderate: {
      perTradeLimits: {
        minInvestment: 0.01,
        maxInvestment: 0.1,
        slippage: 5,
      },
      dailyLimits: {
        maxTrades: 10,
        maxSpending: 1.0,
      },
      tokenFilters: {
        minLiquidity: 1000,
        maxMarketCap: 1000000,
        requireLpBurn: false,
        minLpBurnPercent: 0,
        blockMintAuthority: true,
        blockFreezeAuthority: true,
      },
      autoSell: {
        takeProfitPercent: 50,
        stopLossPercent: 20,
      },
    },
    aggressive: {
      perTradeLimits: {
        minInvestment: 0.01,
        maxInvestment: 0.2,
        slippage: 10,
      },
      dailyLimits: {
        maxTrades: 20,
        maxSpending: 2.0,
      },
      tokenFilters: {
        minLiquidity: 500,
        maxMarketCap: 2000000,
        requireLpBurn: false,
        minLpBurnPercent: 0,
        blockMintAuthority: false,
        blockFreezeAuthority: false,
      },
      autoSell: {
        takeProfitPercent: 100,
        stopLossPercent: 30,
      },
    },
  };

  return defaults[strategy] || defaults.moderate;
};

const TradingSettings =
  mongoose.models.TradingSettings ||
  mongoose.model("TradingSettings", tradingSettingsSchema);

export default TradingSettings;
