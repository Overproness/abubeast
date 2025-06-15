// This file contains utilities for enriching token data

/**
 * Formats market data for display
 * @param {Object} marketData - Raw market data from API
 * @returns {Object} Formatted market data
 */
export function formatMarketData(marketData) {
  console.log("🚀 ~ formatMarketData ~ marketData:", marketData);
  if (!marketData) return null;

  return {
    price: formatCurrency(marketData.price),
    marketCap: formatLargeNumber(marketData.market_cap),
    volume24h: formatLargeNumber(marketData.volume || marketData.volume_24h),
    liquidity: formatLargeNumber(marketData.liquidity),
    priceChange: {
      "1h": formatPercentage(marketData.price_change_1h),
      "24h": formatPercentage(
        marketData.price_change_24h || marketData.price_change_percentage_24h
      ),
      "7d": formatPercentage(marketData.price_change_7d),
    },
    // Add logo URL if available
    logo:
      marketData.logo || (marketData.native && marketData.native.logo) || "",
    // Add token name and symbol if available
    name: marketData.name || "",
    symbol: marketData.symbol || "",
  };
}

/**
 * Format a number as currency
 * @param {number} value
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
  if (value === undefined || value === null) return "N/A";

  // Handle different value ranges appropriately
  if (value < 0.01) {
    return `$${value.toFixed(8)}`;
  } else if (value < 1) {
    return `$${value.toFixed(4)}`;
  } else if (value < 1000) {
    return `$${value.toFixed(2)}`;
  } else {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Format a number with abbreviations (K, M, B)
 * @param {number} value
 * @returns {string} Formatted number
 */
export function formatLargeNumber(value) {
  if (value === undefined || value === null) return "N/A";

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Format a number as percentage
 * @param {number} value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  if (value === undefined || value === null) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
