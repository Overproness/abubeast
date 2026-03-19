"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Globe,
  Save,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [rpcEndpoint, setRpcEndpoint] = useState("mainnet-beta");

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure your trading dashboard preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" /> Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Push Notifications
                </p>
                <p className="text-xs text-slate-500">
                  Receive alerts in your browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Trade Alerts</p>
                <p className="text-xs text-slate-500">
                  Get notified on every trade execution
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tradeAlerts}
                  onChange={(e) => setTradeAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Price Alerts</p>
                <p className="text-xs text-slate-500">
                  Alert when tokens hit target prices
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={priceAlerts}
                  onChange={(e) => setPriceAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        </motion.section>

        {/* Network */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glassmorphism rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-primary" /> Network
          </h2>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
              RPC Endpoint
            </label>
            <select
              value={rpcEndpoint}
              onChange={(e) => setRpcEndpoint(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mainnet-beta">Mainnet Beta (Default)</option>
              <option value="devnet">Devnet</option>
              <option value="custom">Custom RPC</option>
            </select>
          </div>
        </motion.section>

        {/* Security */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glassmorphism rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" /> Security
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-slate-500">
                    Add an extra layer of security
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-primary text-background-dark text-xs font-bold">
                  Enable
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">
                    Active Sessions
                  </p>
                  <p className="text-xs text-slate-500">
                    Manage your active login sessions
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                  Revoke All
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <button className="px-8 py-3 rounded-xl bg-primary text-background-dark font-bold flex items-center gap-2 glow-cyan hover:opacity-90 transition-all">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </motion.div>
      </div>
    </div>
  );
}
