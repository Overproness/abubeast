"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeatureIcon, GlassCard, GradientText } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TokenDiscovery({ tokens, loading, onRefresh }) {
  const [tokenLimit, setTokenLimit] = useState(20);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

    if (searchTerm) {
      filtered = filtered.filter(
        (token) =>
          token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.mint_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBy === "processed") {
      filtered = filtered.filter((token) => token.processed);
    } else if (filterBy === "unprocessed") {
      filtered = filtered.filter((token) => !token.processed);
    }

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
    if (!value) return "N/A";
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (price < 0.00001) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FeatureIcon size="sm">
              <TrendingUp className="w-4 h-4" />
            </FeatureIcon>
            Token Discovery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Newly launched tokens on Solana
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{tokens.length} tokens</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`space-y-4 mb-6 ${showFilters ? "block" : "hidden"}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, symbol, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input text-sm px-3 py-1.5 rounded-lg"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="glass-input text-sm px-3 py-1.5 rounded-lg"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <select
              value={tokenLimit}
              onChange={(e) => setTokenLimit(parseInt(e.target.value))}
              className="glass-input text-sm px-3 py-1.5 rounded-lg"
            >
              {limitOptions.map((limit) => (
                <option key={limit} value={limit}>
                  {limit} tokens
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Token List */}
      {loading && tokens.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : displayTokens.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tokens found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTokens.map((token, index) => (
            <Link
              key={token.mint_address || index}
              href={`/token/${token.mint_address}`}
            >
              <div className="p-4 rounded-xl bg-glass-bg/50 hover:bg-glass-bg border border-transparent hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  {/* Token Logo */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white font-bold">
                    {token.logo_url ? (
                      <img
                        src={token.logo_url}
                        alt={token.symbol || "Token"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span style={{ display: token.logo_url ? "none" : "flex" }}>
                      {(token.symbol || "?")[0]}
                    </span>
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold group-hover:text-primary transition-colors">
                        {token.name || token.symbol || "Unknown Token"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {token.symbol || "???"}
                      </Badge>
                      {token.processed && (
                        <Badge className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                          Enriched
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(token.added_at || token.createdAt)}
                      </span>
                      {token.marketData?.market_cap && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {formatCurrency(token.marketData.market_cap)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold">
                      <GradientText>
                        {formatPrice(
                          token.marketData?.price || token.price_usd
                        )}
                      </GradientText>
                    </p>
                    {token.marketData?.price_change_24h !== undefined && (
                      <p
                        className={`text-sm flex items-center justify-end gap-1 ${
                          token.marketData.price_change_24h >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {token.marketData.price_change_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {token.marketData.price_change_24h >= 0 ? "+" : ""}
                        {token.marketData.price_change_24h.toFixed(2)}%
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {displayTokens.length < tokens.length && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setTokenLimit((prev) => prev + 20)}
          >
            Load More Tokens
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
