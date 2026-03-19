// --- External Libraries ---
const axios = require("axios");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { sendTokenToBackend } = require("./webhook_adapter");

// --- Constants ---
const MOBULA_API = "05af5fe9-c6a2-4677-8491-fa1bea364fc1";
const MORALIS_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjBhOGYyNjUwLWEzODYtNGQzNC05MDIyLTJjOGQ3N2ZkODg0YSIsIm9yZ0lkIjoiNDU1OTY4IiwidXNlcklkIjoiNDY5MTMyIiwidHlwZUlkIjoiN2FmNmY3MTItMmJkNi00YTUxLThkNzctMjA2ZDk0ZTU5ZDdmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTA5NjY1ODcsImV4cCI6NDkwNjcyNjU4N30.razmcbOMMFJ87I-QipQuc-cMGP76D4ZcwqB-aZplYuY";
const SOLANATRACKER_API_KEY = "d1fc458e-bdef-4309-971f-54238845c9c3";

// --- Configuration Options ---
const FILTER_SPAM_TOKENS = false;

// Currently processing tokens (to avoid duplicates)
const currentlyProcessing = new Set();

// Performance tracking
class PerformanceTimer {
  constructor() {
    this.timings = {};
  }

  startTiming(methodName, tokenIdentifier) {
    const key = `${methodName}_${tokenIdentifier}`;
    const startTime = Date.now();
    console.log(`[TIMING] Starting ${methodName} for ${tokenIdentifier}`);
    return { key, startTime };
  }

  endTiming(methodName, timingData, success = true, fieldCount = 0) {
    const duration = (Date.now() - timingData.startTime) / 1000;

    if (!this.timings[methodName]) {
      this.timings[methodName] = {
        calls: 0,
        successes: 0,
        failures: 0,
        totalTime: 0,
        avgFieldCount: 0,
      };
    }

    this.timings[methodName].calls++;
    this.timings[methodName].totalTime += duration;

    if (success) {
      this.timings[methodName].successes++;
      this.timings[methodName].avgFieldCount =
        (this.timings[methodName].avgFieldCount *
          (this.timings[methodName].successes - 1) +
          fieldCount) /
        this.timings[methodName].successes;
    } else {
      this.timings[methodName].failures++;
    }

    console.log(
      `[TIMING] ${methodName} completed in ${duration.toFixed(
        3
      )}s (success: ${success})`
    );
    return duration;
  }

  printComparison() {
    console.log("\n=== API Performance Comparison ===");
    for (const [method, stats] of Object.entries(this.timings)) {
      const avgTime =
        stats.calls > 0 ? (stats.totalTime / stats.calls).toFixed(3) : 0;
      const successRate =
        stats.calls > 0
          ? ((stats.successes / stats.calls) * 100).toFixed(1)
          : 0;
      console.log(`${method}:`);
      console.log(
        `  Calls: ${stats.calls}, Success: ${stats.successes}, Failed: ${stats.failures}`
      );
      console.log(`  Avg Time: ${avgTime}s, Success Rate: ${successRate}%`);
      console.log(`  Avg Fields: ${stats.avgFieldCount.toFixed(1)}`);
    }
    console.log("================================\n");
  }
}

const performanceTimer = new PerformanceTimer();

// --- Utility Functions ---
function emojiSafeText(text) {
  if (typeof text !== "string") return text;

  const emojiMappings = {
    "✅": "[CHECK]",
    "❌": "[X]",
    "❓": "[?]",
  };

  for (const [emoji, replacement] of Object.entries(emojiMappings)) {
    text = text.replace(new RegExp(emoji, "g"), replacement);
  }
  return text;
}

