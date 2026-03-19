"use client";

import WalletConnect from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import { GlassCard, GradientText } from "@/components/ui/glass";
import { RefreshCw } from "lucide-react";

export default function DashboardHeader({ userEmail, loading, onRefreshData }) {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            <GradientText>
              Welcome Back, {userEmail?.split("@")[0] || "Trader"}!
            </GradientText>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your comprehensive trading dashboard
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-muted-foreground">Market Open</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Last updated: {currentTime}
            </span>
          </div>
        </div>
        <div className="flex mt-6 md:mt-0 gap-3 items-center flex-wrap">
          <WalletConnect />
          <Button
            onClick={onRefreshData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
