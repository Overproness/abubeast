"use client";

import AIIntelligence from "@/components/dashboard/ai-intelligence";
import LiveActivity from "@/components/dashboard/live-activity";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import StatusMetrics from "@/components/dashboard/status-metrics";
import { useWallet } from "@/providers/wallet-provider";
import { motion } from "framer-motion";
import { Bot, Key, Loader2, Pause, Settings, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TradeStats {
  tradesToday: number;
  volumeToday: number;
  pnlToday: string | null;
  winRate: string | null;
}

interface SessionKeyInfo {
  _id: string;
  publicKey: string;
  status: string;
  name: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

function WalletRequiredOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-3">
          Connect Your Wallet
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          To view your portfolio, trades, and analytics, please connect your
          Solana wallet using the button in the top navigation bar.
        </p>
        <div className="glassmorphism rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span className="text-slate-300">
              Click &quot;Connect Wallet&quot; in the top right
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span className="text-slate-300">
              Select your Solana wallet (Phantom, Solflare, or Backpack)
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span className="text-slate-300">
              Approve the connection in your wallet
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { connected } = useWallet();
  const [botActive, setBotActive] = useState(true);
  const [stats, setStats] = useState<TradeStats | null>(null);

  // Session key stats
  const [sessionKeys, setSessionKeys] = useState<SessionKeyInfo[]>([]);
  const [activeKeyBalances, setActiveKeyBalances] = useState<Record<string, number | null>>({});
  const [loadingKeys, setLoadingKeys] = useState(true);

  const activeKeys = sessionKeys.filter((k) => k.status === "active");
  const activeKeyCount = activeKeys.length;
  const totalActiveBalance = Object.values(activeKeyBalances).reduce<number>(
    (sum, b) => sum + (b ?? 0),
    0,
  );

  useEffect(() => {
    if (!connected) return;
    fetch("/api/trades/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, [connected]);

  // Fetch session keys
  useEffect(() => {
    if (!connected) return;
    fetch("/api/session-keys")
      .then((r) => r.json())
      .then((data) => setSessionKeys(data.sessionKeys ?? []))
      .catch(console.error)
      .finally(() => setLoadingKeys(false));
  }, [connected]);

  // Fetch balances for active keys
  useEffect(() => {
    const active = sessionKeys.filter((k) => k.status === "active");
    if (active.length === 0) return;

    active.forEach(async (key) => {
      try {
        const res = await fetch(`/api/wallet/balance?address=${key.publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setActiveKeyBalances((prev) => ({ ...prev, [key.publicKey]: data.balance }));
        }
      } catch {
        setActiveKeyBalances((prev) => ({ ...prev, [key.publicKey]: null }));
      }
    });
  }, [sessionKeys]);

  if (!connected) {
    return <WalletRequiredOverlay />;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Bot Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-xl relative overflow-hidden group"
            data-tour="bot-status"
          >
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div
                    className={`size-16 rounded-full border-2 flex items-center justify-center ${
                      botActive
                        ? "border-solana-green neon-pulse bg-solana-green/10"
                        : "border-red-500 bg-red-500/10"
                    }`}
                  >
                    <Bot
                      className={`w-8 h-8 ${
                        botActive ? "text-solana-green" : "text-red-500"
                      }`}
                    />
                  </div>
                  {botActive && (
                    <div className="absolute -bottom-1 -right-1 size-4 bg-solana-green rounded-full border-2 border-background-dark" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Status: {botActive ? "Operational" : "Paused"}
                  </h3>
                  <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    Automated Trading:{" "}
                    <span
                      className={
                        botActive ? "text-solana-green" : "text-red-500"
                      }
                    >
                      {botActive ? "ACTIVE" : "PAUSED"}
                    </span>
                  </h1>
                  <p className="text-sm text-slate-400 font-mono mt-1">
                    Monitoring SOL/USDC &amp; JUP/SOL pairs
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setBotActive(!botActive)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                    botActive
                      ? "bg-background-dark border-solana-green/50 text-solana-green hover:bg-solana-green hover:text-background-dark"
                      : "bg-solana-green text-background-dark border-solana-green"
                  }`}
                >
                  {botActive ? (
                    <span className="flex items-center gap-2">
                      <Pause className="w-4 h-4" /> PAUSE BOT
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> RESUME BOT
                    </span>
                  )}
                </button>
                <button className="px-6 py-2.5 bg-slate-800 text-slate-200 rounded-lg text-sm font-bold border border-glass-border hover:bg-slate-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> SETTINGS
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                {
                  label: "Trades Today",
                  value: stats ? String(stats.tradesToday) : "—",
                  color: "text-slate-100",
                },
                {
                  label: "Daily Volume",
                  value: stats
                    ? stats.volumeToday > 0
                      ? `$${stats.volumeToday.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : "$0"
                    : "—",
                  color: "text-slate-100",
                },
                {
                  label: "P&L Today",
                  value: stats ? (stats.pnlToday ?? "—") : "—",
                  color: stats?.pnlToday?.startsWith("+")
                    ? "text-solana-green"
                    : stats?.pnlToday?.startsWith("-")
                      ? "text-red-400"
                      : "text-slate-100",
                },
                {
                  label: "Win Rate",
                  value: stats
                    ? stats.winRate
                      ? `${stats.winRate}%`
                      : "—"
                    : "—",
                  color: "text-primary",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="p-4 rounded-lg bg-slate-900/50 border border-glass-border"
                >
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-mono font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Portfolio Chart */}
          <PortfolioChart />
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Session Keys Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-5 rounded-xl"
            data-tour="session-keys-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Key className="w-4 h-4" /> SESSION KEYS
              </h3>
              <Link
                href="/dashboard/session-keys"
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-tight hover:bg-primary/30 transition-colors"
              >
                Manage
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {/* Active Keys Count */}
              <div className="bg-background-dark rounded-lg p-3 border border-glass-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Active Keys</p>
                  <p className="text-xl font-mono font-bold text-slate-100">
                    {loadingKeys ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary inline" />
                    ) : (
                      activeKeyCount
                    )}
                  </p>
                </div>
                <div className={`size-10 rounded-full flex items-center justify-center ${
                  activeKeyCount > 0
                    ? "bg-solana-green/10 border border-solana-green/30"
                    : "bg-slate-800 border border-glass-border"
                }`}>
                  <Key className={`w-5 h-5 ${activeKeyCount > 0 ? "text-solana-green" : "text-slate-500"}`} />
                </div>
              </div>

              {/* Total Balance */}
              <div className="bg-background-dark rounded-lg p-3 border border-glass-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">
                    Total Key Balance
                  </p>
                  <p className="text-xl font-mono font-bold text-primary">
                    {loadingKeys ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary inline" />
                    ) : activeKeyCount === 0 ? (
                      "—"
                    ) : Object.keys(activeKeyBalances).length < activeKeyCount ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary inline" />
                    ) : (
                      `${totalActiveBalance.toFixed(4)} SOL`
                    )}
                  </p>
                </div>
                <div className="size-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/30">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                Session keys allow the bot to sign transactions on your behalf
                without requiring manual approval for each trade.
              </p>
            </div>
          </motion.div>

          {/* Live Activity */}
          <LiveActivity />

          {/* AI Intelligence */}
          {/* <AIIntelligence /> */}
        </div>
      </div>

      {/* Bottom Metrics */}
      {/* <StatusMetrics /> */}
    </div>
  );
}
