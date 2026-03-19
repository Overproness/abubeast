"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import PortfolioChart from "@/components/PortfolioChart";
import WalletConnect from "@/components/WalletConnect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  StatsCard,
} from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatPercentage } from "@/lib/utils/tokenEnrichment";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Coins,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PortfolioPage() {
  const { user, walletInfo, isAuthenticated, authChecked } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        router.push("/auth/login?from=/portfolio");
      } else {
        fetchPortfolioData();
      }
    }
  }, [authChecked, isAuthenticated, router, walletInfo]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!walletInfo?.address) {
        setLoading(false);
        setPortfolioData(null);
        return;
      }

      const walletType = walletInfo.networkType || "solana";
      const response = await fetch(
        `/api/portfolio?wallet=${walletInfo.address}&type=${walletType}`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to fetch portfolio data");
      }

      const data = await response.json();
      setPortfolioData(data);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError(`Failed to load portfolio data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Portfolio"
        badgeIcon={<PieChart className="w-4 h-4 mr-2" />}
        title="Your Portfolio"
        subtitle="Track your Solana holdings and performance"
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

        {/* Wallet Connection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {walletInfo?.address ? (
              <GlassCard className="px-4 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Connected Wallet
                  </p>
                  <p className="font-mono text-sm">
                    {walletInfo.address.slice(0, 6)}...
                    {walletInfo.address.slice(-4)}
                  </p>
                </div>
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
              </GlassCard>
            ) : (
              <WalletConnect />
            )}
          </div>

          {walletInfo?.address && (
            <Button
              variant="outline"
              onClick={refreshPortfolio}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <GlassCard className="p-4 mb-8 border-error/50 bg-error/5">
            <div className="flex items-center gap-3 text-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          </GlassCard>
        )}

        {/* No Wallet Connected */}
        {!walletInfo?.address ? (
          <GlassCard className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your Solana wallet to view your portfolio balance,
              holdings, and performance.
            </p>
            <WalletConnect />
          </GlassCard>
        ) : portfolioData ? (
          <div className="space-y-8">
            {/* Portfolio Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Balance"
                value={formatCurrency(portfolioData.totalBalance || 0)}
                icon={<Wallet className="w-5 h-5" />}
              />
              <StatsCard
                title="Total P&L"
                value={formatCurrency(portfolioData.totalPnL || 0)}
                change={portfolioData.totalPnL >= 0 ? "+gain" : "-loss"}
                icon={
                  portfolioData.totalPnL >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )
                }
              />
              <StatsCard
                title="Total Return"
                value={formatPercentage(portfolioData.totalPnLPercentage || 0)}
                change={
                  portfolioData.totalPnLPercentage >= 0 ? "+gain" : "-loss"
                }
                icon={<ArrowUpRight className="w-5 h-5" />}
              />
              <StatsCard
                title="Total Tokens"
                value={portfolioData.tokenCount || 0}
                icon={<Coins className="w-5 h-5" />}
              />
            </div>

            {/* Portfolio Chart */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Portfolio Performance
              </h3>
              <div className="h-[300px]">
                <PortfolioChart data={portfolioData.chartData} />
              </div>
            </GlassCard>

            {/* Token Holdings */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Token Holdings</h3>
                <Badge variant="outline">
                  {portfolioData.tokens?.length || 0} tokens
                </Badge>
              </div>

              {portfolioData.tokens && portfolioData.tokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Token
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Balance
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Price
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Value
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          24h Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioData.tokens.map((token, index) => (
                        <tr
                          key={token.mint || index}
                          className="border-b border-border/30 hover:bg-foreground/5 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {token.logo ? (
                                <img
                                  src={token.logo}
                                  alt={token.symbol}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                  {token.symbol?.charAt(0) || "?"}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{token.symbol}</p>
                                <p className="text-xs text-muted-foreground">
                                  {token.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono">
                            {token.balance?.toLocaleString() || "0"}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {formatCurrency(token.price || 0)}
                          </td>
                          <td className="py-4 px-4 text-right font-medium">
                            {formatCurrency(token.value || 0)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span
                              className={`flex items-center justify-end gap-1 ${
                                token.change24h >= 0
                                  ? "text-success"
                                  : "text-error"
                              }`}
                            >
                              {token.change24h >= 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {formatPercentage(Math.abs(token.change24h || 0))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No tokens found in this wallet
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6" hover>
                <div className="flex items-center gap-4 mb-4">
                  <FeatureIcon>
                    <TrendingUp className="w-5 h-5" />
                  </FeatureIcon>
                  <div>
                    <h4 className="font-semibold">Start Trading</h4>
                    <p className="text-sm text-muted-foreground">
                      Swap tokens with our DEX aggregator
                    </p>
                  </div>
                </div>
                <Link href="/swap">
                  <Button variant="outline" className="w-full gap-2">
                    Go to Swap
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>

              <GlassCard className="p-6" hover>
                <div className="flex items-center gap-4 mb-4">
                  <FeatureIcon>
                    <Lock className="w-5 h-5" />
                  </FeatureIcon>
                  <div>
                    <h4 className="font-semibold">Automated Trading</h4>
                    <p className="text-sm text-muted-foreground">
                      Let our AI bot trade for you 24/7
                    </p>
                  </div>
                </div>
                <Link href="/trading/automated">
                  <Button className="w-full gap-2">
                    Enable Bot
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            </div>
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading portfolio data...</p>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
