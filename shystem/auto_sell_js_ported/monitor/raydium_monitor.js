// Raydium/Universal DEX Monitor - JavaScript Port
// Port of raydium_monitor.rs

const WebSocket = require("ws");
const { Connection, PublicKey } = require("@solana/web3.js");
const { getDexPrograms } = require("./monitor/config");
const { getFileLogger } = require("./file_logger");

class UniversalDEXMonitor {
  constructor(
    config,
    tokenMint,
    tokenPairAddr = null,
    onSwapDetected = null,
    onFreezeDetected = null,
    onLiquidityRemoval = null
  ) {
    this.config = config;
    this.tokenMint = tokenMint;
    this.tokenPairAddr = tokenPairAddr;
    this.onSwapDetected = onSwapDetected;
    this.onFreezeDetected = onFreezeDetected;
    this.onLiquidityRemoval = onLiquidityRemoval;

    this.connection = new Connection(config.solanaRpcUrl, "confirmed");
    this.ws = null;
    this.subscriptionId = null;
    this.running = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000; // 5 seconds

    // DEX program IDs
    this.dexPrograms = getDexPrograms();
  }

  async start() {
    console.log(
      `🚀 Starting DEX monitor for token ${this.tokenMint.substring(0, 8)}...`
    );
    this.running = true;
    await this.connect();
  }

  async stop() {
    console.log(
      `🛑 Stopping DEX monitor for token ${this.tokenMint.substring(0, 8)}...`
    );
    this.running = false;

    if (this.ws) {
      try {
        // Unsubscribe if we have a subscription
        if (this.subscriptionId !== null) {
          this.ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: "logsUnsubscribe",
              params: [this.subscriptionId],
            })
          );
        }

