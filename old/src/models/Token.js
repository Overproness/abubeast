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
    securityData: {
      // GoPlus Security Analysis
      address: String,
      blockchain: String,
      chainId: mongoose.Schema.Types.Mixed, // Can be number or string
      scanned_at: Date,
      has_security_data: { type: Boolean, default: false },
      
      // Token security details
      token_security: {
        is_honeypot: Boolean,
        is_blacklisted: Boolean,
        is_whitelisted: Boolean,
        is_open_source: Boolean,
        is_proxy: Boolean,
        is_mintable: Boolean,
        owner_change_balance: Boolean,
        can_take_back_ownership: Boolean,
        owner_address: String,
        creator_address: String,
        cannot_buy: Boolean,
        cannot_sell_all: Boolean,
        trading_cooldown: Boolean,
        transfer_pausable: Boolean,
        buy_tax: Number,
        sell_tax: Number,
        slippage_modifiable: Boolean,
        liquidity_locked: Boolean,
        liquidity_ratio: Number,
        risk_score: { type: Number, min: 0, max: 100 },
        risk_level: { type: String, enum: ['minimal', 'low', 'medium', 'high', 'unknown'] },
        freeze_authority: String, // Solana specific
        mint_authority: String,   // Solana specific
        raw_data: mongoose.Schema.Types.Mixed
      },
      
      // Address security
      address_security: {
        isMalicious: Boolean,
        riskFactors: [String],
        confidence: Number
      },
      
      // Locker information
      locker_info: {
        hasLocks: Boolean,
        totalCount: Number,
        locks: [mongoose.Schema.Types.Mixed]
      },
      
      // Overall assessment
      overall_risk_score: { type: Number, min: 0, max: 100, default: 50 },
      overall_risk_level: { type: String, enum: ['minimal', 'low', 'medium', 'high', 'unknown'], default: 'unknown' },
      is_tradeable: { type: Boolean, default: false },
      requires_caution: { type: Boolean, default: true },
      red_flags: [String],
      
      // Error handling
      error: String,
      last_security_check: { type: Date, default: Date.now }
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
