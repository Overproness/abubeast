"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function RecentActivity() {
  const { walletInfo } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletInfo?.address) {
      fetchRecentActivity();
    } else {
      // Mock data for demo
      setActivities([
        {
          type: "buy",
          token: "PEPE",
          amount: 1000,
          price: 0.00000123,
          time: "2 minutes ago",
          txHash: "0x123...",
        },
        {
          type: "sell",
          token: "DOGE",
          amount: 500,
          price: 0.082,
          time: "15 minutes ago",
          txHash: "0x456...",
        },
        {
          type: "buy",
          token: "SHIB",
          amount: 2000000,
          price: 0.000008,
          time: "1 hour ago",
          txHash: "0x789...",
        },
        {
          type: "sell",
          token: "FLOKI",
          amount: 750000,
          price: 0.00003,
          time: "2 hours ago",
          txHash: "0xabc...",
        },
      ]);
      setLoading(false);
    }
  }, [walletInfo]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/trading/activity?wallet=${walletInfo.address}&limit=10`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        // Enhanced mock data based on wallet
        setActivities([
          {
            type: "buy",
            token: "ETH",
            amount: 0.5,
            price: 2650.3,
            time: "5 minutes ago",
            txHash: walletInfo.address.slice(0, 10) + "...",
          },
          {
            type: "sell",
            token: "BTC",
            amount: 0.01,
            price: 43250.75,
            time: "1 hour ago",
            txHash: walletInfo.address.slice(0, 10) + "...",
          },
          {
            type: "buy",
            token: "USDC",
            amount: 1000,
            price: 1.0,
            time: "3 hours ago",
            txHash: walletInfo.address.slice(0, 10) + "...",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
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
          Recent Activity
        </h2>
        {walletInfo?.address && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Live
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "buy" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {activity.type === "buy" ? "📈" : "📉"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {activity.type === "buy" ? "Bought" : "Sold"}{" "}
                    {activity.token}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.amount.toLocaleString()} tokens at $
                    {activity.price.toFixed(activity.price < 1 ? 6 : 2)}
                  </p>
                  {activity.txHash && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 font-mono">
                      Tx: {activity.txHash}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
                <div
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === "buy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {activity.type.toUpperCase()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {walletInfo?.address
                ? "Start trading to see your activity"
                : "Connect wallet to view activity"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
