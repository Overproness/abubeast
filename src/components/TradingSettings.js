"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function TradingSettings() {
  const {
    walletInfo,
    tradingPermissions,
    revokeTradingPermission,
    connectWallet,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [strategy, setStrategy] = useState("moderate");
  const [allowedTokens, setAllowedTokens] = useState("all");
  const [maxInvestmentPerToken, setMaxInvestmentPerToken] = useState(100);
  const [maxDailyInvestment, setMaxDailyInvestment] = useState(500);
  const [stopLossPercentage, setStopLossPercentage] = useState(15);
  const [takeProfitPercentage, setTakeProfitPercentage] = useState(25);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentWalletPermission, setCurrentWalletPermission] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      // Find permission for current wallet if connected
      if (walletInfo && walletInfo.address && tradingPermissions.length > 0) {
        const permission = tradingPermissions.find(
          (p) =>
            p.walletAddress.toLowerCase() === walletInfo.address.toLowerCase()
        );
        setCurrentWalletPermission(permission || null);

        // If permission found and has custom settings, use them
        if (permission?.customSettings) {
          const settings = permission.customSettings;
          setStrategy(settings.strategy || "moderate");
          setAllowedTokens(settings.allowedTokens || "all");
          setMaxInvestmentPerToken(settings.maxInvestmentPerToken || 100);
          setMaxDailyInvestment(settings.maxDailyInvestment || 500);
          setStopLossPercentage(settings.stopLossPercentage || 15);
          setTakeProfitPercentage(settings.takeProfitPercentage || 25);
        }
      }
      setIsLoading(false);
    };

    loadPermissions();
  }, [walletInfo, tradingPermissions]);

  const handleRequestPermission = async () => {
    try {
      if (!walletInfo) {
        setMessage({
          text: "Please connect a wallet first",
          type: "error",
        });
        return;
      }

      setIsUpdating(true);
      // Request trading permission with current wallet
      await connectWallet(walletInfo.type, true);
      setMessage({
        text: "Trading permission granted successfully",
        type: "success",
      });
    } catch (error) {
      setMessage({
        text: `Failed to get trading permission: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokePermission = async () => {
    try {
      if (!walletInfo || !walletInfo.address) {
        setMessage({
          text: "No wallet connected",
          type: "error",
        });
        return;
      }

      setIsUpdating(true);
      const success = await revokeTradingPermission(walletInfo.address);

      if (success) {
        setCurrentWalletPermission(null);
        setMessage({
          text: "Trading permission revoked successfully",
          type: "success",
        });
      } else {
        throw new Error("Failed to revoke permission");
      }
    } catch (error) {
      setMessage({
        text: `Error: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      if (!walletInfo || !walletInfo.address) {
        setMessage({
          text: "No wallet connected",
          type: "error",
        });
        return;
      }

      setIsUpdating(true);

      const settings = {
        strategy,
        allowedTokens,
        maxInvestmentPerToken: Number(maxInvestmentPerToken),
        maxDailyInvestment: Number(maxDailyInvestment),
        stopLossPercentage: Number(stopLossPercentage),
        takeProfitPercentage: Number(takeProfitPercentage),
      };

      const response = await fetch("/api/wallet/trading-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: walletInfo.address,
          settings,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setMessage({
          text: "Trading settings updated successfully",
          type: "success",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }
    } catch (error) {
      setMessage({
        text: `Error: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  // Define presets for the different strategies
  const strategyPresets = {
    conservative: {
      description:
        "Lower risk, lower potential returns. Focuses on established tokens with stronger fundamentals.",
      maxInvestment: 50,
      stopLoss: 10,
      takeProfit: 20,
    },
    moderate: {
      description:
        "Balanced approach. Mix of established tokens and promising new projects.",
      maxInvestment: 100,
      stopLoss: 15,
      takeProfit: 25,
    },
    aggressive: {
      description:
        "Higher risk, higher potential returns. Focus on new tokens with high growth potential.",
      maxInvestment: 200,
      stopLoss: 25,
      takeProfit: 50,
    },
  };

  const hasPermission = !!currentWalletPermission;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Automated Trading Settings
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {!walletInfo?.address ? (
        <div className="text-center py-6">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Please connect a wallet to manage automated trading settings
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 p-4 rounded-lg">
            <p>
              You need to connect your wallet first to enable automated trading.
            </p>
          </div>
        </div>
      ) : !hasPermission ? (
        <div>
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
              Enable Automated Trading
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Grant permission for AbuBeast to execute trades on your behalf.
              This allows our platform to automatically buy promising new tokens
              and sell them based on your strategy and settings.
            </p>
            <div className="flex items-center mt-2">
              <svg
                className="h-5 w-5 text-blue-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You'll need to sign a message with your wallet to verify
                ownership and grant permission.
              </p>
            </div>
          </div>

          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
            onClick={handleRequestPermission}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Requesting Permission...
              </>
            ) : (
              "Grant Trading Permission"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mr-3 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                Automated Trading Enabled
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Your wallet has granted permission for automated trading.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trading Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => {
                  setStrategy(e.target.value);
                  // Update other fields based on preset
                  const preset = strategyPresets[e.target.value];
                  if (preset) {
                    setMaxInvestmentPerToken(preset.maxInvestment);
                    setStopLossPercentage(preset.stopLoss);
                    setTakeProfitPercentage(preset.takeProfit);
                  }
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                disabled={isUpdating}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
                <option value="custom">Custom</option>
              </select>
              {strategy !== "custom" && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {strategyPresets[strategy]?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token Types
              </label>
              <select
                value={allowedTokens}
                onChange={(e) => setAllowedTokens(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                disabled={isUpdating}
              >
                <option value="all">All New Tokens</option>
                <option value="verified">Only Verified Tokens</option>
                <option value="trending">Only Trending Tokens</option>
                <option value="whitelisted">Only Whitelisted Tokens</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Investment Per Token ($)
                </label>
                <input
                  type="number"
                  value={maxInvestmentPerToken}
                  onChange={(e) => setMaxInvestmentPerToken(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  disabled={isUpdating || strategy !== "custom"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Daily Investment ($)
                </label>
                <input
                  type="number"
                  value={maxDailyInvestment}
                  onChange={(e) => setMaxDailyInvestment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  value={stopLossPercentage}
                  onChange={(e) => setStopLossPercentage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  disabled={isUpdating || strategy !== "custom"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  value={takeProfitPercentage}
                  onChange={(e) => setTakeProfitPercentage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  disabled={isUpdating || strategy !== "custom"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleUpdateSettings}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>

              <button
                onClick={handleRevokePermission}
                className="py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Revoke Trading Permission"
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              Important Notes:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                AbuBeast never has access to withdraw funds from your wallet
              </li>
              <li>We only execute trades based on your configured settings</li>
              <li>You can revoke trading permissions at any time</li>
              <li>
                All transactions will appear in your wallet for approval
                (depending on your wallet settings)
              </li>
              <li>
                Performance metrics and trading history will be available in the
                dashboard
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
