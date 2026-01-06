// Unified Monitor - JavaScript Port (Part 1 of 2)
// Port of unified_monitor.rs

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { SolanaTracker } = require("./monitor/solanatracker");
const { TradeLogger } = require("./monitor/logger");
const { ShyftClient } = require("./shyft_client");
const { getDexPrograms } = require("./monitor/config");
const { getFileLogger } = require("./file_logger");

class UnifiedTokenMonitor {
  constructor(onSellTrigger, config, shyftClient = null) {
    this.onSellTrigger = onSellTrigger;
    this.dataDir = path.resolve(config.dataDir);
    this.wssUrl = config.solanaWssUrl;
    this.solanatracker = new SolanaTracker();
    this.monitoredTokens = new Map();
    this.dexMonitors = new Map();
    this.running = false;
    this.shyftClient = shyftClient;
    this.callbackUrl = config.callbackUrl;
    this.maxMonitoredTokens = config.maxMonitoredTokens;
    this.streamProvider = config.streamProvider;

    // Create data directory
    if (!fsSync.existsSync(this.dataDir)) {
      fsSync.mkdirSync(this.dataDir, { recursive: true });
    }

    const tradeLogPath = path.join(this.dataDir, "trades.csv");
    this.tradeLogger = new TradeLogger(tradeLogPath);

    console.log(
      `UnifiedTokenMonitor initialized with ${config.streamProvider} stream provider`
    );
  }

  filterDexAddresses(holders) {
    const dexPrograms = getDexPrograms();
    const dexAddresses = Object.values(dexPrograms);

    const knownPools = [
      "3cgc1ZuF",
      "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWKkwdnAnineN",
    ];

    return holders.filter((holder) => {
      // Filter out DEX program addresses
      if (dexAddresses.some((dex) => holder.startsWith(dex))) {
        console.debug(
          `🚫 Filtering DEX program address: ${holder.substring(0, 8)}...`
        );
        return false;
      }

      // Filter out known pool addresses
      if (knownPools.some((pool) => holder.startsWith(pool))) {
        console.debug(
          `🚫 Filtering known liquidity pool: ${holder.substring(0, 8)}...`
        );
        return false;
      }

      // Filter out system accounts
      if (
        holder.startsWith("11111111111111111111111111111111") ||
        holder.startsWith("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") ||
        holder.startsWith("So11111111111111111111111111111111111111112")
      ) {
        console.debug(
          `🚫 Filtering system account: ${holder.substring(0, 8)}...`
        );
        return false;
      }

      return true;
    });
  }

