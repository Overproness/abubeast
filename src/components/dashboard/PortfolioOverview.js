"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function PortfolioOverview() {
  const { walletInfo, isAuthenticated } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    topGainer: null,
    topLoser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (walletInfo?.address) {
      fetchPortfolioData();
    } else {
      // Set mock data if no wallet connected
      setPortfolioData({
        totalValue: 125430.5,
        totalChange: 8742.3,
        totalChangePercent: 7.48,
        topGainer: { symbol: "PEPE", change: 23.45 },
        topLoser: { symbol: "DOGE", change: -12.32 },
        loading: false,
        error: null,
      });
    }
  }, [walletInfo]);

  const fetchPortfolioData = async () => {
    try {
      setPortfolioData((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `/api/portfolio?wallet=${walletInfo.address}&type=${walletInfo.networkType}`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio data");
      }

      const data = await response.json();

      // Calculate top gainer and loser
      let topGainer = null;
      let topLoser = null;

      if (data.holdings && data.holdings.length > 0) {
        const sortedByChange = data.holdings
          .filter((h) => h.pnlPercentage !== undefined)
          .sort((a, b) => b.pnlPercentage - a.pnlPercentage);

        topGainer = sortedByChange[0]
          ? {
              symbol: sortedByChange[0].symbol,
              change: sortedByChange[0].pnlPercentage,
            }
          : null;

        topLoser = sortedByChange[sortedByChange.length - 1]
          ? {
              symbol: sortedByChange[sortedByChange.length - 1].symbol,
              change: sortedByChange[sortedByChange.length - 1].pnlPercentage,
            }
          : null;
      }

      setPortfolioData({
        totalValue: data.totalBalance || 0,
        totalChange: data.totalPnL || 0,
        totalChangePercent: data.totalPnLPercentage || 0,
        topGainer,
        topLoser,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setPortfolioData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch portfolio data",
      }));
    }
  };

  if (portfolioData.loading) {
    return (
      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Portfolio Overview
        </h2>
        {walletInfo?.address && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Live Data
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Value
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${portfolioData.totalValue.toLocaleString()}
          </p>
          <p
            className={`text-sm mt-1 ${
              portfolioData.totalChangePercent >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {portfolioData.totalChangePercent >= 0 ? "+" : ""}$
            {portfolioData.totalChange.toLocaleString()} (
            {portfolioData.totalChangePercent.toFixed(2)}%)
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Top Gainer
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {portfolioData.topGainer?.symbol || "N/A"}
          </p>
          {portfolioData.topGainer && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +{portfolioData.topGainer.change.toFixed(2)}%
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Top Loser
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {portfolioData.topLoser?.symbol || "N/A"}
          </p>
          {portfolioData.topLoser && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {portfolioData.topLoser.change.toFixed(2)}%
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-600 dark:text-gray-400">Portfolio Chart</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {walletInfo?.address
              ? "Real-time data"
              : "Connect wallet for live data"}
          </p>
        </div>
      </div>
    </div>
  );
}
