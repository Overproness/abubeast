"use client";

import { Badge } from "@/components/ui/badge";
import { FeatureIcon, GlassCard } from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRightLeft,
  BarChart3,
  Bot,
  Settings,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const { walletInfo } = useAuth();

  const actions = [
    {
      title: "Swap Tokens",
      description: "Exchange tokens instantly",
      href: "/swap",
      icon: <ArrowRightLeft className="w-5 h-5" />,
      enabled: true,
    },
    {
      title: "Automated Trading",
      description: "Set up AI trading bot",
      href: "/trading/automated",
      icon: <Bot className="w-5 h-5" />,
      enabled: !!walletInfo?.address,
      requiresWallet: true,
    },
    {
      title: "View Portfolio",
      description: "Track your holdings",
      href: "/portfolio",
      icon: <BarChart3 className="w-5 h-5" />,
      enabled: true,
    },
    {
      title: "Settings",
      description: "Configure preferences",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
      enabled: true,
    },
  ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Quick Actions</h3>
        <Zap className="w-5 h-5 text-primary" />
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.enabled ? action.href : "#"}>
            <div
              className={`p-4 rounded-xl border transition-all duration-200 group ${
                action.enabled
                  ? "bg-glass-bg/50 border-glass-border hover:border-primary/50 cursor-pointer hover:bg-glass-bg"
                  : "bg-glass-bg/20 border-glass-border/50 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <FeatureIcon size="sm">{action.icon}</FeatureIcon>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      action.enabled
                        ? "group-hover:text-primary transition-colors"
                        : ""
                    }`}
                  >
                    {action.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                {action.requiresWallet && !walletInfo?.address && (
                  <Badge variant="outline" className="text-xs">
                    <Wallet className="w-3 h-3 mr-1" />
                    Connect Wallet
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!walletInfo?.address && (
        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to unlock all features
          </p>
        </div>
      )}
    </GlassCard>
  );
}
