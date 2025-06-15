import mongoose from "mongoose";

// Define the token schema
const tokenSchema = new mongoose.Schema(
  {
    mint_address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pool_address: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    symbol: {
      type: String,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    analyzed: {
      type: Boolean,
      default: false,
      index: true,
    },
    analyzed_at: {
      type: Date,
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
    last_updated: {
      type: Date,
    },
    marketData: {
      price: Number,
      market_cap: Number,
      volume_24h: Number,
      price_change_24h: Number,
      price_change_percentage_24h: Number,
      circulating_supply: Number,
      total_supply: Number,
      logo: String, // Added logo field to store logo URL
    },
    analysis: {
      recommended: Boolean,
      strategy: String,
      riskLevel: String,
      capBlock: String,
      reason: String,
      timestamp: Date,
    },
    processingNotes: String,
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);

export default Token;
