// Core trading bot logic
// Equivalent to bot.rs

import axios from "axios";
import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import ini from "ini";
import { getTimestamp } from "./prepare.js";
import * as shyftApi from "./shyft_api.js";
import { transferAndClose } from "./spl_swap/solana_account_closure.js";
import { SolanaTrader } from "./spl_swap/solana_trade.js";

dotenv.config();

/**
 * Log error to log.csv
 */
export async function logError(token, operation, errorMessage, accountId) {
  try {
    let baseParameters = [];

    // Try to get the input.csv row for this token
    if (fs.existsSync("input.csv")) {
      const lines = fs.readFileSync("input.csv", "utf-8").split("\n");

      for (const line of lines) {
        const parameters = line.split(",").map((s) => s.trim());
        if (parameters.length >= 6) {
          const csvToken = parameters[5].trim();
          if (token.trim() === csvToken.trim()) {
            baseParameters = parameters;
            break;
          }
        }
      }
    }

    // Create minimal record if not found
    let logParameters =
      baseParameters.length > 0
        ? [...baseParameters]
        : [
            "", // [0] name/type
            "", // [1] date
            "0", // [2] profit
            "0", // [3] trade_period
            "", // [4] some field
            "", // [5] trade_status
            token, // [6] token
          ];

    // Update with error information
    const dt = new Date().toLocaleDateString("en-US");
    const time = getTimestamp();

    if (logParameters.length > 1) logParameters[1] = dt;
    if (logParameters.length > 2) logParameters[2] = "0";
    if (logParameters.length > 3) logParameters[3] = "0";

    // Insert/update trade status with error info
    const errorStatus = `ERROR-${operation}: ${errorMessage}`;
    if (logParameters.length > 5) {
      logParameters[5] = errorStatus;
    } else {
      logParameters.push(errorStatus);
    }

    // Add timestamp and account info
    logParameters.push(time);
    logParameters.push(`Account_${accountId}`);

    // Append to log.csv
    fs.appendFileSync("log.csv", logParameters.join(",") + "\n");

    console.log(
      `[${getTimestamp()}] [${token}] Error logged to log.csv: ${operation} - ${errorMessage}`
    );
  } catch (error) {
    console.error("Failed to log error:", error);
  }
}

/**
 * Change account status in config
 */
export function changeAccStatus(accountId, statusCode) {
  try {
    const iniFile = "account_config.ini";
    const config = ini.parse(fs.readFileSync(iniFile, "utf-8"));

    const section = `Account_${accountId}`;
    if (!config[section]) {
      config[section] = {};
    }

    config[section].STATUS = statusCode;

    fs.writeFileSync(iniFile, ini.stringify(config));
  } catch (error) {
    console.error("Failed to change account status:", error);
    throw error;
  }
}

/**
 * Get token data from DEX API
 */
export async function getData(token) {
  console.log(`[${getTimestamp()}] [${token}] Getting Data From DEX API...`);

  const baseUrl = `https://data.solanatracker.io/tokens/${token}`;

  const response = await axios.get(baseUrl, {
    headers: {
      "x-api-key": "d1fc458e-bdef-4309-971f-54238845c9c3",
    },
  });

  const data = response.data;

  const price = data?.pools?.[0]?.price?.usd || 0;
  const currentMarketCap = data?.pools?.[0]?.marketCap?.usd || 0;

  return { price, currentMarketCap };
}

/**
 * Write trading data to log.csv
 */