  async addToken(
    tokenMint,
    tokenPairAddr = null,
    tokenAccount = null,
    liquidityPool = null,
    metadata = null,
    triggers = null
  ) {
    const startTime = Date.now();

    const logger = await getFileLogger();
    if (logger) {
      logger.logInfo(
        "TOKEN_ADDITION",
        `Attempting to add token: ${tokenMint} (pair: ${
          tokenPairAddr || "N/A"
        })`,
        {
          tokenMint,
          tokenPairAddr,
          liquidityPool,
          hasMetadata: !!metadata,
        }
      );
    }

    // Check if already monitoring
    if (this.monitoredTokens.has(tokenMint)) {
      console.warn(`Token ${tokenMint} already being monitored`);
      if (logger) {
        logger.logWarning("TOKEN_ADDITION", "Token already being monitored", {
          tokenMint,
        });
      }
      return false;
    }

    // Check if we need to remove old tokens due to limit
    if (this.monitoredTokens.size >= this.maxMonitoredTokens) {
      // Find the oldest token
      let oldestMint = null;
      let oldestTime = Infinity;

      for (const [mint, data] of this.monitoredTokens.entries()) {
        if (data.addedAt < oldestTime) {
          oldestTime = data.addedAt;
          oldestMint = mint;
        }
      }

      if (oldestMint) {
        console.warn(
          `Token limit reached (${this.monitoredTokens.size}/${this.maxMonitoredTokens}). ` +
            `Removing oldest token: ${oldestMint.substring(0, 8)}...`
        );

        const oldestToken = this.monitoredTokens.get(oldestMint);
        this.monitoredTokens.delete(oldestMint);

        // Stop DEX monitor for removed token
        await this.stopDexMonitorForToken(oldestMint);

        // Log token removal
        if (logger) {
          const monitoringDuration = Date.now() / 1000 - oldestToken.addedAt;
          logger.logTokenRemoved({
            timestamp: new Date(),
            tokenMint: oldestMint,
            reason: "TOKEN_LIMIT_EXCEEDED",
            shyftCallbackId: oldestToken.shyftCallbackId,
            shyftCleanupSuccess: false,
            monitoringDurationSeconds: Math.floor(monitoringDuration),
          });
        }
      }
    }

    // Fetch top holders
    console.log(`🔍 Fetching top holders for ${tokenMint.substring(0, 8)}...`);
    console.log("📡 About to call solanatracker.getTokenHolders()...");

    let holders = [];
    try {
      const holderData = await this.solanatracker.getTokenHolders(
        tokenMint,
        50
      );
      holders = holderData.map((h) => h.wallet);
      console.log(`✅ Successfully got ${holders.length} holders from API`);
    } catch (error) {
      console.error(`❌ Error fetching holders: ${error.message}`);
      if (logger) {
        logger.logWarning("TOKEN_ADDITION", "Could not fetch top holders", {
          tokenMint,
          error: error.message,
        });
      }
    }

    // Filter DEX addresses
    const rawCount = holders.length;
    const topHolders = this.filterDexAddresses(holders);

    console.log(
      `Found ${topHolders.length} top holders for ${tokenMint.substring(
        0,
        8
      )} (filtered from ${rawCount} raw holders)`
    );

    // Log filtered addresses for debugging
    for (let i = 0; i < Math.min(5, topHolders.length); i++) {
      console.debug(
        `   Top holder #${i + 1}: ${topHolders[i].substring(0, 8)}...`
      );
    }

    // Create Shyft callback if client is available
    let shyftCallbackSuccess = false;
    let shyftCallbackId = null;

    if (this.shyftClient) {
      console.log(
        `Creating Shyft callback for token ${tokenMint.substring(0, 8)}...`
      );
      try {
        const response = await this.shyftClient.createCallback(
          tokenMint,
          this.callbackUrl
        );
        if (response.success) {
          console.log(`✅ Shyft callback created: ${response.callbackId}`);
          shyftCallbackSuccess = true;
          shyftCallbackId = response.callbackId;

          if (logger) {
            logger.logInfo(
              "SHYFT_CALLBACK",
              "Shyft callback created successfully",
              {
                tokenMint,
                callbackId: response.callbackId,
                callbackUrl: this.callbackUrl,
              }
            );
          }
        } else {
          console.warn(
            `⚠️ Failed to create Shyft callback: ${response.errorMessage}`
          );
          if (logger) {
            logger.logError(
              "SHYFT_CALLBACK",
              "Failed to create Shyft callback",
              {
                tokenMint,
                error: response.errorMessage,
                callbackUrl: this.callbackUrl,
              }
            );
          }
        }
      } catch (error) {
        console.error(`❌ Error creating Shyft callback: ${error.message}`);
        if (logger) {
          logger.logError("SHYFT_CALLBACK", "Error creating Shyft callback", {
            tokenMint,
            error: error.message,
            callbackUrl: this.callbackUrl,
          });
        }
      }
    } else {
      console.warn("Shyft client not configured, skipping webhook setup");
      if (logger) {
        logger.logWarning("SHYFT_CALLBACK", "Shyft client not configured", {
          tokenMint,
        });
      }
    }

    // Store monitoring data
    const triggersActive = triggers || {
      topHolderSell: true,
      liquidityRemoval: true,
      accountFreeze: true,
    };

    const monitored = {
      topHolders,
      liquidityPool,
      metadata: metadata || {},
      addedAt: Date.now() / 1000,
      triggersActive,
      shyftCallbackId,
      tokenPairAddr,
      tokenAccount,
    };

    this.monitoredTokens.set(tokenMint, monitored);

    // Start DEX monitor
    await this.startDexMonitorForToken(tokenMint, tokenPairAddr);

    // Save watchlist
    await this.saveWatchlist();

    // Log successful token addition
    if (logger) {
      logger.logTokenAdded({
        timestamp: new Date(),
        tokenMint,
        topHoldersCount: topHolders.length,
        shyftCallbackId,
        shyftCallbackSuccess,
        liquidityPool,
        triggersActive: {
          topHolderSell: true,
          liquidityRemoval: true,
          accountFreeze: true,
        },
      });

      logger.logInfo(
        "TOKEN_ADDITION",
        "Token successfully added to monitoring",
        {
          tokenMint,
          topHoldersCount: topHolders.length,
          durationMs: Date.now() - startTime,
          shyftEnabled: !!shyftCallbackId,
          currentMonitoredCount: this.monitoredTokens.size,
        }
      );
    }

    console.log(`✅ Token ${tokenMint.substring(0, 8)}... added to monitoring`);
    return true;
  }

