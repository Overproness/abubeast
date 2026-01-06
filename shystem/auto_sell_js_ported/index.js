#!/usr/bin/env node

// Main Application Entry Point - JavaScript Port
// Port of main.rs

const { Config } = require("./config");
const { AutoSellEngine } = require("./auto_sell_engine");
const { UnifiedTokenMonitor } = require("./unified_monitor");
const { ShyftClient } = require("./shyft_client");
const { AutoSellServer } = require("./server");
const { initializeFileLogger } = require("./file_logger");
const fs = require("fs");
const path = require("path");

class AutoSellApplication {
  constructor() {
    this.config = null;
    this.engine = null;
    this.monitor = null;
    this.server = null;
    this.isShuttingDown = false;
  }

  async initialize() {
    console.log("=".repeat(80));
    console.log("🚀 AUTO-SELL ENGINE STARTING...");
    console.log("=".repeat(80));

    // Load configuration
    console.log("📝 Loading configuration...");
    this.config = Config.fromEnv();
    console.log(`✅ Configuration loaded successfully`);
    console.log(`   - RPC URL: ${this.config.solanaRpcUrl}`);
    console.log(`   - WSS URL: ${this.config.solanaWssUrl}`);
    console.log(`   - Stream Provider: ${this.config.streamProvider}`);
    console.log(`   - Max Monitored Tokens: ${this.config.maxMonitoredTokens}`);
    console.log(`   - Callback URL: ${this.config.callbackUrl}`);
    console.log(`   - Data Directory: ${this.config.dataDir}`);

    // Ensure data directory exists
    if (!fs.existsSync(this.config.dataDir)) {
      console.log(`📁 Creating data directory: ${this.config.dataDir}`);
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }

    // Ensure logs directory exists
    const logsDir = path.join(this.config.dataDir, "logs");
    if (!fs.existsSync(logsDir)) {
      console.log(`📁 Creating logs directory: ${logsDir}`);
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Initialize file logger
    console.log("📊 Initializing file logger...");
    await initializeFileLogger(logsDir);
    console.log("✅ File logger initialized");

    // Initialize Shyft client (if configured)
    let shyftClient = null;
    if (this.config.shyftApiKey) {
      console.log("🔗 Initializing Shyft client...");
      shyftClient = new ShyftClient(
        this.config.shyftApiKey,
        this.config.solanaNetwork
      );
      console.log("✅ Shyft client initialized");
    } else {
      console.warn("⚠️  SHYFT_API_KEY not set - webhook monitoring disabled");
    }

    // Initialize auto-sell engine
    console.log("⚙️  Initializing auto-sell engine...");
    this.engine = new AutoSellEngine(this.config);
    console.log("✅ Auto-sell engine initialized");

    // Create sell trigger callback
    const onSellTrigger = async (tokenMint, triggerType, triggerDetails) => {
      console.log("");
      console.log("=".repeat(80));
      console.log("🚨 SELL TRIGGER ACTIVATED!");
      console.log("=".repeat(80));
      console.log(`   Token Mint: ${tokenMint}`);
      console.log(`   Trigger Type: ${triggerType}`);
      console.log(`   Details: ${triggerDetails}`);
      console.log("=".repeat(80));
      console.log("");

      try {
        const result = await this.engine.executeSell(
          tokenMint,
          triggerType,
          triggerDetails
        );

        if (result.success) {
          console.log("");
          console.log("✅ SELL EXECUTED SUCCESSFULLY!");
          console.log(`   Transaction: ${result.signature}`);
          console.log(`   SOL Received: ${result.solReceived || "N/A"}`);
          console.log(`   Tokens Sold: ${result.tokensSold || "N/A"}`);
          console.log("");
        } else {
          console.error("");
          console.error("❌ SELL EXECUTION FAILED!");
          console.error(`   Error: ${result.error || "Unknown error"}`);
          console.error("");
        }
      } catch (error) {
        console.error("");
        console.error("❌ CRITICAL ERROR DURING SELL EXECUTION!");
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        console.error("");
      }
    };

    // Initialize unified token monitor
    console.log("👁️  Initializing unified token monitor...");
    this.monitor = new UnifiedTokenMonitor(
      onSellTrigger,
      this.config,
      shyftClient
    );
    console.log("✅ Unified token monitor initialized");

    // Start monitoring
    console.log("🎬 Starting token monitoring...");
    await this.monitor.startMonitoring();
    console.log("✅ Token monitoring started");

    // Initialize HTTP server
    console.log("🌐 Initializing HTTP server...");
    this.server = new AutoSellServer(this.monitor, this.config);
    console.log("✅ HTTP server initialized");

    // Start HTTP server
    const serverPort = this.config.serverPort;
    console.log(`🚀 Starting HTTP server on port ${serverPort}...`);
    await this.server.start(serverPort);
    console.log(`✅ HTTP server listening on http://0.0.0.0:${serverPort}`);

    console.log("");
    console.log("=".repeat(80));
    console.log("✅ AUTO-SELL ENGINE IS RUNNING");
    console.log("=".repeat(80));
    console.log("");
    console.log("📡 Available Endpoints:");
    console.log(`   - GET  /health                     - Health check`);
    console.log(
      `   - POST /monitor/add                - Add token to monitoring`
    );
    console.log(
      `   - DELETE /monitor/remove/:token    - Remove token from monitoring`
    );
    console.log(
      `   - GET  /monitor/tokens             - List all monitored tokens`
    );
    console.log(`   - GET  /monitor/status             - Get monitor status`);
    console.log(
      `   - GET  /monitor/check/:token       - Check if monitoring token`
    );
    console.log(
      `   - POST /webhook/shyft              - Shyft webhook endpoint`
    );
    console.log(`   - GET  /history/sells              - Get sell history`);
    console.log(
      `   - GET  /history/tokens_added       - Get tokens added history`
    );
    console.log(
      `   - GET  /history/sell_attempts      - Get sell attempts history`
    );
    console.log(
      `   - GET  /history/triggered_events   - Get triggered events history`
    );
    console.log(
      `   - GET  /history/system_events      - Get system events history`
    );
    console.log("");
    console.log("💡 Press Ctrl+C to shutdown gracefully");
    console.log("=".repeat(80));
    console.log("");
  }

  async shutdown() {
    if (this.isShuttingDown) {
      console.log("⚠️  Shutdown already in progress...");
      return;
    }

    this.isShuttingDown = true;

    console.log("");
    console.log("=".repeat(80));
    console.log("🛑 SHUTTING DOWN AUTO-SELL ENGINE...");
    console.log("=".repeat(80));

    // Stop HTTP server
    if (this.server) {
      console.log("🌐 Stopping HTTP server...");
      try {
        await this.server.stop();
        console.log("✅ HTTP server stopped");
      } catch (error) {
        console.error(`❌ Error stopping server: ${error.message}`);
      }
    }

    // Stop monitoring
    if (this.monitor) {
      console.log("👁️  Stopping token monitor...");
      try {
        await this.monitor.stopMonitoring();
        console.log("✅ Token monitor stopped");
      } catch (error) {
        console.error(`❌ Error stopping monitor: ${error.message}`);
      }
    }

    // Get final statistics
    if (this.engine) {
      console.log("📊 Final statistics:");
      try {
        const stats = this.engine.getStatistics();
        console.log(`   - Total Sells: ${stats.totalSells}`);
        console.log(`   - Successful: ${stats.successful}`);
        console.log(`   - Failed: ${stats.failed}`);
        console.log(`   - Success Rate: ${stats.successRate.toFixed(2)}%`);
      } catch (error) {
        console.error(`❌ Error getting statistics: ${error.message}`);
      }
    }

    console.log("");
    console.log("✅ SHUTDOWN COMPLETE");
    console.log("=".repeat(80));
    console.log("");
  }

  setupSignalHandlers() {
    // Handle Ctrl+C (SIGINT)
    process.on("SIGINT", async () => {
      console.log("\n📥 Received SIGINT (Ctrl+C)");
      await this.shutdown();
      process.exit(0);
    });

    // Handle SIGTERM
    process.on("SIGTERM", async () => {
      console.log("\n📥 Received SIGTERM");
      await this.shutdown();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("");
      console.error("💥 UNCAUGHT EXCEPTION!");
      console.error(`   Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      console.error("");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("");
      console.error("💥 UNHANDLED PROMISE REJECTION!");
      console.error(`   Reason: ${reason}`);
      console.error(`   Promise: ${promise}`);
      console.error("");
    });
  }
}

// Main entry point
async function main() {
  const app = new AutoSellApplication();

  try {
    // Setup signal handlers
    app.setupSignalHandlers();

    // Initialize and start application
    await app.initialize();

    // Keep the process running
    // The application will run until a shutdown signal is received
  } catch (error) {
    console.error("");
    console.error("💥 FATAL ERROR DURING INITIALIZATION!");
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error("");
    process.exit(1);
  }
}

// Run the application if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error("");
    console.error("💥 FATAL ERROR!");
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error("");
    process.exit(1);
  });
}

module.exports = { AutoSellApplication };
