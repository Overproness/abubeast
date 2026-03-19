"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import WalletConnect from "@/components/WalletConnect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GradientOrb } from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeftRight,
  ArrowRight,
  Bot,
  Check,
  Copy,
  Globe,
  Lock,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SwapPage() {
  const { user, walletInfo, isAuthenticated, authChecked } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [Widget, setWidget] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadWidget = async () => {
      try {
        const { LiFiWidget } = await import("@lifi/widget");
        setWidget(() => LiFiWidget);
      } catch (error) {
        console.error("Failed to load LiFi Widget:", error);
      }
    };
    loadWidget();
  }, []);

  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        router.push("/auth/login?from=/swap");
      } else {
        setIsLoading(false);
      }
    }
  }, [authChecked, isAuthenticated, router]);

  const getWidgetConfig = () => {
    const config = {
      integrator: "AbuBeast",
      variant: "expandable",
      containerStyle: {
        border: "1px solid rgba(0, 200, 255, 0.1)",
        borderRadius: "20px",
        background: "transparent",
      },
      theme: {
        palette: {
          primary: { main: "#00C8FF" },
          secondary: { main: "#8A2BE2" },
          background: {
            paper: "transparent",
            default: "transparent",
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
      },
    };

    if (walletInfo) {
      if (walletInfo.type === "phantom") {
        config.walletManagement = {
          connect: {
            evm: { provider: window.ethereum },
            solana: { provider: window.solana },
          },
        };
      } else if (
        [
          "metamask",
          "coinbase",
          "bitget",
          "uniswap",
          "okx",
          "trustwallet",
        ].includes(walletInfo.type)
      ) {
        config.walletManagement = {
          connect: { evm: { provider: window.ethereum } },
        };
      } else if (walletInfo.type === "walletconnect" && walletInfo.wcProvider) {
        config.walletManagement = {
          connect: { evm: { provider: walletInfo.wcProvider } },
        };
      }
    }

    return config;
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !Widget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Swap"
        badgeIcon={<ArrowLeftRight className="w-4 h-4 mr-2" />}
        title="Cross-Chain Swap"
        subtitle="Swap tokens across different blockchains with best rates via DEX aggregation"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
        />
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-10 fixed"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Swap Widget */}
          <div className="lg:col-span-2">
            <GlassCard className="p-2 sm:p-4">
              {walletInfo?.address ? (
                <Widget config={getWidgetConfig()} />
              ) : (
                <div className="text-center py-16 px-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-6">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Connect Your Wallet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Connect your wallet to start swapping tokens across chains
                    with the best rates.
                  </p>
                  <WalletConnect />
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Info */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Trading Info</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Connected Wallet
                  </p>
                  {walletInfo?.address ? (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">
                        {walletInfo.address.slice(0, 6)}...
                        {walletInfo.address.slice(-4)}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="p-1.5 hover:bg-foreground/5 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not connected</span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Network Type
                  </p>
                  <p className="capitalize font-medium">
                    {walletInfo?.networkType || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Wallet Type
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {walletInfo?.type || "None"}
                  </Badge>
                </div>
              </div>
            </GlassCard>

            {/* Features */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Supported Features</h3>

              <div className="space-y-3">
                {[
                  {
                    icon: <Globe className="w-4 h-4" />,
                    text: "Cross-chain swaps",
                  },
                  {
                    icon: <ArrowLeftRight className="w-4 h-4" />,
                    text: "Bridge tokens",
                  },
                  {
                    icon: <Zap className="w-4 h-4" />,
                    text: "DEX aggregation",
                  },
                  {
                    icon: <Shield className="w-4 h-4" />,
                    text: "Secure transactions",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Automated Trading CTA */}
            <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-purple-400/10">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Want Automated Trading?</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Let our AI bot trade for you 24/7 with smart buy/sell
                strategies.
              </p>
              <Link href="/trading/automated">
                <Button className="w-full gap-2">
                  Enable Bot Trading
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </GlassCard>

            {/* Security Note */}
            <GlassCard className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Secure Swaps</p>
                  <p className="text-xs text-muted-foreground">
                    All swaps are executed through secure smart contracts. Your
                    private keys never leave your wallet.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