        this.ws.close();
      } catch (error) {
        console.error(`Error closing WebSocket: ${error.message}`);
      }

      this.ws = null;
      this.subscriptionId = null;
    }
  }

  async connect() {
    if (!this.running) return;

    try {
      console.log(
        `📡 Connecting to Solana WebSocket: ${this.config.solanaWssUrl}`
      );

      this.ws = new WebSocket(this.config.solanaWssUrl);

      this.ws.on("open", async () => {
        console.log(
          `✅ WebSocket connected for token ${this.tokenMint.substring(
            0,
            8
          )}...`
        );
        this.reconnectAttempts = 0;
        await this.subscribe();
      });

      this.ws.on("message", async (data) => {
        try {
          await this.handleMessage(data);
        } catch (error) {
          console.error(`Error handling WebSocket message: ${error.message}`);
        }
      });

      this.ws.on("error", (error) => {
        console.error(`WebSocket error: ${error.message}`);
      });

      this.ws.on("close", async () => {
        console.warn(
          `WebSocket connection closed for token ${this.tokenMint.substring(
            0,
            8
          )}...`
        );

        if (
          this.running &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          console.log(
            `Reconnecting in ${this.reconnectDelay / 1000}s... (attempt ${
              this.reconnectAttempts
            }/${this.maxReconnectAttempts})`
          );

          setTimeout(() => {
            this.connect();
          }, this.reconnectDelay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error(
            `Max reconnection attempts reached for token ${this.tokenMint.substring(
              0,
              8
            )}...`
          );
          this.running = false;
        }
      });
    } catch (error) {
      console.error(`Failed to connect WebSocket: ${error.message}`);

      if (this.running && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Retrying connection in ${this.reconnectDelay / 1000}s...`);

        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      }
    }
  }

  async subscribe() {
    try {
      // Subscribe to logs mentioning this token mint
      const subscribeRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "logsSubscribe",
        params: [
          {
            mentions: [this.tokenMint],
          },
          {
            commitment: "confirmed",
          },
        ],
      };

      this.ws.send(JSON.stringify(subscribeRequest));
      console.log(
        `📬 Subscribed to logs for token ${this.tokenMint.substring(0, 8)}...`
      );
    } catch (error) {
      console.error(`Failed to subscribe: ${error.message}`);
      throw error;
    }
  }

  async handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());

      // Handle subscription confirmation
      if (
        message.result &&
        typeof message.result === "number" &&
        !message.method
      ) {
        this.subscriptionId = message.result;
        console.log(`✅ Subscription confirmed: ${this.subscriptionId}`);
        return;
      }

      // Handle log notifications
      if (message.method === "logsNotification" && message.params) {
        const result = message.params.result;
        if (result && result.value) {
          await this.processLogNotification(result.value);
        }
      }
    } catch (error) {
      console.error(`Error parsing WebSocket message: ${error.message}`);
    }
  }

  async processLogNotification(logData) {
    const signature = logData.signature;
    const logs = logData.logs || [];
    const err = logData.err;

    // Skip failed transactions
    if (err) {
      return;
    }

    // Check for DEX interactions
    const isDexSwap = this.detectDexSwap(logs);
    const isFreezeAccount = this.detectFreezeAccount(logs);
    const isLiquidityRemoval = this.detectLiquidityRemoval(logs);

    if (isDexSwap) {
      console.log(`🔄 DEX swap detected: ${signature}`);
      await this.handleSwapTransaction(signature, logs);
    }

    if (isFreezeAccount) {
      console.warn(`🚨 Account freeze detected: ${signature}`);
      if (this.onFreezeDetected) {
        this.onFreezeDetected(this.tokenMint, signature, logs);
      }
    }

    if (isLiquidityRemoval) {
      console.warn(`🚨 Liquidity removal detected: ${signature}`);
      if (this.onLiquidityRemoval) {
        this.onLiquidityRemoval(this.tokenMint, signature, logs);
      }
    }
  }

  detectDexSwap(logs) {
    // Check for common DEX program invocations
    const dexProgramIds = Object.values(this.dexPrograms);

    for (const log of logs) {
      // Check for "Program <DEX_ID> invoke"
      for (const dexId of dexProgramIds) {
        if (
          log.includes(`Program ${dexId} invoke`) ||
          log.includes(`Program ${dexId} success`)
        ) {
          return true;
        }
      }

      // Check for common swap-related keywords
      if (
        log.toLowerCase().includes("swap") ||
        log.toLowerCase().includes("trade") ||
        log.toLowerCase().includes("exchange")
      ) {
        return true;
      }
    }

    return false;
  }

  detectFreezeAccount(logs) {
    for (const log of logs) {
      if (
        log.toLowerCase().includes("freezeaccount") ||
        log.toLowerCase().includes("freeze account") ||
        log.includes("MintTo: FreezeAccount")
      ) {
        return true;
      }
    }
    return false;
  }

  detectLiquidityRemoval(logs) {
    for (const log of logs) {
      if (
        log.toLowerCase().includes("removeliquidity") ||
        log.toLowerCase().includes("remove liquidity") ||
        (log.toLowerCase().includes("withdraw") &&
          log.toLowerCase().includes("pool"))
      ) {
        return true;
      }
    }
    return false;
  }

  async handleSwapTransaction(signature, logs) {
    try {
      // Fetch full transaction details
      const tx = await this.connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        console.debug(`No transaction metadata for ${signature}`);
        return;
      }

      // Parse token balances
      const preBalances = tx.meta.preTokenBalances || [];
      const postBalances = tx.meta.postTokenBalances || [];

      // Find changes in our token
      const tokenChanges = this.calculateTokenChanges(
        preBalances,
        postBalances
      );

      // Detect if this is a sell (token balance decreased)
      for (const change of tokenChanges) {
        if (change.mint === this.tokenMint && change.amount < 0) {
          console.log(`📉 Token sell detected:`);
          console.log(`   Trader: ${change.owner.substring(0, 8)}...`);
          console.log(`   Amount: ${Math.abs(change.amount)}`);
          console.log(`   Signature: ${signature}`);

          if (this.onSwapDetected) {
            this.onSwapDetected({
              signature,
              trader: change.owner,
              tokenMint: this.tokenMint,
              amount: Math.abs(change.amount),
              isSell: true,
              timestamp: tx.blockTime || Date.now() / 1000,
            });
          }

          // Log the event
          const logger = await getFileLogger();
          if (logger) {
            logger.logInfo("DEX_MONITOR", "Sell transaction detected", {
              signature,
              tokenMint: this.tokenMint,
              trader: change.owner,
              amount: Math.abs(change.amount),
            });
          }

          break;
        }
      }
    } catch (error) {
      console.error(`Error processing swap transaction: ${error.message}`);
    }
  }

  calculateTokenChanges(preBalances, postBalances) {
    const changes = [];

    // Create a map of pre-balances
    const preBalanceMap = new Map();
    for (const balance of preBalances) {
      if (balance.mint && balance.owner) {
        const key = `${balance.mint}_${balance.owner}`;
        preBalanceMap.set(key, balance.uiTokenAmount.uiAmount || 0);
      }
    }

    // Compare with post-balances
    for (const balance of postBalances) {
      if (balance.mint && balance.owner) {
        const key = `${balance.mint}_${balance.owner}`;
        const preAmount = preBalanceMap.get(key) || 0;
        const postAmount = balance.uiTokenAmount.uiAmount || 0;
        const change = postAmount - preAmount;

        if (change !== 0) {
          changes.push({
            mint: balance.mint,
            owner: balance.owner,
            amount: change,
            preAmount,
            postAmount,
          });
        }
      }
    }

    return changes;
  }

  isRunning() {
    return this.running;
  }

  getTokenMint() {
    return this.tokenMint;
  }
}

class MultiTokenDEXMonitor {
  constructor(config) {
    this.config = config;
    this.monitors = new Map();
  }

  async addToken(tokenMint, tokenPairAddr = null, callbacks = {}) {
    if (this.monitors.has(tokenMint)) {
      console.warn(`Already monitoring token: ${tokenMint}`);
      return false;
    }

    const monitor = new UniversalDEXMonitor(
      this.config,
      tokenMint,
      tokenPairAddr,
      callbacks.onSwapDetected,
      callbacks.onFreezeDetected,
      callbacks.onLiquidityRemoval
    );

    await monitor.start();
    this.monitors.set(tokenMint, monitor);

    console.log(
      `✅ Added DEX monitor for token ${tokenMint.substring(0, 8)}...`
    );
    return true;
  }

  async removeToken(tokenMint) {
    const monitor = this.monitors.get(tokenMint);
    if (!monitor) {
      console.warn(`Not monitoring token: ${tokenMint}`);
      return false;
    }

    await monitor.stop();
    this.monitors.delete(tokenMint);

    console.log(
      `✅ Removed DEX monitor for token ${tokenMint.substring(0, 8)}...`
    );
    return true;
  }

  async stopAll() {
    console.log(`Stopping all ${this.monitors.size} DEX monitors...`);

    const stopPromises = [];
    for (const [tokenMint, monitor] of this.monitors.entries()) {
      stopPromises.push(monitor.stop());
    }

    await Promise.all(stopPromises);
    this.monitors.clear();

    console.log("✅ All DEX monitors stopped");
  }

  getActiveMonitors() {
    const active = [];
    for (const [tokenMint, monitor] of this.monitors.entries()) {
      if (monitor.isRunning()) {
        active.push(tokenMint);
      }
    }
    return active;
  }

  getMonitorCount() {
    return this.monitors.size;
  }

  isMonitoring(tokenMint) {
    return this.monitors.has(tokenMint);
  }
}

module.exports = {
  UniversalDEXMonitor,
  MultiTokenDEXMonitor,
};
