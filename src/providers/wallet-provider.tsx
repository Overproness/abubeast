"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  walletType: string | null;
  balance: number | null;
}

interface WalletContextType extends WalletState {
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  address: null,
  walletType: null,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    address: null,
    walletType: null,
    balance: null,
  });

  // Restore wallet connection on mount
  useEffect(() => {
    const saved = localStorage.getItem("abubeast-wallet");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setState((s) => ({ ...s, ...data, connecting: false }));
      } catch {
        localStorage.removeItem("abubeast-wallet");
      }
    }
  }, []);

  const connect = useCallback(async (walletType: string = "phantom") => {
    setState((s) => ({ ...s, connecting: true }));

    try {
      let address: string | null = null;

      if (walletType === "phantom") {
        const provider = (window as unknown as Record<string, unknown>).solana as {
          isPhantom?: boolean;
          connect: () => Promise<{ publicKey: { toString: () => string } }>;
        } | undefined;

        if (!provider?.isPhantom) {
          window.open("https://phantom.app/", "_blank");
          throw new Error("Phantom wallet not found");
        }

        const resp = await provider.connect();
        address = resp.publicKey.toString();
      } else if (walletType === "solflare") {
        const provider = (window as unknown as Record<string, unknown>).solflare as {
          isSolflare?: boolean;
          connect: () => Promise<void>;
          publicKey: { toString: () => string };
        } | undefined;

        if (!provider?.isSolflare) {
          window.open("https://solflare.com/", "_blank");
          throw new Error("Solflare wallet not found");
        }

        await provider.connect();
        address = provider.publicKey.toString();
      } else if (walletType === "backpack") {
        const provider = (window as unknown as Record<string, unknown>).backpack as {
          isBackpack?: boolean;
          connect: () => Promise<{ publicKey: { toString: () => string } }>;
        } | undefined;

        if (!provider?.isBackpack) {
          window.open("https://www.backpack.app/", "_blank");
          throw new Error("Backpack wallet not found");
        }

        const resp = await provider.connect();
        address = resp.publicKey.toString();
      }

      if (address) {
        const newState: WalletState = {
          connected: true,
          connecting: false,
          address,
          walletType,
          balance: null,
        };
        setState(newState);
        localStorage.setItem(
          "abubeast-wallet",
          JSON.stringify({ connected: true, address, walletType, balance: null })
        );

        // Authenticate with backend
        try {
          const res = await fetch("/api/auth/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: address, walletType }),
          });
          if (!res.ok) throw new Error("Auth failed");
        } catch (err) {
          console.error("Auth error:", err);
        }
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      setState((s) => ({ ...s, connecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      connecting: false,
      address: null,
      walletType: null,
      balance: null,
    });
    localStorage.removeItem("abubeast-wallet");
  }, []);

  return (
    <WalletContext value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext>
  );
}
