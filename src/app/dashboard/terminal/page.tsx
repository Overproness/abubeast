"use client";

import { motion } from "framer-motion";
import { Send, Terminal as TerminalIcon } from "lucide-react";
import { useState } from "react";

export default function TerminalPage() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    {
      type: "system",
      text: "AbuBeast Terminal v2.1 — Connected to Mainnet-Beta",
    },
    { type: "system", text: "Type 'help' for available commands" },
    { type: "input", text: "> status" },
    {
      type: "output",
      text: "Bot Status: ACTIVE | Strategy: MEV Arbitrage V4 | Uptime: 14d 02h",
    },
    { type: "input", text: "> balance" },
    { type: "output", text: "SOL: 142.50 | USDC: 1,248.30 | JUP: 5,420.00" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory((prev) => [
      ...prev,
      { type: "input", text: `> ${input}` },
      { type: "output", text: `Command '${input}' executed successfully.` },
    ]);
    setInput("");
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
          <TerminalIcon className="w-8 h-8 text-primary" /> Terminal
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Direct command interface to the AbuBeast trading engine
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border bg-slate-900/50">
          <div className="size-3 rounded-full bg-red-500" />
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-solana-green" />
          <span className="text-xs text-slate-500 font-mono ml-2">
            abubeast@mainnet:~
          </span>
        </div>

        <div className="p-4 h-[600px] overflow-y-auto font-mono text-sm space-y-1">
          {history.map((line, i) => (
            <div
              key={i}
              className={
                line.type === "system"
                  ? "text-solana-green"
                  : line.type === "input"
                    ? "text-primary"
                    : "text-slate-300"
              }
            >
              {line.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-glass-border"
        >
          <span className="text-primary font-mono text-sm">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-600"
            placeholder="Enter command..."
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
