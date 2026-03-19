import mongoose from "mongoose";

const tradingPermissionSchema = new mongoose.Schema({
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
  walletType: {
    type: String,
    required: true,
    enum: ["ethereum", "solana", "evm"],
  },
  // Session key reference (if using session key for trading)
  sessionKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SessionKey",
    index: true,
  },
  // Traditional signature-based permission (for backward compatibility)
  signature: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Track trading performance
  tradesExecuted: {
    type: Number,
    default: 0,
  },
  lastTradeAt: {
    type: Date,
  },
  tradingStrategy: {
    type: String,
    enum: ["conservative", "moderate", "aggressive", "custom"],
    default: "moderate",
  },
  customSettings: {
    type: mongoose.Schema.Types.Mixed,
  },
  // For audit/security logs
  auditLog: [
    {
      action: String,
      timestamp: Date,
      details: mongoose.Schema.Types.Mixed,
    },
  ],
});

// Compound index for efficient lookups
tradingPermissionSchema.index(
  { userId: 1, walletAddress: 1 },
  { unique: true }
);

// Check if model already exists to prevent OverwriteModelError during hot reloads in development
const TradingPermission =
  mongoose.models.TradingPermission ||
  mongoose.model("TradingPermission", tradingPermissionSchema);

export default TradingPermission;
