"use client";

import AutomatedTradingWidget from "@/components/AutomatedTradingWidget";
import MarketOverview from "@/components/dashboard/MarketOverview";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TradingStats from "@/components/dashboard/TradingStats";
import DexScreenerChart from "@/components/DexScreenerChart";
import TokenTable from "@/components/TokenTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GradientOrb, GradientText } from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  // State management
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    topGainer: null,
    topLoser: null,
  });
  const [tradingStats, setTradingStats] = useState({
    totalTrades: 0,
    successRate: 0,
    avgReturn: 0,
    dailyVolume: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [marketOverview, setMarketOverview] = useState({
    btcPrice: 0,
    ethPrice: 0,
    totalMarketCap: 0,
    fearGreedIndex: 50,
  });

  // Auth and routing
  const {
    user,
    isAuthenticated,
    authChecked,
    loading: authLoading,
    forceAuthWithCookie,
    walletInfo,
  } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const router = useRouter();
  const initialized = useRef(false);
  const userEmailRef = useRef("");
  const authTimeoutRef = useRef(null);
  const maxRetries = useRef(0);
  const headerChecked = useRef(false);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Save user's email to a ref to avoid unnecessary re-renders
  useEffect(() => {
    if (user?.email) {
      userEmailRef.current = user.email;
    }
  }, [user]);

  // Auth check and redirect logic
  useEffect(() => {
    let isMounted = true;

    const checkAuthHeaders = async () => {
      if (headerChecked.current || initialized.current) return;
      headerChecked.current = true;

      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && !initialized.current) {
            console.log("[Dashboard] Auth verified via API");
            initialized.current = true;
            await initializeDashboard();
          }
        }
      } catch (error) {
        console.log("[Dashboard] Auth check via API failed:", error);
      }
    };

    const checkAndInitialize = async () => {
      if (!isMounted || redirectAttempted) return;

      if (authChecked && isAuthenticated && !initialized.current) {
        console.log("[Dashboard] Auth check completed - authenticated");
        initialized.current = true;
        await initializeDashboard();
      } else if (authChecked && !isAuthenticated && !authLoading) {
        if (maxRetries.current < 2) {
          maxRetries.current += 1;
          console.log(`[Dashboard] Auth check retry ${maxRetries.current}/2`);

          try {
            await forceAuthWithCookie();

            const cookies = document.cookie.split(";").map((c) => c.trim());
            const hasTokenCookie = cookies.some((c) => c.startsWith("token="));

            if (hasTokenCookie && !initialized.current) {
              console.log("[Dashboard] Found token cookie, proceeding");
              initialized.current = true;
              await initializeDashboard();
              return;
            }
          } catch (error) {
            console.error("[Dashboard] Force auth failed:", error);
          }
        } else if (!redirectAttempted) {
          console.log("[Dashboard] Max retries reached, redirecting");
          setRedirectAttempted(true);
          router.push("/auth/login?from=/dashboard&reason=notauthenticated");
          return;
        }
      }
    };

    checkAuthHeaders();
    checkAndInitialize();

    const checkInterval = setInterval(() => {
      if (
        isMounted &&
        !initialized.current &&
        !redirectAttempted &&
        maxRetries.current < 3
      ) {
        checkAndInitialize();
      } else {
        clearInterval(checkInterval);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    };
  }, [
    authChecked,
    isAuthenticated,
    authLoading,
    router,
    redirectAttempted,
    user,
    forceAuthWithCookie,
  ]);

  // Initialize dashboard data
  async function initializeDashboard() {
    try {
      setLoading(true);
      await Promise.all([
        fetchTokens(),
        fetchPortfolioData(),
        fetchTradingStats(),
        fetchRecentActivity(),
        fetchMarketData(),
      ]);
    } catch (err) {
      console.error("[Dashboard] Error initializing dashboard:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Data fetching functions
  async function fetchTokens() {
    try {
      console.log("[Dashboard] Fetching tokens...");
      const response = await fetch("/api/tokens?limit=50", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const tokensArray = Array.isArray(data) ? data : data.tokens || [];
      const limitedTokens = tokensArray.slice(0, 50);
      setTokens(limitedTokens);
    } catch (error) {
      console.error("[Dashboard] Error fetching tokens:", error);
      setTokens([]);
    }
  }

  async function fetchPortfolioData() {
    setPortfolioData({
      totalValue: 15420.5,
      totalChange: 245.67,
      totalChangePercent: 1.62,
      topGainer: { symbol: "SOL", change: 8.45 },
      topLoser: { symbol: "ADA", change: -2.31 },
    });
  }

  async function fetchTradingStats() {
    setTradingStats({
      totalTrades: 47,
      successRate: 73.4,
      avgReturn: 4.2,
      dailyVolume: 12450,
    });
  }

  async function fetchRecentActivity() {
    setRecentActivity([
      {
        id: 1,
        type: "buy",
        token: "SOL",
        amount: 2.5,
        price: 98.45,
        time: "2 min ago",
      },
      {
        id: 2,
        type: "sell",
        token: "ETH",
        amount: 0.8,
        price: 2340.12,
        time: "1 hour ago",
      },
      {
        id: 3,
        type: "swap",
        token: "BTC",
        amount: 0.05,
        price: 43250.0,
        time: "3 hours ago",
      },
    ]);
  }

  async function fetchMarketData() {
    setMarketOverview({
      btcPrice: 43250,
      ethPrice: 2340,
      totalMarketCap: 1650000000000,
      fearGreedIndex: 72,
    });
  }

  // Event handlers
  const refreshTokenData = async () => {
    await initializeDashboard();
  };

  const handleTokenClick = (tokenAddress, chain = "solana") => {
    setSelectedToken(tokenAddress);
    setSelectedChain(chain);
  };

  const closeChart = () => {
    setSelectedToken(null);
    setSelectedChain(null);
  };

  // Loading state
  if (
    !authChecked ||
    authLoading ||
    (!isAuthenticated && !redirectAttempted && maxRetries.current < 2)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <GlassCard className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/20 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refreshTokenData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <GradientOrb
        color="blue"
        className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
      />
      <GradientOrb
        color="violet"
        className="w-[400px] h-[400px] bottom-0 left-0 opacity-10 fixed"
      />

      <div className="relative z-10 section-container py-8">
        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Dashboard Header */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back,{" "}
                <GradientText>
                  {userEmailRef.current?.split("@")[0] || "Trader"}
                </GradientText>
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your portfolio today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={refreshTokenData}
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button className="gap-2" asChild>
                <a href="/trading/automated">
                  <Bot className="w-4 h-4" />
                  Auto Trade
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Wallet Status */}
          {walletInfo && walletInfo.address && (
            <motion.div variants={fadeInUp}>
              <GlassCard className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Connected Wallet
                    </p>
                    <p className="font-mono text-sm">
                      {walletInfo.address.slice(0, 8)}...
                      {walletInfo.address.slice(-8)}
                    </p>
                  </div>
                </div>
                <Badge variant="gradient">Active</Badge>
              </GlassCard>
            </motion.div>
          )}

          {/* Stats Overview */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Portfolio Value */}
              <GlassCard className="p-6" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <Badge
                    variant={
                      portfolioData.totalChangePercent >= 0
                        ? "success"
                        : "destructive"
                    }
                  >
                    {portfolioData.totalChangePercent >= 0 ? "+" : ""}
                    {portfolioData.totalChangePercent}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold gradient-text">
                  ${portfolioData.totalValue.toLocaleString()}
                </p>
                <p
                  className={`text-sm mt-1 flex items-center gap-1 ${
                    portfolioData.totalChange >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {portfolioData.totalChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  ${Math.abs(portfolioData.totalChange).toLocaleString()}
                </p>
              </GlassCard>

              {/* Total Trades */}
              <GlassCard className="p-6" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-success" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{tradingStats.totalTrades}</p>
                <p className="text-sm mt-1 text-muted-foreground">This month</p>
              </GlassCard>

              {/* Success Rate */}
              <GlassCard className="p-6" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-400/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {tradingStats.successRate}%
                </p>
                <p className="text-sm mt-1 text-success">
                  +2.4% from last week
                </p>
              </GlassCard>

              {/* Daily Volume */}
              <GlassCard className="p-6" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400/20 to-yellow-400/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Daily Volume</p>
                <p className="text-2xl font-bold">
                  ${tradingStats.dailyVolume.toLocaleString()}
                </p>
                <p className="text-sm mt-1 text-muted-foreground">
                  Average return: {tradingStats.avgReturn}%
                </p>
              </GlassCard>
            </div>
          </motion.div>

          {/* Automated Trading Widget */}
          <motion.div variants={fadeInUp}>
            <AutomatedTradingWidget />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts & Market Overview */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={fadeInUp}>
                <MarketOverview marketData={marketOverview} />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <PortfolioOverview portfolioData={portfolioData} />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <TradingStats stats={tradingStats} />
              </motion.div>
            </div>

            {/* Right Column - Quick Actions & Recent Activity */}
            <div className="space-y-6">
              <motion.div variants={fadeInUp}>
                <QuickActions />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <RecentActivity activities={recentActivity} />
              </motion.div>
            </div>
          </div>

          {/* Token Table */}
          <motion.div variants={fadeInUp}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Market Overview</h2>
                  <p className="text-sm text-muted-foreground">
                    Track and trade tokens in real-time
                  </p>
                </div>
                <Badge variant="gradient">{tokens.length} Tokens</Badge>
              </div>
              <TokenTable
                tokens={tokens}
                loading={loading}
                onTokenClick={handleTokenClick}
              />
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* DexScreener Chart Modal */}
        <DexScreenerChart
          pairAddress={selectedToken}
          chain={selectedChain}
          isOpen={!!selectedToken}
          onClose={closeChart}
          tokenSymbol={
            tokens.find(
              (t) =>
                t.address === selectedToken || t.mint_address === selectedToken
            )?.symbol
          }
        />
      </div>
    </div>
  );
}
