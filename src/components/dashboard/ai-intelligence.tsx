"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function AIIntelligence() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-5 rounded-xl bg-gradient-to-br from-solana-purple/10 to-transparent border border-solana-purple/20"
    >
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-lg bg-solana-purple/20 flex items-center justify-center text-solana-purple">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100">AI Intelligence</h4>
          <p className="text-xs text-slate-400">Current Bias: Bullish</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "72%" }}
          transition={{ duration: 1, delay: 0.6 }}
          className="h-full bg-solana-purple rounded-full shadow-[0_0_8px_rgba(153,69,255,0.6)]"
        />
      </div>
    </motion.div>
  );
}
