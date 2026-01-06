/**
 * Advanced Token Discovery Service
 * Monitors new token launches and provides comprehensive token data
 * Integrated from shystem/input_token_monitoring_js_ported
 */

import axios from "axios";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";

// API Keys - should be moved to environment variables
const MOBULA_API =
  process.env.MOBULA_API_KEY || "05af5fe9-c6a2-4677-8491-fa1bea364fc1";
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const SOLANATRACKER_API_KEY =
  process.env.SOLANATRACKER_API_KEY || "d1fc458e-bdef-4309-971f-54238845c9c3";

export class TokenDiscoveryService {
  constructor(config = {}) {
    this.dataDir = path.resolve(config.dataDir || "./data/token-discovery");
    this.filterSpam = config.filterSpam || false;
    this.currentlyProcessing = new Set();
    this.performanceMetrics = {};

    // Ensure data directory exists
    if (!fsSync.existsSync(this.dataDir)) {
      fsSync.mkdirSync(this.dataDir, { recursive: true });
    }

    console.log("✅ TokenDiscoveryService initialized");
  }

  /**
   * Get comprehensive token data from multiple APIs
   */
  async getTokenData(mintAddress, poolAddress = null) {
    if (this.currentlyProcessing.has(mintAddress)) {
      console.warn(`Already processing ${mintAddress}`);
      return null;
    }

    this.currentlyProcessing.add(mintAddress);

    try {
      console.log(
        `🔍 Fetching data for token: ${mintAddress.substring(0, 8)}...`
      );

      // Fetch from multiple APIs in parallel
      const [mobulaData, goplusData, moralisData] = await Promise.all([
        this.getMobulaData(mintAddress).catch(() => ({})),
        this.getGoPlusData(mintAddress).catch(() => ({})),
        this.getMoralisData(mintAddress).catch(() => ({})),
      ]);

      // Merge data from all sources
      const tokenData = this.mergeTokenData(
        mintAddress,
        poolAddress,
        mobulaData,
        goplusData,
        moralisData
      );

      console.log(
        `✅ Successfully fetched data for ${
          tokenData.token_symbol || mintAddress.substring(0, 8)
        }`
      );

      return tokenData;
    } catch (error) {
      console.error(`Error fetching token data: ${error.message}`);
      return null;
    } finally {
      this.currentlyProcessing.delete(mintAddress);
    }
  }

  /**
   * Get data from Mobula API (market data)
   */
  async getMobulaData(mintAddress) {
    try {
      const url = "https://api.mobula.io/api/1/metadata";
      const params = { asset: mintAddress, blockchain: "solana" };
      const response = await axios.get(url, { params, timeout: 8000 });

      if (response.status === 200) {
        return response.data.data || {};
      }
      return {};
    } catch (error) {
      console.warn(`Mobula API error: ${error.message}`);
      return {};
    }
  }

  /**
   * Get security data from GoPlus API
   */
  async getGoPlusData(mintAddress) {
    try {
      const url = "https://api.gopluslabs.io/api/v1/solana/token_security";
      const params = { contract_addresses: mintAddress };
      const response = await axios.get(url, { params, timeout: 8000 });

      if (response.status === 200 && response.data.result) {
        return response.data.result[mintAddress] || {};
      }
      return {};
    } catch (error) {
      console.warn(`GoPlus API error: ${error.message}`);
      return {};
    }
  }

  /**
   * Get metadata from Moralis API
   */
  async getMoralisData(mintAddress) {
    if (!MORALIS_API_KEY) {
      return {};
    }

    try {
      const url = `https://solana-gateway.moralis.io/token/mainnet/${mintAddress}/metadata`;
      const headers = {
        Accept: "application/json",
        "X-API-Key": MORALIS_API_KEY,
      };
      const response = await axios.get(url, { headers, timeout: 8000 });

      if (response.status === 200) {
        return response.data;
      }
      return {};
    } catch (error) {
      console.warn(`Moralis API error: ${error.message}`);
      return {};
    }
  }

  /**
   * Get wallet information from SolanaTracker
   */
  async getWalletInfo(ownerAddress) {
    try {
      const url = `https://data.solanatracker.io/wallet/${ownerAddress}/basic`;
      const headers = { "x-api-key": SOLANATRACKER_API_KEY };

      const response = await axios.get(url, { headers, timeout: 10000 });

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.warn(`SolanaTracker API error: ${error.message}`);
      return null;
    }
  }

