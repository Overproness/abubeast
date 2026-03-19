"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MarketOverview from "@/components/dashboard/MarketOverview";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TokenDiscoverySection from "@/components/dashboard/TokenDiscoverySection";
import TradingStats from "@/components/dashboard/TradingStats";
import WalletStatus from "@/components/dashboard/WalletStatus";
import DexScreenerChart from "@/components/DexScreenerChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import TokenTable from "@/components/TokenTable";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
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
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
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

          // Try force auth with cookie
          try {
            await forceAuthWithCookie();

            // Check for token cookie as fallback
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

    // Initial check
    checkAuthHeaders();
    checkAndInitialize();

    // Setup polling interval
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

    // Cleanup
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
      const response = await fetch("/api/tokens?limit=50", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTokens(Array.isArray(data) ? data.slice(0, 50) : []);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
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
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-lg text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshTokenData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Dashboard Header */}
          <DashboardHeader
            userEmail={userEmailRef.current}
            loading={loading}
            onRefreshData={refreshTokenData}
          />

          {/* Wallet Status */}
          {walletInfo && walletInfo.address && (
            <WalletStatus walletInfo={walletInfo} />
          )}

          {/* Market Overview */}
          <MarketOverview marketData={marketOverview} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Portfolio & Trading Stats */}
            <div className="lg:col-span-2 space-y-8">
              <PortfolioOverview portfolioData={portfolioData} />
              <TradingStats stats={tradingStats} />
            </div>

            {/* Right Column - Quick Actions & Recent Activity */}
            <div className="space-y-8">
              <QuickActions />
              <RecentActivity activities={recentActivity} />
            </div>
          </div>

          {/* Token Discovery Section */}
          <TokenDiscoverySection
            tokens={tokens}
            loading={loading}
            onTokenClick={handleTokenClick}
            onRefreshData={refreshTokenData}
          />

          {/* Token Table */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Market Overview
            </h2>
            <TokenTable
              tokens={tokens}
              loading={loading}
              onTokenClick={handleTokenClick}
            />
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
