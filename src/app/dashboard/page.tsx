"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Key,
  TrendingUp,
  Pause,
  Settings,
} from "lucide-react";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import LiveActivity from "@/components/dashboard/live-activity";
import AIIntelligence from "@/components/dashboard/ai-intelligence";
import StatusMetrics from "@/components/dashboard/status-metrics";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

export default function DashboardPage() {
  const [botActive, setBotActive] = useState(true);

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
                { label: "Trades Today", value: "24", color: "text-slate-100" },
                {
                  label: "Daily Volume",
                  value: "$12,504",
                  color: "text-slate-100",
                },
                {
                  label: "P&L Today",
                  value: "+4.20%",
                  color: "text-solana-green",
                },
                { label: "Win Rate", value: "78.5%", color: "text-primary" },
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
          {/* Session Key Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-5 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Key className="w-4 h-4" /> SESSION KEY
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-solana-purple/20 text-solana-purple uppercase tracking-tight">
                Active
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-background-dark rounded-lg p-3 border border-glass-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">
                    Time Remaining
                  </p>
                  <p className="text-xl font-mono font-bold text-slate-100">
                    04:22:15
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                  REVOKE
                </button>
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
          <AIIntelligence />
        </div>
      </div>

      {/* Bottom Metrics */}
      <StatusMetrics />
    </div>
  );
}
