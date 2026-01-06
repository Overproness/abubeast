// Server - JavaScript Port
// Port of server.rs

const express = require("express");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { requestLogger } = require("./request_logger");
const { getFileLogger } = require("./file_logger");

class AutoSellServer {
  constructor(unifiedMonitor, config) {
    this.unifiedMonitor = unifiedMonitor;
    this.config = config;
    this.dataDir = path.resolve(config.dataDir);
    this.app = express();

    // Middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(requestLogger());

    // Setup routes
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", async (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "auto-sell-engine",
      });
    });

    // Add token to monitoring
    this.app.post("/monitor/add", async (req, res) => {
      try {
        const {
          token_mint,
          token_pair_addr,
          token_account,
          liquidity_pool,
          metadata,
          triggers,
        } = req.body;

        if (!token_mint) {
          return res.status(400).json({
            success: false,
            error: "Missing required field: token_mint",
          });
        }

        console.log(
          `📥 Request to add token: ${token_mint.substring(0, 8)}...`
        );

        const success = await this.unifiedMonitor.addToken(
          token_mint,
          token_pair_addr,
          token_account,
          liquidity_pool,
          metadata,
          triggers
        );

        if (success) {
          res.json({
            success: true,
            message: `Token ${token_mint} added to monitoring`,
            token_mint,
          });
        } else {
          res.status(400).json({
            success: false,
            error: "Token is already being monitored",
          });
        }
      } catch (error) {
        console.error(`Error adding token: ${error.message}`);
        const logger = await getFileLogger();
        if (logger) {
          logger.logError("SERVER", "Failed to add token", {
            error: error.message,
            stack: error.stack,
            body: req.body,
          });
        }

        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Remove token from monitoring
    this.app.delete("/monitor/remove/:token", async (req, res) => {
      try {
        const tokenMint = req.params.token;

        if (!tokenMint) {
          return res.status(400).json({
            success: false,
            error: "Missing token mint parameter",
          });
        }

        console.log(
          `📤 Request to remove token: ${tokenMint.substring(0, 8)}...`
        );

        const success = await this.unifiedMonitor.removeToken(tokenMint);

        if (success) {
          res.json({
            success: true,
            message: `Token ${tokenMint} removed from monitoring`,
            token_mint: tokenMint,
          });
        } else {
          res.status(404).json({
            success: false,
            error: "Token is not being monitored",
          });
        }
      } catch (error) {
        console.error(`Error removing token: ${error.message}`);
        const logger = await getFileLogger();
        if (logger) {
          logger.logError("SERVER", "Failed to remove token", {
            error: error.message,
            stack: error.stack,
            token: req.params.token,
          });
        }

        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get all monitored tokens
    this.app.get("/monitor/tokens", async (req, res) => {
      try {
        const status = await this.unifiedMonitor.getStatus();

        res.json({
          success: true,
          monitored_tokens_count: status.monitored_tokens_count,
          tokens: status.tokens,
        });
      } catch (error) {
        console.error(`Error getting monitored tokens: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get monitor status
    this.app.get("/monitor/status", async (req, res) => {
      try {
        const status = await this.unifiedMonitor.getStatus();

        res.json({
          success: true,
          ...status,
        });
      } catch (error) {
        console.error(`Error getting monitor status: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Check if monitoring specific token
    this.app.get("/monitor/check/:token", async (req, res) => {
      try {
        const tokenMint = req.params.token;
        const isMonitoring = await this.unifiedMonitor.isMonitoringToken(
          tokenMint
        );

        res.json({
          success: true,
          token_mint: tokenMint,
          is_monitoring: isMonitoring,
        });
      } catch (error) {
        console.error(`Error checking token: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Shyft webhook endpoint
    this.app.post("/webhook/shyft", async (req, res) => {
      try {
        console.log("🔔 Shyft webhook received");
        console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
        console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);

        // Acknowledge receipt immediately
        res.status(200).json({
          success: true,
          message: "Webhook received",
        });

        // Process webhook asynchronously
        setImmediate(async () => {
          try {
            await this.unifiedMonitor.handleShyftWebhook(req.body);
          } catch (error) {
            console.error(`Error processing Shyft webhook: ${error.message}`);
            const logger = await getFileLogger();
            if (logger) {
              logger.logError("WEBHOOK", "Failed to process Shyft webhook", {
                error: error.message,
                stack: error.stack,
                body: req.body,
              });
            }
          }
        });
      } catch (error) {
        console.error(`Error handling webhook: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get sell history
    this.app.get("/history/sells", async (req, res) => {
      try {
        const sellHistoryFile = path.join(this.dataDir, "sell_history.json");

        if (!fsSync.existsSync(sellHistoryFile)) {
          return res.json({
            success: true,
            sells: [],
          });
        }

        const data = await fs.readFile(sellHistoryFile, "utf-8");
        const history = JSON.parse(data);

        res.json({
          success: true,
          sells: history.sells || [],
        });
      } catch (error) {
        console.error(`Error reading sell history: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get tokens added history
    this.app.get("/history/tokens_added", async (req, res) => {
      try {
        const logger = await getFileLogger();
        if (!logger) {
          return res.status(500).json({
            success: false,
            error: "Logger not initialized",
          });
        }

        const events = await logger.readTokenEvents();

        res.json({
          success: true,
          events: events.map((e) => ({
            timestamp: e.timestamp,
            token_mint: e.tokenMint,
            top_holders_count: e.topHoldersCount,
            shyft_callback_id: e.shyftCallbackId,
            liquidity_pool: e.liquidityPool,
          })),
        });
      } catch (error) {
        console.error(`Error reading token addition history: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get sell attempts history
    this.app.get("/history/sell_attempts", async (req, res) => {
      try {
        const logger = await getFileLogger();
        if (!logger) {
          return res.status(500).json({
            success: false,
            error: "Logger not initialized",
          });
        }

        const attempts = await logger.readSellAttempts();

        res.json({
          success: true,
          attempts: attempts.map((a) => ({
            timestamp: a.timestamp,
            token_mint: a.tokenMint,
            trigger_type: a.triggerType,
            attempt_number: a.attemptNumber,
            status: a.status,
            transaction_signature: a.transactionSignature,
            error_message: a.errorMessage,
            sol_received: a.solReceived,
            tokens_sold: a.tokensSold,
          })),
        });
      } catch (error) {
        console.error(`Error reading sell attempts history: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get triggered events history
    this.app.get("/history/triggered_events", async (req, res) => {
      try {
        const logger = await getFileLogger();
        if (!logger) {
          return res.status(500).json({
            success: false,
            error: "Logger not initialized",
          });
        }

        const events = await logger.readTriggeredEvents();

        res.json({
          success: true,
          events: events.map((e) => ({
            timestamp: e.timestamp,
            token_mint: e.tokenMint,
            event_type: e.eventType,
            detection_source: e.detectionSource,
            trigger_details: e.triggerDetails,
            transaction_signature: e.transactionSignature,
            will_trigger_sell: e.willTriggerSell,
          })),
        });
      } catch (error) {
        console.error(`Error reading triggered events: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get system events history
    this.app.get("/history/system_events", async (req, res) => {
      try {
        const logger = await getFileLogger();
        if (!logger) {
          return res.status(500).json({
            success: false,
            error: "Logger not initialized",
          });
        }

        const events = await logger.readSystemEvents();

        res.json({
          success: true,
          events: events.map((e) => ({
            timestamp: e.timestamp,
            level: e.level,
            category: e.category,
            message: e.message,
            details: e.details,
          })),
        });
      } catch (error) {
        console.error(`Error reading system events: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: `Endpoint not found: ${req.method} ${req.path}`,
      });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      console.error(`Unhandled error: ${err.message}`);
      console.error(err.stack);

      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: err.message,
      });
    });
  }

  async start(port = 3000) {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          console.log(`🚀 AutoSell Server listening on port ${port}`);
          resolve();
        });

        this.server.on("error", (error) => {
          console.error(`Server error: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log("🛑 AutoSell Server stopped");
          resolve();
        });
      });
    }
  }
}

module.exports = { AutoSellServer };