async function extractAllExistingAddresses() {
  const existingAddresses = [];

  try {
    if (fsSync.existsSync("existing_urls.txt")) {
      const content = await fs.readFile("existing_urls.txt", "utf-8");
      const lines = content.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) continue;

        const parts = trimmedLine.split("|");
        if (parts.length >= 2) {
          const poolAddress = parts[0].trim();
          const mintAddress = parts[1].trim();
          existingAddresses.push([poolAddress, mintAddress]);
        }
      }

      console.log(`Loaded ${existingAddresses.length} existing addresses`);
    } else {
      console.log("No existing_urls.txt file found. Starting fresh.");
      await fs.writeFile(
        "existing_urls.txt",
        "# Pool Address | Mint Address | Token Name | Timestamp\n"
      );
    }
  } catch (error) {
    console.error(`Error reading existing addresses: ${error.message}`);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (fsSync.existsSync("existing_urls.txt")) {
        await fs.copyFile(
          "existing_urls.txt",
          `existing_urls_backup_${timestamp}.txt`
        );
      }
      await fs.writeFile(
        "existing_urls.txt",
        "# Pool Address | Mint Address | Token Name | Timestamp\n"
      );
    } catch (backupError) {
      console.error(`Failed to create backup: ${backupError.message}`);
    }
  }

  return existingAddresses;
}

async function writeAddress(poolAddress, mintAddress, name) {
  try {
    const timestamp = new Date().toISOString();
    const line = `${poolAddress} | ${mintAddress} | ${name} | ${timestamp}\n`;
    await fs.appendFile("existing_urls.txt", line);
    console.log(`Successfully wrote address to file: ${poolAddress}`);
  } catch (error) {
    console.error(`Error writing address to file: ${error.message}`);
  }
}

async function writeFailedToken(poolAddress, mintAddress, errorReason) {
  try {
    const timestamp = new Date().toISOString();
    const line = `${timestamp} | ${poolAddress} | ${mintAddress} | ${errorReason}\n`;

    if (!fsSync.existsSync("couldNotGet.txt")) {
      await fs.writeFile(
        "couldNotGet.txt",
        "# Timestamp | Pool Address | Mint Address | Error Reason\n"
      );
    }

    await fs.appendFile("couldNotGet.txt", line);
    console.log(`Logged failed token: ${poolAddress} - ${errorReason}`);
  } catch (error) {
    console.error(`Error writing failed token: ${error.message}`);
  }
}

// --- API Functions ---
async function walletInfo(ownerAddress) {
  const url = `https://data.solanatracker.io/wallet/${ownerAddress}/basic`;
  const headers = { "x-api-key": SOLANATRACKER_API_KEY };

  console.log(`Fetching wallet info for address: ${ownerAddress}`);

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status === 200) {
      const data = response.data;
      console.log(`Successfully fetched wallet info for ${ownerAddress}`);
      return data;
    } else {
      console.error(`Failed to fetch wallet data. Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(`Timeout fetching wallet data for ${ownerAddress}`);
    } else {
      console.error(`Error fetching wallet data: ${error.message}`);
    }
    return null;
  }
}

async function getMobulaDataFast(mintAddress) {
  try {
    const url = "https://api.mobula.io/api/1/metadata";
    const params = { asset: mintAddress, blockchain: "solana" };
    const response = await axios.get(url, { params, timeout: 8000 });
    return response.status === 200 ? response.data.data || {} : {};
  } catch {
    return {};
  }
}

async function getGoPlusDataFast(mintAddress) {
  try {
    const url = "https://api.gopluslabs.io/api/v1/solana/token_security";
    const params = { contract_addresses: mintAddress };
    const response = await axios.get(url, { params, timeout: 8000 });
    if (response.status === 200 && response.data.result) {
      return response.data.result[mintAddress] || {};
    }
    return {};
  } catch {
    return {};
  }
}

async function getMoralisDataFast(mintAddress) {
  try {
    const url = `https://solana-gateway.moralis.io/token/mainnet/${mintAddress}/metadata`;
    const headers = {
      Accept: "application/json",
      "X-API-Key": MORALIS_API_KEY,
    };
    const response = await axios.get(url, { headers, timeout: 8000 });
    return response.status === 200 ? response.data : {};
  } catch {
    return {};
  }
}

