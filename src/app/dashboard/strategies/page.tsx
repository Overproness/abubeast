"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Lock,
  Unlock,
  ChevronRight,
} from "lucide-react";

const STRATEGIES = [
  {
    name: "MEV Arbitrage V4",
    desc: "Cross-DEX arbitrage with Jito bundles for MEV extraction",
    risk: "Medium",
    riskColor: "text-yellow-400",
    active: true,
    pnl: "+24.5%",
    icon: Zap,
    iconColor: "text-primary",
  },
  {
    name: "Momentum Scalper",
    desc: "High-frequency scalping on trending tokens with ML signals",
    risk: "High",
    riskColor: "text-red-400",
    active: false,
    pnl: "+18.2%",
    icon: TrendingUp,
    iconColor: "text-solana-green",
  },
  {
    name: "Whale Follower",
    desc: "Copy-trade algorithm tracking top Solana whale wallets",
    risk: "Low",
    riskColor: "text-solana-green",
    active: false,
    pnl: "+12.8%",
    icon: Brain,
    iconColor: "text-solana-purple",
  },
  {
    name: "DCA Auto-Invest",
    desc: "Dollar-cost averaging into selected tokens on schedule",
    risk: "Low",
    riskColor: "text-solana-green",
    active: false,
    pnl: "+8.4%",
    icon: Shield,
    iconColor: "text-slate-400",
  },
];

export default function StrategiesPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-white tracking-tighter">
          Trading Strategies
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure and activate automated trading strategies
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STRATEGIES.map((strat, i) => (
          <motion.div
            key={strat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glassmorphism rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${strat.iconColor}`}
                >
                  <strat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{strat.name}</h3>
                  <p className="text-xs text-slate-500">{strat.desc}</p>
                </div>
              </div>
              {strat.active ? (
                <Unlock className="w-5 h-5 text-solana-green" />
              ) : (
                <Lock className="w-5 h-5 text-slate-600" />
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-0.5">Risk</p>
                  <p className={`text-xs font-bold ${strat.riskColor}`}>
                    {strat.risk}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-0.5">30d PnL</p>
                  <p className="text-xs font-bold text-solana-green font-mono">
                    {strat.pnl}
                  </p>
                </div>
              </div>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  strat.active
                    ? "bg-solana-green text-background-dark"
                    : "bg-white/10 text-white hover:bg-primary hover:text-background-dark"
                }`}
              >
                {strat.active ? "Active" : "Activate"}{" "}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
