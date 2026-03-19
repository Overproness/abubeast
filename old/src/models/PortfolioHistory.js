import mongoose from "mongoose";

const PortfolioHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  holdings: [
    {
      tokenAddress: String,
      symbol: String,
      name: String,
      balance: Number,
      value: Number,
      price: Number,
    },
  ],
  pnl: {
    type: Number,
    default: 0,
  },
  pnlPercentage: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
PortfolioHistorySchema.index({ userId: 1, walletAddress: 1, timestamp: -1 });

export default mongoose.models.PortfolioHistory ||
  mongoose.model("PortfolioHistory", PortfolioHistorySchema);
