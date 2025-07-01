"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import TokenTable from "@/components/TokenTable";
import WalletConnect from "@/components/WalletConnect";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
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

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  };

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Save user's email to a ref to avoid unnecessary re-renders on user object changes
  useEffect(() => {
    if (user?.email) {
      userEmailRef.current = user.email;
    }
  }, [user]);

  // NEW: Check for auth headers set by middleware
  useEffect(() => {
    const checkAuthHeaders = async () => {
      if (headerChecked.current || initialized.current) return;
      headerChecked.current = true;

      try {
        // Make a simple request to get current route with headers
        const response = await fetch(window.location.pathname, {
          method: "HEAD",
          cache: "no-cache",
          credentials: "same-origin",
        });

        // Check if auth headers are present
        const authStatus = response.headers.get("x-auth-status");
        const userEmail = response.headers.get("x-auth-user-email");

        if (authStatus === "authenticated" && userEmail) {
          console.log(`[Dashboard] Auth headers found: ${userEmail}`);
          userEmailRef.current = userEmail;

          // If auth context isn't ready but we have headers, force auth with cookie
          if (!isAuthenticated && typeof forceAuthWithCookie === "function") {
            console.log("[Dashboard] Forcing auth based on middleware headers");
            forceAuthWithCookie();
          }

          // Initialize dashboard directly if not already initialized
          if (!initialized.current) {
            console.log("[Dashboard] Initializing from header check");
            initialized.current = true;
            initializeDashboard();
          }
        }
      } catch (err) {
        console.error("[Dashboard] Error checking auth headers:", err);
      }
    };

    // Check headers after a short delay to give auth context a chance to initialize
    setTimeout(checkAuthHeaders, 300);
  }, [isAuthenticated, forceAuthWithCookie]);

  useEffect(() => {
    // Track mount state to prevent state updates after unmount
    let isMounted = true;

    console.log(
      `[Dashboard] Rendering with isAuthenticated=${isAuthenticated}, authLoading=${authLoading}, authChecked=${authChecked}, userEmail=${
        userEmailRef.current || "(none)"
      }`
    );

    // Set a hard timeout to prevent infinite loading - longer timeout for more reliability
    authTimeoutRef.current = setTimeout(() => {
      if (isMounted && !initialized.current) {
        console.log(
          "[Dashboard] Auth check timeout reached, checking localStorage for evidence of login"
        );

        // Check for token cookie as a fallback
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const hasTokenCookie = cookies.some((c) => c.startsWith("token="));

        if (hasTokenCookie) {
          console.log(
            "[Dashboard] Found token cookie, proceeding with dashboard initialization"
          );
          initialized.current = true;
          initializeDashboard();
          return;
        }

        // Only redirect if we're sure we're not authenticated
        setRedirectAttempted(true); // Prevent multiple redirects
        router.push("/auth/login?from=/dashboard&reason=timeout");
      }
    }, 8000); // Increased to 8 seconds to give more time for auth check

    const checkAndInitialize = async () => {
      // Check for auth completion first
      if (authChecked) {
        // If authenticated, initialize dashboard
        if (isAuthenticated || userEmailRef.current) {
          if (!initialized.current && isMounted) {
            console.log(
              "[Dashboard] Auth check complete and authenticated, initializing dashboard for user:",
              userEmailRef.current || "authenticated user"
            );
            initialized.current = true;
            initializeDashboard();

            // Set up refresh interval
            const intervalId = setInterval(() => {
              if (isMounted && document.visibilityState === "visible") {
                fetchTokens();
                fetchMarketData();
              }
            }, 60000);

            // Clear the timeout since we've successfully initialized
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }

            return () => clearInterval(intervalId);
          }
        }
        // If auth check is complete but not authenticated, redirect after multiple attempts
        else if (!redirectAttempted && maxRetries.current >= 2) {
          console.log(
            "[Dashboard] Auth check completed - not authenticated after retries, redirecting"
          );
          setRedirectAttempted(true);
          // Clear timeout to prevent duplicate redirects
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
            authTimeoutRef.current = null;
          }
          router.push("/auth/login?from=/dashboard&reason=notauthenticated");
          return;
        }
        // Increment retry counter if auth check complete but not authenticated
        else if (!redirectAttempted) {
          maxRetries.current += 1;
          console.log(`[Dashboard] Auth check retry ${maxRetries.current}/3`);

          // Check for token cookie as a fallback
          const cookies = document.cookie.split(";").map((c) => c.trim());
          const hasTokenCookie = cookies.some((c) => c.startsWith("token="));

          if (hasTokenCookie && maxRetries.current >= 2) {
            console.log(
              "[Dashboard] Found token cookie despite auth check failure, proceeding anyway"
            );
            initialized.current = true;
            initializeDashboard();
            return;
          }
        }
      }
      // If auth is still loading, handle accordingly
      else if (authLoading) {
        console.log("[Dashboard] Still waiting for auth check...");
        return;
      }
    };

    // Initial check
    checkAndInitialize();

    // Setup polling interval with shorter interval
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
    }, 1000); // Check more frequently

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
  ]);

  // Initialize all dashboard data
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

  async function fetchTokens() {
    try {
      console.log("[Dashboard] Fetching tokens");
      const response = await fetch("/api/tokens", {
        credentials: "include",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) throw new Error("Failed to fetch tokens");
      const data = await response.json();
      setTokens(data.tokens || []);
      console.log("[Dashboard] Tokens fetched:", data.tokens?.length || 0);
    } catch (err) {
      console.error("[Dashboard] Error fetching tokens:", err);
      setError("Failed to load tokens. Please try again later.");
    }
  }

  async function fetchPortfolioData() {
    try {
      // Simulate portfolio data
      setPortfolioData({
        totalValue: 125430.5,
        totalChange: 8742.3,
        totalChangePercent: 7.48,
        topGainer: { symbol: "PEPE", change: 23.45 },
        topLoser: { symbol: "DOGE", change: -12.32 },
      });
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
    }
  }

  async function fetchTradingStats() {
    try {
      // Simulate trading stats
      setTradingStats({
        totalTrades: 247,
        successRate: 78.5,
        avgReturn: 12.3,
        dailyVolume: 45230.75,
      });
    } catch (err) {
      console.error("Error fetching trading stats:", err);
    }
  }

  async function fetchRecentActivity() {
    try {
      // Simulate recent activity
      setRecentActivity([
        {
          type: "buy",
          token: "PEPE",
          amount: 1000,
          price: 0.00000123,
          time: "2 minutes ago",
        },
        {
          type: "sell",
          token: "DOGE",
          amount: 500,
          price: 0.082,
          time: "15 minutes ago",
        },
        {
          type: "buy",
          token: "SHIB",
          amount: 2000000,
          price: 0.000008,
          time: "1 hour ago",
        },
        {
          type: "sell",
          token: "FLOKI",
          amount: 750000,
          price: 0.00003,
          time: "2 hours ago",
        },
      ]);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  }

  async function fetchMarketData() {
    try {
      // Simulate market data
      setMarketOverview({
        btcPrice: 43250.75,
        ethPrice: 2650.3,
        totalMarketCap: 1.7e12,
        fearGreedIndex: 72,
      });
    } catch (err) {
      console.error("Error fetching market data:", err);
    }
  }

  const refreshTokenData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tokens/enrichment", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to refresh token data");
      await fetchTokens();
    } catch (err) {
      console.error("Error refreshing tokens:", err);
      setError("Failed to refresh token data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Improved loading states
  if (authLoading && !userEmailRef.current && !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white/60 to-purple-50/80 dark:from-gray-900/90 dark:via-slate-800/80 dark:to-purple-900/90 backdrop-blur-xl flex justify-center items-center flex-col">
        <LoadingSpinner size="large" />
        <span className="mt-3 text-gray-600 dark:text-gray-300">
          Checking authentication...
        </span>
        <button
          onClick={() => router.push("/auth/login?from=/dashboard")}
          className="mt-4 text-blue-500 hover:text-blue-700 text-sm"
        >
          Click here if loading takes too long
        </button>
      </div>
    );
  }

  // Show more informative message if auth check completed but not initialized
  if (!initialized.current && authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white/60 to-purple-50/80 dark:from-gray-900/90 dark:via-slate-800/80 dark:to-purple-900/90 backdrop-blur-xl flex justify-center items-center flex-col">
        <LoadingSpinner size="large" />
        <span className="mt-3 text-gray-700 dark:text-gray-200">
          {isAuthenticated
            ? "Loading dashboard data..."
            : "Authentication failed. Redirecting to login page..."}
        </span>
        <button
          onClick={() => router.push("/auth/login?from=/dashboard")}
          className="mt-4 text-blue-500 hover:text-blue-700 text-sm"
        >
          Retry Login
        </button>
      </div>
    );
  }

  // Render dashboard content as soon as we have a user, don't wait for token loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white/60 to-purple-50/80 dark:from-gray-900/90 dark:via-slate-800/80 dark:to-purple-900/90">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-2xl"
          animate={{
            scale: [1, 0.8, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/40 to-teal-400/40 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-r from-orange-400/40 to-red-400/40 rounded-full blur-lg"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
            delay: 0.7,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <motion.div
          className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:flex md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Welcome Back, {userEmailRef.current?.split("@")[0] || "Trader"}!
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Your comprehensive trading dashboard
              </motion.p>
              <motion.div
                className="mt-4 flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Market Open
                  </span>
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex mt-6 md:mt-0 gap-4 items-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <WalletConnect />
              <motion.button
                onClick={refreshTokenData}
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? (
                  <>
                    <motion.svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </motion.svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh Data
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Wallet Connection Status */}
        {walletInfo && walletInfo.address && (
          <motion.div
            className="backdrop-blur-sm bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-l-4 border-blue-500 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.7)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                        "0 0 0 0 rgba(59, 130, 246, 0)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {walletInfo.type.charAt(0).toUpperCase() +
                      walletInfo.type.slice(1)}{" "}
                    Connected
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {`${walletInfo.address.substring(
                      0,
                      6
                    )}...${walletInfo.address.substring(
                      walletInfo.address.length - 4
                    )}`}
                  </p>
                </motion.div>
              </div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Market Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
            variants={fadeInUp}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bitcoin Price
                </p>
                <motion.p
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  ${marketOverview.btcPrice.toLocaleString()}
                </motion.p>
                <motion.p
                  className="text-sm text-green-600 dark:text-green-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  +2.45%
                </motion.p>
              </div>
              <motion.div
                className="text-3xl"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ₿
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
            variants={fadeInUp}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ethereum Price
                </p>
                <motion.p
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  ${marketOverview.ethPrice.toLocaleString()}
                </motion.p>
                <motion.p
                  className="text-sm text-green-600 dark:text-green-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  +1.23%
                </motion.p>
              </div>
              <motion.div
                className="text-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Ξ
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
            variants={fadeInUp}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Market Cap
                </p>
                <motion.p
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  ${(marketOverview.totalMarketCap / 1e12).toFixed(2)}T
                </motion.p>
                <motion.p
                  className="text-sm text-green-600 dark:text-green-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  +0.89%
                </motion.p>
              </div>
              <motion.div
                className="text-3xl"
                animate={{
                  y: [0, -5, 0],
                  rotateY: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                📊
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
            variants={fadeInUp}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fear & Greed
                </p>
                <motion.p
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {marketOverview.fearGreedIndex}
                </motion.p>
                <motion.p
                  className="text-sm text-yellow-600 dark:text-yellow-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Greed
                </motion.p>
              </div>
              <motion.div
                className="text-3xl"
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                😱
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl"
              whileHover={{ y: -5 }}
            >
              <motion.h2
                className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Portfolio Overview
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div className="text-center" variants={fadeInUp}>
                  <motion.p
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    Total Value
                  </motion.p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    ${portfolioData.totalValue.toLocaleString()}
                  </motion.p>
                  <motion.p
                    className={`text-sm mt-1 ${
                      portfolioData.totalChangePercent >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    {portfolioData.totalChangePercent >= 0 ? "+" : ""}$
                    {portfolioData.totalChange.toLocaleString()} (
                    {portfolioData.totalChangePercent.toFixed(2)}%)
                  </motion.p>
                </motion.div>
                <motion.div className="text-center" variants={fadeInUp}>
                  <motion.p
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    Top Gainer
                  </motion.p>
                  <motion.p
                    className="text-xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.6,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {portfolioData.topGainer?.symbol || "N/A"}
                  </motion.p>
                  <motion.p
                    className="text-sm text-green-600 dark:text-green-400 mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                  >
                    +{portfolioData.topGainer?.change.toFixed(2)}%
                  </motion.p>
                </motion.div>
                <motion.div className="text-center" variants={fadeInUp}>
                  <motion.p
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                  >
                    Top Loser
                  </motion.p>
                  <motion.p
                    className="text-xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.9,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {portfolioData.topLoser?.symbol || "N/A"}
                  </motion.p>
                  <motion.p
                    className="text-sm text-red-600 dark:text-red-400 mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 2 }}
                  >
                    {portfolioData.topLoser?.change.toFixed(2)}%
                  </motion.p>
                </motion.div>
              </motion.div>
              <motion.div
                className="mt-8 h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 2.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    📈
                  </motion.div>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2.3 }}
                  >
                    Portfolio Chart
                  </motion.p>
                  <motion.p
                    className="text-sm text-gray-500 dark:text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2.4 }}
                  >
                    Coming Soon
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {/* Trading Stats */}
            <motion.div
              className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
              whileHover={{ y: -5 }}
            >
              <motion.h3
                className="text-lg font-bold text-gray-900 dark:text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                Trading Stats
              </motion.h3>
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  className="flex justify-between"
                  variants={fadeInLeft}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Trades
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tradingStats.totalTrades}
                  </span>
                </motion.div>
                <motion.div
                  className="flex justify-between"
                  variants={fadeInLeft}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    Success Rate
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {tradingStats.successRate}%
                  </span>
                </motion.div>
                <motion.div
                  className="flex justify-between"
                  variants={fadeInLeft}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    Avg Return
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {tradingStats.avgReturn}%
                  </span>
                </motion.div>
                <motion.div
                  className="flex justify-between"
                  variants={fadeInLeft}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    Daily Volume
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${tradingStats.dailyVolume.toLocaleString()}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
              whileHover={{ y: -5 }}
            >
              <motion.h3
                className="text-lg font-bold text-gray-900 dark:text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                Quick Actions
              </motion.h3>
              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔄 Swap Tokens
                </motion.button>
                <motion.button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💰 Start Trading
                </motion.button>
                <motion.button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📊 View Analytics
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-white/5"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "buy" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {activity.type === "buy" ? "📈" : "📉"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {activity.type === "buy" ? "Bought" : "Sold"}{" "}
                      {activity.token}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.amount.toLocaleString()} tokens at $
                      {activity.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="backdrop-blur-sm bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl shadow-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Token Table Section */}
        <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Token Discovery
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {tokens.length} tokens tracked
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tokens.filter((t) => !t.processed).length} pending enrichment
              </div>
            </div>
          </div>

          {loading && tokens.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : tokens.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No tokens found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                New tokens will appear here as they are discovered and added to
                our database.
              </p>
              <button
                onClick={refreshTokenData}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <TokenTable tokens={tokens} />
          )}
        </div>

        {/* Footer Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time data updates and instant trade execution
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Secure
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bank-grade security with multi-layer protection
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Advanced analytics and insights for better trading
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
