"use client";

import { useEffect, useState } from "react";

export default function SessionKeyStatus({ walletAddress }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      fetchStatus();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/trading/execute?walletAddress=${walletAddress}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching session key status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
    );
  }

  if (!status?.canTrade) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
              Automated Trading Disabled
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              Authorize a session key to enable 24/7 automated trading
            </p>
          </div>
          <a
            href="/trading/automated"
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-md transition"
          >
            Enable
          </a>
        </div>
      </div>
    );
  }

  const { sessionKey } = status;
  const expiresAt = new Date(sessionKey.expiresAt);
  const now = new Date();
  const hoursRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60));

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-green-900 dark:text-green-200">
              Automated Trading Active
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 dark:text-green-400">
                Expires in:
              </span>
              <p className="font-semibold text-green-900 dark:text-green-200">
                {hoursRemaining > 24
                  ? `${Math.floor(hoursRemaining / 24)} days`
                  : `${hoursRemaining} hours`}
              </p>
            </div>

            {sessionKey.remainingDailyLimit !== null && (
              <div>
                <span className="text-green-700 dark:text-green-400">
                  Daily Limit Remaining:
                </span>
                <p className="font-semibold text-green-900 dark:text-green-200">
                  ${sessionKey.remainingDailyLimit.toFixed(2)}
                </p>
              </div>
            )}

            {sessionKey.usageStats && (
              <>
                <div>
                  <span className="text-green-700 dark:text-green-400">
                    Trades Today:
                  </span>
                  <p className="font-semibold text-green-900 dark:text-green-200">
                    {sessionKey.usageStats.transactionsCount || 0}
                  </p>
                </div>

                <div>
                  <span className="text-green-700 dark:text-green-400">
                    Total Volume:
                  </span>
                  <p className="font-semibold text-green-900 dark:text-green-200">
                    ${sessionKey.usageStats.totalVolume?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <a
          href="/trading/automated?tab=manage"
          className="ml-4 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
        >
          Manage
        </a>
      </div>
    </div>
  );
}
