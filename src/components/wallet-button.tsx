"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, X, ExternalLink } from "lucide-react";
import { useWallet } from "@/providers/wallet-provider";
import { shortenAddress } from "@/lib/utils";

const WALLETS = [
  { id: "phantom", name: "Phantom", icon: "👻", color: "#ab9ff2" },
  { id: "solflare", name: "Solflare", icon: "🔥", color: "#fc822b" },
  { id: "backpack", name: "Backpack", icon: "🎒", color: "#e33e3f" },
] as const;

export default function WalletButton() {
  const { connected, connecting, address, walletType, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (connected && address) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold hover:brightness-110 transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>{shortenAddress(address)}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-xl p-4 z-50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-mono">Connected via {walletType}</span>
                <button onClick={() => setShowDropdown(false)}>
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 mb-3 border border-glass-border">
                <p className="font-mono text-xs text-slate-300 break-all">{address}</p>
              </div>
              <div className="space-y-2">
                <a
                  href={`https://solscan.io/account/${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> View on Solscan
                </a>
                <button
                  onClick={() => { disconnect(); setShowDropdown(false); }}
                  className="w-full py-2 mt-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={connecting}
        className="bg-primary hover:bg-primary/90 text-background-dark px-5 py-2 rounded-full text-sm font-bold transition-all glow-cyan disabled:opacity-50"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>

      <AnimatePresence>
        {showDropdown && !connecting && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 glass-panel rounded-xl p-4 z-50"
          >
            <p className="text-xs text-slate-500 mb-3 font-medium">Select a Solana wallet</p>
            <div className="space-y-2">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    connect(w.id);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
                >
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{w.name}</p>
                    <p className="text-[10px] text-slate-500">Solana</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