  async removeToken(tokenMint) {
    if (!this.monitoredTokens.has(tokenMint)) {
      console.warn(`Token ${tokenMint} not being monitored`);
      return false;
    }

    const tokenData = this.monitoredTokens.get(tokenMint);
    const callbackId = tokenData.shyftCallbackId;

    // Stop DEX monitor
    await this.stopDexMonitorForToken(tokenMint);

    // Remove from monitored tokens
    this.monitoredTokens.delete(tokenMint);

    // Clean up Shyft callback if it exists
    if (this.shyftClient && callbackId) {
      console.log(`Removing Shyft callback: ${callbackId}`);
      try {
        const response = await this.shyftClient.deleteCallback(callbackId);
        if (response.success) {
          console.log("✅ Shyft callback removed successfully");
        } else {
          console.warn(
            `⚠️ Failed to remove Shyft callback: ${response.errorMessage}`
          );
        }
      } catch (error) {
        console.error(`❌ Error removing Shyft callback: ${error.message}`);
      }
    }

    // Save watchlist
    await this.saveWatchlist();

    console.log(
      `✅ Token ${tokenMint.substring(0, 8)}... removed from monitoring`
    );
    return true;
  }

  async startDexMonitorForToken(tokenMint, tokenPairAddr = null) {
    // DEX monitoring would be implemented here with WebSocket
    // For now, this is a placeholder as the full WebSocket implementation
    // is complex and would require the raydium_monitor.js port
    console.log(
      `🚀 DEX monitor started for ${tokenMint.substring(0, 8)}... (Mint only)`
    );

    // Store placeholder monitor
    this.dexMonitors.set(`${tokenMint}_mint`, {
      tokenMint,
      tokenPairAddr,
      running: true,
    });
  }

  async stopDexMonitorForToken(tokenMint) {
    // Stop monitors
    this.dexMonitors.delete(`${tokenMint}_mint`);
    this.dexMonitors.delete(`${tokenMint}_pair`);
    this.dexMonitors.delete(tokenMint);

    console.log(`🛑 DEX monitor stopped for ${tokenMint.substring(0, 8)}...`);
  }

  async handleLiquidityRemoval(poolAddress, eventData) {
    const affectedTokens = [];

    for (const [mint, data] of this.monitoredTokens.entries()) {
      if (data.liquidityPool === poolAddress) {
        affectedTokens.push(mint);
      }
    }

    for (const tokenMint of affectedTokens) {
      console.error("🚨 LIQUIDITY REMOVAL DETECTED!");
      console.error(`   Token: ${tokenMint.substring(0, 8)}...`);
      console.error(`   Pool: ${poolAddress.substring(0, 8)}...`);

      const triggerDetails = JSON.stringify({
        poolAddress,
        transactionSignature: eventData.transaction_signature,
        timestamp: eventData.timestamp,
      });

      this.onSellTrigger(tokenMint, "LIQUIDITY_REMOVAL", triggerDetails);
    }
  }

