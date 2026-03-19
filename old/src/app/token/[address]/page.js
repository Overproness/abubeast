"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
  StatsCard,
} from "@/components/ui/glass";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import TokenChart from "../../../components/TokenChart";
import TokenInfo from "../../../components/TokenInfo";
import { formatCurrency } from "../../../lib/utils/tokenEnrichment";

export default function TokenDetail() {
  const { address } = useParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchTokenData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/tokens/${address}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.token) {
          setToken(data.token);
        } else {
          throw new Error(data.error || "Failed to fetch token data");
        }
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchTokenData();
    }
  }, [address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(token?.mint_address || address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTokenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <GradientOrb color="blue" className="w-[400px] h-[400px] opacity-20" />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen section-container py-20">
        <GradientOrb
          color="blue"
          className="w-[400px] h-[400px] top-0 left-0 opacity-10 fixed"
        />
        <GlassCard className="p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {error || "Token not found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load the token data. Please try again.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  const priceChange = token.price_change_24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen relative">
      <GradientOrb
        color="blue"
        className="w-[500px] h-[500px] top-0 left-0 opacity-10 fixed"
      />
      <GradientOrb
        color="violet"
        className="w-[400px] h-[400px] bottom-0 right-0 opacity-10 fixed"
      />

      <div className="section-container py-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Token Header */}
        <GlassCard className="p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              {token.logo_url ? (
                <img
                  src={token.logo_url}
                  alt={`${token.name || "Token"} logo`}
                  className="w-16 h-16 rounded-full ring-2 ring-primary/30"
                  onError={(e) => {
                    e.target.src = "/token-placeholder.png";
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(token.symbol || "?")[0]}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {token.name ||
                    token.symbol ||
                    formatTokenAddress(token.mint_address)}
                  <Badge variant="outline">{token.symbol || "Unknown"}</Badge>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-sm text-muted-foreground bg-glass-bg px-2 py-1 rounded font-mono">
                    {formatTokenAddress(token.mint_address)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <a
                    href={`https://solscan.io/token/${token.mint_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                <GradientText>
                  {token.price_usd
                    ? `$${Number(token.price_usd).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}`
                    : "N/A"}
                </GradientText>
              </p>
              <div
                className={`flex items-center justify-end gap-1 text-sm ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">24h</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Market Cap"
            value={token.market_cap ? formatCurrency(token.market_cap) : "N/A"}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatsCard
            title="24h Volume"
            value={token.volume_24h ? formatCurrency(token.volume_24h) : "N/A"}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <StatsCard
            title="Holders"
            value={token.holders?.toLocaleString() || "N/A"}
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title="Liquidity"
            value={token.liquidity ? formatCurrency(token.liquidity) : "N/A"}
            icon={<Wallet className="w-5 h-5" />}
          />
        </div>

        {/* Chart Section */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FeatureIcon>
              <BarChart3 className="w-4 h-4" />
            </FeatureIcon>
            Price Chart
          </h2>
          <div className="h-[400px]">
            <TokenChart tokenAddress={token.mint_address} />
          </div>
        </GlassCard>

        {/* Token Info */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FeatureIcon>
              <Clock className="w-4 h-4" />
            </FeatureIcon>
            Token Information
          </h2>
          <TokenInfo token={token} />
        </GlassCard>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/swap">
            <Button size="lg">Trade Token</Button>
          </Link>
          <Link href="/trading/automated">
            <Button variant="outline" size="lg">
              Set Up Auto-Trade
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
