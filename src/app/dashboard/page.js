"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import TokenTable from "@/components/TokenTable";
import WalletConnect from "@/components/WalletConnect";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    user,
    isAuthenticated,
    authChecked,
    loading: authLoading,
    forceAuthWithCookie, // We'll use this if available
    walletInfo, // Add walletInfo from useAuth
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
            fetchTokens();
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
          fetchTokens();
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
            fetchTokens();

            // Set up refresh interval
            const intervalId = setInterval(() => {
              if (isMounted && document.visibilityState === "visible") {
                fetchTokens();
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
            fetchTokens();
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

  async function fetchTokens() {
    try {
      setLoading(true);
      console.log("[Dashboard] Fetching tokens");

      const response = await fetch("/api/tokens", {
        credentials: "include", // Important for sending cookies
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }

      const data = await response.json();
      setTokens(data.tokens || []);
      console.log("[Dashboard] Tokens fetched:", data.tokens?.length || 0);
    } catch (err) {
      console.error("[Dashboard] Error fetching tokens:", err);
      setError("Failed to load tokens. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const refreshTokenData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tokens/enrichment", {
        method: "POST",
        credentials: "include", // Important for sending cookies
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token data");
      }

      // Fetch the updated tokens
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
      <div className="flex justify-center items-center h-screen flex-col">
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
      <div className="flex justify-center items-center h-screen flex-col">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Token Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track newly launched tokens in real-time
          </p>
          {userEmailRef.current && (
            <p className="text-sm text-blue-500">
              Logged in as: {userEmailRef.current}
            </p>
          )}
        </div>
        <div className="flex mt-4 md:mt-0 gap-4 items-center">
          <WalletConnect />
          <button
            onClick={refreshTokenData}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                </svg>
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
          </button>
        </div>
      </div>

      {/* Display wallet information if connected */}
      {walletInfo && walletInfo.address && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Connected{" "}
                {walletInfo.type.charAt(0).toUpperCase() +
                  walletInfo.type.slice(1)}{" "}
                wallet:{" "}
                <span className="font-mono">{`${walletInfo.address.substring(
                  0,
                  6
                )}...${walletInfo.address.substring(
                  walletInfo.address.length - 4
                )}`}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading && tokens.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : tokens.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            ></path>
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">
            No tokens found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            New tokens will appear here as they are added.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Showing {tokens.length} tokens.{" "}
                  {tokens.filter((t) => !t.processed).length} tokens are pending
                  enrichment.
                </p>
              </div>
            </div>
          </div>
          <TokenTable tokens={tokens} />
        </>
      )}
    </div>
  );
}
