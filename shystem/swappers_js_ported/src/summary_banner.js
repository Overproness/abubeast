// Real-time summary banner for trading statistics
// Equivalent to summary_banner.rs

import chalk from "chalk";
import fs from "fs";

class Metrics {
  constructor() {
    this.tokensProcessed = 0;
    this.uniqueTokens = 0;
    this.avgPl = 0;
    this.sumPl = 0;
    this.lostTradesPct = 0;
    this.sellFailurePct = 0;
    this.buyFailurePct = 0;
    this.avgTradePeriod = 0;
    this.avgBuyTime = 0;
    this.statusCounts = {};
    this.totalFeesSol = 0;
  }
}

function safeFloat(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function computeMetrics(rows) {
  if (rows.length === 0) {
    return new Metrics();
  }

  const totalRows = rows.length;
  const profits = [];
  const tradePeriods = [];
  const buyTimes = [];
  const statusCounter = {};
  const uniqueTokensSet = new Set();
  let sellAttemptRows = 0;
  let sellFailRows = 0;
  let buyFailRows = 0;
  let lostRows = 0;
  let totalFeesSol = 0;

  for (const row of rows) {
    if (row.length < 7) continue;

    const profit = safeFloat(row[2]);
    profits.push(profit);
    tradePeriods.push(safeFloat(row[3]));

    // Parse fee from last column if present
    const feeCandidate = safeFloat(row[row.length - 1]);
    const secondLast = row.length >= 2 ? safeFloat(row[row.length - 2]) : 0;

    if (feeCandidate <= 0.01 && secondLast > 0.01) {
      totalFeesSol += feeCandidate;
      buyTimes.push(secondLast);
    } else {
      buyTimes.push(feeCandidate);
    }

    const status = row[5] ? row[5].trim().toLowerCase() : "";
    if (status) {
      statusCounter[status] = (statusCounter[status] || 0) + 1;
    }

    const tokenMint = row[6] ? row[6].trim() : "";
    if (tokenMint) {
      uniqueTokensSet.add(tokenMint);
    }

    if (status !== "fail-buy") {
      sellAttemptRows++;
    }
    if (status === "fail-sell") {
      sellFailRows++;
    }
    if (status === "fail-buy") {
      buyFailRows++;
    }
    if (profit < 0) {
      lostRows++;
    }
  }

  const avgPl =
    profits.length > 0
      ? profits.reduce((a, b) => a + b, 0) / profits.length
      : 0;
  const sumPl = profits.reduce((a, b) => a + b, 0);
  const lostTradesPct = totalRows > 0 ? (lostRows / totalRows) * 100 : 0;
  const sellFailurePct =
    sellAttemptRows > 0 ? (sellFailRows / sellAttemptRows) * 100 : 0;
  const buyFailurePct = totalRows > 0 ? (buyFailRows / totalRows) * 100 : 0;
  const avgTradePeriod =
    tradePeriods.length > 0
      ? tradePeriods.reduce((a, b) => a + b, 0) / tradePeriods.length
      : 0;
  const avgBuyTime =
    buyTimes.length > 0
      ? buyTimes.reduce((a, b) => a + b, 0) / buyTimes.length
      : 0;

  const metrics = new Metrics();
  metrics.tokensProcessed = totalRows;
  metrics.uniqueTokens = uniqueTokensSet.size;
  metrics.avgPl = Math.round(avgPl * 1000) / 1000;
  metrics.sumPl = Math.round(sumPl * 1000) / 1000;
  metrics.lostTradesPct = Math.round(lostTradesPct * 100) / 100;
  metrics.sellFailurePct = Math.round(sellFailurePct * 100) / 100;
  metrics.buyFailurePct = Math.round(buyFailurePct * 100) / 100;
  metrics.avgTradePeriod = Math.round(avgTradePeriod * 100) / 100;
  metrics.avgBuyTime = Math.round(avgBuyTime * 100) / 100;
  metrics.statusCounts = statusCounter;
  metrics.totalFeesSol = Math.round(totalFeesSol * 1000000) / 1000000;

  return metrics;
}

function readLogCsv(logPath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    if (!fs.existsSync(logPath)) {
      resolve([]);
      return;
    }

    fs.createReadStream(logPath)
      .on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            rows.push(line.split(",").map((s) => s.trim()));
          }
        }
      })
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function colorPct(value) {
  if (value > 0) {
    return chalk.green(`${value.toFixed(2)}%`);
  } else if (value < 0) {
    return chalk.red(`${value.toFixed(2)}%`);
  } else {
    return chalk.yellow(`${value.toFixed(2)}%`);
  }
}

function formatBanner(metrics) {
  const parts = [];

  parts.push(
    `Tokens ${chalk.cyan(metrics.tokensProcessed)} (uniq ${
      metrics.uniqueTokens
    })`
  );
  parts.push(`Avg P/L ${colorPct(metrics.avgPl)}`);
  parts.push(`Sum P/L ${colorPct(metrics.sumPl)}`);
  parts.push(`Lost ${chalk.magenta(metrics.lostTradesPct.toFixed(2) + "%")}`);
  parts.push(
    `Sell-Fail ${chalk.magenta(metrics.sellFailurePct.toFixed(2) + "%")}`
  );
  parts.push(
    `Buy-Fail ${chalk.magenta(metrics.buyFailurePct.toFixed(2) + "%")}`
  );

  if (Object.keys(metrics.statusCounts).length > 0) {
    const statusVec = Object.entries(metrics.statusCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    parts.push(`Status [${statusVec}]`);
  }

  parts.push(`Fees ${chalk.yellow(metrics.totalFeesSol)} SOL`);

  return parts.join(" | ");
}

export async function startSummaryBanner(logPath = "log.csv", refreshSec = 5) {
  while (true) {
    try {
      const rows = await readLogCsv(logPath);
      const metrics = computeMetrics(rows);
      const banner = formatBanner(metrics);

      process.stdout.write(`\r${banner.padEnd(120)}`);
    } catch (error) {
      console.error("Error in summary banner:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, refreshSec * 1000));
  }
}
