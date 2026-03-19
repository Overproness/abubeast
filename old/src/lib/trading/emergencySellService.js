/**
 * Emergency Sell Service
 * Monitors token positions and executes emergency sells based on safety triggers
 */

import dbConnect from "@/lib/db/mongodb";
import TradeLog from "@/models/TradeLog";
import axios from "axios";
import { createTraderForUser } from "./sessionKeyTrader";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

class EmergencySellService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 30000; // 30 seconds
    this.rugCheckApiUrl = "https://api.rugcheck.xyz/v1/tokens";
  }

  async start() {
    if (this.isRunning) {
      console.log("[EmergencySell] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[EmergencySell] Starting emergency sell monitoring...");

    this.monitorLoop();
  }

  async stop() {
    this.isRunning = false;
    console.log("[EmergencySell] Stopped emergency sell monitoring");
  }

  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkAllPositions();
      } catch (error) {
        console.error("[EmergencySell] Error in monitor loop:", error.message);
      }

      await new Promise((resolve) => setTimeout(resolve, this.checkInterval));
    }
  }

  async checkAllPositions() {
    try {
      await dbConnect();

      // Get all recent buy trades from the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentBuys = await TradeLog.find({
        tradeType: "buy",
        status: "completed",
        timestamp: { $gte: oneDayAgo },
        // Only get buys that haven't been sold yet
        _id: {
          $nin: await TradeLog.distinct("relatedTradeId", {
            tradeType: "sell",
            status: "completed",
          }),
        },
      }).populate("userId sessionKeyId");

      console.log(
        `[EmergencySell] Checking ${recentBuys.length} open positions`
      );

      for (const trade of recentBuys) {
        await this.checkPosition(trade);
      }
    } catch (error) {
      console.error("[EmergencySell] Error checking positions:", error.message);
    }
  }

  async checkPosition(trade) {
    try {
      const tokenAddress = trade.outputToken;

      // Run safety checks
      const safetyChecks = await this.runSafetyChecks(tokenAddress);

      if (safetyChecks.shouldSell) {
        console.log(
          `[EmergencySell] 🚨 Safety trigger for ${tokenAddress}: ${safetyChecks.reason}`
        );

        await this.executeSell(trade, safetyChecks.reason);
      }
    } catch (error) {
      console.error(
        `[EmergencySell] Error checking position for ${trade.outputToken}:`,
        error.message
      );
    }
  }

  async runSafetyChecks(tokenAddress) {
    const checks = {
      shouldSell: false,
      reason: "",
      triggers: [],
    };

    try {
      // Check 1: RugCheck API for known scams
      const rugCheckResult = await this.checkRugCheck(tokenAddress);
      if (rugCheckResult.isRug) {
        checks.shouldSell = true;
        checks.triggers.push("rug_detected");
        checks.reason = `Rug detected: ${rugCheckResult.reason}`;
        return checks;
      }

      // Check 2: Top holder analysis (if available)
      const holderCheck = await this.checkTopHolders(tokenAddress);
      if (holderCheck.suspicious) {
        checks.shouldSell = true;
        checks.triggers.push("suspicious_holders");
        checks.reason = `Suspicious holder activity: ${holderCheck.reason}`;
        return checks;
      }

      // Check 3: Liquidity check
      const liquidityCheck = await this.checkLiquidity(tokenAddress);
      if (liquidityCheck.removed) {
        checks.shouldSell = true;
        checks.triggers.push("liquidity_removed");
        checks.reason = "Liquidity removed or critically low";
        return checks;
      }

      // Add more checks as needed
    } catch (error) {
      console.error(
        `[EmergencySell] Error running safety checks:`,
        error.message
      );
    }

    return checks;
  }

  async checkRugCheck(tokenAddress) {
    try {
      const response = await axios.get(
        `${this.rugCheckApiUrl}/${tokenAddress}/report`,
        {
          timeout: 5000,
        }
      );

      const data = response.data;

      // Check risk score
      if (data.risks && data.risks.length > 0) {
        const criticalRisks = data.risks.filter(
          (r) => r.level === "danger" || r.level === "critical"
        );

        if (criticalRisks.length > 0) {
          return {
            isRug: true,
            reason: criticalRisks.map((r) => r.name).join(", "),
          };
        }
      }

      return { isRug: false };
    } catch (error) {
      // If API fails, don't block other checks
      console.error("[EmergencySell] RugCheck API error:", error.message);
      return { isRug: false };
    }
  }

  async checkTopHolders(tokenAddress) {
    try {
      // Use Helius or another API to check top holders
      // For now, return safe
      return { suspicious: false };
    } catch (error) {
      console.error("[EmergencySell] Holder check error:", error.message);
      return { suspicious: false };
    }
  }

  async checkLiquidity(tokenAddress) {
    try {
      // Check if liquidity has been removed or is critically low
      // This would require integration with DEX APIs
      // For now, return safe
      return { removed: false };
    } catch (error) {
      console.error("[EmergencySell] Liquidity check error:", error.message);
      return { removed: false };
    }
  }

  async executeSell(trade, reason) {
    try {
      console.log(
        `[EmergencySell] Executing emergency sell for user ${trade.userId} - ${reason}`
      );

      // Get trader instance
      const trader = await createTraderForUser(trade.userId);

      if (!trader) {
        console.error("[EmergencySell] Could not create trader for user");
        return;
      }

      // Execute sell (100% of position)
      const result = await trader.sellToken(
        trade.outputToken,
        WRAPPED_SOL_MINT,
        100, // Sell 100%
        1000 // 10% slippage for emergency sells
      );

      if (result.success) {
        console.log(
          `[EmergencySell] ✅ Emergency sell successful: ${result.signature}`
        );

        // Update the original trade log to link the sell
        await TradeLog.findByIdAndUpdate(trade._id, {
          $set: {
            emergencySold: true,
            emergencyReason: reason,
          },
        });
      } else {
        console.error(
          `[EmergencySell] ❌ Emergency sell failed: ${result.error}`
        );
      }
    } catch (error) {
      console.error("[EmergencySell] Error executing sell:", error.message);
    }
  }
}

// Singleton instance
let sellServiceInstance = null;

export function getEmergencySellService() {
  if (!sellServiceInstance) {
    sellServiceInstance = new EmergencySellService();
  }
  return sellServiceInstance;
}

export async function startEmergencySellMonitoring() {
  const service = getEmergencySellService();
  await service.start();
  return service;
}

export async function stopEmergencySellMonitoring() {
  const service = getEmergencySellService();
  await service.stop();
}
