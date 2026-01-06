/**
 * Trading Bot Initialization Script
 * Auto-starts the trading bot services on server startup
 * Unified integration of all trading systems
 */

import { initializeAutoSellEngine } from "./lib/trading/autoSellEngine.js";
import { startEmergencySellMonitoring } from "./lib/trading/emergencySellService.js";
import { initializeSwapperService } from "./lib/trading/swapperService.js";
import { getTokenDiscoveryService } from "./lib/trading/tokenDiscoveryService.js";
import { startTokenMonitoring } from "./lib/trading/tokenMonitoringService.js";
import { UnifiedTokenMonitor } from "./lib/trading/unifiedMonitor.js";

const AUTO_START_BOT = process.env.AUTO_START_TRADING_BOT === "true";

// Global instances
let unifiedMonitor = null;
let autoSellEngine = null;
let tokenDiscovery = null;
let swapperService = null;

export async function initializeTradingBot() {
  if (!AUTO_START_BOT) {
    console.log("[TradingBot] Auto-start disabled. Use API to start manually.");
    return;
  }

  try {
    console.log("[TradingBot] 🚀 Initializing unified trading system...");

    // Initialize configuration (no private key needed - uses session keys)
    const config = {
      dataDir: process.env.TRADING_DATA_DIR || "./data/trading",
      solanaWssUrl: process.env.SOLANA_WSS_URL,
      solanaRpcUrl: process.env.SOLANA_RPC_URL,
      heliusKey: process.env.HELIUS_API_KEY,
      // NO solanaPrivateKey - system uses user session keys!
      sellPercentage: parseInt(process.env.SELL_PERCENTAGE || "100"),
      slippage: parseInt(process.env.SLIPPAGE_BPS || "1000"),
      highPriority: process.env.HIGH_PRIORITY === "true",
      useJito: process.env.USE_JITO === "true",
      maxMonitoredTokens: parseInt(process.env.MAX_MONITORED_TOKENS || "50"),
      callbackUrl: process.env.WEBHOOK_CALLBACK_URL,
    };

    // 1. Initialize Auto-Sell Engine
    console.log("[TradingBot] Initializing auto-sell engine...");
    autoSellEngine = await initializeAutoSellEngine(config);
    console.log("[TradingBot] ✅ Auto-sell engine ready");

    // 2. Initialize Unified Token Monitor
    console.log("[TradingBot] Initializing unified token monitor...");
    const onSellTrigger = async (
      userId,
      walletAddress,
      sessionKey,
      tokenMint,
      triggerType,
      triggerDetails
    ) => {
      console.log(
        `[TradingBot] 🚨 Sell trigger: ${triggerType} for ${tokenMint} (user: ${userId})`
      );
      await autoSellEngine.executeSell(
        userId,
        walletAddress,
        sessionKey,
        tokenMint,
        triggerType,
        triggerDetails
      );
    };

    unifiedMonitor = new UnifiedTokenMonitor(onSellTrigger, config);
    await unifiedMonitor.start();
    console.log("[TradingBot] ✅ Unified monitor started");

    // 3. Initialize Token Discovery Service
    console.log("[TradingBot] Initializing token discovery service...");
    tokenDiscovery = getTokenDiscoveryService({
      dataDir: config.dataDir + "/discovery",
      filterSpam: process.env.FILTER_SPAM_TOKENS === "true",
    });
    console.log("[TradingBot] ✅ Token discovery ready");

    // 4. Initialize Swapper Service (session-based, no hardcoded keys)
    console.log("[TradingBot] Initializing swapper service (session-based)...");
    swapperService = initializeSwapperService({
      heliusApiKey: config.heliusKey,
    });
    console.log(
      "[TradingBot] ✅ Swapper service ready (uses user session keys)"
    );

    // 5. Start existing token monitoring (legacy)
    await startTokenMonitoring();
    console.log("[TradingBot] ✅ Token monitoring started");

    // 6. Start emergency sell monitoring (legacy)
    await startEmergencySellMonitoring();
    console.log("[TradingBot] ✅ Emergency sell monitoring started");

    console.log("[TradingBot] 🎉 All trading services running!");
    console.log("[TradingBot] ====================================");
    console.log("[TradingBot]   Auto-Sell Engine: Active");
    console.log("[TradingBot]   Unified Monitor: Active");
    console.log("[TradingBot]   Token Discovery: Active");
    console.log("[TradingBot]   Swapper Service: Active");
    console.log("[TradingBot]   Legacy Services: Active");
    console.log("[TradingBot] ====================================");
  } catch (error) {
    console.error("[TradingBot] ❌ Failed to initialize:", error.message);
    console.error(error.stack);
  }
}

// Export service instances for API access
export function getTradingServices() {
  return {
    autoSellEngine,
    unifiedMonitor,
    tokenDiscovery,
    swapperService,
  };
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[TradingBot] 🛑 Shutting down gracefully...");

  try {
    if (unifiedMonitor) {
      await unifiedMonitor.stop();
    }

    const { stopTokenMonitoring } = await import(
      "./lib/trading/tokenMonitoringService.js"
    );
    const { stopEmergencySellMonitoring } = await import(
      "./lib/trading/emergencySellService.js"
    );

    await stopTokenMonitoring();
    await stopEmergencySellMonitoring();

    console.log("[TradingBot] ✅ Shutdown complete");
  } catch (error) {
    console.error("[TradingBot] Error during shutdown:", error.message);
  }

  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[TradingBot] Shutting down gracefully...");
  const { stopTokenMonitoring } = await import(
    "./lib/trading/tokenMonitoringService.js"
  );
  const { stopEmergencySellMonitoring } = await import(
    "./lib/trading/emergencySellService.js"
  );

  await stopTokenMonitoring();
  await stopEmergencySellMonitoring();

  console.log("[TradingBot] Shutdown complete");
  process.exit(0);
});
