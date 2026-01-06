// SolanaTracker Client - JavaScript Port
// Port of monitor/solanatracker.rs

const axios = require("axios");
const {
  SOLANATRACKER_BASE_URL,
  BIRDEYE_BASE_URL,
  MOBULA_BASE_URL,
  getSolanaTrackerApiKey,
  getBirdeyeApiKey,
} = require("./config");

class SolanaTracker {
  constructor() {
    this.client = axios.create({
      timeout: 10000, // 10 second timeout
    });
    this.baseUrl = SOLANATRACKER_BASE_URL;
    this.solanaTrackerApiKey = getSolanaTrackerApiKey();
    this.birdeyeApiKey = getBirdeyeApiKey();
  }

  async getTokenHolders(tokenAddress, limit = 50) {
    // Try SolanaTracker first
    try {
      const holders = await this.getHoldersFromSolanaTracker(
        tokenAddress,
        limit
      );
      if (holders && holders.length > 0) {
        console.log("Successfully got holders from SolanaTracker");
        return holders;
      }
    } catch (error) {
      console.warn(`SolanaTracker failed: ${error.message}`);
    }

    // Try Birdeye as fallback
    if (this.birdeyeApiKey) {
      console.log("Trying Birdeye API...");
      try {
        const holders = await this.getHoldersFromBirdeye(tokenAddress, limit);
        if (holders && holders.length > 0) {
          console.log("Successfully got holders from Birdeye");
          return holders;
        }
      } catch (error) {
        console.warn(`Birdeye failed: ${error.message}`);
      }
    }

    // Try Mobula as final fallback
    console.log("Trying Mobula API...");
    try {
      const holders = await this.getHoldersFromMobula(tokenAddress, limit);
      if (holders && holders.length > 0) {
        console.log("Successfully got holders from Mobula");
        return holders;
      }
    } catch (error) {
      console.warn(`Mobula failed: ${error.message}`);
    }

    console.error(`All APIs failed for ${tokenAddress}`);
    return [];
  }

  async getHoldersFromSolanaTracker(tokenAddress, limit) {
    const url = `${this.baseUrl}/tokens/${tokenAddress}/holders`;

    const config = {};
    if (this.solanaTrackerApiKey) {
      config.headers = { "X-API-KEY": this.solanaTrackerApiKey };
    }

    const response = await this.client.get(url, config);
    const data = response.data;

    if (!data.accounts || !Array.isArray(data.accounts)) {
      throw new Error("No accounts found");
    }

    const holders = data.accounts
      .slice(0, limit)
      .filter((acc) => acc.wallet)
      .map((acc) => ({
        wallet: acc.wallet,
        amount: acc.amount || 0,
        percentage: acc.percentage || 0,
      }));

    return holders;
  }

  async getHoldersFromBirdeye(tokenAddress, limit) {
    const url = `${BIRDEYE_BASE_URL}/defi/v3/token/holder`;

    const config = {
      params: {
        address: tokenAddress,
        offset: 0,
        limit: limit,
      },
    };

    if (this.birdeyeApiKey) {
      config.headers = { "X-API-KEY": this.birdeyeApiKey };
    }

    const response = await this.client.get(url, config);
    const data = response.data;

    if (!data.success) {
      throw new Error("Birdeye API returned unsuccessful response");
    }

    if (!data.data?.items || !Array.isArray(data.data.items)) {
      throw new Error("No items found");
    }

    let holders = data.data.items
      .filter((item) => item.owner)
      .map((item) => ({
        wallet: item.owner,
        amount: item.ui_amount || 0,
        percentage: 0,
      }));

    // Sort by amount
    holders.sort((a, b) => b.amount - a.amount);
    holders = holders.slice(0, limit);

    return holders;
  }

  async getHoldersFromMobula(tokenAddress, limit) {
    const url = `${MOBULA_BASE_URL}/market/token/holders`;

    const config = {
      params: {
        asset: tokenAddress,
        blockchain: "solana",
        limit: limit,
      },
    };

    const response = await this.client.get(url, config);
    const data = response.data;

    let holdersArray;
    if (data.data && data.data.holders && Array.isArray(data.data.holders)) {
      holdersArray = data.data.holders;
    } else if (Array.isArray(data)) {
      holdersArray = data;
    } else {
      throw new Error("No holders found");
    }

    let holders = holdersArray
      .filter((holder) => holder.address || holder.wallet)
      .map((holder) => ({
        wallet: holder.address || holder.wallet,
        amount: holder.amount || holder.balance || 0,
        percentage: holder.percentage || 0,
      }));

    // Sort by amount
    holders.sort((a, b) => b.amount - a.amount);
    holders = holders.slice(0, limit);

    return holders;
  }
}

module.exports = { SolanaTracker };
