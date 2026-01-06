// Data preparation and API utilities
// Equivalent to prepare.rs

import axios from "axios";
import { format } from "date-fns";

/**
 * Get current timestamp
 */
export function getTimestamp() {
  return format(new Date(), "HH:mm:ss.SSS");
}

/**
 * Get token data from DEX API
 * @param {string} token - Token mint address
 * @returns {Promise<{price: number, currentMarketCap: number}>}
 */
export async function getData(token) {
  console.log(`[${token}] Getting Data From DEX API...`);

  const baseUrl = `https://data.solanatracker.io/tokens/${token}`;

  try {
    const response = await axios.get(baseUrl, {
      headers: {
        "x-api-key": "d1fc458e-bdef-4309-971f-54238845c9c3",
      },
    });

    const data = response.data;

    const price = data?.pools?.[0]?.price?.usd || 0;
    const currentMarketCap = data?.pools?.[0]?.marketCap?.usd || 0;

    console.log(`Price: $${price}`);
    console.log(`Market Cap: $${currentMarketCap}`);

    return { price, currentMarketCap };
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP error: ${error.response.status} - Skipping token`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}
