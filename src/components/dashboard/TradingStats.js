"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function TradingStats() {
  const { walletInfo, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    avgReturn: 0,
    dailyVolume: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (walletInfo?.address) {
      fetchTradingStats();
    } else {
      // Set mock data if no wallet connected
      setStats({
        totalTrades: 247,
        successRate: 78.5,
        avgReturn: 12.3,
        dailyVolume: 45230.75,
        loading: false,
        error: null,
      });
    }
  }, [walletInfo]);

  const fetchTradingStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `/api/trading/stats?wallet=${walletInfo.address}`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          ...data,
          loading: false,
          error: null,
        });
      } else {
        // Handle error response
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch trading stats",
        }));
      }
    } catch (error) {
      console.error("Error fetching trading stats:", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch trading stats",
      }));
    }
  };

  if (stats.loading) {
    return (
      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Trading Stats
        </h3>
        {walletInfo?.address && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Live
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Trades</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {stats.totalTrades.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {stats.successRate.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Avg Return</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {stats.avgReturn.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Daily Volume</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${stats.dailyVolume.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
