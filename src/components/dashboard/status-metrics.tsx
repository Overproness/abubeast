"use client";

import { motion } from "framer-motion";
import { Gauge, Radio, Shield, Wallet } from "lucide-react";

const METRICS = [
  {
    icon: Shield,
    label: "Security Score",
    value: "Tier 3 Verified",
    color: "text-slate-200",
  },
  {
    icon: Gauge,
    label: "Execution Latency",
    value: "14ms Average",
    color: "text-slate-200",
  },
  {
    icon: Wallet,
    label: "Gas Savings",
    value: "0.42 SOL saved",
    color: "text-solana-green",
  },
  {
    icon: Radio,
    label: "Network Health",
    value: "Optimal (2.1k TPS)",
    color: "text-slate-200",
  },
];

export default function StatusMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
      {METRICS.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="glass-panel p-4 rounded-xl flex items-center gap-4"
        >
          <div className="size-10 rounded-full bg-slate-800 border border-glass-border flex items-center justify-center">
            <metric.icon className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
              {metric.label}
            </p>
            <p className={`text-sm font-bold ${metric.color}`}>
              {metric.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