async function extractInfoFromEnhancedAPIs(mintAddress, poolAddress) {
  console.log(`Using enhanced APIs for ${mintAddress}`);

  const startTime = performanceTimer.startTiming("Fallback_APIs", mintAddress);

  try {
    // Make all API calls in parallel
    const [mobulaData, goplusData, moralisData] = await Promise.all([
      getMobulaDataFast(mintAddress),
      getGoPlusDataFast(mintAddress),
      getMoralisDataFast(mintAddress),
    ]);

    const output = {
      token_name: "",
      token_symbol: "",
      token_price: "",
      token_liquidity: "",
      token_total_supply: "",
      token_exchange: "",
      token_market_cap: "0",
      token_address: mintAddress,
      dev: "",
      lpBurn: "",
      website: "",
      twitter: "",
      telegram: "",
      mint_authority_status: false,
      freeze_authority_status: false,
      risk_status: "Unknown",
      is_spam: false,
      data_source: "enhanced_apis",
    };

    // Fill from Mobula (best for market data)
    if (mobulaData && Object.keys(mobulaData).length > 0) {
      output.token_name = mobulaData.name || output.token_name;
      output.token_symbol = mobulaData.symbol || output.token_symbol;
      output.token_price = mobulaData.price?.toString() || output.token_price;
      output.token_liquidity =
        mobulaData.liquidity?.toString() || output.token_liquidity;
      output.token_market_cap =
        mobulaData.market_cap?.toString() || output.token_market_cap;
      output.website = mobulaData.website || output.website;
      output.twitter = mobulaData.twitter || output.twitter;
      output.telegram = mobulaData.telegram || output.telegram;
    }

    // Fill from GoPlus (best for security data)
    if (goplusData && Object.keys(goplusData).length > 0) {
      output.mint_authority_status =
        goplusData.mint_authority === "1" || goplusData.mint_authority === true;
      output.freeze_authority_status =
        goplusData.freeze_authority === "1" ||
        goplusData.freeze_authority === true;
      output.lpBurn = goplusData.lp_burned_percent || output.lpBurn;
      output.token_total_supply =
        goplusData.total_supply || output.token_total_supply;
      output.dev = goplusData.owner_address || output.dev;
    }

    // Fill from Moralis (fallback for basic data)
    if (moralisData && Object.keys(moralisData).length > 0) {
      output.token_name = output.token_name || moralisData.name || "";
      output.token_symbol = output.token_symbol || moralisData.symbol || "";
      output.token_total_supply =
        output.token_total_supply || moralisData.supply || "";
    }

    // Count filled fields
    let fieldCount = 0;
    for (const [key, value] of Object.entries(output)) {
      if (
        value &&
        value !== "" &&
        value !== "0" &&
        value !== false &&
        key !== "data_source"
      ) {
        fieldCount++;
      }
    }

    // Only return if we have basic token info
    if (output.token_name || output.token_symbol) {
      performanceTimer.endTiming("Fallback_APIs", startTime, true, fieldCount);
      console.log(
        `Enhanced APIs provided ${fieldCount} fields for ${mintAddress}`
      );
      return output;
    }

    performanceTimer.endTiming("Fallback_APIs", startTime, false, 0);
    console.warn(
      `Enhanced APIs failed to provide adequate data for ${mintAddress}`
    );
    return null;
  } catch (error) {
    performanceTimer.endTiming("Fallback_APIs", startTime, false, 0);
    console.error(`Error in enhanced API integration: ${error.message}`);
    return null;
  }
}

