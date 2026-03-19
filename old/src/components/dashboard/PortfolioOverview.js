"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard, GradientText } from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PortfolioOverview() {
  const { walletInfo, isAuthenticated } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    topGainer: null,
    topLoser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (walletInfo?.address) {
      fetchPortfolioData();
    } else {
      setPortfolioData({
        totalValue: 125430.5,
        totalChange: 8742.3,
        totalChangePercent: 7.48,
        topGainer: { symbol: "PEPE", change: 23.45 },
        topLoser: { symbol: "DOGE", change: -12.32 },
        loading: false,
        error: null,
      });
    }
  }, [walletInfo]);

  const fetchPortfolioData = async () => {
    try {
      setPortfolioData((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `/api/portfolio?wallet=${walletInfo.address}&type=${walletInfo.networkType}`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio data");
      }

      const data = await response.json();

      let topGainer = null;
      let topLoser = null;

      if (data.holdings && data.holdings.length > 0) {
        const sortedByChange = data.holdings
          .filter((h) => h.pnlPercentage !== undefined)
          .sort((a, b) => b.pnlPercentage - a.pnlPercentage);

        topGainer = sortedByChange[0]
          ? {
              symbol: sortedByChange[0].symbol,
              change: sortedByChange[0].pnlPercentage,
            }
          : null;

        topLoser = sortedByChange[sortedByChange.length - 1]
          ? {
              symbol: sortedByChange[sortedByChange.length - 1].symbol,
              change: sortedByChange[sortedByChange.length - 1].pnlPercentage,
            }
          : null;
      }

      setPortfolioData({
        totalValue: data.totalBalance || 0,
        totalChange: data.totalPnL || 0,
        totalChangePercent: data.totalPnLPercentage || 0,
        topGainer,
        topLoser,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setPortfolioData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch portfolio data",
      }));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isPositive = portfolioData.totalChangePercent >= 0;

  if (portfolioData.loading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-6 bg-glass-bg rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-glass-bg rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-glass-bg rounded w-1/4"></div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Portfolio Overview</h2>
        <Badge variant="outline">
          <Wallet className="w-3 h-3 mr-1" />
          {walletInfo?.address ? "Connected" : "Demo Mode"}
        </Badge>
      </div>

      {/* Main Value */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">
          Total Portfolio Value
        </p>
        <p className="text-4xl font-bold">
          <GradientText>
            {formatCurrency(portfolioData.totalValue)}
          </GradientText>
        </p>
        <div
          className={`flex items-center gap-2 mt-2 ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">
            {isPositive ? "+" : ""}
            {formatCurrency(portfolioData.totalChange)}
          </span>
          <span className="text-sm">
            ({isPositive ? "+" : ""}
            {portfolioData.totalChangePercent.toFixed(2)}%)
          </span>
          <span className="text-muted-foreground text-sm">24h</span>
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-2 gap-4">
        {portfolioData.topGainer && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Top Gainer</span>
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </div>
            <p className="font-bold text-lg">
              {portfolioData.topGainer.symbol}
            </p>
            <p className="text-green-500 text-sm font-medium">
              +{portfolioData.topGainer.change.toFixed(2)}%
            </p>
          </div>
        )}
        {portfolioData.topLoser && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Top Loser</span>
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            </div>
            <p className="font-bold text-lg">{portfolioData.topLoser.symbol}</p>
            <p className="text-red-500 text-sm font-medium">
              {portfolioData.topLoser.change.toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
