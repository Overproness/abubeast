"use client";

import { useEffect, useState } from "react";

export default function SessionKeyManager({ walletAddress }) {
  const [sessionKeys, setSessionKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      fetchSessionKeys();
    }
  }, [walletAddress]);

  const fetchSessionKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (walletAddress) {
        params.append("walletAddress", walletAddress);
      }

      const response = await fetch(`/api/session-keys/list?${params}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch session keys");
      }

      setSessionKeys(data.sessionKeys);
    } catch (err) {
      console.error("Error fetching session keys:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm("Are you sure you want to revoke this session key?")) {
      return;
    }

    try {
      const response = await fetch("/api/session-keys/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionKeyId: keyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke session key");
      }

      // Refresh the list
      fetchSessionKeys();
    } catch (err) {
      console.error("Error revoking session key:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading session keys...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Active Session Keys
        </h2>
        <button
          onClick={fetchSessionKeys}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition"
        >
          Refresh
        </button>
      </div>

      {sessionKeys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            No active session keys found.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Generate a new session key to enable automated trading.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessionKeys.map((key) => (
            <div
              key={key._id}
              className={`p-4 border rounded-lg ${
                key.isValid
                  ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {key.name}
                    </h3>
                    {key.isValid ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                        ACTIVE
                      </span>
                    ) : key.isExpired ? (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                        EXPIRED
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-600 text-white text-xs font-semibold rounded">
                        INACTIVE
                      </span>
                    )}
                  </div>

                  {key.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {key.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>Public Key:</strong>
                      <code className="ml-2 px-2 py-1 bg-white dark:bg-gray-900 rounded text-xs">
                        {key.publicKey.substring(0, 20)}...
                      </code>
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(key.createdAt)}
                    </div>
                    <div>
                      <strong>Expires:</strong> {formatDate(key.expiresAt)} (
                      {formatTimeRemaining(key.expiresAt)})
                    </div>
                    <div>
                      <strong>Permissions:</strong>{" "}
                      {Object.entries(key.permissions)
                        .filter(([k, v]) => typeof v === "boolean" && v)
                        .map(([k]) => k.replace("can", ""))
                        .join(", ")}
                    </div>
                    {key.permissions.maxTransactionAmount && (
                      <div>
                        <strong>Max per Transaction:</strong> $
                        {key.permissions.maxTransactionAmount}
                      </div>
                    )}
                    {key.permissions.dailySpendingLimit && (
                      <div>
                        <strong>Daily Limit:</strong> $
                        {key.permissions.dailySpendingLimit}
                      </div>
                    )}
                  </div>

                  {/* Usage Stats */}
                  {key.usageStats && key.usageStats.transactionsCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Usage:</strong>{" "}
                        {key.usageStats.transactionsCount} transactions |
                        Volume: ${key.usageStats.totalVolume.toFixed(2)}
                        {key.usageStats.lastUsedAt && (
                          <span>
                            {" "}
                            | Last used: {formatDate(key.usageStats.lastUsedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {key.isValid && (
                    <button
                      onClick={() => handleRevokeKey(key._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
