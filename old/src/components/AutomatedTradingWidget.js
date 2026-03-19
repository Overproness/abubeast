"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AutomatedTradingWidget() {
  const { user, walletAddress } = useAuth();
  const [sessionKey, setSessionKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tradesCompleted: 0,
    dailyVolume: 0,
    remainingLimit: 0,
    profitLoss: 0,
  });

  useEffect(() => {
    if (walletAddress) {
      fetchSessionKeyStatus();
      // Refresh every 30 seconds
      const interval = setInterval(fetchSessionKeyStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const fetchSessionKeyStatus = async () => {
    try {
      const response = await fetch("/api/session-keys/list");
      if (response.ok) {
        const data = await response.json();
        const activeKey = data.sessionKeys?.find((key) => key.isActive);
        setSessionKey(activeKey);

        if (activeKey) {
          setStats({
            tradesCompleted: activeKey.usageStats?.transactionCount || 0,
            dailyVolume: activeKey.usageStats?.totalVolume || 0,
            remainingLimit:
              activeKey.permissions?.dailySpendingLimit -
                activeKey.usageStats?.todaySpending || 0,
            profitLoss: 125.45, // Mock data - would come from trading API
          });
        }
      }
    } catch (error) {
      console.error("Error fetching session key status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-lg p-6 border border-purple-100 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Automated Trading
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect your wallet to enable 24/7 automated trading with session
              keys.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              🔐 Secure • ⚡ Fast • 🎯 Customizable
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!sessionKey) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-lg p-6 border border-purple-100 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Automated Trading Inactive
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Set up automated trading to let our bot trade 24/7 on your behalf
              with custom limits and permissions.
            </p>
            <Link
              href="/trading/automated"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
            >
              <span>⚡</span>
              <span>Enable Automated Trading</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expiresIn = new Date(sessionKey.expiresAt) - new Date();
  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow-lg p-6 border border-green-200 dark:border-green-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Automated Trading Active
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bot is trading for you
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/trading/automated"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Manage →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Trades Today
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.tradesCompleted}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Daily Volume
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ${stats.dailyVolume.toFixed(0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Remaining Limit
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ${stats.remainingLimit.toFixed(0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Profit/Loss
          </div>
          <div
            className={`text-xl font-bold ${
              stats.profitLoss >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stats.profitLoss >= 0 ? "+" : ""}${stats.profitLoss.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expiration Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Session expires in:
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {daysLeft > 0 ? `${daysLeft} days` : `${hoursLeft} hours`}
          </div>
        </div>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(
                100,
                (expiresIn / (30 * 24 * 60 * 60 * 1000)) * 100
              )}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Permissions Display */}
      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Active Permissions:
        </div>
        <div className="flex flex-wrap gap-2">
          {sessionKey.permissions?.canTrade && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium rounded">
              Trading ✓
            </span>
          )}
          {sessionKey.permissions?.canSwap && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
              Swapping ✓
            </span>
          )}
          {sessionKey.permissions?.canStake && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
              Staking ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
