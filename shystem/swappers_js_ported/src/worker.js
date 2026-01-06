// Worker process for individual token trades
// Equivalent to worker.rs

import fs from "fs";
import ini from "ini";
import { runBot } from "./bot.js";

async function runMain() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.error(
      "Usage: worker.js <account_name> <token_name> <token> <token_score>"
    );
    process.exit(1);
  }

  const [accountName, tokenName, token, tokenScore] = args;

  // Load account config
  const accountConfigData = fs.readFileSync("account_config.ini", "utf-8");
  const accountConfig = ini.parse(accountConfigData);
  const account = accountConfig[accountName];

  if (!account) {
    throw new Error(`Account ${accountName} not found`);
  }

  // Load token config
  const tokenConfigData = fs.readFileSync("config.ini", "utf-8");
  const tokenConfig = ini.parse(tokenConfigData);
  const tokenConf = tokenConfig[tokenName];

  if (!tokenConf) {
    throw new Error(`Token config ${tokenName} not found`);
  }

  // Call bot trading logic
  await runBot(account, tokenConf, token, tokenScore);
}

// Run worker
runMain().catch((error) => {
  console.error("Worker error:", error);
  process.exit(1);
});