export function writeData(
  tradeToken,
  profit,
  tradePeriod,
  totalBuyTime,
  tradeStatus,
  feeSol
) {
  try {
    const lines = fs.readFileSync("input.csv", "utf-8").split("\n");

    for (const line of lines) {
      const parameters = line.split(",").map((s) => s.trim());

      if (parameters.length < 6) continue;

      const token = parameters[5];

      if (tradeToken.trim() === token.trim()) {
        const dt = new Date().toLocaleDateString("en-US");
        parameters[1] = dt;
        parameters[2] = profit.toString();
        parameters[3] = tradePeriod.toString();

        // Insert trade status at column 6
        if (parameters.length > 5) {
          parameters.splice(5, 0, tradeStatus);
        }

        parameters.push(totalBuyTime.toString());
        parameters.push(feeSol.toString());

        // Append to log.csv
        fs.appendFileSync("log.csv", parameters.join(",") + "\n");

        console.log(`[${getTimestamp()}] [${token}] Log Entry successful`);
        break;
      }
    }
  } catch (error) {
    console.error("Failed to write data:", error);
    throw error;
  }
}

/**
 * Check if main thread is running
 */
export function checkMainThread() {
  return true;
}

/**
 * Execute sell operation
 */
async function executeSell(
  token,
  sellSize,
  apiMethod,
  simulationStatus,
  accountId
) {
  if (simulationStatus.toLowerCase() === "yes") {
    return "simulated_signature";
  }

  if (apiMethod === "spl") {
    const trader = new SolanaTrader();

    const sellTx = await trader.executeSellPhase(token, sellSize, true);

    console.log(`\nSell results of token: ${token}\n`, sellTx, "\n");

    if (sellTx.success) {
      if (sellTx.signature) {
        console.log(`[+] Transaction Signature: ${sellTx.signature}`);

        console.log("\n[+] Executing Account Closure...");

        // Remove from monitor watcher
        try {
          const response = await axios.delete(
            `http://57.128.216.19/monitor/remove/${token}`
          );
          console.log("Watcher Response:\n", response.data);
        } catch {
          console.log(chalk.red("Failed to call monitor/remove watcher"));
        }

        return sellTx.signature;
      }
    } else {
      // Sell failed - try retry logic
      const initialError = sellTx.error || "Unknown error";
      console.log(
        chalk.red(
          `[${getTimestamp()}] [${token}] Failed to Sell. Trying again....`
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));

      let lastError = initialError;
      for (let i = 0; i < 2; i++) {
        const sellTx2 = await trader.executeSellPhase(token, sellSize, true);

        console.log(`\nSell results of token: ${token}\n`, sellTx2, "\n");

        if (sellTx2.success) {
          if (sellTx2.signature) {
            console.log(`[+] Transaction Signature: ${sellTx2.signature}`);

            console.log("\n[+] Executing Account Closure...");

            // Remove from monitor watcher
            try {
              const response = await axios.delete(
                `http://57.128.216.19/monitor/remove/${token}`
              );
              console.log("Watcher Response:\n", response.data);
            } catch {
              console.log(chalk.red("Failed to call monitor/remove watcher"));
            }

            return sellTx2.signature;
          }
        } else {
          lastError = sellTx2.error || "Unknown error";
          console.log(
            chalk.red(
              `[${getTimestamp()}] [${token}] Failed to Sell. Trying again. Attempt: ${
                i + 1
              }`
            )
          );
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      // All retries failed - log the error
      await logError(
        token,
        "SELL",
        `All sell retries failed: ${lastError}`,
        accountId
      );

      // Execute account closure anyway
      console.log("\n[+] Executing Account Closure...");
      try {
        await transferAndClose(token);
      } catch (error) {
        console.error("Account closure error:", error);
      }
    }
  }

  return "";
}

/**
 * Main trading logic
 */
async function runTradingLogic(
  accountId,
  username,
  token,
  tokenScore,
  sellAt,
  minLoss,
  deadlineSell,
  keepSomeMinScore,
  maxKeep,
  simulationStatus,
  apiMethod,
  buyAmount,
  maxPriceImpact
) {
  let tradeStatus = "";
  let buySignature = "";
  let sellSignature = "";
  let profitLoss = 0;
  let sellSize = 100;

  console.log(chalk.cyan(`[+] Simulation Status: ${simulationStatus}`));
  console.log(chalk.green(`[+] API Method: ${apiMethod}`));
  console.log(chalk.cyan(`[+] Token Score: ${tokenScore}`));

  const initBuyTime = Date.now();
  console.log(
    `[${getTimestamp()}] [${token}] Before Starting Buying Process...\n`
  );

  let buyStatus = false;

  if (simulationStatus.toLowerCase() === "yes") {
    buyStatus = true;
  } else if (apiMethod === "spl") {
    // Execute buy using Solana trader
    const trader = new SolanaTrader();

    const txHashBuy = await trader.executeBuyPhase(
      token,
      buyAmount,
      maxPriceImpact,
      true
    );

    console.log(`\nBuy results of token: ${token}\n`, txHashBuy, "\n");

    if (txHashBuy.success) {
      if (txHashBuy.signature) {
        buySignature = txHashBuy.signature;
        console.log(`[+] Transaction Signature: ${buySignature}`);
        buyStatus = await shyftApi.checkBuySellStatus(buySignature);
      } else {
        buyStatus = false;
      }
    } else {
      // Log buy error
      const errorMsg = txHashBuy.error || "Unknown buy error";
      await logError(token, "BUY", errorMsg, accountId);
      buyStatus = false;
    }
  }

  const totalBuyTime = (Date.now() - initBuyTime) / 1000;
  let tradePeriod;

  console.log(`[${getTimestamp()}] [${token}] Buying Status: ${buyStatus}`);

  if (buyStatus) {
    console.log(
      chalk.green.bold(
        `[✓] [${token}] BUY SUCCESSFUL - Token purchased, monitoring for sell conditions...`
      )
    );
  } else {
    console.log(chalk.red.bold(`[✗] [${token}] BUY FAILED - Skipping token`));
  }

  const buyTime = Date.now();

  if (buyStatus) {
    // Set up monitoring watcher
    const payload = {
      token_mint: token,
      triggers: {
        top_holder_sell: true,
        liquidity_removal: true,
        account_freeze: true,
      },
      top_holders_count: 10,
    };

    try {
      const response = await axios.post(
        "http://57.128.216.19/monitor/add",
        payload
      );
      console.log("Watcher Response:\n", response.data);
    } catch {
      console.log(chalk.red("Failed to call monitor/add watcher"));
    }

    const { price: buyTimePrice, currentMarketCap: buyTimeMc } = await getData(
      token
    );
    console.log(
      `[${getTimestamp()}] [${token}] Buy Time Price: ${buyTimePrice}`
    );
    console.log(
      `[${getTimestamp()}] [${token}] Buy Time Market Cap: ${buyTimeMc}`
    );

    // Adjust sell size based on score
    if (tokenScore >= keepSomeMinScore) {
      sellSize = sellSize - maxKeep;
      console.log(
        chalk.cyan(`[${getTimestamp()}] [${token}] Sell Size: ${sellSize}`)
      );
    }

    // Main trading loop
    while (checkMainThread()) {
      // Check garbage tokens
      if (fs.existsSync("garbage.txt")) {
        const garbageLines = fs
          .readFileSync("garbage.txt", "utf-8")
          .split("\n");
        for (const line of garbageLines) {
          const parts = line.split(",").map((p) => p.trim());
          if (parts.length >= 2 && parts[0] === token) {
            tradeStatus = "garbage-sell";
            console.log(
              chalk.red.bold(
                "\n[!] Garbage Token Detected - Selling immediately!"
              )
            );

            const garbageSellAmount = parseFloat(parts[1]);
            const changeAmount = (garbageSellAmount - buyAmount) / buyAmount;
            profitLoss = Math.round(changeAmount * 100 * 1000) / 1000;
            console.log(
              chalk.yellow.bold(
                `[✓] [${token}] GARBAGE SELL EXECUTED - P/L: ${profitLoss.toFixed(
                  2
                )}%`
              )
            );
            break;
          }
        }
        if (tradeStatus) break;
      }

      console.log(
        "\n-------------Sell_Condition_Checking_Loop-----------------"
      );
      console.log(`[${getTimestamp()}] [${token}] Checking Price Change...\n`);

      const { price: currentPrice } = await getData(token);

      const priceChange =
        buyTimePrice > 0
          ? Math.round(
              ((currentPrice - buyTimePrice) / buyTimePrice) * 100 * 100
            ) / 100
          : 0;

      console.log(
        `\n[${getTimestamp()}] [${token}] Current Price: ${currentPrice}`
      );
      console.log(
        `[${getTimestamp()}] [${token}] Price Change: ${priceChange}`
      );

      const elapsed = Math.floor((Date.now() - buyTime) / 1000);

      // Check sell conditions
      if (elapsed > deadlineSell) {
        console.log(
          chalk.yellow(
            `[${getTimestamp()}] [${token}] Target Deadline Price Change Reached!! >> deadline sell: ${deadlineSell}`
          )
        );
        console.log(
          `[${getTimestamp()}] [${token}] Sell Percentage: ${priceChange}`
        );

        // Execute sell
        sellSignature = await executeSell(
          token,
          sellSize,
          apiMethod,
          simulationStatus,
          accountId
        );

        if (sellSignature) {
          tradeStatus = "deadline";
          profitLoss = await shyftApi.calProfitLoss(
            buySignature,
            sellSignature,
            token
          );
          console.log(
            chalk.cyan.bold(
              `[✓] [${token}] SELL SUCCESSFUL (DEADLINE) - P/L: ${profitLoss.toFixed(
                2
              )}%`
            )
          );
        } else {
          tradeStatus = "fail-sell";
          profitLoss = -100;
          console.log(
            chalk.red.bold(
              `[✗] [${token}] SELL FAILED (DEADLINE) - Transaction failed`
            )
          );

          await logError(
            token,
            "SELL",
            "Failed to sell at deadline",
            accountId
          );

          console.log("\n[+] Executing Account Closure...");
          try {
            await transferAndClose(token);
          } catch (error) {
            console.error("Account closure error:", error);
          }
        }
        break;
      } else if (priceChange > 0 && priceChange >= sellAt) {
        console.log(
          chalk.green(
            `[${getTimestamp()}] [${token}] Target Price Change Reached!! >> sell_at: ${sellAt}`
          )
        );

        sellSignature = await executeSell(
          token,
          sellSize,
          apiMethod,
          simulationStatus,
          accountId
        );

        if (sellSignature) {
          tradeStatus = `sell at ${sellAt}`;
          profitLoss = await shyftApi.calProfitLoss(
            buySignature,
            sellSignature,
            token
          );
          console.log(
            chalk.green.bold(
              `[✓] [${token}] SELL SUCCESSFUL (TARGET PROFIT) - P/L: ${profitLoss.toFixed(
                2
              )}%`
            )
          );
        } else {
          tradeStatus = "fail-sell";
          profitLoss = -100;
          console.log(
            chalk.red.bold(
              `[✗] [${token}] SELL FAILED (TARGET PROFIT) - Transaction failed`
            )
          );

          await logError(
            token,
            "SELL",
            `Failed to sell at target ${sellAt}`,
            accountId
          );

          console.log("\n[+] Executing Account Closure...");
          try {
            await transferAndClose(token);
          } catch (error) {
            console.error("Account closure error:", error);
          }
        }
        break;
      } else if (
        priceChange < 0 &&
        Math.abs(priceChange) >= Math.abs(minLoss)
      ) {
        console.log(
          chalk.red(
            `[${getTimestamp()}] [${token}] Target Price Change Reached!! >> min_loss: ${minLoss}`
          )
        );

        sellSignature = await executeSell(
          token,
          sellSize,
          apiMethod,
          simulationStatus,
          accountId
        );

        if (sellSignature) {
          tradeStatus = `min loss ${minLoss}`;
          profitLoss = await shyftApi.calProfitLoss(
            buySignature,
            sellSignature,
            token
          );
          console.log(
            chalk.red.bold(
              `[✓] [${token}] SELL SUCCESSFUL (STOP-LOSS) - P/L: ${profitLoss.toFixed(
                2
              )}%`
            )
          );
        } else {
          tradeStatus = "fail-sell";
          profitLoss = -100;
          console.log(
            chalk.red.bold(
              `[✗] [${token}] SELL FAILED (STOP-LOSS) - Transaction failed`
            )
          );

          await logError(
            token,
            "SELL",
            `Failed to sell at min loss ${minLoss}`,
            accountId
          );

          console.log("\n[+] Executing Account Closure...");
          try {
            await transferAndClose(token);
          } catch (error) {
            console.error("Account closure error:", error);
          }
        }
        break;
      } else {
        console.log(`[${token}] Target Price Change NOT Reached Yet!!`);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } else {
    console.log(chalk.red(`[${getTimestamp()}] Failed to Buy....`));
    tradeStatus = "fail-buy";
    profitLoss = 0;
  }

  tradePeriod = Math.floor((Date.now() - buyTime) / 1000);

  console.log("\n" + "=".repeat(80));
  console.log(`[=] Trade Status: ${tradeStatus}`);
  console.log(`[=] Profit/Loss: ${profitLoss}%`);
  console.log("=".repeat(80));

  // Calculate fees
  const baseFee = 0.000105 + 0.0001;
  let feeSol;
  if (tradeStatus === "fail-sell") {
    feeSol = Math.round(baseFee * 2 * 1000000000) / 1000000000;
  } else if (tradeStatus === "fail-buy") {
    feeSol = 0;
  } else {
    feeSol = Math.round(baseFee * 1000000000) / 1000000000;
  }

  // Only write to log.csv if it's NOT a fail-buy
  if (tradeStatus !== "fail-buy") {
    writeData(
      token,
      profitLoss,
      tradePeriod,
      totalBuyTime,
      tradeStatus,
      feeSol
    );
  } else {
    console.log(
      chalk.yellow(
        `[!] [${token}] Skipping log entry - Buy failed, no trade occurred`
      )
    );
  }
}

/**
 * Run bot with given configuration
 */
export async function runBot(accConf, tokenConf, token, tokenScore) {
  const accountId = parseInt(accConf.ACCOUNT_ID || "0");
  const username = accConf.USERNAME || "";

  const sellAt = parseFloat(tokenConf.sell_at || "10");
  const minLoss = parseFloat(tokenConf.min_loss || "-5");
  const deadlineSell = parseFloat(tokenConf.deadline || "300");
  const keepSomeMinScore = parseInt(tokenConf.keep_some_min_score || "8");
  const maxKeep = parseFloat(tokenConf.max_keep || "10");
  const simulationStatus = tokenConf.Simulate || "no";
  const apiMethod = tokenConf.api_method || "spl";
  const buyAmount = parseFloat(tokenConf.buy_amount || "0.01");
  const maxPriceImpact = parseFloat(tokenConf.max_price_impact || "5");

  // Adjust parameters based on token score
  const tokenScoreF = parseFloat(tokenScore);
  const adjustedSellAt = (sellAt * tokenScoreF) / 10;
  const adjustedMaxKeep = (maxKeep * tokenScoreF) / 10;

  console.log("\n\t Starting the Main Program...\n");

  changeAccStatus(accountId, "1");

  try {
    await runTradingLogic(
      accountId,
      username,
      token,
      tokenScoreF,
      adjustedSellAt,
      minLoss,
      deadlineSell,
      keepSomeMinScore,
      adjustedMaxKeep,
      simulationStatus,
      apiMethod,
      buyAmount,
      maxPriceImpact
    );
  } catch (error) {
    console.error("Trading logic error:", error);
    throw error;
  } finally {
    changeAccStatus(accountId, "0");
  }
}
