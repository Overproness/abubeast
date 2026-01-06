/**
 * Unified Token Monitor - Integrated Version
 * WebSocket and webhook-based token monitoring with auto-sell triggers
 * Integrated from shystem/auto_sell_js_ported
 */

import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";

const DEX_PROGRAMS = {
  raydium: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
  orca: "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
  jupiter: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
};

export class UnifiedTokenMonitor {
  constructor(onSellTrigger, config) {
    this.onSellTrigger = onSellTrigger;
    this.dataDir = path.resolve(config.dataDir || "./data/monitoring");
    this.wssUrl = config.solanaWssUrl || process.env.SOLANA_WSS_URL;
    this.rpcUrl = config.solanaRpcUrl || process.env.SOLANA_RPC_URL;
    this.monitoredTokens = new Map();
    this.websockets = new Map();
    this.running = false;
    this.callbackUrl = config.callbackUrl;
    this.maxMonitoredTokens = config.maxMonitoredTokens || 50;

    // Create data directory
    if (!fsSync.existsSync(this.dataDir)) {
      fsSync.mkdirSync(this.dataDir, { recursive: true });
    }

    console.log(`✅ UnifiedTokenMonitor initialized`);
    console.log(`   Max monitored tokens: ${this.maxMonitoredTokens}`);
    console.log(`   Data dir: ${this.dataDir}`);
  }

