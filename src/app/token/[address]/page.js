"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import TokenChart from "../../../components/TokenChart";
import TokenInfo from "../../../components/TokenInfo";
import { formatCurrency } from "../../../lib/utils/tokenEnrichment";

export default function TokenDetail() {
  const { address } = useParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTokenData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/tokens/${address}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Token data fetched:", data);

        if (data.success && data.token) {
          setToken(data.token);
        } else {
          throw new Error(data.error || "Failed to fetch token data");
        }
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchTokenData();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl text-red-500 mb-4">
          {error || "Token not found"}
        </h2>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Token Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            {token.logo_url && (
              <img
                src={token.logo_url}
                alt={`${token.name || "Token"} logo`}
                className="w-10 h-10 mr-3 rounded-full"
                onError={(e) => {
                  e.target.src = "/token-placeholder.png";
                }}
              />
            )}
            {token.name ||
              token.symbol ||
              token.mint_address.substring(0, 8) + "..."}
          </h1>
          <div className="flex items-center mt-2">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-medium mr-2">
              {token.symbol || "Unknown"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {`${token.mint_address.substring(
                0,
                6
              )}...${token.mint_address.substring(
                token.mint_address.length - 4
              )}`}
            </span>
          </div>
        </div>

        <div className="md:ml-auto mt-4 md:mt-0 flex items-center">
          {token.marketData && token.marketData.price ? (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(token.marketData.price)}
              </div>
              <div
                className={`text-sm ${
                  (token.marketData.price_change_percentage_24h || 0) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(token.marketData.price_change_percentage_24h || 0) >= 0
                  ? "▲"
                  : "▼"}
                {Math.abs(
                  token.marketData.price_change_percentage_24h || 0
                ).toFixed(2)}
                % (24h)
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                Price N/A
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                No price data available
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <TokenChart tokenAddress={address} />
      </div>

      {/* Token Info Cards */}
      <TokenInfo token={token} />

      {/* Swap Button */}
      {token && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push(`/swap?fromToken=${token.mint_address}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Swap
          </button>
          <Link
            href={`https://etherscan.io/address/${token.mint_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg flex items-center"
          >
            View on Etherscan
          </Link>
        </div>
      )}
    </div>
  );
}
