"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { Widget } from "@lifi/widget";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SwapPage() {
  const { user, walletInfo, isAuthenticated, authChecked } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated after auth check is complete
    if (authChecked) {
      if (!isAuthenticated) {
        router.push("/auth/login?from=/swap");
      } else {
        setIsLoading(false);
      }
    }
  }, [authChecked, isAuthenticated, router]);

  // Configure the widget based on connected wallet
  const getWidgetConfig = () => {
    const config = {
      integrator: "AbuBeast",
      variant: "expandable",
      containerStyle: {
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "16px",
      },
      theme: {
        palette: {
          primary: { main: "#3B82F6" }, // Match app's blue theme
          secondary: { main: "#10B981" },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
      },
    };

    // Add wallet-specific configuration if a wallet is connected
    if (walletInfo) {
      if (walletInfo.type === "phantom") {
        config.walletManagement = {
          connect: {
            // Use already connected Phantom wallet
            evm: { provider: window.ethereum },
            solana: { provider: window.solana },
          },
        };
      } else if (
        walletInfo.type === "metamask" ||
        walletInfo.type === "coinbase" ||
        walletInfo.type === "bitget" ||
        walletInfo.type === "uniswap" ||
        walletInfo.type === "okx" ||
        walletInfo.type === "trustwallet"
      ) {
        config.walletManagement = {
          connect: {
            evm: { provider: window.ethereum },
          },
        };
      } else if (walletInfo.type === "walletconnect" && walletInfo.wcProvider) {
        config.walletManagement = {
          connect: {
            evm: { provider: walletInfo.wcProvider },
          },
        };
      }
    }

    return config;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cross-Chain Token Swap
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Swap tokens across different blockchains using LI.FI protocol
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-4">
            {walletInfo && walletInfo.address ? (
              <Widget config={getWidgetConfig()} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400 dark:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25zm0 3h.008v.008H12V11.25zm0 3h.008v.008H12V14.25z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Connect your wallet first
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  You need to connect your wallet (MetaMask or Phantom) before
                  you can swap tokens.
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Trading Info
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Connected Wallet
                </h3>
                <p className="font-medium text-gray-900 dark:text-white">
                  {walletInfo && walletInfo.address
                    ? `${
                        walletInfo.type.charAt(0).toUpperCase() +
                        walletInfo.type.slice(1)
                      }: ${walletInfo.address.substring(
                        0,
                        6
                      )}...${walletInfo.address.substring(
                        walletInfo.address.length - 4
                      )}`
                    : "No wallet connected"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Network Type
                </h3>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {walletInfo ? walletInfo.networkType : "N/A"}
                </p>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Supported Features
                </h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Cross-chain swaps
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Bridge tokens
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Best execution via DEX aggregation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
