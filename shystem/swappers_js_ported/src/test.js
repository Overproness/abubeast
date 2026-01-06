// Test utility for trading functions
// Equivalent to test.rs

import dotenv from "dotenv";
import { SolanaTrader } from "./spl_swap/solana_trade.js";

dotenv.config();

async function main() {
  const tokenMint = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";

  console.log("Testing Solana trader with token:", tokenMint);

  const trader = new SolanaTrader();

  // Test get balance
  try {
    const balance = await trader.getBalance(tokenMint);
    console.log("Balance:", balance);
  } catch (error) {
    console.log("Error getting balance:", error.message);
  }

  // Uncomment to test buying
  /*
  try {
    const buyResult = await trader.executeBuyPhase(
      tokenMint,
      0.005,
      5.0,
      true
    );
    console.log('Buy result:', buyResult);
  } catch (error) {
    console.log('Buy error:', error.message);
  }
  */

  // Uncomment to test selling
  /*
  try {
    const sellResult = await trader.executeSellPhase(
      tokenMint,
      100.0,
      true
    );
    console.log('Sell result:', sellResult);
  } catch (error) {
    console.log('Sell error:', error.message);
  }
  */
}

main().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
