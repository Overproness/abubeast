"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATA_1D = [
  { time: "00:00", value: 120 },
  { time: "03:00", value: 125 },
  { time: "06:00", value: 118 },
  { time: "09:00", value: 130 },
  { time: "12:00", value: 138 },
  { time: "15:00", value: 135 },
  { time: "18:00", value: 140 },
  { time: "19:00", value: 142 },
  { time: "20:00", value: 141 },
  { time: "21:00", value: 142.5 },
];

const DATA_1W = [
  { time: "Mon", value: 110 },
  { time: "Tue", value: 118 },
  { time: "Wed", value: 125 },
  { time: "Thu", value: 120 },
  { time: "Fri", value: 135 },
  { time: "Sat", value: 138 },
  { time: "Sun", value: 142.5 },
];

const DATA_1M = [
  { time: "Week 1", value: 90 },
  { time: "Week 2", value: 105 },
  { time: "Week 3", value: 115 },
  { time: "Week 4", value: 142.5 },
];

type Period = "1D" | "1W" | "1M";

export default function PortfolioChart() {
  const [period, setPeriod] = useState<Period>("1D");

  const dataMap: Record<Period, typeof DATA_1D> = {
    "1D": DATA_1D,
    "1W": DATA_1W,
    "1M": DATA_1M,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-panel p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100">
            Portfolio Performance
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-3xl font-mono font-bold text-white tracking-tighter">
              142.50 SOL
            </span>
            <span className="text-solana-green text-sm font-bold bg-solana-green/10 px-2 py-0.5 rounded">
              +$842.12 (24h)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {(["1D", "1W", "1M"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                period === p
                  ? "bg-primary text-background-dark"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataMap[period]} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 10", "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 34, 35, 0.9)",
                border: "1px solid rgba(0, 242, 255, 0.2)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(0, 242, 255, 0.05)" }}
              formatter={(value) => [`${value} SOL`, "Balance"]}
            />
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14f195" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#00f2ff" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
