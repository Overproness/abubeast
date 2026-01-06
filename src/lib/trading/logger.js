/**
 * Trade Logger
 * CSV-based logging for all trades
 */

import fsSync from "fs";
import fs from "fs/promises";
import path from "path";

export class TradeLogger {
  constructor(csvPath) {
    this.csvPath = csvPath;
    this.initializeLog();
  }

  initializeLog() {
    if (!fsSync.existsSync(this.csvPath)) {
      const dir = path.dirname(this.csvPath);
      if (!fsSync.existsSync(dir)) {
        fsSync.mkdirSync(dir, { recursive: true });
      }

      // Write CSV header
      const header =
        "timestamp,token,action,trigger,balance_sold,balance_remaining,signature,details\n";
      fsSync.writeFileSync(this.csvPath, header);
      console.log(`✅ Trade log initialized: ${this.csvPath}`);
    }
  }

  async logTrade(tradeData) {
    const {
      timestamp,
      token,
      action,
      trigger,
      balanceSold,
      balanceRemaining,
      signature,
      details,
    } = tradeData;

    const row =
      [
        timestamp,
        token,
        action,
        trigger,
        balanceSold,
        balanceRemaining,
        signature,
        details.replace(/"/g, '""'), // Escape quotes
      ].join(",") + "\n";

    await fs.appendFile(this.csvPath, row);
  }

  async getRecentTrades(limit = 100) {
    try {
      const content = await fs.readFile(this.csvPath, "utf-8");
      const lines = content.trim().split("\n");

      // Skip header
      const dataLines = lines.slice(1);

      // Get last N lines
      const recent = dataLines.slice(-limit);

      return recent.map((line) => {
        const parts = line.split(",");
        return {
          timestamp: parseInt(parts[0]),
          token: parts[1],
          action: parts[2],
          trigger: parts[3],
          balanceSold: parseFloat(parts[4]),
          balanceRemaining: parseFloat(parts[5]),
          signature: parts[6],
          details: parts.slice(7).join(","),
        };
      });
    } catch (error) {
      console.error(`Error reading trade log: ${error.message}`);
      return [];
    }
  }
}
