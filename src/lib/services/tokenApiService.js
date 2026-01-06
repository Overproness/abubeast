import axios from "axios";
import apiKeyManager from "./apiKeyManager.js";

/**
 * Unified Token API Service
 * Handles requests to both Mobula and Moralis APIs with automatic fallback
 */

class TokenApiService {
  constructor() {
    this.timeout = 10000; // 10 seconds
    this.maxRetries = 3;
  }

  /**
   * Determine blockchain for Moralis API based on token address
   */
  getBlockchainFromAddress(address) {
    // Solana addresses are typically 32-44 characters and base58 encoded
    if (
      address.length >= 32 &&
      address.length <= 44 &&
      /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)
    ) {
      return "solana";
    }
    // Ethereum addresses are 42 characters and start with 0x
    if (address.length === 42 && address.startsWith("0x")) {
      return "ethereum";
    }
    // Default to ethereum for other cases
    return "ethereum";
  }

  /**
   * Make request to Mobula API with enhanced error handling
   */
  async makeMobulaRequest(endpoint, params = {}) {
    const { key, index } = apiKeyManager.getNextMobulaKey();

    try {
      const response = await axios({
        method: "get",
        url: `https://production-api.mobula.io/api/1${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: key,
        },
        params,
        timeout: this.timeout,
      });

      // Mark success for key health tracking
      apiKeyManager.markSuccess("mobula", index);
      return response.data;
    } catch (error) {
      // Check for specific timeout or slow response
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        console.warn(
          `[TokenAPI] Mobula timeout with key ${index}:`,
          error.message
        );
        apiKeyManager.markKeyError("mobula", index, {
          ...error,
          message: "Request timeout",
        });
      } else {
        apiKeyManager.markKeyError("mobula", index, error);
      }
      throw error;
    }
  }

  /**
   * Make request to Moralis API with enhanced error handling
   */
  async makeMoralisRequest(endpoint, params = {}, blockchain = "ethereum") {
    const { key, index } = apiKeyManager.getNextMoralisKey();

    try {
      let baseUrl;
      if (blockchain === "solana") {
        baseUrl = "https://solana-gateway.moralis.io";
      } else {
        baseUrl = "https://deep-index.moralis.io/api/v2.2";
      }

      const response = await axios({
        method: "get",
        url: `${baseUrl}${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": key,
        },
        params,
        timeout: this.timeout,
      });

      // Mark success for key health tracking
      apiKeyManager.markSuccess("moralis", index);
      return response.data;
    } catch (error) {
      // Check for specific timeout or slow response
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        console.warn(
          `[TokenAPI] Moralis timeout with key ${index}:`,
          error.message
        );
        apiKeyManager.markKeyError("moralis", index, {
          ...error,
          message: "Request timeout",
        });
      } else {
        apiKeyManager.markKeyError("moralis", index, error);
      }
      throw error;
    }
  }

  /**
   * Get token data with intelligent provider selection and enhanced fallback
   */
  async getTokenData(address) {
    const blockchain = this.getBlockchainFromAddress(address);
    const bestProvider = apiKeyManager.getBestProvider();

    // Try the best provider first
    if (bestProvider === "mobula") {
      try {
        console.log(
          `[TokenAPI] Trying Mobula (preferred) for token data: ${address}`
        );
        const data = await this.makeMobulaRequest(`/market/data`, {
          asset: address,
        });

        if (data?.data) {
          console.log(
            `[TokenAPI] Successfully fetched from Mobula: ${address}`
          );
          return {
            provider: "mobula",
            data: data.data,
            blockchain,
          };
        }
      } catch (error) {
        console.warn(`[TokenAPI] Mobula failed for ${address}:`, error.message);
      }
    }

    // Fallback to Moralis with enhanced implementation
    try {
      console.log(`[TokenAPI] Trying Moralis for token data: ${address}`);

      let tokenData;
      if (blockchain === "solana") {
        // Enhanced Solana implementation using multiple Moralis endpoints
        const [metadata, price, holders] = await Promise.allSettled([
          this.makeMoralisRequest(
            `/token/mainnet/${address}/metadata`,
            {},
            "solana"
          ),
          this.makeMoralisRequest(
            `/token/mainnet/${address}/price`,
            {},
            "solana"
          ),
          this.makeMoralisRequest(
            `/token/mainnet/holders/${address}`,
            { limit: 1 },
            "solana"
          ),
        ]);

        const metadataValue =
          metadata.status === "fulfilled" ? metadata.value : {};
        const priceValue = price.status === "fulfilled" ? price.value : {};
        const holdersValue =
          holders.status === "fulfilled" ? holders.value : {};

        tokenData = {
          name: metadataValue?.name || "Unknown",
          symbol: metadataValue?.symbol || "UNKNOWN",
          price: priceValue?.usdPrice || 0,
          market_cap:
            (priceValue?.usdPrice || 0) * (metadataValue?.supply || 0),
          decimals: metadataValue?.decimals || 9,
          total_supply: metadataValue?.supply || 0,
          holders_count: holdersValue?.total || 0,
          volume_24h: priceValue?.["24hrChange"]?.usdVolume || 0,
          price_change_percentage_24h:
            priceValue?.["24hrChange"]?.priceChangeUsd || 0,
        };
      } else {
        // Enhanced Ethereum implementation using multiple Moralis endpoints
        const [metadata, price, holders] = await Promise.allSettled([
          this.makeMoralisRequest(`/erc20/metadata`, { addresses: [address] }),
          this.makeMoralisRequest(`/erc20/${address}/price`),
          this.makeMoralisRequest(`/erc20/${address}/owners`, { limit: 1 }),
        ]);

        const metadataValue =
          metadata.status === "fulfilled" ? metadata.value?.[0] : {};
        const priceValue = price.status === "fulfilled" ? price.value : {};
        const holdersValue =
          holders.status === "fulfilled" ? holders.value : {};

        tokenData = {
          name: metadataValue?.name || "Unknown",
          symbol: metadataValue?.symbol || "UNKNOWN",
          price: priceValue?.usdPrice || 0,
          market_cap:
            ((priceValue?.usdPrice || 0) * (metadataValue?.total_supply || 0)) /
            Math.pow(10, metadataValue?.decimals || 18),
          decimals: metadataValue?.decimals || 18,
          total_supply: metadataValue?.total_supply || 0,
          holders_count: holdersValue?.total || 0,
          volume_24h: priceValue?.["24hrChange"]?.usdVolume || 0,
          price_change_percentage_24h:
            priceValue?.["24hrChange"]?.priceChangeUsd || 0,
          circulating_supply: metadataValue?.total_supply || 0, // Adjust if circulating supply data available
        };
      }

      console.log(`[TokenAPI] Successfully fetched from Moralis: ${address}`);
      return {
        provider: "moralis",
        data: tokenData,
        blockchain,
      };
    } catch (error) {
      console.error(
        `[TokenAPI] Moralis also failed for ${address}:`,
        error.message
      );

      // If Moralis was tried first and failed, try Mobula as last resort
      if (bestProvider !== "mobula") {
        try {
          console.log(
            `[TokenAPI] Last resort - trying Mobula for token data: ${address}`
          );
          const data = await this.makeMobulaRequest(`/market/data`, {
            asset: address,
          });

          if (data?.data) {
            console.log(
              `[TokenAPI] Successfully fetched from Mobula (last resort): ${address}`
            );
            return {
              provider: "mobula",
              data: data.data,
              blockchain,
            };
          }
        } catch (mobulaError) {
          console.error(
            `[TokenAPI] Mobula last resort also failed for ${address}:`,
            mobulaError.message
          );
        }
      }

      throw new Error(`Both Mobula and Moralis failed for token ${address}`);
    }
  }

  /**
   * Get OHLCV data with enhanced fallback and better timeframe mapping
   */
  async getOHLCVData(address, period = "1h") {
    const blockchain = this.getBlockchainFromAddress(address);
    const bestProvider = apiKeyManager.getBestProvider();

    // Map period to Moralis timeframe
    const moralisTimeframeMap = {
      "1min": "1m",
      "5min": "5m",
      "15min": "15m",
      "1h": "1h",
      "4h": "4h",
      "1d": "1d",
      "1w": "1w",
      "1M": "1M",
    };

    // Try best provider first
    if (bestProvider === "mobula") {
      try {
        console.log(
          `[TokenAPI] Trying Mobula (preferred) for OHLCV: ${address}`
        );
        const data = await this.makeMobulaRequest(`/market/candles`, {
          asset: address,
          period,
        });

        if (data?.data && Array.isArray(data.data)) {
          const ohlcv = data.data.map((candle) => ({
            time: candle.timestamp / 1000,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
          }));

          console.log(
            `[TokenAPI] Successfully fetched OHLCV from Mobula: ${address}`
          );
          return {
            provider: "mobula",
            ohlcv,
          };
        }
      } catch (error) {
        console.warn(
          `[TokenAPI] Mobula OHLCV failed for ${address}:`,
          error.message
        );
      }
    }

    // Fallback to Moralis
    try {
      console.log(`[TokenAPI] Trying Moralis for OHLCV: ${address}`);

      // For Moralis, we need to get pairs first, then OHLCV
      const pairs = await this.getTokenPairs(address);
      if (pairs.length > 0) {
        const pairAddress = pairs[0].pairAddress || pairs[0].address;
        const timeframe = moralisTimeframeMap[period] || period;

        let endpoint;
        if (blockchain === "solana") {
          endpoint = `/token/mainnet/pairs/${pairAddress}/ohlcv`;
        } else {
          endpoint = `/pairs/${pairAddress}/ohlcv`;
        }

        const data = await this.makeMoralisRequest(
          endpoint,
          { timeframe },
          blockchain
        );

        if (data && Array.isArray(data)) {
          const ohlcv = data.map((candle) => ({
            time: new Date(candle.timestamp).getTime() / 1000,
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
            volume: parseFloat(candle.volume || 0),
          }));

          console.log(
            `[TokenAPI] Successfully fetched OHLCV from Moralis: ${address}`
          );
          return {
            provider: "moralis",
            ohlcv,
          };
        }
      }

      // If no pairs found, try direct OHLCV call (some tokens might have direct support)
      if (blockchain === "ethereum") {
        try {
          const directData = await this.makeMoralisRequest(
            `/erc20/${address}/ohlcv`,
            { timeframe },
            blockchain
          );
          if (directData && Array.isArray(directData)) {
            const ohlcv = directData.map((candle) => ({
              time: new Date(candle.timestamp).getTime() / 1000,
              open: parseFloat(candle.open),
              high: parseFloat(candle.high),
              low: parseFloat(candle.low),
              close: parseFloat(candle.close),
              volume: parseFloat(candle.volume || 0),
            }));

            console.log(
              `[TokenAPI] Successfully fetched direct OHLCV from Moralis: ${address}`
            );
            return {
              provider: "moralis",
              ohlcv,
            };
          }
        } catch (directError) {
          console.log(
            `[TokenAPI] Direct OHLCV failed, pairs approach was already tried: ${directError.message}`
          );
        }
      }
    } catch (error) {
      console.error(
        `[TokenAPI] Moralis OHLCV failed for ${address}:`,
        error.message
      );
    }

    // If Moralis was tried first and failed, try Mobula as last resort
    if (bestProvider !== "mobula") {
      try {
        console.log(
          `[TokenAPI] Last resort - trying Mobula for OHLCV: ${address}`
        );
        const data = await this.makeMobulaRequest(`/market/candles`, {
          asset: address,
          period,
        });

        if (data?.data && Array.isArray(data.data)) {
          const ohlcv = data.data.map((candle) => ({
            time: candle.timestamp / 1000,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
          }));

          console.log(
            `[TokenAPI] Successfully fetched OHLCV from Mobula (last resort): ${address}`
          );
          return {
            provider: "mobula",
            ohlcv,
          };
        }
      } catch (mobulaError) {
        console.error(
          `[TokenAPI] Mobula OHLCV last resort also failed for ${address}:`,
          mobulaError.message
        );
      }
    }

    throw new Error(`OHLCV data not available for token ${address}`);
  }

  /**
   * Get token pairs
   */
  async getTokenPairs(address) {
    const blockchain = this.getBlockchainFromAddress(address);

    try {
      if (blockchain === "solana") {
        const data = await this.makeMoralisRequest(
          `/token/mainnet/${address}/pairs`,
          {},
          "solana"
        );
        return data || [];
      } else {
        const data = await this.makeMoralisRequest(`/${address}/pairs`);
        return data || [];
      }
    } catch (error) {
      console.error(
        `[TokenAPI] Failed to get pairs for ${address}:`,
        error.message
      );
      return [];
    }
  }

  /**
   * Get token holders with fallback
   */
  async getTokenHolders(address, limit = 20, offset = 0) {
    const blockchain = this.getBlockchainFromAddress(address);

    // Try Mobula first
    try {
      console.log(`[TokenAPI] Trying Mobula for holders: ${address}`);
      const data = await this.makeMobulaRequest(`/market/token/holders`, {
        asset: address,
        blockchain: blockchain === "solana" ? "solana" : "ethereum",
        limit,
        offset,
      });

      if (data?.data) {
        console.log(
          `[TokenAPI] Successfully fetched holders from Mobula: ${address}`
        );
        return {
          provider: "mobula",
          holders: data.data,
          total_count: data.total_count || 0,
        };
      }
    } catch (error) {
      console.warn(
        `[TokenAPI] Mobula holders failed for ${address}:`,
        error.message
      );
    }

    // Fallback to Moralis
    try {
      console.log(`[TokenAPI] Trying Moralis for holders: ${address}`);

      let endpoint;
      if (blockchain === "solana") {
        endpoint = `/token/mainnet/holders/${address}`;
      } else {
        endpoint = `/erc20/${address}/owners`;
      }

      const data = await this.makeMoralisRequest(
        endpoint,
        { limit, offset },
        blockchain
      );

      if (data) {
        console.log(
          `[TokenAPI] Successfully fetched holders from Moralis: ${address}`
        );
        return {
          provider: "moralis",
          holders: data.result || data,
          total_count: data.total || data.length || 0,
        };
      }
    } catch (error) {
      console.error(
        `[TokenAPI] Moralis holders also failed for ${address}:`,
        error.message
      );
    }

    throw new Error(`Holders data not available for token ${address}`);
  }

  /**
   * Get token transactions with fallback
   */
  async getTokenTransactions(address, limit = 50) {
    const blockchain = this.getBlockchainFromAddress(address);

    // Try Mobula first
    try {
      console.log(`[TokenAPI] Trying Mobula for transactions: ${address}`);
      const data = await this.makeMobulaRequest(`/market/trades`, {
        asset: address,
        limit,
      });

      if (data?.data && Array.isArray(data.data)) {
        const transactions = data.data.map((tx) => ({
          hash: tx.hash,
          timestamp: tx.date,
          type: tx.type,
          amount: tx.token_amount,
          amountUsd: tx.token_amount_usd,
          price: tx.token_price,
          sender: tx.sender,
        }));

        console.log(
          `[TokenAPI] Successfully fetched transactions from Mobula: ${address}`
        );
        return {
          provider: "mobula",
          transactions,
        };
      }
    } catch (error) {
      console.warn(
        `[TokenAPI] Mobula transactions failed for ${address}:`,
        error.message
      );
    }

    // Fallback to Moralis
    try {
      console.log(`[TokenAPI] Trying Moralis for transactions: ${address}`);

      let endpoint;
      if (blockchain === "solana") {
        endpoint = `/token/mainnet/${address}/swaps`;
      } else {
        endpoint = `/erc20/${address}/swaps`;
      }

      const data = await this.makeMoralisRequest(
        endpoint,
        { limit },
        blockchain
      );

      if (data?.result || data) {
        const swaps = data.result || data;
        const transactions = swaps.map((swap) => ({
          hash: swap.transaction_hash || swap.hash,
          timestamp: swap.block_timestamp || swap.timestamp,
          type: swap.from_token === address ? "sell" : "buy",
          amount: swap.from_amount || swap.amount,
          amountUsd: swap.from_amount_usd || swap.amount_usd,
          price: swap.price,
          sender: swap.from_address || swap.sender,
        }));

        console.log(
          `[TokenAPI] Successfully fetched transactions from Moralis: ${address}`
        );
        return {
          provider: "moralis",
          transactions,
        };
      }
    } catch (error) {
      console.error(
        `[TokenAPI] Moralis transactions also failed for ${address}:`,
        error.message
      );
    }

    throw new Error(`Transactions data not available for token ${address}`);
  }

  /**
   * Get API metrics for monitoring
   */
  getMetrics() {
    return apiKeyManager.getMetrics();
  }

  /**
   * Reset API metrics
   */
  resetMetrics() {
    return apiKeyManager.resetMetrics();
  }

  /**
   * Get multiple token prices using Moralis batch API
   */
  async getMultipleTokenPrices(addresses, blockchain = "ethereum") {
    try {
      console.log(
        `[TokenAPI] Fetching multiple token prices for ${addresses.length} tokens`
      );

      if (blockchain === "solana") {
        // For Solana, need to call individual endpoints (batch not available)
        const promises = addresses.map((address) =>
          this.makeMoralisRequest(
            `/token/mainnet/${address}/price`,
            {},
            "solana"
          ).catch((error) => ({ error: error.message, address }))
        );

        const results = await Promise.allSettled(promises);
        const prices = {};

        results.forEach((result, index) => {
          const address = addresses[index];
          if (result.status === "fulfilled" && !result.value.error) {
            prices[address] = result.value.usdPrice || 0;
          } else {
            prices[address] = 0;
          }
        });

        return { provider: "moralis", prices };
      } else {
        // For Ethereum, use the multiple token prices endpoint
        const data = await this.makeMoralisRequest(`/erc20/prices`, {
          tokens: addresses.map((addr) => ({ token_address: addr })),
        });

        const prices = {};
        if (data && Array.isArray(data)) {
          data.forEach((tokenPrice) => {
            prices[tokenPrice.token_address] = tokenPrice.usdPrice || 0;
          });
        }

        return { provider: "moralis", prices };
      }
    } catch (error) {
      console.error(
        `[TokenAPI] Failed to get multiple token prices:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get trending tokens using Moralis
   */
  async getTrendingTokens(limit = 20, chain = "eth") {
    try {
      console.log(`[TokenAPI] Fetching trending tokens for chain: ${chain}`);

      const data = await this.makeMoralisRequest(`/tokens/trending`, {
        limit,
        chain,
      });

      return {
        provider: "moralis",
        tokens: data || [],
      };
    } catch (error) {
      console.error(`[TokenAPI] Failed to get trending tokens:`, error.message);
      throw error;
    }
  }

  /**
   * Get top gainers using Moralis
   */
  async getTopGainers(limit = 20) {
    try {
      console.log(`[TokenAPI] Fetching top gainer tokens`);

      const data = await this.makeMoralisRequest(
        `/discovery/tokens/top-gainers`,
        {
          limit,
        }
      );

      return {
        provider: "moralis",
        tokens: data || [],
      };
    } catch (error) {
      console.error(`[TokenAPI] Failed to get top gainers:`, error.message);
      throw error;
    }
  }

  /**
   * Get token analytics using Moralis
   */
  async getTokenAnalytics(address) {
    const blockchain = this.getBlockchainFromAddress(address);

    try {
      console.log(`[TokenAPI] Fetching token analytics: ${address}`);

      const data = await this.makeMoralisRequest(
        `/tokens/${address}/analytics`,
        {},
        blockchain
      );

      return {
        provider: "moralis",
        analytics: data,
      };
    } catch (error) {
      console.error(
        `[TokenAPI] Failed to get token analytics for ${address}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get token swaps using Moralis
   */
  async getTokenSwaps(address, limit = 50) {
    const blockchain = this.getBlockchainFromAddress(address);

    try {
      console.log(`[TokenAPI] Fetching token swaps: ${address}`);

      let endpoint;
      if (blockchain === "solana") {
        endpoint = `/token/mainnet/${address}/swaps`;
      } else {
        endpoint = `/erc20/${address}/swaps`;
      }

      const data = await this.makeMoralisRequest(
        endpoint,
        { limit },
        blockchain
      );

      return {
        provider: "moralis",
        swaps: data?.result || data || [],
      };
    } catch (error) {
      console.error(
        `[TokenAPI] Failed to get token swaps for ${address}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Force switch to next API key for a provider
   */
  forceKeySwitch(provider) {
    return apiKeyManager.forceKeySwitch(provider);
  }

  /**
   * Get current provider health status
   */
  getProviderHealth() {
    return {
      mobula: apiKeyManager.isMobulaHealthy(),
      bestProvider: apiKeyManager.getBestProvider(),
      metrics: apiKeyManager.getMetrics(),
    };
  }
}

// Create singleton instance
const tokenApiService = new TokenApiService();

export default tokenApiService;