  async handleAccountFreeze(mintAddress, eventData) {
    if (!this.monitoredTokens.has(mintAddress)) {
      return;
    }

    console.error("🚨 ACCOUNT FREEZE DETECTED!");
    console.error(`   Token: ${mintAddress.substring(0, 8)}...`);

    const triggerDetails = JSON.stringify({
      mintAddress,
      transactionSignature: eventData.transaction_signature,
      timestamp: eventData.timestamp,
    });

    this.onSellTrigger(mintAddress, "ACCOUNT_FREEZE", triggerDetails);
  }

  async handleShyftWebhook(webhookData) {
    console.log("=== Shyft Webhook Received ===");
    console.log(`Full webhook data: ${JSON.stringify(webhookData, null, 2)}`);

    const txType = (webhookData.type || "").toUpperCase();
    console.log(`Transaction type: ${txType}`);

    // Process different types of events
    switch (txType) {
      case "SWAP":
        console.log(
          "🔄 SWAP transaction detected, checking for top holder activity..."
        );
        await this.processSwapTransaction(webhookData);
        break;
      case "FREEZEACCOUNT":
        console.warn("🚨 FREEZE_ACCOUNT detected from Shyft!");
        await this.processFreezeEvent(webhookData);
        break;
      case "REMOVE_LIQUIDITY":
        console.warn("🚨 LIQUIDITY_REMOVAL detected from Shyft!");
        await this.processLiquidityRemovalEvent(webhookData);
        break;
      default:
        // Check if actions array contains these events
        if (webhookData.actions && Array.isArray(webhookData.actions)) {
          for (const action of webhookData.actions) {
            const actionType = (action.type || "").toUpperCase();
            if (actionType === "SWAP") {
              console.log(
                "🔄 SWAP found in actions, checking for top holder activity..."
              );
              await this.processSwapTransaction(webhookData);
              return;
            } else if (actionType === "FREEZEACCOUNT") {
              console.warn("🚨 FREEZE_ACCOUNT found in actions!");
              await this.processFreezeEvent(webhookData);
              return;
            } else if (actionType === "REMOVE_LIQUIDITY") {
              console.warn("🚨 LIQUIDITY_REMOVAL found in actions!");
              await this.processLiquidityRemovalEvent(webhookData);
              return;
            }
          }
        }

        // Fallback: Check raw transaction for freeze instructions
        await this.detectAndProcessFreezeInRawTransaction(webhookData);
        break;
    }
  }

