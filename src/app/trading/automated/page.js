"use client";

import RealTimeTradingMonitor from "@/components/RealTimeTradingMonitor";
import SessionKeyAuthorization from "@/components/SessionKeyAuthorization";
import SessionKeyManager from "@/components/SessionKeyManager";
import TradingBotControl from "@/components/TradingBotControl";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function AutomatedTradingPage() {
  const { user, walletInfo, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAuthorization, setShowAuthorization] = useState(false);

  const handleSessionKeyCreated = (sessionKey) => {
    console.log("Session key created:", sessionKey);
    setShowAuthorization(false);
    setActiveTab("manage");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access automated trading features.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (!walletInfo?.address) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Wallet Connection Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect a Solana wallet to enable automated trading.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            Connect Wallet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Automated Trading
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Authorize our bot to trade on your behalf with customizable limits
            and permissions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("authorize")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "authorize"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Authorize Bot
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "manage"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Manage Sessions
            </button>
            <button
              onClick={() => setActiveTab("monitor")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "monitor"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Live Monitor
            </button>
            <button
              onClick={() => setActiveTab("botcontrol")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "botcontrol"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Bot Control
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "docs"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Documentation
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {activeTab === "overview" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                How Automated Trading Works
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      1
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Generate Session Key
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      A temporary cryptographic keypair is generated on our
                      server. This key will be used to sign transactions on your
                      behalf.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      2
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Set Permissions & Limits
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure what actions the bot can perform, spending
                      limits, expiration time, and which tokens it can trade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      3
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Authorize with Signature
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Sign an authorization message with your wallet. This
                      proves you consent to the bot trading with the specified
                      limits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      4
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Bot Trades Autonomously
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our trading bot can now execute trades on your behalf 24/7
                      within your configured limits, without requiring your
                      signature for each transaction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  🔒 Security Features
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li>
                    ✓ Session keys are encrypted with AES-256-GCM encryption
                  </li>
                  <li>
                    ✓ Your main wallet private key never leaves your device
                  </li>
                  <li>
                    ✓ Set spending limits per transaction and daily limits
                  </li>
                  <li>
                    ✓ Keys automatically expire after your chosen duration
                  </li>
                  <li>✓ Revoke access anytime instantly</li>
                  <li>✓ Full audit trail of all bot actions</li>
                </ul>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setActiveTab("authorize")}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-lg"
                >
                  Get Started →
                </button>
              </div>
            </div>
          )}

          {activeTab === "authorize" && (
            <SessionKeyAuthorization
              walletAddress={walletInfo.address}
              onSuccess={handleSessionKeyCreated}
            />
          )}

          {activeTab === "manage" && (
            <SessionKeyManager walletAddress={walletInfo.address} />
          )}

          {activeTab === "monitor" && (
            <div className="p-8">
              <RealTimeTradingMonitor walletAddress={walletInfo.address} />
            </div>
          )}

          {activeTab === "botcontrol" && (
            <div className="p-8">
              <TradingBotControl />
            </div>
          )}

          {activeTab === "docs" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Technical Documentation
              </h2>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mt-6 mb-4">
                  What are Session Keys?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Session keys are temporary cryptographic keypairs that allow
                  our trading bot to sign and execute transactions on your
                  behalf without requiring your manual approval for each trade.
                  This enables true automated trading while maintaining security
                  through configurable permissions and spending limits.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-4">
                  How It Works
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>Key Generation:</strong> A new Solana keypair is
                    generated on our secure server
                  </li>
                  <li>
                    <strong>Encryption:</strong> The private key is encrypted
                    using AES-256-GCM with a master encryption secret
                  </li>
                  <li>
                    <strong>Authorization:</strong> You sign a message with your
                    main wallet authorizing the session key
                  </li>
                  <li>
                    <strong>Storage:</strong> The encrypted key is stored in our
                    database along with your permissions
                  </li>
                  <li>
                    <strong>Trading:</strong> The bot decrypts the key when
                    needed to sign transactions within your limits
                  </li>
                </ol>

                <h3 className="text-xl font-semibold mt-6 mb-4">
                  Security Considerations
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    Important Security Notes:
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
                    <li>
                      Your main wallet private key NEVER leaves your browser
                    </li>
                    <li>
                      Session keys are separate keypairs with limited
                      permissions
                    </li>
                    <li>
                      All session keys are encrypted at rest with military-grade
                      encryption
                    </li>
                    <li>Set conservative spending limits to minimize risk</li>
                    <li>
                      Use short expiration times (24 hours recommended) and
                      renew as needed
                    </li>
                    <li>
                      Revoke session keys immediately if you suspect any issues
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-4">
                  Recommended Settings
                </h3>
                <table className="min-w-full border dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Use Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Expiration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Daily Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Max per Trade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        Conservative
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        6-12 hours
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        $100-$500
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        $50-$100
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        Moderate
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        24 hours
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        $500-$2,000
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        $200-$500
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        Aggressive
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        1-3 days
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        $2,000-$10,000
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        $500-$2,000
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="text-xl font-semibold mt-6 mb-4">FAQ</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Can the bot withdraw all my funds?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      No. Session keys only grant permission for specific
                      actions (trading, swapping) within your configured limits.
                      By default, transfer permissions are disabled.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      What happens if I lose access?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      You can always revoke session keys from your account
                      dashboard. Additionally, all keys automatically expire
                      after the time period you set.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Is my private key stored anywhere?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your main wallet private key never leaves your browser.
                      The session key is a separate, temporary key that is
                      encrypted and stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
