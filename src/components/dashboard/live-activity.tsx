"use client";

import { motion } from "framer-motion";
import { ListChecks, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface Trade {
  _id: string;
  type: "buy" | "sell" | "swap";
  status: "success" | "failed" | "pending";
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  pnl?: number;
  pnlPercentage?: number;
  txSignature?: string;
  createdAt: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function LiveActivity() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = () => {
    setLoading(true);
    fetch("/api/trades?limit=5")
      .then((r) => r.json())
      .then((data) => setTrades(data.trades ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-5 rounded-xl flex-1 flex flex-col"
      data-tour="live-activity"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
          <ListChecks className="w-4 h-4" /> TRADE HISTORY
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTrades}
            className="p-1 rounded text-slate-500 hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <span className="size-2 rounded-full bg-solana-green animate-pulse" />
        </div>
      </div>

      <div className="flex-1 space-y-3 font-mono text-[11px] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-1">
            <p className="text-slate-500 text-xs">No trades executed yet</p>
            <p className="text-slate-600 text-[10px] text-center">
              Trade history will appear here once the bot starts
            </p>
          </div>
        ) : (
          trades.map((trade, i) => {
            const label =
              trade.type === "buy"
                ? "BUY Order"
                : trade.type === "sell"
                  ? "SELL Order"
                  : "SWAP";
            const detail = `${trade.fromAmount} ${trade.fromToken} → ${trade.toAmount} ${trade.toToken}`;
            const sub =
              trade.pnlPercentage != null
                ? `${trade.pnlPercentage >= 0 ? "+" : ""}${trade.pnlPercentage.toFixed(2)}% P&L`
                : trade.txSignature
                  ? `Tx: ${trade.txSignature.slice(0, 6)}...${trade.txSignature.slice(-4)}`
                  : "";
            const status =
              trade.status === "success"
                ? "SUCCESS"
                : trade.status === "failed"
                  ? "FAILED"
                  : "PENDING";
            const statusColor =
              trade.status === "success"
                ? "text-solana-green"
                : trade.status === "failed"
                  ? "text-red-400"
                  : "text-primary";
            const borderColor =
              trade.status === "success"
                ? "border-solana-green"
                : trade.status === "failed"
                  ? "border-red-400"
                  : "border-primary";

            return (
              <motion.div
                key={trade._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-2.5 rounded bg-slate-900/40 border-l-2 ${borderColor}`}
              >
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>
                    [{formatTime(trade.createdAt)}] {label}
                  </span>
                  <span className={statusColor}>{status}</span>
                </div>
                <div className="text-slate-200">{detail}</div>
                {sub && (
                  <div
                    className={`text-[10px] ${
                      sub.startsWith("+")
                        ? "text-solana-green font-bold"
                        : "text-slate-500"
                    } truncate`}
                  >
                    {sub}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <button className="w-full mt-4 py-2 border border-glass-border rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
        VIEW FULL HISTORY
      </button>
    </motion.div>
  );
}
