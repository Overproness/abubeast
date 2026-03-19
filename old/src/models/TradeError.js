import mongoose from "mongoose";

const tradeErrorSchema = new mongoose.Schema({
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
  error: {
    type: String,
    required: true,
  },
  tradeInfo: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolution: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
});

// Create indexes for efficient querying
tradeErrorSchema.index({ timestamp: -1 });
tradeErrorSchema.index({ userId: 1, timestamp: -1 });
tradeErrorSchema.index({ walletAddress: 1, timestamp: -1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const TradeError =
  mongoose.models.TradeError || mongoose.model("TradeError", tradeErrorSchema);

export default TradeError;
