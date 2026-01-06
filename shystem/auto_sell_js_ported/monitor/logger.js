// Trade Logger - JavaScript Port
// Port of monitor/logger.rs

const fs = require("fs").promises;
const fsSync = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

class TradeLogger {
  constructor(csvPath) {
    this.csvPath = csvPath;

    // Create file with headers if it doesn't exist
    if (!fsSync.existsSync(csvPath)) {
      try {
        fsSync.writeFileSync(csvPath, "CA,SOL\n");
      } catch (error) {
        console.error(`Failed to create trade logger CSV: ${error}`);
        throw error;
      }
    }
  }

  async logTrade(tokenMint, amount, solAmountReturned) {
    try {
      const line = `${tokenMint},${solAmountReturned}\n`;
      await fs.appendFile(this.csvPath, line);

      console.log(
        `📊 Trade logged to CSV: ${tokenMint} -> ${solAmountReturned} SOL`
      );
    } catch (error) {
      console.error(`Failed to log trade: ${error}`);
      throw error;
    }
  }
}

module.exports = { TradeLogger };
