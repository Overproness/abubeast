import mongoose from "mongoose";

const swapHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fromToken: {
      address: { type: String, required: true },
      symbol: { type: String },
      decimals: { type: Number },
      name: { type: String },
    },
    toToken: {
      address: { type: String, required: true },
      symbol: { type: String },
      decimals: { type: Number },
      name: { type: String },
    },
    fromChain: {
      id: { type: Number, required: true },
      name: { type: String },
    },
    toChain: {
      id: { type: Number, required: true },
      name: { type: String },
    },
    fromAmount: {
      type: String,
      required: true,
    },
    toAmount: {
      type: String,
    },
    txHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    gasUsed: {
      type: String,
    },
    gasCostUSD: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const SwapHistory =
  mongoose.models.SwapHistory ||
  mongoose.model("SwapHistory", swapHistorySchema);

export default SwapHistory;