  filterDexAddresses(holders) {
    const dexAddresses = Object.values(DEX_PROGRAMS);

    const knownPools = [
      "3cgc1ZuF",
      "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWKkwdnAnineN",
    ];

    return holders.filter((holder) => {
      // Filter out DEX program addresses
      if (dexAddresses.some((dex) => holder.startsWith(dex))) {
        return false;
      }

      // Filter out known pool addresses
      if (knownPools.some((pool) => holder.startsWith(pool))) {
        return false;
      }

      // Filter out system accounts
      if (
        holder.startsWith("11111111111111111111111111111111") ||
        holder.startsWith("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") ||
        holder.startsWith("So11111111111111111111111111111111111111112")
      ) {
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
    console.log(
      `📊 Adding token to monitoring: ${tokenMint.substring(0, 8)}...`
    );

    // Check if already monitoring
    if (this.monitoredTokens.has(tokenMint)) {
      console.warn(`Token ${tokenMint} already being monitored`);
      return false;
    }

    // Check if we need to remove old tokens due to limit
    if (this.monitoredTokens.size >= this.maxMonitoredTokens) {
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
        await this.removeToken(oldestMint);
      }
    }

    // Fetch top holders
    console.log(`🔍 Fetching top holders for ${tokenMint.substring(0, 8)}...`);
    let topHolders = [];

    try {
      topHolders = await this.getTopHolders(tokenMint, 50);
      console.log(`✅ Found ${topHolders.length} top holders`);
    } catch (error) {
      console.error(`❌ Error fetching holders: ${error.message}`);
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
      tokenPairAddr,
      tokenAccount,
    };

    this.monitoredTokens.set(tokenMint, monitored);

    // Start WebSocket monitoring
    if (this.running) {
      await this.startWebSocketForToken(tokenMint, topHolders);
    }

    // Save watchlist
    await this.saveWatchlist();

    console.log(`✅ Token ${tokenMint.substring(0, 8)}... added to monitoring`);
    return true;
  }

  async removeToken(tokenMint) {
    console.log(
      `🗑️  Removing token from monitoring: ${tokenMint.substring(0, 8)}...`
    );

    // Stop WebSocket
    if (this.websockets.has(tokenMint)) {
      const ws = this.websockets.get(tokenMint);
      ws.close();
      this.websockets.delete(tokenMint);
    }

    // Remove from monitored tokens
    this.monitoredTokens.delete(tokenMint);

    // Save watchlist
    await this.saveWatchlist();

    console.log(
      `✅ Token ${tokenMint.substring(0, 8)}... removed from monitoring`
    );
    return true;
  }

  async getTopHolders(tokenMint, limit = 50) {
    try {
      // Use Helius to get token holders
      const response = await axios.post(`${this.rpcUrl}`, {
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenLargestAccounts",
        params: [tokenMint],
      });

      if (response.data.result?.value) {
        const holders = response.data.result.value
          .map((acc) => acc.address)
          .slice(0, limit);

        return this.filterDexAddresses(holders);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching top holders: ${error.message}`);
      return [];
    }
  }

  async startWebSocketForToken(tokenMint, holders) {
    if (this.websockets.has(tokenMint)) {
      console.warn(`WebSocket already active for ${tokenMint}`);
      return;
    }

    console.log(
      `🔌 Starting WebSocket for token ${tokenMint.substring(0, 8)}...`
    );

    // Monitor top holder accounts
    for (const holder of holders.slice(0, 10)) {
      // Monitor top 10
      this.subscribeToAccount(tokenMint, holder);
    }
  }

  subscribeToAccount(tokenMint, accountAddress) {
    try {
      const connection = new Connection(this.rpcUrl, "confirmed");
      const pubkey = new PublicKey(accountAddress);

      connection.onAccountChange(
        pubkey,
        (accountInfo, context) => {
          this.handleAccountChange(
            tokenMint,
            accountAddress,
            accountInfo,
            context
          );
        },
        "confirmed"
      );

      console.log(
        `📡 Subscribed to account: ${accountAddress.substring(0, 8)}...`
      );
    } catch (error) {
      console.error(`Error subscribing to account: ${error.message}`);
    }
  }

  async handleAccountChange(tokenMint, accountAddress, accountInfo, context) {
    console.log(
      `📢 Account change detected for ${accountAddress.substring(0, 8)}...`
    );

    const monitored = this.monitoredTokens.get(tokenMint);
    if (!monitored) {
      return;
    }

    // Check if this is a top holder
    const isTopHolder = monitored.topHolders.includes(accountAddress);

    if (isTopHolder && monitored.triggersActive.topHolderSell) {
      // Check if balance decreased (potential sell)
      const currentBalance = accountInfo.lamports;

      console.warn(`🚨 Top holder activity detected!`);
      console.warn(`   Token: ${tokenMint.substring(0, 8)}...`);
      console.warn(`   Holder: ${accountAddress.substring(0, 8)}...`);
      console.warn(`   Balance: ${currentBalance}`);

      // Trigger sell
      await this.onSellTrigger(tokenMint, "TopHolderSell", {
        holder: accountAddress,
        balance: currentBalance,
        slot: context.slot,
      });
    }
  }

  async start() {
    if (this.running) {
      console.warn("Monitor already running");
      return;
    }

    console.log("🚀 Starting unified token monitor...");
    this.running = true;

    // Load watchlist
    await this.loadWatchlist();

    // Start WebSocket monitoring for all tokens
    for (const [tokenMint, data] of this.monitoredTokens.entries()) {
      await this.startWebSocketForToken(tokenMint, data.topHolders);
    }

    console.log(`✅ Monitoring ${this.monitoredTokens.size} tokens`);
  }

  async stop() {
    console.log("🛑 Stopping unified token monitor...");
    this.running = false;

    // Close all WebSockets
    for (const [tokenMint, ws] of this.websockets.entries()) {
      ws.close();
    }

    this.websockets.clear();
    console.log("✅ Monitor stopped");
  }

  async saveWatchlist() {
    const watchlistPath = path.join(this.dataDir, "watchlist.json");
    const data = Array.from(this.monitoredTokens.entries()).map(
      ([mint, info]) => ({
        mint,
        ...info,
      })
    );

    await fs.writeFile(watchlistPath, JSON.stringify(data, null, 2));
  }

  async loadWatchlist() {
    const watchlistPath = path.join(this.dataDir, "watchlist.json");

    try {
      const content = await fs.readFile(watchlistPath, "utf-8");
      const data = JSON.parse(content);

      for (const item of data) {
        const { mint, ...info } = item;
        this.monitoredTokens.set(mint, info);
      }

      console.log(
        `✅ Loaded ${this.monitoredTokens.size} tokens from watchlist`
      );
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Error loading watchlist: ${error.message}`);
      }
    }
  }

  getMonitoredTokens() {
    return Array.from(this.monitoredTokens.entries()).map(([mint, info]) => ({
      mint,
      topHoldersCount: info.topHolders.length,
      addedAt: info.addedAt,
      triggers: info.triggersActive,
    }));
  }
}
