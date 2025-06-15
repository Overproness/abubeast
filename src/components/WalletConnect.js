"use client";

import { useAuth } from "@/context/AuthContext";
import {
  logWalletInfo,
  testMetaMaskConnection,
} from "@/lib/wallet/walletDetector";
import Image from "next/image";
import { useEffect, useState } from "react";
import WalletConnectModal from "./WalletConnectModal";

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { connectWallet, disconnectWallet, walletInfo } = useAuth();

  // Expanded list of supported wallets
  const [availableWallets, setAvailableWallets] = useState({
    metamask: false,
    phantom: false,
    coinbase: false,
    bitget: false,
    uniswap: false,
    okx: false,
    trustwallet: false,
    walletconnect: true, // Always available as fallback option
  });

  useEffect(() => {
    // Check for wallet availability and log detailed wallet info to console
    logWalletInfo();

    // Check for MetaMask
    const hasMetaMask =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isMetaMask;

    // Check for Phantom
    const hasPhantom =
      typeof window !== "undefined" && window.solana && window.solana.isPhantom;

    // Check for Coinbase Wallet
    const hasCoinbaseWallet =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isCoinbaseWallet;

    // Check for BitGet
    const hasBitget =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isBitKeep;

    // Check for UniswapWallet
    const hasUniswap =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isUniswap;

    // Check for OKX Wallet
    const hasOKX =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isOKExWallet;

    // Check for Trust Wallet
    const hasTrustWallet =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isTrust;

    setAvailableWallets({
      metamask: hasMetaMask,
      phantom: hasPhantom,
      coinbase: hasCoinbaseWallet,
      bitget: hasBitget,
      uniswap: hasUniswap,
      okx: hasOKX,
      trustwallet: hasTrustWallet,
      walletconnect: true,
    });
  }, []);

  const handleConnectWallet = async (walletType) => {
    try {
      console.log(`Attempting to connect ${walletType} wallet`);
      setIsConnecting(true);
      setWalletType(walletType);
      setConnectionError(null);

      if (walletType === "metamask") {
        // Test MetaMask before attempting connection
        const testResult = await testMetaMaskConnection();
        console.log("MetaMask test result:", testResult);
        if (!testResult.success) {
          throw new Error(`MetaMask test failed: ${testResult.message}`);
        }
        if (testResult.isLocked) {
          console.log("MetaMask is locked. Please unlock your wallet.");
        }
      }

      if (walletType === "walletconnect") {
        // Use our custom modal instead of relying on direct WalletConnect imports
        console.log("Opening WalletConnect modal");
        setShowWalletConnectModal(true);
        setShowWalletOptions(false);
        return;
      }

      console.log(`Calling connectWallet for ${walletType}`);
      await connectWallet(walletType);
      console.log(`Successfully connected ${walletType} wallet`);
      setShowWalletOptions(false);
    } catch (error) {
      console.error(`Error connecting ${walletType} wallet:`, error);
      setConnectionError(`${error.message || "Connection failed"}`);

      // Show user-friendly error message
      alert(
        `Failed to connect ${walletType} wallet: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setWalletType(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Display the wallet address in a shortened form
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Add debug button (can be removed in production)
  const debugWallet = async () => {
    logWalletInfo();
    const testResult = await testMetaMaskConnection();
    console.log("MetaMask test result:", testResult);
    alert(
      `Wallet diagnostic info logged to console. MetaMask: ${testResult.message}`
    );
  };

  return (
    <div className="relative">
      {walletInfo && walletInfo.address ? (
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-blue-100 dark:bg-gray-700 rounded-lg flex items-center">
            {walletInfo.type === "phantom" && (
              <Image
                src="/phantom-icon.svg"
                alt="Phantom"
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            {walletInfo.type === "metamask" && (
              <Image
                src="/metamask-icon.svg"
                alt="MetaMask"
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            {walletInfo.type === "coinbase" && (
              <Image
                src="/coinbase-icon.svg"
                alt="Coinbase"
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            <span className="font-medium text-sm">
              {formatAddress(walletInfo.address)}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowWalletOptions(!showWalletOptions)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            disabled={isConnecting}
          >
            {isConnecting ? (
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
                Connecting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Connect Wallet
              </>
            )}
          </button>

          {connectionError && (
            <div className="mt-2 text-sm text-red-500">{connectionError}</div>
          )}

          {/* Debug button - remove in production */}
          <button
            onClick={debugWallet}
            className="mt-2 text-xs text-gray-500 underline"
          >
            Diagnose wallet
          </button>

          {showWalletOptions && (
            <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  Popular wallets
                </div>

                {/* MetaMask */}
                {availableWallets.metamask && (
                  <button
                    onClick={() => handleConnectWallet("metamask")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/metamask-icon.svg"
                      alt="MetaMask"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    MetaMask
                  </button>
                )}

                {/* Coinbase */}
                {availableWallets.coinbase && (
                  <button
                    onClick={() => handleConnectWallet("coinbase")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/coinbase-icon.svg"
                      alt="Coinbase"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    Coinbase Wallet
                  </button>
                )}

                {/* Phantom */}
                {availableWallets.phantom && (
                  <button
                    onClick={() => handleConnectWallet("phantom")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/phantom-icon.svg"
                      alt="Phantom"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    Phantom (Solana)
                  </button>
                )}

                {/* BitGet */}
                {availableWallets.bitget && (
                  <button
                    onClick={() => handleConnectWallet("bitget")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/bitget-icon.svg"
                      alt="BitGet"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    BitGet Wallet
                  </button>
                )}

                {/* Uniswap */}
                {availableWallets.uniswap && (
                  <button
                    onClick={() => handleConnectWallet("uniswap")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/uniswap-icon.svg"
                      alt="Uniswap"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    Uniswap Wallet
                  </button>
                )}

                {/* OKX */}
                {availableWallets.okx && (
                  <button
                    onClick={() => handleConnectWallet("okx")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/okx-icon.svg"
                      alt="OKX"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    OKX Wallet
                  </button>
                )}

                {/* Trust Wallet */}
                {availableWallets.trustwallet && (
                  <button
                    onClick={() => handleConnectWallet("trustwallet")}
                    className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image
                      src="/trustwallet-icon.svg"
                      alt="Trust Wallet"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    Trust Wallet
                  </button>
                )}

                <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-t border-b border-gray-200 dark:border-gray-700 mt-2">
                  Other options
                </div>

                {/* WalletConnect - always available as fallback */}
                <button
                  onClick={() => handleConnectWallet("walletconnect")}
                  className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Image
                    src="/walletconnect-icon.svg"
                    alt="WalletConnect"
                    width={24}
                    height={24}
                    className="mr-3"
                  />
                  WalletConnect
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    Connect any wallet
                  </span>
                </button>

                {/* No wallets detected message */}
                {!availableWallets.metamask &&
                  !availableWallets.phantom &&
                  !availableWallets.coinbase &&
                  !availableWallets.bitget &&
                  !availableWallets.uniswap &&
                  !availableWallets.okx &&
                  !availableWallets.trustwallet && (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No browser wallets detected. You can use WalletConnect or
                      install a supported wallet.
                    </div>
                  )}

                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                <button
                  onClick={() => setShowWalletOptions(false)}
                  className="flex items-center px-4 py-2 w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Custom WalletConnect Modal */}
          <WalletConnectModal
            isOpen={showWalletConnectModal}
            onClose={() => {
              setShowWalletConnectModal(false);
              setIsConnecting(false);
            }}
            onConnect={connectWallet}
          />
        </>
      )}
    </div>
  );
}
