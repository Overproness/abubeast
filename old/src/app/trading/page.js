"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import TradingSettings from "@/components/TradingSettings";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TradingPage() {
  const { user, authChecked, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        router.push("/auth/login?from=/trading");
      } else {
        setIsLoading(false);
      }
    }
  }, [authChecked, isAuthenticated, router]);

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
          Automated Trading
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure automated buying and selling of tokens
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TradingSettings />
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              How Automated Trading Works
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Token Detection
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our system constantly monitors blockchain networks for newly
                    launched tokens matching your criteria.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-3 mt-1">
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
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Analysis & Verification
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Each token is analyzed for security, liquidity, and
                    potential based on your selected strategy.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-full mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Automated Purchase
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    If a token meets all criteria, the system automatically
                    purchases it for you within your set limits.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Performance Monitoring
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Tokens are continuously monitored for price movements and
                    market performance.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Automated Selling
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    The system will sell tokens when they hit your take profit
                    target or stop loss level.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Security Measures
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Signature-based permissions
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Strict investment limits
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  No withdrawal access
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Revoke access anytime
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Detailed audit trail
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
