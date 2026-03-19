import mongoose from "mongoose";

const tradeOrderSchema = new mongoose.Schema({
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
  tokenAddress: {
    type: String,
    required: true,
    index: true,
  },
  orderType: {
    type: String,
    enum: ["stop_loss", "take_profit"],
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  amount: {
    type: String, // Use string for precise numeric representation
    required: true,
  },
  triggerCondition: {
    type: String,
    enum: ["<=", ">="], // <= for stop-loss, >= for take-profit
    default: "<=",
  },
  status: {
    type: String,
    enum: ["active", "executed", "cancelled", "expired"],
    default: "active",
    index: true,
  },
  chainId: {
    type: Number,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  executedAt: {
    type: Date,
  },
  executedPrice: {
    type: Number,
  },
  txHash: {
    type: String,
  },
});

// Create relevant indexes
tradeOrderSchema.index({ walletAddress: 1, status: 1 });
tradeOrderSchema.index({ userId: 1, status: 1 });
tradeOrderSchema.index({ tokenAddress: 1, status: 1 });
tradeOrderSchema.index({ createdAt: -1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const TradeOrder =
  mongoose.models.TradeOrder || mongoose.model("TradeOrder", tradeOrderSchema);

export default TradeOrder;
