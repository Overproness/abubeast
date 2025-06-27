"use client";

import { useEffect, useState } from "react";

export default function MarketOverview() {
  const [marketData, setMarketData] = useState({
    btcPrice: 0,
    ethPrice: 0,
    totalMarketCap: 0,
    fearGreedIndex: 50,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setMarketData((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch crypto prices from CoinGecko
      const priceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
      );
      const priceData = await priceResponse.json();

      // Fetch global market data
      const globalResponse = await fetch(
        "https://api.coingecko.com/api/v3/global"
      );
      const globalData = await globalResponse.json();

      // Fetch Fear & Greed Index
      const fearGreedResponse = await fetch("https://api.alternative.me/fng/");
      const fearGreedData = await fearGreedResponse.json();

      setMarketData({
        btcPrice: priceData.bitcoin?.usd || 0,
        btcChange: priceData.bitcoin?.usd_24h_change || 0,
        ethPrice: priceData.ethereum?.usd || 0,
        ethChange: priceData.ethereum?.usd_24h_change || 0,
        totalMarketCap: globalData.data?.total_market_cap?.usd || 0,
        marketCapChange:
          globalData.data?.market_cap_change_percentage_24h_usd || 0,
        fearGreedIndex: parseInt(fearGreedData.data?.[0]?.value) || 50,
        fearGreedText:
          fearGreedData.data?.[0]?.value_classification || "Neutral",
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      setMarketData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch market data",
      }));
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  if (marketData.loading && marketData.btcPrice === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Bitcoin Price
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(marketData.btcPrice)}
            </p>
            <p
              className={`text-sm ${
                marketData.btcChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercentage(marketData.btcChange)}
            </p>
          </div>
          <div className="text-3xl">₿</div>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Ethereum Price
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(marketData.ethPrice)}
            </p>
            <p
              className={`text-sm ${
                marketData.ethChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercentage(marketData.ethChange)}
            </p>
          </div>
          <div className="text-3xl">Ξ</div>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Market Cap
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(marketData.totalMarketCap)}
            </p>
            <p
              className={`text-sm ${
                marketData.marketCapChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatPercentage(marketData.marketCapChange)}
            </p>
          </div>
          <div className="text-3xl">📊</div>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Fear & Greed
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {marketData.fearGreedIndex}
            </p>
            <p
              className={`text-sm ${
                marketData.fearGreedIndex >= 75
                  ? "text-red-600"
                  : marketData.fearGreedIndex >= 50
                  ? "text-yellow-600"
                  : marketData.fearGreedIndex >= 25
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {marketData.fearGreedText}
            </p>
          </div>
          <div className="text-3xl">
            {marketData.fearGreedIndex >= 75
              ? "🤑"
              : marketData.fearGreedIndex >= 50
              ? "😊"
              : marketData.fearGreedIndex >= 25
              ? "😐"
              : "😨"}
          </div>
        </div>
      </div>
    </div>
  );
}
