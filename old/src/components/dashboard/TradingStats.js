"use client";

import { Badge } from "@/components/ui/badge";
import { FeatureIcon, GlassCard } from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function TradingStats() {
  const { walletInfo, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    avgReturn: 0,
    dailyVolume: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (walletInfo?.address) {
      fetchTradingStats();
    } else {
      setStats({
        totalTrades: 247,
        successRate: 78.5,
        avgReturn: 12.3,
        dailyVolume: 45230.75,
        loading: false,
        error: null,
      });
    }
  }, [walletInfo]);

  const fetchTradingStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `/api/trading/stats?wallet=${walletInfo.address}`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          ...data,
          loading: false,
          error: null,
        });
      } else {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch trading stats",
        }));
      }
    } catch (error) {
      console.error("Error fetching trading stats:", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch trading stats",
      }));
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  if (stats.loading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-6 bg-glass-bg rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-glass-bg rounded w-1/2"></div>
              <div className="h-4 bg-glass-bg rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  const statItems = [
    {
      label: "Total Trades",
      value: stats.totalTrades.toLocaleString(),
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-primary",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: <Target className="w-4 h-4" />,
      color: stats.successRate >= 50 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Avg Return",
      value: `${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn.toFixed(1)}%`,
      icon: <Percent className="w-4 h-4" />,
      color: stats.avgReturn >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "24h Volume",
      value: formatCurrency(stats.dailyVolume),
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-purple-400",
    },
  ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Trading Stats</h3>
        <Badge variant="outline">
          <TrendingUp className="w-3 h-3 mr-1" />
          {walletInfo?.address ? "Live" : "Demo"}
        </Badge>
      </div>

      <div className="space-y-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl bg-glass-bg/50 hover:bg-glass-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <FeatureIcon size="sm">{item.icon}</FeatureIcon>
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className={`font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {stats.error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-sm text-red-500">{stats.error}</p>
        </div>
      )}
    </GlassCard>
  );
}
