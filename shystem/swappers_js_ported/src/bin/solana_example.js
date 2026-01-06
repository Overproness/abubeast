// Interactive Solana trading example
// Equivalent to solana_example.rs

import dotenv from "dotenv";
import readline from "readline";
import { SolanaTrader } from "../spl_swap/solana_trade.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("=== Solana Token Trading Example ===\n");

  // Create trader
  const trader = new SolanaTrader();

  // Get contract address from user
  const contractAddress = await question("Enter the Solana token address: ");
  const tokenAddress = contractAddress.trim();

  // Check balance
  console.log("\nChecking balance...");
  try {
    const balance = await trader.getBalance(tokenAddress);
    console.log("Current balance:", balance, "tokens");
  } catch (error) {
    console.log("Error getting balance:", error.message);
  }

  // Buy tokens
  const buyAmountStr = await question(
    "\nEnter the amount of SOL to use for buying: "
  );
  const buyAmount = parseFloat(buyAmountStr);

  if (buyAmount > 0) {
    console.log("\nExecuting buy phase...");
    try {
      const buyResult = await trader.executeBuyPhase(
        tokenAddress,
        buyAmount,
        5.0, // max_price_impact
        true // high_priority
      );

      if (buyResult.success) {
        console.log("✅ Buy transaction successful!");
        if (buyResult.signature) {
          console.log("Transaction signature:", buyResult.signature);
        }
      } else {
        console.log("❌ Buy failed:", buyResult.error || "Unknown error");
        rl.close();
        return;
      }

      // Wait for balance update
      console.log("\nWaiting for balance update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.log("❌ Unexpected error during buy:", error.message);
      rl.close();
      return;
    }
  } else {
    console.log("Invalid amount. Must be greater than 0.");
    rl.close();
    return;
  }

  // Check balance again
  try {
    const balance = await trader.getBalance(tokenAddress);
    if (balance <= 0) {
      console.log(
        "No balance found for the token. Make sure the buy transaction was successful."
      );
      rl.close();
      return;
    }
    console.log("Current token balance:", balance, "tokens");
  } catch (error) {
    console.log("Error getting balance:", error.message);
    rl.close();
    return;
  }

  // Sell tokens
  const sellPercentageStr = await question(
    "\nEnter the percentage of the token to sell (1-100): "
  );
  const percentage = parseFloat(sellPercentageStr);

  if (percentage >= 1 && percentage <= 100) {
    console.log("\nExecuting sell phase...");
    try {
      const sellResult = await trader.executeSellPhase(
        tokenAddress,
        percentage,
        true // high_priority
      );

      if (sellResult.success) {
        console.log("✅ Sell transaction successful!");
        if (sellResult.signature) {
          console.log("Transaction signature:", sellResult.signature);
        }
      } else {
        console.log("❌ Sell failed:", sellResult.error || "Unknown error");
      }
    } catch (error) {
      console.log("❌ Unexpected error during sell:", error.message);
    }
  } else {
    console.log("Invalid percentage. Must be between 1 and 100.");
  }

  console.log("\n=== Trading session complete ===");
  rl.close();
}

main().catch((error) => {
  console.error("Error:", error);
  rl.close();
  process.exit(1);
});
