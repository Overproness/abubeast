"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function WalletStatus({ walletInfo }) {
  const [copied, setCopied] = useState(false);

  if (!walletInfo?.address) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletInfo.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getWalletIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "phantom":
        return "👻";
      case "solflare":
        return "🔥";
      case "metamask":
        return "🦊";
      default:
        return "💰";
    }
  };

  return (
    <GlassCard className="p-5 bg-gradient-to-br from-primary/5 to-purple-400/5 border-l-4 border-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-2xl">
            {getWalletIcon(walletInfo.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {walletInfo.type?.charAt(0).toUpperCase() +
                  walletInfo.type?.slice(1)}{" "}
                Connected
              </p>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-muted-foreground font-mono">
                {formatAddress(walletInfo.address)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={copyAddress}
              >
                {copied ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              <a
                href={`https://solscan.io/account/${walletInfo.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>
    </GlassCard>
  );
}
