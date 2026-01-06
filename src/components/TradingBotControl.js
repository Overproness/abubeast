"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function TradingBotControl() {
  const { user } = useAuth();
  const [botStatus, setBotStatus] = useState({
    tokenMonitoring: { running: false, processedTokens: 0 },
    emergencySell: { running: false },
  });
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBotStatus();
      fetchTradeHistory();

      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchBotStatus();
        fetchTradeHistory();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch("/api/trading/bot/start");
      if (response.ok) {
        const data = await response.json();
        setBotStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching bot status:", error);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const response = await fetch("/api/trading/history?limit=10");
      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error("Error fetching trade history:", error);
    }
  };

  const startBot = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trading/bot/start", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        await fetchBotStatus();
        alert("Trading bot started successfully!");
      } else {
        alert("Failed to start trading bot");
      }
    } catch (error) {
      console.error("Error starting bot:", error);
      alert("Error starting trading bot");
    } finally {
      setLoading(false);
    }
  };

  const stopBot = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trading/bot/start", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchBotStatus();
        alert("Trading bot stopped successfully!");
      } else {
        alert("Failed to stop trading bot");
      }
    } catch (error) {
      console.error("Error stopping bot:", error);
      alert("Error stopping trading bot");
    } finally {
      setLoading(false);
    }
  };

  const isRunning =
    botStatus.tokenMonitoring.running && botStatus.emergencySell.running;

  return (
    <div className="space-y-6">
      {/* Bot Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Automated Trading Bot
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isRunning ? "Running" : "Stopped"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
              Token Monitor
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {botStatus.tokenMonitoring.running ? "Active" : "Inactive"}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {botStatus.tokenMonitoring.processedTokens} tokens processed
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
              Emergency Sell
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
              {botStatus.emergencySell.running ? "Active" : "Inactive"}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              Monitoring positions
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={startBot}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {loading ? "Starting..." : "▶️ Start Bot"}
            </button>
          ) : (
            <button
              onClick={stopBot}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {loading ? "Stopping..." : "⏸️ Stop Bot"}
            </button>
          )}
        </div>

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>⚠️ Important:</strong> The bot will only trade for users who
            have authorized session keys with trading permissions. Make sure you
            have set appropriate spending limits and expiration times.
          </p>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Trades
        </h3>

        {trades.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No trades yet
          </p>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <div
                key={trade._id}
                className={`p-4 rounded-lg border ${
                  trade.status === "completed"
                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {trade.tradeType.toUpperCase()} -{" "}
                      {trade.status === "completed" ? "✅" : "❌"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trade.inputAmount?.toFixed(4)} SOL
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {trade.signature && (
                    <a
                      href={`https://solscan.io/tx/${trade.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View TX →
                    </a>
                  )}
                </div>
                {trade.error && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Error: {trade.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
