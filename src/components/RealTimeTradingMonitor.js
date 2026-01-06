"use client";

import { useEffect, useState } from "react";

export default function RealTimeTradingMonitor({ walletAddress }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTrades: 0,
    todayVolume: 0,
    todayProfit: 0,
    successRate: 0,
  });

  useEffect(() => {
    if (walletAddress) {
      fetchTrades();
      // Refresh every 10 seconds
      const interval = setInterval(fetchTrades, 10000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const fetchTrades = async () => {
    try {
      // This would connect to your real-time trading API
      // For now, using mock data
      const mockTrades = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 120000).toISOString(),
          tokenIn: "SOL",
          tokenOut: "USDC",
          amountIn: 0.5,
          amountOut: 75.5,
          status: "completed",
          profit: 2.5,
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          tokenIn: "USDC",
          tokenOut: "BONK",
          amountIn: 100,
          amountOut: 5000000,
          status: "completed",
          profit: 5.2,
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          tokenIn: "SOL",
          tokenOut: "RAY",
          amountIn: 1.2,
          amountOut: 45.3,
          status: "pending",
          profit: 0,
        },
      ];

      setTrades(mockTrades);
      setStats({
        activeTrades: mockTrades.filter((t) => t.status === "pending").length,
        todayVolume: mockTrades.reduce((acc, t) => acc + t.amountIn, 0),
        todayProfit: mockTrades.reduce((acc, t) => acc + t.profit, 0),
        successRate: 87.5,
      });
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🔴 Live Trading Monitor
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Active Trades
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
            {stats.activeTrades}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
            Today's Volume
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-200">
            ${stats.todayVolume.toFixed(0)}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Today's Profit
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
            ${stats.todayProfit.toFixed(2)}
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            Success Rate
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
            {stats.successRate}%
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Recent Trades
        </h4>
        <div className="space-y-3">
          {trades.slice(0, 5).map((trade) => (
            <div
              key={trade.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                trade.status === "completed"
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                  : "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {trade.tokenIn} → {trade.tokenOut}
                  </span>
                  {trade.status === "pending" && (
                    <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
                      Pending
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {trade.amountIn} {trade.tokenIn} →{" "}
                  {trade.amountOut.toFixed(2)} {trade.tokenOut}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatTime(trade.timestamp)}
                </div>
              </div>
              {trade.status === "completed" && (
                <div
                  className={`text-right ${
                    trade.profit > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <div className="font-bold">
                    {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                  </div>
                  <div className="text-xs">
                    {trade.profit > 0 ? "+" : ""}
                    {((trade.profit / trade.amountIn) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {trades.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No trades yet</p>
          <p className="text-sm mt-2">
            Authorize a session key to start automated trading
          </p>
        </div>
      )}
    </div>
  );
}
