"use client";

import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  connectBitgetWallet,
  connectCoinbaseWallet,
  connectEthereumWallet,
  connectOKXWallet,
  connectPhantomWallet,
  connectTrustWallet,
  connectUniswapWallet,
  connectWalletConnect,
  disconnectWallet,
} from "../lib/wallet/walletUtils";

// Check ethers version
const ethersVersion = parseInt(ethers.version.split(".")[0]);
if (ethersVersion < 6) {
  console.warn(
    `You are using ethers v${ethers.version}. This application expects ethers v6 or higher.`
  );
}

// Create the auth context with default values
const AuthContext = createContext({
  user: null,
  loading: true,
  authChecked: false,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  checkAuth: async () => {},
  verifyOTP: async () => {},
  isAuthenticated: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  walletInfo: null,
  tradingPermissions: [],
  fetchTradingPermissions: async () => {},
  revokeTradingPermission: async () => {},
});

// Auth provider component
export function AuthProvider({ children }) {
  // Core authentication states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Wallet states
  const [walletInfo, setWalletInfo] = useState(null);
  const [tradingPermissions, setTradingPermissions] = useState([]);

  // Other utilities
  const router = useRouter();

  // Constants
  const AUTH_STORAGE_KEY = "auth_data";
  const WALLET_STORAGE_KEY = "wallet_info";
  const AUTH_CHECK_TIMEOUT = 3000; // 3 seconds max for auth check

  // Check if token exists in cookies
  const hasTokenCookie = useCallback(() => {
    try {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      return cookies.some((c) => c.startsWith("token="));
    } catch (error) {
      console.error("[Auth] Error checking cookie:", error);
      return false;
    }
  }, []);

  // Get user from token in cookie or localStorage
  const getUserFromToken = useCallback(() => {
    // First try cookie
    try {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        return {
          id: payload.userId || payload.id,
          email: payload.email,
          name: payload.name,
        };
      }
    } catch (e) {
      console.warn("[Auth] Could not parse token from cookie");
    }

    // Then try localStorage
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.user) {
          console.log("[Auth] Found user in localStorage");
          return authData.user;
        }
      }
    } catch (e) {
      console.warn("[Auth] Could not parse auth from localStorage");
    }

    return null;
  }, []);

  // Clean, simple auth check with timeout
  const checkAuth = useCallback(
    async (silent = false) => {
      if (!silent) {
        console.log("[Auth] Checking authentication status");
      }

      try {
        setLoading(true);

        // Set timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          AUTH_CHECK_TIMEOUT
        );

        // First check if we have a token cookie
        if (!hasTokenCookie()) {
          if (!silent) console.log("[Auth] No token cookie found");

          // Check localStorage fallback
          const localUser = getUserFromToken();
          if (localUser) {
            setUser(localUser);
            setIsAuthenticated(true);
            if (!silent) console.log("[Auth] Authenticated via localStorage");
          } else {
            setUser(null);
            setIsAuthenticated(false);
            if (!silent) console.log("[Auth] Not authenticated");
          }

          setAuthChecked(true);
          setLoading(false);
          clearTimeout(timeoutId);
          return isAuthenticated;
        }

        // If we have a token, verify with API
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          // API call failed but we have token - use local data
          if (hasTokenCookie()) {
            const localUser = getUserFromToken();
            if (localUser) {
              setUser(localUser);
              setIsAuthenticated(true);
              if (!silent)
                console.log(
                  "[Auth] API call failed but authenticated via token"
                );

              // Store in localStorage as fallback
              localStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({
                  user: localUser,
                  timestamp: Date.now(),
                })
              );

              setAuthChecked(true);
              setLoading(false);
              return true;
            }
          }

          // No valid token/user found
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          if (!silent)
            console.log("[Auth] Not authenticated - API check failed");

          setAuthChecked(true);
          setLoading(false);
          return false;
        }

        // API success
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);

          // Store in localStorage as fallback
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              user: data.user,
              timestamp: Date.now(),
            })
          );

          if (!silent) console.log("[Auth] Authenticated via API");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          if (!silent)
            console.log("[Auth] Not authenticated - no user in response");
        }

        setAuthChecked(true);
        setLoading(false);
        return isAuthenticated;
      } catch (error) {
        console.error("[Auth] Error checking authentication:", error);

        // On error, check if we have a token and try to use local data
        if (hasTokenCookie()) {
          const localUser = getUserFromToken();
          if (localUser) {
            setUser(localUser);
            setIsAuthenticated(true);
            if (!silent)
              console.log("[Auth] API error but authenticated via token");
          } else {
            setUser(null);
            setIsAuthenticated(false);
            if (!silent)
              console.log("[Auth] Not authenticated after API error");
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }

        setAuthChecked(true);
        setLoading(false);
        return isAuthenticated;
      }
    },
    [getUserFromToken, hasTokenCookie, isAuthenticated]
  );

  // Login function
  const login = async (email, password) => {
    setLoading(true);

    try {
      console.log("[Auth] Login attempt:", email);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("[Auth] Password verified, awaiting OTP verification");

      // Don't set user or authentication state yet - wait for OTP
      setLoading(false);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("[Auth] Login error:", error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      console.log("[Auth] Logging out");

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear all auth data
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_STORAGE_KEY);

      setLoading(false);
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("[Auth] Logout error:", error.message);

      // Force logout even on API error
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_STORAGE_KEY);

      setLoading(false);
      router.push("/");
      return { success: true, error: error.message };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      return { success: true };
    } catch (error) {
      console.error("[Auth] Signup error:", error.message);
      return { success: false, error: error.message };
    }
  };

  // OTP verification function
  const verifyOTP = async (email, otp) => {
    setLoading(true);

    try {
      console.log("[Auth] Verifying OTP for:", email);

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      console.log("[Auth] OTP verified successfully - user now authenticated");

      // Now set the user and authentication state
      setUser(data.user);
      setIsAuthenticated(true);

      // Store in localStorage as fallback
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: data.user,
          timestamp: Date.now(),
        })
      );

      setAuthChecked(true);
      setLoading(false);
      return { success: true, message: data.message };
    } catch (error) {
      console.error("[Auth] OTP verification error:", error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Connect wallet function
  const connectWallet = async (
    walletType,
    requestTradingPermission = false
  ) => {
    try {
      console.log(`[Auth] Connecting ${walletType} wallet...`);
      let walletData;

      switch (walletType) {
        case "metamask":
          walletData = await connectEthereumWallet(requestTradingPermission);
          break;
        case "phantom":
          walletData = await connectPhantomWallet(requestTradingPermission);
          break;
        case "coinbase":
          walletData = await connectCoinbaseWallet(requestTradingPermission);
          break;
        case "bitget":
          walletData = await connectBitgetWallet(requestTradingPermission);
          break;
        case "uniswap":
          walletData = await connectUniswapWallet(requestTradingPermission);
          break;
        case "okx":
          walletData = await connectOKXWallet(requestTradingPermission);
          break;
        case "trustwallet":
          walletData = await connectTrustWallet(requestTradingPermission);
          break;
        case "walletconnect":
          walletData = await connectWalletConnect(requestTradingPermission);
          break;
        default:
          throw new Error("Unsupported wallet type");
      }

      // Save wallet info to state
      const newWalletInfo = {
        type: walletType,
        address: walletData.address,
        networkType: walletData.networkType,
        tradingApproved: walletData.tradingApproved || false,
      };

      // Store WalletConnect provider reference if available
      if (walletData.wcProvider) {
        newWalletInfo.wcProvider = walletData.wcProvider;
      }

      setWalletInfo(newWalletInfo);

      // Store in localStorage
      localStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify({
          ...newWalletInfo,
          wcProvider: undefined, // Don't store provider in localStorage
          timestamp: Date.now(),
        })
      );

      // If user is authenticated, associate wallet with account
      if (isAuthenticated && user) {
        try {
          const response = await fetch("/api/user/wallet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletType,
              walletAddress: walletData.address,
              tradingApproved: walletData.tradingApproved || false,
            }),
            credentials: "include",
          });

          if (!response.ok) {
            console.warn("[Auth] Failed to associate wallet with user account");
          }

          // If trading was approved, fetch updated permissions
          if (walletData.tradingApproved) {
            await fetchTradingPermissions();
          }
        } catch (error) {
          console.error(
            "[Auth] Failed to associate wallet with user:",
            error.message
          );
        }
      }

      return walletData;
    } catch (error) {
      console.error("[Auth] Error connecting wallet:", error.message);
      throw error;
    }
  };

  // Disconnect wallet function
  const disconnectWalletHandler = async () => {
    try {
      if (walletInfo) {
        // Pass WalletConnect provider if it exists
        await disconnectWallet(
          walletInfo.type,
          walletInfo.type === "walletconnect" ? walletInfo.wcProvider : null
        );

        setWalletInfo(null);
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
      return true;
    } catch (error) {
      console.error("[Auth] Error disconnecting wallet:", error.message);

      // Force disconnect even on error
      setWalletInfo(null);
      localStorage.removeItem(WALLET_STORAGE_KEY);
      return false;
    }
  };

  // Fetch trading permissions
  const fetchTradingPermissions = async () => {
    if (!isAuthenticated) return [];

    try {
      const response = await fetch("/api/wallet/trading-permission", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTradingPermissions(data.permissions || []);
        return data.permissions;
      }
      return [];
    } catch (error) {
      console.error(
        "[Auth] Error fetching trading permissions:",
        error.message
      );
      return [];
    }
  };

  // Revoke trading permission
  const revokeTradingPermission = async (walletAddress) => {
    try {
      const response = await fetch("/api/wallet/trading-permission", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
        credentials: "include",
      });

      if (response.ok) {
        // Update state
        setTradingPermissions((prev) =>
          prev.filter(
            (p) => p.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
          )
        );

        // Update wallet info if it's the current wallet
        if (
          walletInfo &&
          walletInfo.address.toLowerCase() === walletAddress.toLowerCase()
        ) {
          const updatedWalletInfo = {
            ...walletInfo,
            tradingApproved: false,
          };

          setWalletInfo(updatedWalletInfo);

          // Update localStorage
          localStorage.setItem(
            WALLET_STORAGE_KEY,
            JSON.stringify({
              ...updatedWalletInfo,
              wcProvider: undefined,
              timestamp: Date.now(),
            })
          );
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("[Auth] Error revoking trading permission:", error.message);
      return false;
    }
  };

  // Initialize auth status check
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (isMounted) {
        // First check localStorage for wallet info
        try {
          const storedWalletInfo = localStorage.getItem(WALLET_STORAGE_KEY);
          if (storedWalletInfo) {
            setWalletInfo(JSON.parse(storedWalletInfo));
          }
        } catch (e) {
          console.warn("[Auth] Error restoring wallet info from localStorage");
          localStorage.removeItem(WALLET_STORAGE_KEY);
        }

        // Then check auth status
        await checkAuth();

        // Set a timeout to ensure auth check completes
        const timeoutId = setTimeout(() => {
          if (isMounted && !authChecked) {
            console.warn(
              "[Auth] Auth check taking too long, forcing completion"
            );

            // Use localStorage data as fallback
            const localUser = getUserFromToken();
            if (localUser) {
              setUser(localUser);
              setIsAuthenticated(true);
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }

            setAuthChecked(true);
            setLoading(false);
          }
        }, AUTH_CHECK_TIMEOUT);

        return () => clearTimeout(timeoutId);
      }
    };

    initAuth();

    // Check auth when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuth, getUserFromToken, authChecked]);

  // Load trading permissions when authenticated
  useEffect(() => {
    if (isAuthenticated && authChecked) {
      fetchTradingPermissions();
    }
  }, [isAuthenticated, authChecked]);

  // Auth context value
  const value = {
    user,
    loading,
    authChecked,
    login,
    signup,
    logout,
    checkAuth,
    verifyOTP,
    isAuthenticated,
    connectWallet,
    disconnectWallet: disconnectWalletHandler,
    walletInfo,
    tradingPermissions,
    fetchTradingPermissions,
    revokeTradingPermission,
    // Session key methods (to be implemented)
    sessionKeys: {
      generate: async (walletAddress, config) => {
        try {
          const response = await fetch("/api/session-keys/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ walletAddress, ...config }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return { success: true, data };
        } catch (error) {
          console.error("[Auth] Session key generation error:", error);
          return { success: false, error: error.message };
        }
      },
      authorize: async (authData) => {
        try {
          const response = await fetch("/api/session-keys/authorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(authData),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return { success: true, data };
        } catch (error) {
          console.error("[Auth] Session key authorization error:", error);
          return { success: false, error: error.message };
        }
      },
      list: async (walletAddress = null) => {
        try {
          const params = walletAddress ? `?walletAddress=${walletAddress}` : "";
          const response = await fetch(`/api/session-keys/list${params}`, {
            credentials: "include",
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return { success: true, data: data.sessionKeys };
        } catch (error) {
          console.error("[Auth] Session keys list error:", error);
          return { success: false, error: error.message };
        }
      },
      revoke: async (sessionKeyId) => {
        try {
          const response = await fetch("/api/session-keys/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionKeyId }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return { success: true, data };
        } catch (error) {
          console.error("[Auth] Session key revoke error:", error);
          return { success: false, error: error.message };
        }
      },
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
// export const useAuth = () => useContext(AuthContext);
