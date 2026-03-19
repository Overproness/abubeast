"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeatureIcon, GlassCard } from "@/components/ui/glass";
import { ArrowRight, Clock, Rocket, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TokenDiscoverySection({ recentTokens = [] }) {
  const displayTokens = recentTokens.slice(0, 5);

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FeatureIcon size="sm">
            <Rocket className="w-4 h-4" />
          </FeatureIcon>
          <h3 className="text-lg font-bold">New Token Launches</h3>
        </div>
        <Badge variant="outline">
          <Sparkles className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      {displayTokens.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Rocket className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No new tokens detected</p>
          <p className="text-sm">New launches will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTokens.map((token, index) => (
            <Link
              key={token.mint_address || index}
              href={`/token/${token.mint_address}`}
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-glass-bg/50 hover:bg-glass-bg transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {(token.symbol || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">
                    {token.symbol || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(token.added_at || token.createdAt)}
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link href="/dashboard" className="block mt-4">
        <Button variant="outline" className="w-full">
          View All Tokens
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </GlassCard>
  );
}
