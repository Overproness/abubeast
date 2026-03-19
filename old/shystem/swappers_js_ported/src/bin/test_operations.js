// Test binary for Solana trading operations
// Equivalent to test_operations.rs

import dotenv from "dotenv";
import { SolanaTrader } from "../spl_swap/solana_trade.js";

dotenv.config();

const TOKEN_MINT = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";

async function testBuy(trader) {
  console.log("\n=== Testing BUY operation ===");
  const result = await trader.executeBuyPhase(
    TOKEN_MINT,
    0.005, // 0.005 SOL
    5.0, // max_price_impact
    true // high_priority
  );

  console.log("Buy Result:");
  console.log("  Success:", result.success);
  if (result.signature) {
    console.log("  Signature:", result.signature);
  }
  if (result.error) {
    console.log("  Error:", result.error);
  }
}

async function testSell(trader) {
  console.log("\n=== Testing SELL operation ===");
  const result = await trader.executeSellPhase(
    TOKEN_MINT,
    100.0, // Sell 100%
    true // high_priority
  );

  console.log("Sell Result:");
  console.log("  Success:", result.success);
  if (result.signature) {
    console.log("  Signature:", result.signature);
  }
  if (result.error) {
    console.log("  Error:", result.error);
  }
}

async function testGetBalance(trader) {
  console.log("\n=== Testing GET BALANCE operation ===");
  const balance = await trader.getBalance(TOKEN_MINT);
  console.log("Balance:", balance, "tokens");
}

async function main() {
  console.log("=== Solana Trading Test Suite ===");
  console.log("Token:", TOKEN_MINT);

  // Create trader
  const trader = new SolanaTrader();

  // Test operations based on command-line argument
  const args = process.argv.slice(2);
  const operation = args[0];

  switch (operation) {
    case "buy":
      await testBuy(trader);
      break;
    case "sell":
      await testSell(trader);
      break;
    case "balance":
      await testGetBalance(trader);
      break;
    case "all":
      await testGetBalance(trader);
      // Uncomment to test buy/sell:
      // await testBuy(trader);
      // await new Promise(resolve => setTimeout(resolve, 5000));
      // await testSell(trader);
      break;
    default:
      await testGetBalance(trader);
      console.log("\nUsage:");
      console.log(
        "  node src/bin/test_operations.js buy      - Test buy operation"
      );
      console.log(
        "  node src/bin/test_operations.js sell     - Test sell operation"
      );
      console.log(
        "  node src/bin/test_operations.js balance  - Test balance check"
      );
      console.log("  node src/bin/test_operations.js all      - Run all tests");
  }

  console.log("\n=== Test complete ===");
}

main().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