async function trySolanaTracker(mintAddress, poolAddress, attempt) {
  const startTime = performanceTimer.startTiming("SolanaTracker", mintAddress);

  const url = `https://data.solanatracker.io/tokens/${mintAddress}`;
  const headers = { "x-api-key": SOLANATRACKER_API_KEY };

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status === 200 || response.status === 500) {
      const data = response.data;

      if (!data || Object.keys(data).length === 0) {
        performanceTimer.endTiming("SolanaTracker", startTime, false, 0);
        console.warn(`Empty response from SolanaTracker for ${mintAddress}`);
        return null;
      }

      const poolsData = data.pools || [];
      const pool =
        poolsData.find((p) => p.address === poolAddress) || poolsData[0];

      if (!pool) {
        performanceTimer.endTiming("SolanaTracker", startTime, false, 0);
        console.warn(`No pool data found for ${mintAddress}`);
        return null;
      }

      const output = {
        token_name: data.token?.name || "",
        token_symbol: data.token?.symbol || "",
        token_price: pool.price?.toString() || "",
        token_liquidity: pool.liquidity?.usd?.toString() || "",
        token_total_supply: data.token?.supply?.toString() || "",
        token_exchange: pool.exchangeName || "Unknown",
        token_market_cap: pool.marketCap?.usd?.toString() || "0",
        token_address: mintAddress,
        dev: data.token?.creator || "",
        lpBurn: pool.lpBurn?.toString() || "",
        website: data.token?.websites?.[0] || "",
        twitter: data.token?.twitter || "",
        telegram: data.token?.telegram || "",
        mint_authority_status: data.token?.mintAuthority !== null,
        freeze_authority_status: data.token?.freezeAuthority !== null,
        risk_status: data.risk || "Unknown",
        is_spam: false,
        data_source: "solanatracker",
      };

      // Count filled fields
      let fieldCount = 0;
      for (const [key, value] of Object.entries(output)) {
        if (
          value &&
          value !== "" &&
          value !== "0" &&
          value !== false &&
          key !== "data_source"
        ) {
          fieldCount++;
        }
      }

      performanceTimer.endTiming("SolanaTracker", startTime, true, fieldCount);
      console.log(
        `SolanaTracker provided ${fieldCount} fields for ${mintAddress}`
      );
      return output;
    } else {
      performanceTimer.endTiming("SolanaTracker", startTime, false, 0);
      console.error(`SolanaTracker API returned status ${response.status}`);
      return null;
    }
  } catch (error) {
    performanceTimer.endTiming("SolanaTracker", startTime, false, 0);

    if (error.code === "ECONNABORTED") {
      console.warn(
        `Timeout on attempt ${attempt} for SolanaTracker: ${mintAddress}`
      );
    } else {
      console.error(`Request error on attempt ${attempt}: ${error.message}`);
    }
    return null;
  }
}

async function extractInfoFromSolTracker(mintAddress, poolAddress) {
  console.log(`Starting parallel token info extraction for ${mintAddress}`);

  // Race between SolanaTracker and fallback APIs
  const solanaTrackerPromise = trySolanaTracker(mintAddress, poolAddress, 1);
  const fallbackPromise = extractInfoFromEnhancedAPIs(mintAddress, poolAddress);

  try {
    // Return whichever completes first successfully
    const result = await Promise.race([
      solanaTrackerPromise.then((data) => ({ source: "solanatracker", data })),
      fallbackPromise.then((data) => ({ source: "fallback", data })),
    ]);

    if (result.data) {
      console.log(`Data retrieved from ${result.source} for ${mintAddress}`);
      return result.data;
    }

    // If the first one failed, wait for the other
    const [solData, fallData] = await Promise.all([
      solanaTrackerPromise,
      fallbackPromise,
    ]);

    if (solData) {
      console.log(`SolanaTracker succeeded (slower) for ${mintAddress}`);
      return solData;
    }

    if (fallData) {
      console.log(`Fallback APIs succeeded (slower) for ${mintAddress}`);
      return fallData;
    }

    console.error(
      `Both SolanaTracker and fallback APIs failed for ${mintAddress}`
    );
    await writeFailedToken(
      poolAddress,
      mintAddress,
      "Both parallel methods failed"
    );
    return null;
  } catch (error) {
    console.error(`Error in parallel extraction: ${error.message}`);
    await writeFailedToken(
      poolAddress,
      mintAddress,
      `Parallel extraction error: ${error.message}`
    );
    return null;
  }
}

