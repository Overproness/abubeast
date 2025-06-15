import mongoose from "mongoose";

const tradeLogSchema = new mongoose.Schema({
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
  txHash: {
    type: String,
    required: true,
  },
  fromToken: {
    type: String,
    required: true,
  },
  toToken: {
    type: String,
    required: true,
  },
  fromAmount: {
    type: String,
    required: true,
  },
  toAmount: {
    type: String,
  },
  expectedToAmount: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
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
});

// Create indexes for querying
tradeLogSchema.index({ txHash: 1 });
tradeLogSchema.index({ timestamp: -1 });
tradeLogSchema.index({ userId: 1, timestamp: -1 });
tradeLogSchema.index({ walletAddress: 1, timestamp: -1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const TradeLog =
  mongoose.models.TradeLog || mongoose.model("TradeLog", tradeLogSchema);

export default TradeLog;
