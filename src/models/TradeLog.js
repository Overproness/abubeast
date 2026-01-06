import mongoose from "mongoose";

const tradeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    // Session key used for this trade
    sessionKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionKey",
      index: true,
    },
    // Transaction hash/signature
    txHash: {
      type: String,
    },
    signature: {
      type: String,
    },
    // Trade tokens (new field names for consistency)
    tokenIn: {
      type: String,
      required: true,
    },
    tokenOut: {
      type: String,
      required: true,
    },
    // Legacy field names (for backward compatibility)
    fromToken: {
      type: String,
    },
    toToken: {
      type: String,
    },
    // Amounts
    amountIn: {
      type: Number,
      required: true,
    },
    amountOut: {
      type: Number,
    },
    // Legacy field names (for backward compatibility)
    fromAmount: {
      type: String,
    },
    toAmount: {
      type: String,
    },
    expectedToAmount: {
      type: String,
    },
    // Slippage
    slippage: {
      type: Number,
    },
    // Profit/Loss tracking
    profitLoss: {
      type: Number,
    },
    profitLossPercent: {
      type: Number,
    },
    // Token metadata
    tokenData: {
      name: String,
      symbol: String,
      price: Number,
      liquidity: Number,
      marketCap: Number,
    },
    // Sell information (if this is a buy that was later sold)
    sellInfo: {
      soldAt: Date,
      sellPrice: Number,
      amountSold: Number,
      solReceived: Number,
      profitLoss: Number,
      profitLossPercent: Number,
      triggerType: String, // take_profit, stop_loss, dev_sell, etc.
    },
    // Trigger information (for sells)
    triggerType: {
      type: String,
      enum: [
        "manual",
        "take_profit",
        "stop_loss",
        "dev_sell",
        "whale_sell",
        "rug_pull",
        "emergency",
      ],
    },
    triggerDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    error: {
      type: String,
    },
    // Timestamps
    timestamp: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    // Gas and costs
    chainId: {
      type: Number,
    },
    gasUsed: {
      type: String,
    },
    gasCostUSD: {
      type: Number,
    },
    profitUSD: {
      type: Number,
    },
    // Trade type
    tradeType: {
      type: String,
      enum: ["buy", "sell", "swap"],
      default: "swap",
    },
    automated: {
      type: Boolean,
      default: true,
    },
    tradingStrategy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to get signature or txHash
tradeLogSchema.virtual("transactionId").get(function () {
  return this.signature || this.txHash;
});

// Create indexes for querying
tradeLogSchema.index({ signature: 1 });
tradeLogSchema.index({ txHash: 1 });
tradeLogSchema.index({ timestamp: -1 });
tradeLogSchema.index({ userId: 1, timestamp: -1 });
tradeLogSchema.index({ walletAddress: 1, timestamp: -1 });
tradeLogSchema.index({ tradeType: 1, status: 1 });
tradeLogSchema.index({ tokenOut: 1, tradeType: 1, status: 1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const TradeLog =
  mongoose.models.TradeLog || mongoose.model("TradeLog", tradeLogSchema);

export default TradeLog;
