"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";

export default function TokenDiscovery({ tokens, loading, onRefresh }) {
  const [tokenLimit, setTokenLimit] = useState(20);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "marketCap", label: "Market Cap" },
    { value: "volume", label: "Volume" },
    { value: "price", label: "Price" },
  ];

  const filterOptions = [
    { value: "all", label: "All Tokens" },
    { value: "processed", label: "Enriched Only" },
    { value: "unprocessed", label: "Pending Enrichment" },
  ];

  const limitOptions = [10, 20, 50, 100, 200];

  const filteredAndSortedTokens = () => {
    let filtered = [...tokens];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (token) =>
          token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.mint_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply processing filter
    if (filterBy === "processed") {
      filtered = filtered.filter((token) => token.processed);
    } else if (filterBy === "unprocessed") {
      filtered = filtered.filter((token) => !token.processed);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.added_at || b.createdAt) -
            new Date(a.added_at || a.createdAt)
          );
        case "oldest":
          return (
            new Date(a.added_at || a.createdAt) -
            new Date(b.added_at || b.createdAt)
          );
        case "marketCap":
          return (
            (b.marketData?.market_cap || 0) - (a.marketData?.market_cap || 0)
          );
        case "volume":
          return (
            (b.marketData?.volume_24h || 0) - (a.marketData?.volume_24h || 0)
          );
        case "price":
          return (b.marketData?.price || 0) - (a.marketData?.price || 0);
        default:
          return 0;
      }
    });

    return filtered.slice(0, tokenLimit);
  };

  const displayTokens = filteredAndSortedTokens();

  const formatCurrency = (value) => {
    if (!value || value === 0) return "N/A";
    if (value < 0.01) return `$${value.toFixed(8)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    if (value < 1000) return `$${value.toFixed(2)}`;
    return `$${value.toLocaleString()}`;
  };

  const formatLargeNumber = (value) => {
    if (!value || value === 0) return "N/A";
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "N/A";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Token Discovery
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>{displayTokens.length} tokens shown</span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {tokens.filter((t) => !t.processed).length} pending enrichment
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Data
            </>
          )}
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white dark:bg-gray-800"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Filter */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {filterOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white dark:bg-gray-800"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Limit */}
        <select
          value={tokenLimit}
          onChange={(e) => setTokenLimit(parseInt(e.target.value))}
          className="px-4 py-2 bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {limitOptions.map((limit) => (
            <option
              key={limit}
              value={limit}
              className="bg-white dark:bg-gray-800"
            >
              Show {limit}
            </option>
          ))}
        </select>
      </div>

      {/* Token Grid */}
      {loading && tokens.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : displayTokens.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No tokens found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm
              ? "Try adjusting your search or filters"
              : "New tokens will appear here as they are discovered"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayTokens.map((token, index) => (
            <div
              key={token.mint_address || index}
              className="group bg-white/5 dark:bg-black/5 rounded-2xl p-6 border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Token Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {token.marketData?.logo ? (
                    <img
                      src={token.marketData.logo}
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      display: token.marketData?.logo ? "none" : "flex",
                    }}
                  >
                    {token.symbol?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {token.symbol || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-20">
                      {token.name || "Unknown Token"}
                    </p>
                  </div>
                </div>

                <div
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    token.processed
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {token.processed ? "Enriched" : "Pending"}
                </div>
              </div>

              {/* Token Data */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Price
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(token.marketData?.price)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Market Cap
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatLargeNumber(token.marketData?.market_cap)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      24h Volume
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatLargeNumber(token.marketData?.volume_24h)}
                    </span>
                  </div>
                </div>

                {token.marketData?.price_change_percentage_24h !==
                  undefined && (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        24h Change
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          token.marketData.price_change_percentage_24h >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPercentage(
                          token.marketData.price_change_percentage_24h
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Token Address */}
              <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Address
                  </span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(token.mint_address)
                    }
                    className="text-xs font-mono text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                    title="Click to copy"
                  >
                    {token.mint_address?.slice(0, 6)}...
                    {token.mint_address?.slice(-4)}
                  </button>
                </div>
              </div>

              {/* Added time */}
              <div className="mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Added{" "}
                  {new Date(
                    token.added_at || token.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