async function extractInfoFromSolTrackerHolders(mintAddress) {
  console.log(`Fetching holder info for mint address: ${mintAddress}`);

  const url = `https://data.solanatracker.io/tokens/${mintAddress}/holders`;
  const headers = { "x-api-key": SOLANATRACKER_API_KEY };

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status === 200) {
      const data = response.data;

      if (data && data.holders) {
        console.log(
          `Successfully fetched ${data.holders.length} holders for ${mintAddress}`
        );
        return data;
      } else {
        console.warn(`No holder data found for ${mintAddress}`);
        return null;
      }
    } else {
      console.error(`Failed to fetch holder data. Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.warn(`Timeout fetching holder data for ${mintAddress}`);
    } else {
      console.error(`Error fetching holder data: ${error.message}`);
    }
    return null;
  }
}

async function makeOutput(soltrackerOutput, holdersOutput) {
  try {
    const tokenName = soltrackerOutput.token_name || "Unknown";
    const tokenSymbol = soltrackerOutput.token_symbol || "Unknown";
    const tokenPrice = soltrackerOutput.token_price || "0";
    const tokenLiquidity = soltrackerOutput.token_liquidity || "0";
    const tokenSupply = soltrackerOutput.token_total_supply || "0";
    const tokenExchange = soltrackerOutput.token_exchange || "Unknown";
    const tokenMarketCap = soltrackerOutput.token_market_cap || "0";
    const tokenAddress = soltrackerOutput.token_address || "";
    const dev = soltrackerOutput.dev || "Unknown";
    const lpBurn = soltrackerOutput.lpBurn || "0";
    const website = soltrackerOutput.website || "";
    const twitter = soltrackerOutput.twitter || "";
    const telegram = soltrackerOutput.telegram || "";
    const mintAuthority = soltrackerOutput.mint_authority_status
      ? "True"
      : "False";
    const freezeAuthority = soltrackerOutput.freeze_authority_status
      ? "True"
      : "False";
    const riskStatus = soltrackerOutput.risk_status || "Unknown";
    const dataSource = soltrackerOutput.data_source || "unknown";

    // Format holders data
    let top5Holders = "No holder data";
    let devPercentage = "0";

    if (holdersOutput && holdersOutput.holders) {
      const holders = holdersOutput.holders;

      if (holders.length > 0) {
        const top5 = holders.slice(0, 5);
        top5Holders = top5
          .map(
            (h, i) =>
              `${i + 1}. ${h.owner || "Unknown"} (${h.percentage || 0}%)`
          )
          .join("; ");

        // Find dev percentage
        if (dev && dev !== "Unknown") {
          const devHolder = holders.find((h) => h.owner === dev);
          if (devHolder) {
            devPercentage = devHolder.percentage?.toString() || "0";
          }
        }
      }
    }

    // Create message
    const message = `
🎯 New Token Detected!

📊 Token Information:
━━━━━━━━━━━━━━━
Name: ${tokenName}
Symbol: ${tokenSymbol}
Address: ${tokenAddress}
Exchange: ${tokenExchange}
Data Source: ${dataSource}

💰 Market Data:
━━━━━━━━━━━━━━━
Price: $${tokenPrice}
Market Cap: $${tokenMarketCap}
Liquidity: $${tokenLiquidity}
Total Supply: ${tokenSupply}

🔒 Security:
━━━━━━━━━━━━━━━
LP Burn: ${lpBurn}%
Mint Authority: ${mintAuthority}
Freeze Authority: ${freezeAuthority}
Risk Status: ${riskStatus}

👨‍💻 Developer:
━━━━━━━━━━━━━━━
Address: ${dev}
Dev Holding: ${devPercentage}%

👥 Top 5 Holders:
━━━━━━━━━━━━━━━
${top5Holders}

🔗 Links:
━━━━━━━━━━━━━━━
${website ? `Website: ${website}` : ""}
${twitter ? `Twitter: ${twitter}` : ""}
${telegram ? `Telegram: ${telegram}` : ""}
`.trim();

    // Write to CSV
    const csvLine = `${tokenName},${tokenSymbol},${tokenPrice},${tokenLiquidity},${tokenSupply},${tokenExchange},${tokenMarketCap},${tokenAddress},${dev},${lpBurn},${mintAuthority},${freezeAuthority},${riskStatus},${devPercentage},${dataSource}\n`;

    if (!fsSync.existsSync("token_data.csv")) {
      const header =
        "Token Name,Token Symbol,Price,Liquidity,Total Supply,Exchange,Market Cap,Address,Developer,LP Burn,Mint Authority,Freeze Authority,Risk Status,Dev Holding %,Data Source\n";
      await fs.writeFile("token_data.csv", header);
    }

    await fs.appendFile("token_data.csv", csvLine);
    console.log(`Token data written to CSV: ${tokenName}`);

    return message;
  } catch (error) {
    console.error(`Error in makeOutput: ${error.message}`);
    return null;
  }
}

// --- Main Scraping Logic ---
async function scrape(poolAddress, mintAddress) {
  const startTime = Date.now();
  console.log(`Starting scrape for Pool=${poolAddress}, Mint=${mintAddress}`);

  try {
    // Check if already processing
    const tokenKey = `${poolAddress}|${mintAddress}`;

    if (currentlyProcessing.has(tokenKey)) {
      console.log(`Already processing ${tokenKey}, skipping...`);
      return;
    }

    currentlyProcessing.add(tokenKey);

    try {
      // Extract token info using parallel method
      const soltrackerOutput = await extractInfoFromSolTracker(
        mintAddress,
        poolAddress
      );

      if (!soltrackerOutput) {
        console.error(`Failed to extract info for ${mintAddress}`);
        await writeFailedToken(
          poolAddress,
          mintAddress,
          "Failed to extract token info"
        );
        return;
      }

      // Check spam filtering
      if (FILTER_SPAM_TOKENS && soltrackerOutput.is_spam) {
        console.log(`Token ${mintAddress} filtered as spam`);
        await writeAddress(
          poolAddress,
          mintAddress,
          `SPAM_${soltrackerOutput.token_name}`
        );
        return `FILTERED_SPAM: ${soltrackerOutput.token_name}`;
      }

      // Extract holder info
      const holdersOutput = await extractInfoFromSolTrackerHolders(mintAddress);

      // Generate output message
      const message = await makeOutput(soltrackerOutput, holdersOutput);

      if (message) {
        console.log("\n" + message + "\n");
        await writeAddress(
          poolAddress,
          mintAddress,
          soltrackerOutput.token_name
        );
        console.log(
          `Successfully processed token: ${soltrackerOutput.token_name}`
        );

        // Send token to backend webhook
        try {
          const tokenDataForBackend = {
            token_address: soltrackerOutput.token_address,
            token_name: soltrackerOutput.token_name,
            token_symbol: soltrackerOutput.token_symbol,
            token_price: soltrackerOutput.token_price,
            token_liquidity: soltrackerOutput.token_liquidity,
            token_market_cap: soltrackerOutput.token_market_cap,
            token_exchange: soltrackerOutput.token_exchange,
            lpBurn: soltrackerOutput.lpBurn,
            mint_authority_status: soltrackerOutput.mint_authority_status,
            freeze_authority_status: soltrackerOutput.freeze_authority_status,
            dev: soltrackerOutput.dev,
            website: soltrackerOutput.website,
            twitter: soltrackerOutput.twitter,
            telegram: soltrackerOutput.telegram,
          };

          await sendTokenToBackend(tokenDataForBackend);
        } catch (webhookError) {
          console.error(
            `Failed to send token to backend: ${webhookError.message}`
          );
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Total scraping time: ${duration}s`);
    } finally {
      currentlyProcessing.delete(tokenKey);
    }
  } catch (error) {
    console.error(`Error in scrape function: ${error.message}`);
    currentlyProcessing.delete(`${poolAddress}|${mintAddress}`);
  }
}

