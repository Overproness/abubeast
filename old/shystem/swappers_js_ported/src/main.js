// Main entry point for the trading bot
// Equivalent to main.rs

import chalk from "chalk";
import { spawn } from "child_process";
import fs from "fs";
import ini from "ini";
import { getData, getTimestamp } from "./prepare.js";

/**
 * Process tokens and spawn workers for trading
 */
async function processTokens() {
  while (true) {
    const processedTokenPath = "done.txt";

    // Ensure processed tokens file exists
    if (!fs.existsSync(processedTokenPath)) {
      fs.writeFileSync(processedTokenPath, "");
    }

    // Read processed tokens
    const processedContent = fs.readFileSync(processedTokenPath, "utf-8");
    const activeTokens = new Set(
      processedContent.split("\n").filter((line) => line.trim())
    );

    // Read account config
    const accountConfig = ini.parse(
      fs.readFileSync("account_config.ini", "utf-8")
    );
    const accounts = Object.keys(accountConfig).filter(
      (key) => key.trim() !== ""
    );

    // Read token config
    const tokenConfig = ini.parse(fs.readFileSync("config.ini", "utf-8"));
    const tokenConfSection = Object.keys(tokenConfig)[0] || "Default";

    const autoTradeStatus =
      tokenConfig[tokenConfSection]?.auto_trading || "false";
    const apiMethod = tokenConfig[tokenConfSection]?.api_method || "spl";

    let breakFlag = false;

    if (autoTradeStatus.toLowerCase() === "true") {
      for (const acc of accounts) {
        const accStatus = accountConfig[acc]?.STATUS || "0";

        if (apiMethod === "spl" || (apiMethod === "tg" && accStatus === "0")) {
          if (apiMethod === "tg" && accStatus === "0") {
            const username = accountConfig[acc]?.username || "unknown";
            console.log(`[+] Idle account: ${username}`);
          }

          // Read input.csv
          if (fs.existsSync("input.csv")) {
            const lines = fs.readFileSync("input.csv", "utf-8").split("\n");

            for (let lineNum = 0; lineNum < lines.length; lineNum++) {
              // Skip header line (first line)
              if (lineNum === 0) continue;

              const line = lines[lineNum].trim();
              if (!line) continue;

              const parameters = line.split(",").map((s) => s.trim());

              if (parameters.length < 26) {
                console.error(
                  `[Warning] Skipping line ${
                    lineNum + 1
                  } - insufficient columns (has ${parameters.length}, needs 26)`
                );
                continue;
              }

              const token = parameters[5];

              if (!activeTokens.has(token)) {
                console.log(
                  `[${getTimestamp()}] [${token}] Token Processing Started...\n`
                );

                const tokenAge = parameters[20];
                const processAge = parameters[25];
                const tokenScore = parameters[4];

                const maxTokenAge = parseFloat(
                  tokenConfig[tokenConfSection]?.max_token_age || "3600"
                );
                const processingMaxAge = parseFloat(
                  tokenConfig[tokenConfSection]?.processing_max_age || "3600"
                );
                const maxMarketcap = parseFloat(
                  tokenConfig[tokenConfSection]?.max_marketcap || "1000000"
                );

                const now = Math.floor(Date.now() / 1000);
                const tokenAgeVal = parseInt(tokenAge || "0");
                const processAgeVal = parseInt(processAge || "0");

                const tokenAgeDiff = now - tokenAgeVal;
                const processAgeDiff = now - processAgeVal;

                try {
                  const { price, currentMarketCap } = await getData(token);

                  console.log(
                    `[${getTimestamp()}] [${token}] After Get the MC Data...\n`
                  );
                  console.log(
                    chalk.yellow(
                      `[+] Token [${token}] Current - Price: ${price} | Market Cap: ${currentMarketCap}`
                    )
                  );

                  if (
                    tokenAgeDiff <= maxTokenAge &&
                    processAgeDiff <= processingMaxAge
                  ) {
                    if (currentMarketCap <= maxMarketcap) {
                      // Mark as processed
                      activeTokens.add(token);

                      // Append to done.txt
                      fs.appendFileSync(processedTokenPath, `${token}\n`);

                      // Spawn worker process
                      const workerProcess = spawn(
                        "node",
                        [
                          "src/worker.js",
                          acc,
                          tokenConfSection,
                          token,
                          tokenScore,
                        ],
                        {
                          stdio: "inherit",
                          detached: false,
                        }
                      );

                      breakFlag = true;
                      if (apiMethod === "tg") {
                        await new Promise((resolve) =>
                          setTimeout(resolve, 3000)
                        );
                      }
                      break;
                    } else {
                      console.log(
                        chalk.red(
                          `[+] Token [${token}] Current Market Cap Greater Than MAX Market.`
                        )
                      );
                    }
                  } else {
                    console.log(
                      chalk.red(
                        `[+] Token [${token}] has exceeded the allowed time difference.`
                      )
                    );
                  }
                } catch (error) {
                  console.error(
                    `[${getTimestamp()}] [${token}] Error getting market data: ${
                      error.message
                    } - Skipping token\n`
                  );
                  continue;
                }
              }
            }
          } else {
            console.log("Input file NOT found!!");
          }
        }

        if (breakFlag) {
          break;
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Start the main process
processTokens().catch((error) => {
  console.error("Main process error:", error);
  process.exit(1);
});