  async processSwapTransaction(webhookData) {
    const tokenMint = webhookData.triggered_for;
    if (!tokenMint) {
      console.debug("No triggered_for field found in SWAP webhook");
      return;
    }

    const tokenData = this.monitoredTokens.get(tokenMint);
    if (!tokenData) {
      console.debug(`SWAP detected for unmonitored token: ${tokenMint}`);
      return;
    }

    console.log(
      `📊 Analyzing SWAP for monitored token: ${tokenMint.substring(0, 8)}...`
    );

    // Check token_balance_changes
    if (
      webhookData.token_balance_changes &&
      Array.isArray(webhookData.token_balance_changes)
    ) {
      for (const change of webhookData.token_balance_changes) {
        if (change.mint !== tokenMint) continue;

        const owner = change.owner;
        const changeAmount = parseInt(change.change_amount || "0");

        if (changeAmount < 0) {
          console.log(
            `📉 Sell detected - Owner: ${owner.substring(
              0,
              8
            )}..., Amount: ${Math.abs(changeAmount)}`
          );

          if (tokenData.topHolders.includes(owner)) {
            console.error("🚨 TOP HOLDER SELL DETECTED VIA SHYFT!");
            console.error(`   Token: ${tokenMint.substring(0, 8)}...`);
            console.error(`   Top Holder: ${owner.substring(0, 8)}...`);
            console.error(`   Amount Sold: ${Math.abs(changeAmount)}`);

            const transactionSignature =
              webhookData.signatures?.[0] || "unknown";

            const logger = await getFileLogger();
            if (logger) {
              logger.logEventDetected({
                timestamp: new Date(),
                tokenMint,
                eventType: "TOP_HOLDER_SELL",
                detectionSource: "SHYFT_WEBHOOK",
                triggerDetails: {
                  trader: owner,
                  amountSold: Math.abs(changeAmount),
                  tokenMint,
                  detectionMethod: "token_balance_changes",
                },
                transactionSignature,
                willTriggerSell: true,
              });
            }

            const triggerDetails = JSON.stringify({
              trader: owner,
              amountSold: Math.abs(changeAmount),
              tokenMint,
              transactionSignature,
              timestamp: Date.now() / 1000,
              detectionSource: "SHYFT_WEBHOOK",
            });

            this.onSellTrigger(tokenMint, "TOP_HOLDER_SELL", triggerDetails);
            return;
          }
        }
      }
    }
  }

  async processFreezeEvent(webhookData) {
    const mintAddress = webhookData.triggered_for || webhookData.mint_address;
    if (mintAddress) {
      console.error(`🚨 Processing freeze event for mint: ${mintAddress}`);
      await this.handleAccountFreeze(mintAddress, webhookData);
    } else {
      console.warn("⚠️ Could not extract mint address from freeze event");
    }
  }

  async processLiquidityRemovalEvent(webhookData) {
    const poolAddress = webhookData.pool_address;
    if (poolAddress) {
      console.error(`🚨 Processing liquidity removal for pool: ${poolAddress}`);
      await this.handleLiquidityRemoval(poolAddress, webhookData);
    } else {
      console.warn(
        "⚠️ Could not extract pool address from liquidity removal event"
      );
    }
  }

  async detectAndProcessFreezeInRawTransaction(webhookData) {
    // Check for freeze instructions in raw transaction data
    console.debug("No freeze account instruction detected in transaction");
  }

  async saveWatchlist() {
    try {
      const watchlistFile = path.join(this.dataDir, "watchlist.json");
      const data = Object.fromEntries(this.monitoredTokens);
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(watchlistFile, json);
    } catch (error) {
      console.error(`Failed to save watchlist: ${error.message}`);
    }
  }

  async getStatus() {
    const tokensInfo = [];

    for (const [mint, data] of this.monitoredTokens.entries()) {
      tokensInfo.push({
        token_mint: mint,
        token_pair_addr: data.tokenPairAddr,
        top_holders_count: data.topHolders.length,
        liquidity_pool: data.liquidityPool,
        added_at: data.addedAt,
        triggers_active: data.triggersActive,
        dex_monitor_active:
          this.dexMonitors.has(`${mint}_mint`) ||
          this.dexMonitors.has(`${mint}_pair`) ||
          this.dexMonitors.has(mint),
      });
    }

    return {
      running: this.running,
      monitored_tokens_count: this.monitoredTokens.size,
      tokens: tokensInfo,
      active_dex_monitors: this.dexMonitors.size,
    };
  }

  async startMonitoring() {
    this.running = true;
    console.log("🚀 Unified Token Monitor started");
  }

  async stopMonitoring() {
    this.running = false;

    // Stop all DEX monitors
    for (const [key, monitor] of this.dexMonitors.entries()) {
      // Stop monitor logic would go here
      console.log(`Stopping monitor: ${key}`);
    }

    console.log("🛑 Unified Token Monitor stopped");
  }

  async isMonitoringToken(tokenMint) {
    return this.monitoredTokens.has(tokenMint);
  }
}

module.exports = { UnifiedTokenMonitor };