async function main(poolAddress, mintAddress) {
  const tokenKey = `${poolAddress}|${mintAddress}`;

  console.log(
    `Processing request for Pool=${poolAddress}, Mint=${mintAddress}`
  );

  try {
    // Check if already exists
    const existingAddresses = await extractAllExistingAddresses();

    for (const [existingPool, existingMint] of existingAddresses) {
      if (existingPool === poolAddress && existingMint === mintAddress) {
        console.log(
          `Duplicate detected: ${tokenKey} already processed. Skipping.`
        );
        return "DUPLICATE";
      }
    }

    // Process the token
    await scrape(poolAddress, mintAddress);
  } catch (error) {
    console.error(`Error in main function: ${error.message}`);
  }
}

// --- Token Monitoring ---
async function fetchLatestCryptoTokens() {
  const url = "https://input-render.onrender.com/get_crypto_tokens";

  try {
    const response = await axios.get(url, { timeout: 10000 });

    if (response.status === 200) {
      const data = response.data;
      const tokens = data.tokens || [];
      const count = data.count || 0;

      const currentTime = new Date().toISOString();

      if (count > 0) {
        console.log(`[${currentTime}] Found ${count} new crypto tokens!`);

        // Check for duplicate tokens in current batch
        const seenTokens = new Set();
        const uniqueTokens = [];

        for (const token of tokens) {
          const poolAddress = token.pool_address || "Unknown";
          const mintAddress = token.mint_address || "Unknown";
          const tokenKey = `${poolAddress}|${mintAddress}`;

          if (!seenTokens.has(tokenKey)) {
            seenTokens.add(tokenKey);
            uniqueTokens.push(token);
          } else {
            console.log(
              `Duplicate token detected in batch: Pool=${poolAddress}, Mint=${mintAddress}`
            );
          }
        }

        if (uniqueTokens.length !== count) {
          console.log(
            `Filtered ${
              count - uniqueTokens.length
            } duplicate tokens from current batch`
          );
        }

        if (uniqueTokens.length > 0) {
          console.log(
            `Starting parallel processing of ${uniqueTokens.length} unique tokens...`
          );

          // Process all tokens in parallel
          const promises = uniqueTokens.map((token, i) => {
            const poolAddress = token.pool_address || "Unknown";
            const mintAddress = token.mint_address || "Unknown";
            const timestamp = token.timestamp || "Unknown";

            console.log(`Token #${i + 1}:`);
            console.log(`  - Created at: ${timestamp}`);
            console.log(`  - Pool Address: ${poolAddress}`);
            console.log(`  - Mint Address: ${mintAddress}`);
            console.log("-".repeat(50));

            return main(poolAddress, mintAddress).catch((error) => {
              console.error(
                `Error processing token ${i + 1}: ${error.message}`
              );
            });
          });

          await Promise.all(promises);
          console.log(
            `All ${uniqueTokens.length} unique tokens processed in parallel!`
          );
        } else {
          console.log("No unique tokens to process after filtering duplicates");
        }
      } else {
        console.log(`[${currentTime}] No new crypto tokens found.`);
      }
    } else {
      console.log(`Failed to fetch tokens. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching crypto tokens: ${error.message}`);
  }
}

async function startTokenMonitoring() {
  console.log("Starting crypto token monitoring...");
  console.log("Will check for new tokens every 2 seconds.");

  while (true) {
    await fetchLatestCryptoTokens();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
  }
}

// --- Entry Point ---
if (require.main === module) {
  console.log("Starting token monitoring service...");

  startTokenMonitoring().catch((error) => {
    console.error(`Fatal error in token monitoring: ${error.message}`);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    performanceTimer.printComparison();
    console.log("Goodbye!");
    process.exit(0);
  });
}

module.exports = { main, scrape, fetchLatestCryptoTokens };
