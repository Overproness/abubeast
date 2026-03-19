"use client";

import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";

const ACTIVITIES = [
  {
    time: "14:02:11",
    type: "BUY Order",
    detail: "2.50 SOL → 342.10 USDC",
    sub: "Tx: 4z9jP...zX21",
    status: "SUCCESS",
    statusColor: "text-solana-green",
    borderColor: "border-solana-green",
  },
  {
    time: "13:58:45",
    type: "PRICE ALERT",
    detail: "JUP/SOL Breakout Pattern Det.",
    sub: "",
    status: "SIGNAL",
    statusColor: "text-primary",
    borderColor: "border-primary",
  },
  {
    time: "13:45:02",
    type: "SELL Order",
    detail: "120.4 JUP → 0.85 SOL",
    sub: "+1.2% Gain",
    status: "SUCCESS",
    statusColor: "text-solana-green",
    borderColor: "border-solana-green",
  },
  {
    time: "13:30:11",
    type: "WALLET",
    detail: "Balance update completed.",
    sub: "",
    status: "SYNC",
    statusColor: "text-solana-purple",
    borderColor: "border-solana-purple",
  },
  {
    time: "13:12:44",
    type: "SCANNING",
    detail: "Checking Raydium liquidity...",
    sub: "",
    status: "IDLE",
    statusColor: "text-slate-500",
    borderColor: "border-slate-700",
  },
];

export default function LiveActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-5 rounded-xl flex-1 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
          <ListChecks className="w-4 h-4" /> LIVE ACTIVITY
        </h3>
        <span className="size-2 rounded-full bg-solana-green animate-pulse" />
      </div>

      <div className="flex-1 space-y-3 font-mono text-[11px] overflow-hidden">
        {ACTIVITIES.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className={`p-2.5 rounded bg-slate-900/40 border-l-2 ${activity.borderColor}`}
          >
            <div className="flex justify-between text-slate-400 mb-1">
              <span>
                [{activity.time}] {activity.type}
              </span>
              <span className={activity.statusColor}>{activity.status}</span>
            </div>
            <div className="text-slate-200">{activity.detail}</div>
            {activity.sub && (
              <div
                className={`text-[10px] ${
                  activity.sub.includes("+")
                    ? "text-solana-green font-bold"
                    : "text-slate-500"
                } truncate`}
              >
                {activity.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 border border-glass-border rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
        VIEW FULL HISTORY
      </button>
    </motion.div>
  );
}
