"use client";

import { useAuth } from "@/context/AuthContext";
import bs58 from "bs58";
import { useState } from "react";

export default function SessionKeyAuthorization({ walletAddress, onSuccess }) {
  const { walletInfo } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState(null);
  const [pendingSessionKey, setPendingSessionKey] = useState(null);

  // Configuration state
  const [config, setConfig] = useState({
    name: "Trading Session",
    description: "Automated trading session for my wallet",
    expirationHours: 24,
    permissions: {
      canTrade: true,
      canSwap: true,
      canStake: false,
      canTransfer: false,
      maxTransactionAmount: 100,
      dailySpendingLimit: 1000,
    },
  });

  const handleGenerateSessionKey = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/session-keys/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          walletAddress,
          ...config,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate session key");
      }

      setPendingSessionKey({
        ...data.sessionKey,
        pendingAuthorization: data.pendingAuthorization,
      });
    } catch (err) {
      console.error("Error generating session key:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuthorizeSessionKey = async () => {
    try {
      setIsAuthorizing(true);
      setError(null);

      if (!pendingSessionKey) {
        throw new Error("No pending session key to authorize");
      }

      // Request signature from wallet
      if (!window.solana || !window.solana.signMessage) {
        throw new Error("Solana wallet not available");
      }

      const message = pendingSessionKey.message;
      const encodedMessage = new TextEncoder().encode(message);

      const { signature } = await window.solana.signMessage(
        encodedMessage,
        "utf8"
      );

      // Convert signature to base58
      const signatureBase58 = bs58.encode(signature);

      // Send authorization request to backend
      const response = await fetch("/api/session-keys/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          walletAddress,
          publicKey: pendingSessionKey.publicKey,
          signature: signatureBase58,
          message,
          encryptedData: pendingSessionKey.pendingAuthorization.encryptedData,
          iv: pendingSessionKey.pendingAuthorization.iv,
          authTag: pendingSessionKey.pendingAuthorization.authTag,
          expiresAt: pendingSessionKey.expiresAt,
          permissions: pendingSessionKey.permissions,
          name: config.name,
          description: config.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to authorize session key");
      }

      // Success!
      setPendingSessionKey(null);
      if (onSuccess) {
        onSuccess(data.sessionKey);
      }
    } catch (err) {
      console.error("Error authorizing session key:", err);
      setError(err.message);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const updatePermission = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Authorize Trading Bot
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!pendingSessionKey ? (
        <div className="space-y-6">
          {/* Session Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={config.description}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiration
            </label>
            <select
              value={config.expirationHours}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  expirationHours: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours (1 day)</option>
              <option value={72}>72 hours (3 days)</option>
              <option value={168}>168 hours (1 week)</option>
              <option value={720}>720 hours (30 days)</option>
            </select>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Permissions
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.permissions.canTrade}
                  onChange={(e) =>
                    updatePermission("canTrade", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow Trading
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.permissions.canSwap}
                  onChange={(e) =>
                    updatePermission("canSwap", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow Token Swaps
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.permissions.canStake}
                  onChange={(e) =>
                    updatePermission("canStake", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow Staking (Advanced)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.permissions.canTransfer}
                  onChange={(e) =>
                    updatePermission("canTransfer", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow Transfers (Not Recommended)
                </span>
              </label>
            </div>
          </div>

          {/* Spending Limits */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Spending Limits
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max per Transaction ($)
                </label>
                <input
                  type="number"
                  value={config.permissions.maxTransactionAmount || ""}
                  onChange={(e) =>
                    updatePermission(
                      "maxTransactionAmount",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daily Spending Limit ($)
                </label>
                <input
                  type="number"
                  value={config.permissions.dailySpendingLimit || ""}
                  onChange={(e) =>
                    updatePermission(
                      "dailySpendingLimit",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSessionKey}
            disabled={isGenerating || !walletAddress}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
          >
            {isGenerating ? "Generating..." : "Generate Session Key"}
          </button>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Security Notice:</strong> By authorizing a session key,
              you give our trading bot permission to execute transactions on
              your behalf within the limits you set. Your private key never
              leaves your wallet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Session Key Generated
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
              Please review the details and sign the message with your wallet to
              authorize this session key.
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Public Key:</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs break-all">
                  {pendingSessionKey.publicKey}
                </code>
              </div>
              <div>
                <strong>Expires:</strong>{" "}
                {new Date(pendingSessionKey.expiresAt).toLocaleString()}
              </div>
              <div>
                <strong>Permissions:</strong>{" "}
                {Object.entries(pendingSessionKey.permissions)
                  .filter(([k, v]) => typeof v === "boolean" && v)
                  .map(([k]) => k)
                  .join(", ")}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAuthorizeSessionKey}
              disabled={isAuthorizing}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
            >
              {isAuthorizing ? "Authorizing..." : "Sign & Authorize"}
            </button>
            <button
              onClick={() => setPendingSessionKey(null)}
              disabled={isAuthorizing}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