  /**
   * Merge token data from multiple sources
   */
  mergeTokenData(
    mintAddress,
    poolAddress,
    mobulaData,
    goplusData,
    moralisData
  ) {
    const output = {
      token_address: mintAddress,
      pool_address: poolAddress || "",
      token_name: "",
      token_symbol: "",
      token_price: "",
      token_liquidity: "",
      token_total_supply: "",
      token_market_cap: "0",
      dev: "",
      lpBurn: "",
      website: "",
      twitter: "",
      telegram: "",
      mint_authority_status: false,
      freeze_authority_status: false,
      risk_status: "Unknown",
      is_spam: false,
      data_source: "multi_api",
      timestamp: new Date().toISOString(),
    };

    // Merge Mobula data (market data)
    if (mobulaData && Object.keys(mobulaData).length > 0) {
      output.token_name = mobulaData.name || output.token_name;
      output.token_symbol = mobulaData.symbol || output.token_symbol;
      output.token_price = mobulaData.price?.toString() || output.token_price;
      output.token_liquidity =
        mobulaData.liquidity?.toString() || output.token_liquidity;
      output.token_market_cap =
        mobulaData.market_cap?.toString() || output.token_market_cap;
      output.token_total_supply =
        mobulaData.total_supply?.toString() || output.token_total_supply;
      output.website = mobulaData.website || output.website;
      output.twitter = mobulaData.twitter || output.twitter;
      output.telegram = mobulaData.telegram || output.telegram;
    }

    // Merge GoPlus data (security)
    if (goplusData && Object.keys(goplusData).length > 0) {
      output.mint_authority_status = goplusData.mint_authority === "0";
      output.freeze_authority_status = goplusData.freeze_authority === "0";
      output.lpBurn = goplusData.lp_burned || output.lpBurn;
      output.dev = goplusData.creator_address || output.dev;

      // Calculate risk status
      if (goplusData.is_honeypot === "1" || goplusData.is_scam === "1") {
        output.risk_status = "High";
      } else if (goplusData.trading_enabled === "0") {
        output.risk_status = "Medium";
      } else {
        output.risk_status = "Low";
      }
    }

    // Merge Moralis data
    if (moralisData && Object.keys(moralisData).length > 0) {
      output.token_name = output.token_name || moralisData.name;
      output.token_symbol = output.token_symbol || moralisData.symbol;
      output.token_total_supply =
        output.token_total_supply || moralisData.supply?.toString();
    }

    // Spam detection
    if (this.filterSpam) {
      output.is_spam = this.isSpamToken(output);
    }

    return output;
  }

  /**
   * Simple spam detection
   */
  isSpamToken(tokenData) {
    const { token_name, token_symbol, token_liquidity, token_market_cap } =
      tokenData;

    // Check for empty data
    if (!token_name && !token_symbol) {
      return true;
    }

    // Check for very low liquidity
    const liquidity = parseFloat(token_liquidity || "0");
    if (liquidity < 100) {
      return true;
    }

    // Check for very low market cap
    const marketCap = parseFloat(token_market_cap || "0");
    if (marketCap < 1000) {
      return true;
    }

    return false;
  }

  /**
   * Monitor new tokens from a stream/webhook
   */
  async handleNewToken(tokenData) {
    const { mintAddress, poolAddress } = tokenData;

    console.log(`🆕 New token detected: ${mintAddress.substring(0, 8)}...`);

    // Get comprehensive data
    const fullData = await this.getTokenData(mintAddress, poolAddress);

    if (!fullData) {
      console.error(`Failed to fetch data for ${mintAddress}`);
      return null;
    }

    // Filter spam if enabled
    if (this.filterSpam && fullData.is_spam) {
      console.log(`🚫 Filtered spam token: ${mintAddress.substring(0, 8)}...`);
      return null;
    }

    // Log to file
    await this.logToken(fullData);

    return fullData;
  }

  /**
   * Log token to file
   */
  async logToken(tokenData) {
    const logPath = path.join(this.dataDir, "tokens.jsonl");
    const line = JSON.stringify(tokenData) + "\n";
    await fs.appendFile(logPath, line);
  }

  /**
   * Get recent discovered tokens
   */
  async getRecentTokens(limit = 100) {
    const logPath = path.join(this.dataDir, "tokens.jsonl");

    try {
      const content = await fs.readFile(logPath, "utf-8");
      const lines = content
        .trim()
        .split("\n")
        .filter((l) => l);

      return lines.slice(-limit).map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Error reading token log: ${error.message}`);
      }
      return [];
    }
  }
}

// Singleton instance
let tokenDiscoveryInstance = null;

export function getTokenDiscoveryService(config = null) {
  if (!tokenDiscoveryInstance) {
    tokenDiscoveryInstance = new TokenDiscoveryService(config || {});
  }
  return tokenDiscoveryInstance;
}
