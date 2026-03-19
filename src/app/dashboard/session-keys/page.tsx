"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Download,
  LinkIcon,
  Lock,
  ArrowRightLeft,
  Bot,
  StopCircle,
  Rocket,
  Receipt,
  ArrowRight,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const TRADES = [
  {
    from: "SOL",
    to: "JUP",
    toColor: "text-solana-green",
    iconBg: "bg-solana-green/10",
    iconColor: "text-solana-green",
    amount: "+412.50 JUP",
    fees: "-$1.20 Fees",
    time: "2 minutes ago • Jupiter Aggregator",
  },
  {
    from: "PYTH",
    to: "SOL",
    toColor: "text-solana-purple",
    iconBg: "bg-solana-purple/10",
    iconColor: "text-solana-purple",
    amount: "+0.85 SOL",
    fees: "-$0.85 Fees",
    time: "14 minutes ago • Raydium V3",
  },
  {
    from: "USDC",
    to: "PYTH",
    toColor: "text-solana-green",
    iconBg: "bg-solana-green/10",
    iconColor: "text-solana-green",
    amount: "+1,200 PYTH",
    fees: "-$2.10 Fees",
    time: "1 hour ago • Orca Whirlpool",
  },
];

export default function SessionKeysPage() {
  const [canTrade, setCanTrade] = useState(true);
  const [canSwap, setCanSwap] = useState(true);
  const [dailyLimit, setDailyLimit] = useState("25.50");
  const [slippage, setSlippage] = useState("0.5");

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Session &amp; <span className="text-primary">Trading Keys</span>
          </h1>
          <p className="text-slate-400 max-w-xl">
            Manage automated execution permissions and bot session authorization.
            Your keys are encrypted using bank-grade hardware security modules.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Manifest
          </button>
          <button className="px-6 py-3 rounded-xl bg-primary text-background-dark text-sm font-black transition-all hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20">
            <LinkIcon className="w-4 h-4" /> Rotate Keys
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Session Key Authorization */}
          <motion.section
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="glassmorphism rounded-2xl p-8 border-l-4 border-l-primary relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Session Key Authorization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Toggles */}
                <div className="space-y-6">
                  {/* Can Trade */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Can Trade Assets</p>
                      <p className="text-xs text-slate-500">
                        Allow bot to execute market orders
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canTrade}
                        onChange={(e) => setCanTrade(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>

                  {/* Can Swap */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Can Swap Tokens</p>
                      <p className="text-xs text-slate-500">
                        Permission to use DEX aggregators
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canSwap}
                        onChange={(e) => setCanSwap(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>

                  {/* Withdrawal (disabled) */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-50 grayscale">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Withdrawal Access
                      </p>
                      <p className="text-xs text-slate-500">
                        Disabled for security reasons
                      </p>
                    </div>
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                </div>

                {/* Right: Limits */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                      Daily Spending Limit (SOL)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dailyLimit}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) setDailyLimit(val);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                        SOL
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500 italic">
                      Remaining today: 12.45 SOL
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                      Max Slippage (%)
                    </label>
                    <div className="flex gap-2">
                      {["0.1", "0.5", "1.0"].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSlippage(val)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            slippage === val
                              ? "bg-primary text-background-dark"
                              : "bg-white/10 text-white hover:bg-primary hover:text-background-dark"
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                      <button
                        onClick={() => setSlippage("custom")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          slippage === "custom"
                            ? "bg-primary text-background-dark"
                            : "bg-white/10 text-white hover:bg-primary hover:text-background-dark"
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all">
                  Update Authorized Session
                </button>
              </div>
            </div>
          </motion.section>

          {/* Recent Trades */}
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="glassmorphism rounded-2xl overflow-hidden border border-white/5"
          >
            <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-solana-green" /> Recent
                Automated Trades
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">
                View on Solscan
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {TRADES.map((trade, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="px-8 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 rounded-lg ${trade.iconBg} flex items-center justify-center ${trade.iconColor}`}
                    >
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {trade.from}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span
                          className={`font-mono text-sm font-bold ${trade.toColor}`}
                        >
                          {trade.to}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{trade.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-white">
                      {trade.amount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {trade.fees}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Trading Bot Status */}
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="glassmorphism rounded-2xl p-8 border border-white/5 flex flex-col items-center text-center"
          >
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="relative size-32 rounded-full border-4 border-primary flex items-center justify-center bg-background-dark glow-cyan">
                <Bot className="w-14 h-14 text-primary" />
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                Trading Bot
              </h3>
              <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Bot Scanning Blockchain...
                </span>
              </div>
            </div>
            <div className="w-full space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Current Strategy</span>
                <span className="text-white font-bold">MEV Arbitrage V4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Avg. Response Time</span>
                <span className="text-white font-mono">14ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nodes Connected</span>
                <span className="text-white font-bold">4 (Global)</span>
              </div>
            </div>
            <button className="w-full py-5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black text-lg transition-all group flex items-center justify-center gap-3">
              <StopCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              TERMINATE BOT
            </button>
          </motion.section>

          {/* Real-time Performance */}
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="glassmorphism rounded-2xl p-6 border border-white/5"
          >
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
              Real-time Performance
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-500">Success Rate</span>
                  <span className="text-xs font-mono font-bold text-primary">
                    98.4%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "98.4%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-primary shadow-[0_0_10px_#00f2ff]"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-500">Session Uptime</span>
                  <span className="text-xs font-mono font-bold text-solana-green">
                    14d 02h 11m
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full solana-gradient"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Upgrade Card */}
          <motion.section
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="rounded-2xl p-6 bg-gradient-to-br from-solana-purple/20 to-primary/20 border border-white/10 overflow-hidden relative"
          >
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-white mb-2">
                Go Professional
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Unlock multi-wallet signing and institutional grade execution
                latency.
              </p>
              <button className="w-full py-2.5 rounded-lg bg-white text-background-dark text-xs font-black transition-all hover:bg-slate-100">
                UPGRADE PLAN
              </button>
            </div>
            <Rocket className="absolute -bottom-4 -right-4 w-20 h-20 text-white opacity-10 rotate-12" />
          </motion.section>
        </div>
      </div>
    </div>
  );
}
