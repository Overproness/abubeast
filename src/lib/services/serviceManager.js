/**
 * Service Manager
 * Manages all background services (token monitoring, position monitoring, etc.)
 * Everything runs as part of the main backend process
 */

import { getTradingBotEngine } from "@/lib/trading/tradingBotEngine";

// Import token monitoring
const tokenMonitoringPath =
  "../../shystem/input_token_monitoring_js_ported/token_monitoring.js";

class ServiceManager {
  constructor() {
    this.services = {
      tokenMonitoring: {
        name: "Token Monitoring",
        status: "stopped",
        instance: null,
        error: null,
      },
      tradingBotEngine: {
        name: "Trading Bot Engine",
        status: "stopped",
        instance: null,
        error: null,
      },
    };
    this.initialized = false;
  }

  /**
   * Initialize all services
   */
  async initialize() {
    if (this.initialized) {
      console.log("[ServiceManager] Already initialized");
      return;
    }

    console.log("[ServiceManager] Initializing all services...");

    try {
      // Initialize Trading Bot Engine
      await this.startTradingBotEngine();

      // Initialize Token Monitoring
      await this.startTokenMonitoring();

      this.initialized = true;
      console.log("[ServiceManager] All services initialized successfully");
    } catch (error) {
      console.error("[ServiceManager] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Start Trading Bot Engine
   */
  async startTradingBotEngine() {
    try {
      console.log("[ServiceManager] Starting Trading Bot Engine...");
      const engine = getTradingBotEngine();
      await engine.start();

      this.services.tradingBotEngine.status = "running";
      this.services.tradingBotEngine.instance = engine;
      this.services.tradingBotEngine.error = null;

      console.log("[ServiceManager] Trading Bot Engine started");
    } catch (error) {
      console.error(
        "[ServiceManager] Failed to start Trading Bot Engine:",
        error
      );
      this.services.tradingBotEngine.status = "error";
      this.services.tradingBotEngine.error = error.message;
      throw error;
    }
  }

  /**
   * Start Token Monitoring
   */
  async startTokenMonitoring() {
    try {
      console.log("[ServiceManager] Starting Token Monitoring...");

      // Import the monitoring module
      const { startTokenMonitoring } = await import(tokenMonitoringPath).catch(
        () => {
          // If import fails, create inline version
          return {
            startTokenMonitoring: this.createInlineTokenMonitor.bind(this),
          };
        }
      );

      // Start monitoring in background
      this.services.tokenMonitoring.instance = startTokenMonitoring();
      this.services.tokenMonitoring.status = "running";
      this.services.tokenMonitoring.error = null;

      console.log("[ServiceManager] Token Monitoring started");
    } catch (error) {
      console.error(
        "[ServiceManager] Failed to start Token Monitoring:",
        error
      );
      this.services.tokenMonitoring.status = "error";
      this.services.tokenMonitoring.error = error.message;
      // Don't throw - monitoring is optional
    }
  }

  /**
   * Create inline token monitor if external module not available
   */
  createInlineTokenMonitor() {
    const axios = require("axios");
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

    let running = true;

    const monitor = async () => {
      while (running) {
        try {
          // Fetch new tokens from external API
          const response = await axios.get(
            "https://input-render.onrender.com/get_crypto_tokens",
            { timeout: 10000 }
          );

          if (response.status === 200 && response.data.tokens) {
            const tokens = response.data.tokens;

            for (const token of tokens) {
              try {
                // Send to our webhook
                await axios.post(
                  `${BACKEND_URL}/api/trading/webhook/new-token`,
                  {
                    address: token.mint_address,
                    symbol: token.symbol || "UNKNOWN",
                    name: token.name || token.symbol,
                    price: token.price || 0,
                    liquidity: token.liquidity || 0,
                    marketCap: token.market_cap || 0,
                    poolAddress: token.pool_address || "",
                  },
                  {
                    headers: {
                      "X-Webhook-Secret": WEBHOOK_SECRET,
                    },
                    timeout: 5000,
                  }
                );

                console.log(
                  `[Token Monitor] Sent token ${token.symbol} to backend`
                );
              } catch (error) {
                console.error(
                  `[Token Monitor] Failed to send token:`,
                  error.message
                );
              }
            }
          }
        } catch (error) {
          console.error(
            `[Token Monitor] Error fetching tokens:`,
            error.message
          );
        }

        // Wait 2 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    };

    // Start monitoring
    monitor().catch((error) => {
      console.error("[Token Monitor] Fatal error:", error);
    });

    // Return stop function
    return {
      stop: () => {
        running = false;
      },
    };
  }

  /**
   * Stop all services
   */
  async shutdown() {
    console.log("[ServiceManager] Shutting down all services...");

    // Stop Trading Bot Engine
    if (this.services.tradingBotEngine.instance) {
      try {
        await this.services.tradingBotEngine.instance.stop();
        this.services.tradingBotEngine.status = "stopped";
      } catch (error) {
        console.error(
          "[ServiceManager] Error stopping Trading Bot Engine:",
          error
        );
      }
    }

    // Stop Token Monitoring
    if (this.services.tokenMonitoring.instance?.stop) {
      try {
        this.services.tokenMonitoring.instance.stop();
        this.services.tokenMonitoring.status = "stopped";
      } catch (error) {
        console.error(
          "[ServiceManager] Error stopping Token Monitoring:",
          error
        );
      }
    }

    this.initialized = false;
    console.log("[ServiceManager] All services shut down");
  }

  /**
   * Get status of all services
   */
  getStatus() {
    return {
      initialized: this.initialized,
      services: Object.entries(this.services).map(([key, service]) => ({
        id: key,
        name: service.name,
        status: service.status,
        error: service.error,
      })),
    };
  }

  /**
   * Restart a specific service
   */
  async restartService(serviceId) {
    const service = this.services[serviceId];
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    console.log(`[ServiceManager] Restarting ${service.name}...`);

    // Stop if running
    if (service.instance) {
      if (serviceId === "tradingBotEngine") {
        await service.instance.stop();
      } else if (service.instance.stop) {
        service.instance.stop();
      }
    }

    // Restart
    if (serviceId === "tradingBotEngine") {
      await this.startTradingBotEngine();
    } else if (serviceId === "tokenMonitoring") {
      await this.startTokenMonitoring();
    }

    console.log(`[ServiceManager] ${service.name} restarted`);
  }
}

// Global singleton instance
let serviceManagerInstance = null;

/**
 * Get the global service manager instance
 */
export function getServiceManager() {
  if (!serviceManagerInstance) {
    serviceManagerInstance = new ServiceManager();
  }
  return serviceManagerInstance;
}

/**
 * Initialize services on app startup
 */
export async function initializeServices() {
  const manager = getServiceManager();
  await manager.initialize();
}

/**
 * Shutdown services on app termination
 */
export async function shutdownServices() {
  const manager = getServiceManager();
  await manager.shutdown();
}
