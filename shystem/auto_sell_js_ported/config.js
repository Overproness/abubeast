// Configuration - JavaScript Port
// Port of config.rs

require("dotenv").config();

const DEFAULT_SOLANA_RPC_URL = "https://rpc.shyft.to/?api_key=YC65T1SP6NMXDI6X";
const DEFAULT_SOLANA_WSS_URL =
  "wss://mainnet.helius-rpc.com/?api-key=a1506358-8094-454c-a6cb-1de5373a878b";
const JUPITER_API_URL = "https://lite-api.jup.ag/swap/v1";
const SOL_MINT_ADDRESS = "So11111111111111111111111111111111111111112";

// Jito Configuration
const DEFAULT_JITO_BUNDLE_RPC_URL =
  "https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles";
const JITO_TIP_ACCOUNTS = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QiEV5fGqZNyN9nmNhvrZU5",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
];

const DEFAULT_JITO_TIP_LAMPORTS = 100_000; // 0.0001 SOL

// Priority fee settings
const DEFAULT_PRIORITY_FEE_MICROLAMPORTS = 50_000; // 0.05 SOL
const HIGH_PRIORITY_FEE_MICROLAMPORTS = 80_000; // 0.08 SOL
const ULTRA_HIGH_PRIORITY_FEE_MICROLAMPORTS = 100_000; // 0.1 SOL
const COMPUTE_UNIT_LIMIT = 1_400_000;

// Stream provider types
const StreamProvider = {
  SOLANA_WEBSOCKET: "SolanaWebSocket",
  LASERSTREAM: "LaserStream",
};

/**
 * Parse stream provider from string
 * @param {string} s
 * @returns {string}
 */
function parseStreamProvider(s) {
  const lower = s.toLowerCase();
  if (["websocket", "ws", "solana"].includes(lower)) {
    return StreamProvider.SOLANA_WEBSOCKET;
  } else if (["laserstream", "grpc", "helius"].includes(lower)) {
    return StreamProvider.LASERSTREAM;
  } else {
    throw new Error(
      `Invalid stream provider: ${s}. Use 'websocket' or 'laserstream'`
    );
  }
}

/**
 * Configuration class
 */
class Config {
  constructor() {
    // Load configuration from environment
    this.solanaPrivateKey =
      process.env.SOLANA_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!this.solanaPrivateKey) {
      throw new Error(
        "SOLANA_PRIVATE_KEY or PRIVATE_KEY environment variable must be set"
      );
    }

    console.log(
      `Using private key from environment variable (length: ${this.solanaPrivateKey.length} chars)`
    );

    this.solanaRpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_SOLANA_RPC_URL;
    this.solanaWssUrl = process.env.SOLANA_WSS_URL || DEFAULT_SOLANA_WSS_URL;
    this.jitoBundleRpcUrl =
      process.env.JITO_BUNDLE_RPC_URL || DEFAULT_JITO_BUNDLE_RPC_URL;
    this.jitoTipLamports =
      parseInt(process.env.JITO_TIP) || DEFAULT_JITO_TIP_LAMPORTS;
    this.sellPercentage = parseFloat(process.env.SELL_PERCENTAGE) || 100.0;
    this.slippage = parseFloat(process.env.SLIPPAGE) || 100.0; // 100% slippage tolerance for emergency sells
    this.highPriority =
      (process.env.HIGH_PRIORITY || "true").toLowerCase() === "true";
    this.useJito = (process.env.USE_JITO || "false").toLowerCase() === "true"; // Temporarily disable Jito
    this.maxSellRetries = parseInt(process.env.MAX_SELL_RETRIES) || 60;
    this.dataDir = process.env.DATA_DIR || "./data";
    this.shyftApiKey = process.env.SHYFT_API_KEY || null;
    this.shyftBaseUrl = process.env.SHYFT_BASE_URL || "https://api.shyft.to";
    this.pauseShyft =
      (process.env.PAUSE_SHYFT || "false").toLowerCase() === "true";
    this.callbackUrl = process.env.CALLBACK_URL || "http://57.128.216.19";
    this.maxMonitoredTokens = parseInt(process.env.MAX_MONITORED_TOKENS) || 50;

    // LaserStream configuration
    this.streamProvider = parseStreamProvider(
      process.env.STREAM_PROVIDER || "websocket"
    );
    this.laserstreamUrl = process.env.LASERSTREAM_URL || null;
    this.laserstreamApiKey = process.env.LASERSTREAM_API_KEY || null;
    this.heliusKey = process.env.HELIUS_API_KEY || null;
  }

  /**
   * Load configuration from environment
   * @returns {Config}
   */
  static fromEnv() {
    const cwd = process.cwd();
    console.log(`Current working directory: ${cwd}`);

    return new Config();
  }
}

module.exports = {
  Config,
  StreamProvider,
  DEFAULT_SOLANA_RPC_URL,
  DEFAULT_SOLANA_WSS_URL,
  JUPITER_API_URL,
  SOL_MINT_ADDRESS,
  DEFAULT_JITO_BUNDLE_RPC_URL,
  JITO_TIP_ACCOUNTS,
  DEFAULT_JITO_TIP_LAMPORTS,
  DEFAULT_PRIORITY_FEE_MICROLAMPORTS,
  HIGH_PRIORITY_FEE_MICROLAMPORTS,
  ULTRA_HIGH_PRIORITY_FEE_MICROLAMPORTS,
  COMPUTE_UNIT_LIMIT,
};
