"use client";

import { handleImageError } from "@/lib/utils/imageUtils";
import {
  formatCurrency,
  formatLargeNumber,
  formatPercentage,
} from "@/lib/utils/tokenEnrichment";
import Image from "next/image";
import { useState } from "react";

export default function TokenInfo({ token }) {
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  if (!token) return null;

  const { marketData } = token;

  // Get the logo from marketData or token properties
  const logoUrl =
    (marketData && marketData.logo) || token.logo || "/token-placeholder.png";

  const metrics = [
    {
      name: "Price",
      value: marketData?.price ? formatCurrency(marketData.price) : "N/A",
      change: marketData?.price_change_percentage_24h,
      changeFormatted: marketData?.price_change_percentage_24h
        ? formatPercentage(marketData.price_change_percentage_24h)
        : null,
    },
    {
      name: "Market Cap",
      value: marketData?.market_cap
        ? formatLargeNumber(marketData.market_cap)
        : "N/A",
    },
    {
      name: "24h Volume",
      value: marketData?.volume_24h
        ? formatLargeNumber(marketData.volume_24h)
        : "N/A",
    },
    {
      name: "Circulating Supply",
      value: marketData?.circulating_supply
        ? formatLargeNumber(marketData.circulating_supply)
        : "N/A",
    },
    {
      name: "Total Supply",
      value: marketData?.total_supply
        ? formatLargeNumber(marketData.total_supply)
        : "N/A",
    },
    {
      name: "Added",
      value: token.added_at
        ? new Date(token.added_at).toLocaleDateString()
        : "N/A",
    },
  ];

  // Advanced metrics that are shown when "Show More" is clicked
  const advancedMetrics = [
    {
      name: "Pool Address",
      value: token.pool_address ? (
        <a
          href={`https://etherscan.io/address/${token.pool_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {`${token.pool_address.substring(
            0,
            6
          )}...${token.pool_address.substring(token.pool_address.length - 4)}`}
        </a>
      ) : (
        "N/A"
      ),
    },
    {
      name: "Contract Address",
      value: token.mint_address ? (
        <a
          href={`https://etherscan.io/address/${token.mint_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {`${token.mint_address.substring(
            0,
            6
          )}...${token.mint_address.substring(token.mint_address.length - 4)}`}
        </a>
      ) : (
        "N/A"
      ),
    },
    {
      name: "Network",
      value: "Ethereum", // This should be dynamically determined based on the token
    },
    {
      name: "Last Updated",
      value: token.last_updated
        ? new Date(token.last_updated).toLocaleString()
        : "N/A",
    },
  ];

  const allMetrics = [...metrics, ...(showAllMetrics ? advancedMetrics : [])];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        {logoUrl && (
          <div className="mr-3">
            <Image
              src={logoUrl}
              alt={`${token.name || "Token"} logo`}
              width={32}
              height={32}
              className="rounded-full"
              onError={handleImageError}
            />
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Token Information
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 rounded-md p-4"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {metric.name}
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white mt-1">
              {metric.value}
            </div>
            {metric.changeFormatted && (
              <div
                className={`text-sm mt-1 ${
                  metric.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {metric.changeFormatted}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowAllMetrics(!showAllMetrics)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          {showAllMetrics ? "Show Less" : "Show More"}
        </button>
      </div>
    </div>
  );
}
