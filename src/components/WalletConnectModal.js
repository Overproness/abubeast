"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function WalletConnectModal({ isOpen, onClose, onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset error state when modal opens/closes
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    console.log("WalletConnectModal: Attempting to connect via WalletConnect");

    try {
      console.log("WalletConnectModal: Calling onConnect('walletconnect')");
      await onConnect("walletconnect");
      console.log("WalletConnectModal: Connection successful");
      onClose();
    } catch (err) {
      console.error("WalletConnectModal: Connection error:", err);
      setError(
        `Failed to connect with WalletConnect: ${
          err.message || "Unknown error"
        }`
      );
    } finally {
      setConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Connect with WalletConnect
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Click the button below to connect your wallet using WalletConnect.
            This will allow you to connect most mobile wallets.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {connecting ? (
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
                <Image
                  src="/walletconnect-icon.svg"
                  alt="WalletConnect"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
