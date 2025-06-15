"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import {
  executeSwap,
  getAvailableChains,
  getAvailableTokens,
  getRoute,
} from "@/lib/services/lifiService";
import { useEffect, useState } from "react";

export default function AdvancedSwap() {
  const { walletInfo } = useAuth();
  const [chains, setChains] = useState([]);
  const [fromTokens, setFromTokens] = useState([]);
  const [toTokens, setToTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapInProgress, setSwapInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [fromChain, setFromChain] = useState("");
  const [toChain, setToChain] = useState("");
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0); // Default 1% slippage

  // Route info
  const [routeInfo, setRouteInfo] = useState(null);

  // Load available chains on component mount
  useEffect(() => {
    async function loadChains() {
      try {
        setLoading(true);
        const availableChains = await getAvailableChains();
        setChains(availableChains);

        // Default to the connected wallet's chain if available
        if (walletInfo && walletInfo.chainId) {
          const connectedChain = availableChains.find(
            (chain) => chain.id === walletInfo.chainId
          );
          if (connectedChain) {
            setFromChain(connectedChain.id);
            setToChain(connectedChain.id); // Default to same chain

            // Load tokens for selected chains
            const tokens = await getAvailableTokens(connectedChain.id);
            setFromTokens(tokens);
            setToTokens(tokens);
          }
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load blockchain networks. Please try again.");
        setLoading(false);
      }
    }

    loadChains();
  }, [walletInfo]);

  // Load tokens when chains are selected
  useEffect(() => {
    async function loadTokens() {
      if (fromChain) {
        try {
          const tokens = await getAvailableTokens(fromChain);
          setFromTokens(tokens);
        } catch (err) {
          setError("Failed to load source chain tokens.");
        }
      }

      if (toChain) {
        try {
          const tokens = await getAvailableTokens(toChain);
          setToTokens(tokens);
        } catch (err) {
          setError("Failed to load destination chain tokens.");
        }
      }
    }

    loadTokens();
  }, [fromChain, toChain]);

  // Find route when all params are set and amount changes
  useEffect(() => {
    async function findRoute() {
      if (
        fromChain &&
        toChain &&
        fromToken &&
        toToken &&
        amount &&
        !isNaN(parseFloat(amount))
      ) {
        try {
          setRouteInfo(null);

          const route = await getRoute({
            fromChainId: parseInt(fromChain),
            toChainId: parseInt(toChain),
            fromTokenAddress: fromToken,
            toTokenAddress: toToken,
            fromAmount: amount,
            fromAddress: walletInfo.address,
            slippage: slippage / 100,
          });

          if (route && route.routes && route.routes.length > 0) {
            setRouteInfo(route.routes[0]);
            setError(null);
          } else {
            setError(
              "No routes found for this swap. Try different tokens or amounts."
            );
          }
        } catch (err) {
          console.error("Route error:", err);
          setError(
            "Error finding swap route. Check your inputs and try again."
          );
        }
      }
    }

    const debounce = setTimeout(() => {
      if (
        fromChain &&
        toChain &&
        fromToken &&
        toToken &&
        amount &&
        !isNaN(parseFloat(amount))
      ) {
        findRoute();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [fromChain, toChain, fromToken, toToken, amount, slippage, walletInfo]);

  const handleSwap = async () => {
    if (!routeInfo) return;

    try {
      setSwapInProgress(true);
      setError(null);
      setSuccess(null);

      // Get signer from wallet - this will depend on the wallet type
      let signer;
      if (walletInfo.type === "phantom" && window.solana) {
        // Handle Phantom wallet signer
        // This might require adaptation based on how you've implemented the Phantom integration
        signer = window.solana;
      } else if (window.ethereum) {
        // Handle EVM wallet signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      }

      if (!signer) {
        throw new Error(
          "Unable to get wallet signer. Please reconnect your wallet."
        );
      }

      // Execute the swap
      const result = await executeSwap(routeInfo, signer);
      console.log("Swap executed:", result);

      setSuccess("Swap completed successfully!");
      setSwapInProgress(false);
    } catch (err) {
      console.error("Swap error:", err);
      setError(`Swap failed: ${err.message || "Unknown error"}`);
      setSwapInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Advanced Swap
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* From Section */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              From Chain
            </label>
          </div>
          <select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            disabled={swapInProgress}
          >
            <option value="">Select Source Chain</option>
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              From Token
            </label>
          </div>
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            disabled={!fromChain || swapInProgress}
          >
            <option value="">Select Token</option>
            {fromTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
          </div>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            disabled={!fromToken || swapInProgress}
          />
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              // Swap from/to chains and tokens
              const tempChain = fromChain;
              const tempToken = fromToken;
              setFromChain(toChain);
              setFromToken(toToken);
              setToChain(tempChain);
              setToToken(tempToken);
            }}
            className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full"
            disabled={swapInProgress}
          >
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              To Chain
            </label>
          </div>
          <select
            value={toChain}
            onChange={(e) => setToChain(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            disabled={swapInProgress}
          >
            <option value="">Select Destination Chain</option>
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              To Token
            </label>
          </div>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            disabled={!toChain || swapInProgress}
          >
            <option value="">Select Token</option>
            {toTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Settings */}
        <div className="pt-2">
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slippage Tolerance
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {slippage}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={swapInProgress}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Route Info */}
        {routeInfo && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Route Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Estimated Gas:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {routeInfo.gasCostUSD
                    ? `$${parseFloat(routeInfo.gasCostUSD).toFixed(2)}`
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Estimated Time:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {routeInfo.estimatedDuration
                    ? `${Math.ceil(routeInfo.estimatedDuration / 60)} minutes`
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Exchange Rate:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {routeInfo.toAmountMin && routeInfo.fromAmount
                    ? `1 ${routeInfo.fromToken?.symbol} ≈ ${(
                        parseFloat(routeInfo.toAmountMin) /
                        parseFloat(routeInfo.fromAmount)
                      ).toFixed(6)} ${routeInfo.toToken?.symbol}`
                    : "Calculating..."}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!routeInfo || swapInProgress || !walletInfo}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white mt-4
            ${
              !routeInfo || swapInProgress || !walletInfo
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            }`}
        >
          {swapInProgress ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing Swap
            </div>
          ) : !walletInfo ? (
            "Connect Wallet First"
          ) : !routeInfo ? (
            "Enter Swap Details"
          ) : (
            "Swap Tokens"
          )}
        </button>
      </div>
    </div>
  );
}
