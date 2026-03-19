"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getZIndexClass } from "@/lib/utils/zIndexLayers";
import {
  logWalletInfo,
  testMetaMaskConnection,
} from "@/lib/wallet/walletDetector";
import { Check, Copy, LogOut, Wallet, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import WalletConnectModal from "./WalletConnectModal";

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { connectWallet, disconnectWallet, walletInfo } = useAuth();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [availableWallets, setAvailableWallets] = useState({
    metamask: false,
    phantom: false,
    coinbase: false,
    bitget: false,
    uniswap: false,
    okx: false,
    trustwallet: false,
    walletconnect: true,
  });

  useEffect(() => {
    logWalletInfo();

    const hasMetaMask =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isMetaMask;

    const hasPhantom =
      typeof window !== "undefined" && window.solana && window.solana.isPhantom;

    const hasCoinbaseWallet =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isCoinbaseWallet;

    const hasBitget =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isBitKeep;

    const hasUniswap =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isUniswap;

    const hasOKX =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isOKExWallet;

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showWalletOptions &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowWalletOptions(false);
      }
    }

    if (showWalletOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWalletOptions]);

  const handleConnectWallet = async (walletType) => {
    try {
      setIsConnecting(true);
      setWalletType(walletType);
      setConnectionError(null);

      if (walletType === "metamask") {
        const testResult = await testMetaMaskConnection();
        if (!testResult.success) {
          throw new Error(`MetaMask test failed: ${testResult.message}`);
        }
      }

      if (walletType === "walletconnect") {
        setShowWalletConnectModal(true);
        setShowWalletOptions(false);
        return;
      }

      await connectWallet(walletType);
      setShowWalletOptions(false);
    } catch (error) {
      console.error(`Error connecting ${walletType} wallet:`, error);
      setConnectionError(`${error.message || "Connection failed"}`);
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

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWalletIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "phantom":
        return "👻";
      case "metamask":
        return "🦊";
      case "coinbase":
        return "💰";
      default:
        return "💳";
    }
  };

  return (
    <div className="relative">
      {walletInfo && walletInfo.address ? (
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-glass-bg border border-glass-border flex items-center gap-2">
            <span className="text-lg">{getWalletIcon(walletInfo.type)}</span>
            <span className="font-mono text-sm font-medium">
              {formatAddress(walletInfo.address)}
            </span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-glass-bg rounded transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          <Button
            ref={buttonRef}
            onClick={() => setShowWalletOptions(!showWalletOptions)}
            disabled={isConnecting}
            size="sm"
          >
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          {connectionError && (
            <div className="absolute mt-2 text-sm text-red-500 whitespace-nowrap">
              {connectionError}
            </div>
          )}

          {showWalletOptions && (
            <WalletDropdown
              availableWallets={availableWallets}
              handleConnectWallet={handleConnectWallet}
              setShowWalletOptions={setShowWalletOptions}
              buttonRef={buttonRef}
            />
          )}

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

function WalletDropdown({
  availableWallets,
  handleConnectWallet,
  setShowWalletOptions,
  buttonRef,
}) {
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function updatePosition() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right - window.scrollX,
        });
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [buttonRef]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowWalletOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowWalletOptions, buttonRef]);

  const walletItems = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "/metamask-icon.svg",
      available: availableWallets.metamask,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "/coinbase-icon.svg",
      available: availableWallets.coinbase,
    },
    {
      id: "phantom",
      name: "Phantom (Solana)",
      icon: "/phantom-icon.svg",
      available: availableWallets.phantom,
    },
    {
      id: "bitget",
      name: "Bitget Wallet",
      icon: "/bitget-icon.svg",
      available: availableWallets.bitget,
    },
    {
      id: "uniswap",
      name: "Uniswap Wallet",
      icon: "/uniswap-icon.svg",
      available: availableWallets.uniswap,
    },
    {
      id: "okx",
      name: "OKX Wallet",
      icon: "/okx-icon.svg",
      available: availableWallets.okx,
    },
    {
      id: "trustwallet",
      name: "Trust Wallet",
      icon: "/trustwallet-icon.svg",
      available: availableWallets.trustwallet,
    },
  ];

  const availableItems = walletItems.filter((w) => w.available);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`fixed w-72 rounded-xl shadow-2xl glass-card border border-glass-border overflow-hidden ${getZIndexClass(
        "WALLET_DROPDOWN"
      )}`}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className="max-h-96 overflow-y-auto">
        <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
          <span className="text-sm font-semibold">Connect Wallet</span>
          <button
            onClick={() => setShowWalletOptions(false)}
            className="p-1 hover:bg-glass-bg rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {availableItems.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs text-muted-foreground font-medium">
              Detected Wallets
            </div>
            {availableItems.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnectWallet(wallet.id)}
                className="flex items-center px-4 py-3 w-full text-left text-sm hover:bg-glass-bg transition-colors"
              >
                <Image
                  src={wallet.icon}
                  alt={wallet.name}
                  width={24}
                  height={24}
                  className="mr-3"
                />
                <span className="font-medium">{wallet.name}</span>
              </button>
            ))}
          </>
        )}

        <div className="px-4 py-2 text-xs text-muted-foreground font-medium border-t border-glass-border mt-1">
          Other Options
        </div>

        <button
          onClick={() => handleConnectWallet("walletconnect")}
          className="flex items-center px-4 py-3 w-full text-left text-sm hover:bg-glass-bg transition-colors"
        >
          <Image
            src="/walletconnect-icon.svg"
            alt="WalletConnect"
            width={24}
            height={24}
            className="mr-3"
          />
          <div>
            <span className="font-medium">WalletConnect</span>
            <p className="text-xs text-muted-foreground">Connect any wallet</p>
          </div>
        </button>

        {availableItems.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground border-t border-glass-border">
            No browser wallets detected. Use WalletConnect or install a
            supported wallet.
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dropdownContent, document.body)
    : null;
}
