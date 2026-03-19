import mongoose from "mongoose";

const sessionKeySchema = new mongoose.Schema({
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
  publicKey: {
    type: String,
    required: true,
    unique: true,
  },
  // Store encrypted private key - ONLY the backend should access this
  encryptedPrivateKey: {
    type: String,
    required: true,
  },
  // IV for encryption
  iv: {
    type: String,
    required: true,
  },
  // Auth tag for GCM mode
  authTag: {
    type: String,
    required: true,
  },
  // Session key metadata
  name: {
    type: String,
    default: "Trading Session",
  },
  description: {
    type: String,
    default: "",
  },
  // Expiration settings
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  // Active status
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  // Permissions and limits
  permissions: {
    canTrade: {
      type: Boolean,
      default: true,
    },
    canSwap: {
      type: Boolean,
      default: true,
    },
    canStake: {
      type: Boolean,
      default: false,
    },
    canTransfer: {
      type: Boolean,
      default: false,
    },
    // Spending limits per transaction
    maxTransactionAmount: {
      type: Number,
      default: null, // null means no limit
    },
    // Daily spending limit in USD
    dailySpendingLimit: {
      type: Number,
      default: null,
    },
    // Allowed token addresses (empty array = all tokens)
    allowedTokens: [String],
  },
  // Usage tracking
  usageStats: {
    transactionsCount: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    dailySpent: {
      type: Number,
      default: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  // Audit trail
  auditLog: [
    {
      action: {
        type: String,
        enum: ["created", "used", "revoked", "expired", "limit_reached"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      details: mongoose.Schema.Types.Mixed,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient lookups
sessionKeySchema.index({ userId: 1, walletAddress: 1 });
sessionKeySchema.index({ userId: 1, active: 1, expiresAt: 1 });

// Auto-update updatedAt on save
sessionKeySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if session key is valid
sessionKeySchema.methods.isValid = function () {
  if (!this.active) return false;
  if (this.expiresAt < new Date()) return false;
  return true;
};

// Method to check spending limits
sessionKeySchema.methods.canSpend = function (amount) {
  if (!this.isValid()) return false;

  // Check per-transaction limit
  if (
    this.permissions.maxTransactionAmount !== null &&
    amount > this.permissions.maxTransactionAmount
  ) {
    return false;
  }

  // Check daily limit
  if (this.permissions.dailySpendingLimit !== null) {
    // Reset daily counter if needed
    const today = new Date().toDateString();
    const lastReset = new Date(this.usageStats.lastResetDate).toDateString();

    if (today !== lastReset) {
      this.usageStats.dailySpent = 0;
      this.usageStats.lastResetDate = new Date();
    }

    if (
      this.usageStats.dailySpent + amount >
      this.permissions.dailySpendingLimit
    ) {
      return false;
    }
  }

  return true;
};

// Method to record usage
sessionKeySchema.methods.recordUsage = async function (amount, details = {}) {
  this.usageStats.transactionsCount += 1;
  this.usageStats.totalVolume += amount;
  this.usageStats.dailySpent += amount;
  this.usageStats.lastUsedAt = new Date();

  this.auditLog.push({
    action: "used",
    timestamp: new Date(),
    details: {
      amount,
      ...details,
    },
  });

  await this.save();
};

// Static method to find valid session keys for a user
sessionKeySchema.statics.findValidKeys = function (userId, walletAddress) {
  return this.find({
    userId,
    walletAddress: walletAddress.toLowerCase(),
    active: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Check if model already exists to prevent OverwriteModelError during hot reloads
const SessionKey =
  mongoose.models.SessionKey || mongoose.model("SessionKey", sessionKeySchema);

export default SessionKey;
