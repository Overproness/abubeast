/**
 * Token Monitoring Service
 * Monitors for new token launches and triggers buy orders for authorized users
 */

import dbConnect from "@/lib/db/mongodb";
import SessionKey from "@/models/SessionKey";
import axios from "axios";
import { createTraderForUser } from "./sessionKeyTrader";

const MOBULA_API =
  process.env.MOBULA_API_KEY || "05af5fe9-c6a2-4677-8491-fa1bea364fc1";
const SOLANATRACKER_API_KEY =
  process.env.SOLANATRACKER_API_KEY || "d1fc458e-bdef-4309-971f-54238845c9c3";

class TokenMonitoringService {
  constructor() {
    this.processedTokens = new Set();
    this.isRunning = false;
    this.checkInterval = 10000; // 10 seconds
  }

  async start() {
    if (this.isRunning) {
      console.log("[TokenMonitor] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[TokenMonitor] Starting token monitoring service...");

    // Start monitoring loop
    this.monitorLoop();
  }

  async stop() {
    this.isRunning = false;
    console.log("[TokenMonitor] Stopped token monitoring service");
  }

  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkForNewTokens();
      } catch (error) {
        console.error("[TokenMonitor] Error in monitor loop:", error.message);
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, this.checkInterval));
    }
  }

  async checkForNewTokens() {
    try {
      const newTokens = await this.fetchNewTokensFromSolanaTracker();

      if (newTokens && newTokens.length > 0) {
        console.log(`[TokenMonitor] Found ${newTokens.length} new tokens`);

        for (const token of newTokens) {
          if (!this.processedTokens.has(token.address)) {
            await this.processNewToken(token);
            this.processedTokens.add(token.address);
          }
        }
      }
    } catch (error) {
      console.error(
        "[TokenMonitor] Error checking for new tokens:",
        error.message
      );
    }
  }

  async fetchNewTokensFromSolanaTracker() {
    try {
      const response = await axios.get(
        "https://data.solanatracker.io/tokens/latest",
        {
          headers: {
            "x-api-key": SOLANATRACKER_API_KEY,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((token) => ({
          address: token.mint || token.address,
          name: token.name || "Unknown",
          symbol: token.symbol || "UNKNOWN",
          liquidity: token.liquidity || 0,
          marketCap: token.market_cap || 0,
          createdAt: token.created_at || new Date(),
        }));
      }

      return [];
    } catch (error) {
      console.error("[TokenMonitor] SolanaTracker API error:", error.message);
      return [];
    }
  }

  async processNewToken(token) {
    try {
      console.log(
        `[TokenMonitor] Processing new token: ${token.symbol} (${token.address})`
      );

      // Basic filtering
      if (!this.shouldBuyToken(token)) {
        console.log(
          `[TokenMonitor] Skipping token ${token.symbol} - failed filters`
        );
        return;
      }

      // Get all users with active trading sessions
      await dbConnect();

      const activeSessionKeys = await SessionKey.find({
        active: true,
        expiresAt: { $gt: new Date() },
        "permissions.canTrade": true,
      }).populate("userId");

      console.log(
        `[TokenMonitor] Found ${activeSessionKeys.length} active trading sessions`
      );

      // Execute buy for each user
      for (const sessionKey of activeSessionKeys) {
        await this.executeBuyForUser(sessionKey, token);
      }
    } catch (error) {
      console.error(
        `[TokenMonitor] Error processing token ${token.address}:`,
        error.message
      );
    }
  }

  shouldBuyToken(token) {
    // Basic safety filters
    if (!token.address || token.address.length < 32) {
      return false;
    }

    // Must have minimum liquidity
    if (token.liquidity < 1000) {
      return false;
    }

    // Add more filters as needed
    return true;
  }

  async executeBuyForUser(sessionKey, token) {
    try {
      const trader = await createTraderForUser(sessionKey.userId);

      if (!trader) {
        console.log(
          `[TokenMonitor] No trader available for user ${sessionKey.userId}`
        );
        return;
      }

      // Calculate buy amount based on user's settings
      const buyAmount = this.calculateBuyAmount(sessionKey);

      console.log(
        `[TokenMonitor] Executing buy for user ${sessionKey.userId}: ${buyAmount} SOL for ${token.symbol}`
      );

      // Execute buy
      const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";
      const result = await trader.buyToken(
        WRAPPED_SOL_MINT,
        token.address,
        buyAmount,
        500 // 5% slippage
      );

      if (result.success) {
        console.log(
          `[TokenMonitor] ✅ Buy successful for user ${sessionKey.userId}: ${result.signature}`
        );
      } else {
        console.error(
          `[TokenMonitor] ❌ Buy failed for user ${sessionKey.userId}: ${result.error}`
        );
      }
    } catch (error) {
      console.error(
        `[TokenMonitor] Error executing buy for user ${sessionKey.userId}:`,
        error.message
      );
    }
  }

  calculateBuyAmount(sessionKey) {
    // Default to 0.01 SOL per trade
    let buyAmount = 0.01;

    // Respect max transaction amount if set
    if (sessionKey.permissions?.maxTransactionAmount) {
      buyAmount = Math.min(
        buyAmount,
        sessionKey.permissions.maxTransactionAmount
      );
    }

    // Check remaining daily limit
    const remainingDaily =
      (sessionKey.permissions?.dailySpendingLimit || 1) -
      (sessionKey.usageStats?.todaySpending || 0);

    buyAmount = Math.min(buyAmount, remainingDaily);

    return Math.max(0.001, buyAmount); // Minimum 0.001 SOL
  }
}

// Singleton instance
let monitorInstance = null;

export function getTokenMonitor() {
  if (!monitorInstance) {
    monitorInstance = new TokenMonitoringService();
  }
  return monitorInstance;
}

export async function startTokenMonitoring() {
  const monitor = getTokenMonitor();
  await monitor.start();
  return monitor;
}

export async function stopTokenMonitoring() {
  const monitor = getTokenMonitor();
  await monitor.stop();
}
