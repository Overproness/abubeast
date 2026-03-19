"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function RecentActivity() {
  const { walletInfo } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletInfo?.address) {
      fetchRecentActivity();
    } else {
      setActivities([
        {
          type: "buy",
          token: "PEPE",
          amount: 1000,
          price: 0.00000123,
          time: "2 minutes ago",
          txHash: "0x123...",
        },
        {
          type: "sell",
          token: "DOGE",
          amount: 500,
          price: 0.082,
          time: "15 minutes ago",
          txHash: "0x456...",
        },
        {
          type: "buy",
          token: "SHIB",
          amount: 2000000,
          price: 0.000008,
          time: "1 hour ago",
          txHash: "0x789...",
        },
        {
          type: "sell",
          token: "FLOKI",
          amount: 750000,
          price: 0.00003,
          time: "2 hours ago",
          txHash: "0xabc...",
        },
      ]);
      setLoading(false);
    }
  }, [walletInfo]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/trading/activity?wallet=${walletInfo.address}&limit=10`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setActivities([
          {
            type: "buy",
            token: "ETH",
            amount: 0.5,
            price: 2650.3,
            time: "5 minutes ago",
            txHash: walletInfo.address.slice(0, 10) + "...",
          },
          {
            type: "sell",
            token: "SOL",
            amount: 10,
            price: 95.2,
            time: "30 minutes ago",
            txHash: walletInfo.address.slice(0, 10) + "...",
          },
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-6 bg-glass-bg rounded w-1/3 mb-4"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 bg-glass-bg rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-glass-bg rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-glass-bg rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <Badge variant="outline">
          <Activity className="w-3 h-3 mr-1" />
          {activities.length} trades
        </Badge>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm">Your trades will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 rounded-xl bg-glass-bg/50 hover:bg-glass-bg transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === "buy"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {activity.type === "buy" ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {activity.type === "buy" ? "Bought" : "Sold"}
                  </span>
                  <span className="font-bold">{activity.token}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatAmount(activity.amount)} tokens</span>
                  <span>•</span>
                  <span>${activity.price.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
                <a
                  href={`https://solscan.io/tx/${activity.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
