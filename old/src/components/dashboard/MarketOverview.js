"use client";

import { Badge } from "@/components/ui/badge";
import { FeatureIcon, GlassCard, GradientText } from "@/components/ui/glass";
import {
  Activity,
  BarChart3,
  DollarSign,
  Gauge,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function MarketOverview() {
  const [marketData, setMarketData] = useState({
    btcPrice: 0,
    ethPrice: 0,
    totalMarketCap: 0,
    fearGreedIndex: 50,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setMarketData((prev) => ({ ...prev, loading: true, error: null }));

      const priceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
      );
      const priceData = await priceResponse.json();

      const globalResponse = await fetch(
        "https://api.coingecko.com/api/v3/global"
      );
      const globalData = await globalResponse.json();

      const fearGreedResponse = await fetch("https://api.alternative.me/fng/");
      const fearGreedData = await fearGreedResponse.json();

      setMarketData({
        btcPrice: priceData.bitcoin?.usd || 0,
        btcChange: priceData.bitcoin?.usd_24h_change || 0,
        ethPrice: priceData.ethereum?.usd || 0,
        ethChange: priceData.ethereum?.usd_24h_change || 0,
        solPrice: priceData.solana?.usd || 0,
        solChange: priceData.solana?.usd_24h_change || 0,
        totalMarketCap: globalData.data?.total_market_cap?.usd || 0,
        marketCapChange:
          globalData.data?.market_cap_change_percentage_24h_usd || 0,
        fearGreedIndex: parseInt(fearGreedData.data?.[0]?.value) || 50,
        fearGreedText:
          fearGreedData.data?.[0]?.value_classification || "Neutral",
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      setMarketData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch market data",
      }));
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPrice = (value) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getFearGreedColor = (index) => {
    if (index <= 25) return "text-red-500";
    if (index <= 45) return "text-orange-500";
    if (index <= 55) return "text-yellow-500";
    if (index <= 75) return "text-lime-500";
    return "text-green-500";
  };

  if (marketData.loading && marketData.btcPrice === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-glass-bg rounded mb-2 w-1/2"></div>
            <div className="h-8 bg-glass-bg rounded mb-1"></div>
            <div className="h-3 bg-glass-bg rounded w-1/3"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  const PriceCard = ({ name, symbol, price, change, icon }) => {
    const isPositive = change >= 0;
    return (
      <GlassCard className="p-5 hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FeatureIcon size="sm" size2={4}>
              {icon}
            </FeatureIcon>
            <span className="font-medium">{symbol}</span>
          </div>
          <Badge
            variant={isPositive ? "default" : "outline"}
            className={isPositive ? "" : "text-red-500 border-red-500"}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {change?.toFixed(2)}%
          </Badge>
        </div>
        <p className="text-2xl font-bold">
          <GradientText>{formatPrice(price)}</GradientText>
        </p>
        <p className="text-sm text-muted-foreground mt-1">{name}</p>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Market Overview</h2>
        <Badge variant="outline">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PriceCard
          name="Bitcoin"
          symbol="BTC"
          price={marketData.btcPrice}
          change={marketData.btcChange}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <PriceCard
          name="Ethereum"
          symbol="ETH"
          price={marketData.ethPrice}
          change={marketData.ethChange}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <PriceCard
          name="Solana"
          symbol="SOL"
          price={marketData.solPrice}
          change={marketData.solChange}
          icon={<DollarSign className="w-4 h-4" />}
        />

        {/* Fear & Greed Index */}
        <GlassCard className="p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FeatureIcon size="sm">
                <Gauge className="w-4 h-4" />
              </FeatureIcon>
              <span className="font-medium">Fear & Greed</span>
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${getFearGreedColor(
              marketData.fearGreedIndex
            )}`}
          >
            {marketData.fearGreedIndex}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {marketData.fearGreedText}
          </p>
        </GlassCard>
      </div>

      {/* Total Market Cap */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatureIcon>
              <BarChart3 className="w-4 h-4" />
            </FeatureIcon>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Crypto Market Cap
              </p>
              <p className="text-xl font-bold">
                <GradientText>
                  {formatCurrency(marketData.totalMarketCap)}
                </GradientText>
              </p>
            </div>
          </div>
          <Badge
            variant={marketData.marketCapChange >= 0 ? "default" : "outline"}
            className={
              marketData.marketCapChange >= 0
                ? ""
                : "text-red-500 border-red-500"
            }
          >
            {marketData.marketCapChange >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {marketData.marketCapChange >= 0 ? "+" : ""}
            {marketData.marketCapChange?.toFixed(2)}% (24h)
          </Badge>
        </div>
      </GlassCard>
    </div>
  );
}
