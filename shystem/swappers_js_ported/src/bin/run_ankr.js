// Interactive EVM trading example using Ankr
// Equivalent to run_ankr.rs

import readline from "readline";
import { checkBalance, swapBuy, swapSell } from "../spl_swap/ankr_functions.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("=== EVM Token Trading with Ankr ===\n");

  // Get contract address from user
  const contractAddress = await question("Enter the contract address: ");

  // Check balance
  console.log("\nChecking balance...");
  try {
    const balance = await checkBalance(contractAddress.trim());
    console.log("Balance:", balance);
  } catch (error) {
    console.log("Error checking balance:", error.message);
    rl.close();
    return;
  }

  // Buy tokens
  const buyAmountStr = await question(
    "\nEnter the amount of native currency to use for buying: "
  );
  const buyAmount = parseFloat(buyAmountStr);

  if (buyAmount > 0) {
    console.log("\nExecuting buy...");
    try {
      const txHash = await swapBuy(contractAddress.trim(), buyAmount);
      console.log("✅ Buy transaction hash:", txHash);
    } catch (error) {
      console.log("❌ Buy failed:", error.message);
      rl.close();
      return;
    }
  } else {
    console.log("Invalid amount. Must be greater than 0.");
    rl.close();
    return;
  }

  // Sell tokens
  const sellPercentageStr = await question(
    "\nEnter the percentage of the token to sell (1-100): "
  );
  const percentage = parseFloat(sellPercentageStr);

  if (percentage >= 1 && percentage <= 100) {
    console.log("\nExecuting sell...");
    try {
      const txHash = await swapSell(contractAddress.trim(), percentage);
      console.log("✅ Sell transaction hash:", txHash);
    } catch (error) {
      console.log("❌ Sell failed:", error.message);
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
