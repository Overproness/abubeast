"use client";

import WalletButton from "@/components/wallet-button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import { Bell, LogOut, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/terminal", label: "Terminal" },
  { href: "/dashboard/strategies", label: "Strategies" },
  { href: "/dashboard/session-keys", label: "Security Keys" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between border-b border-glass-border bg-background-dark/80 backdrop-blur-md px-6 py-3 sticky top-0 z-50"
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <div className="size-8 bg-gradient-to-br from-solana-green to-solana-purple rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-background-dark" />
          </div>
          <h2 className="text-slate-100 text-xl font-bold tracking-tight">
            AbuBeast{" "}
            <span className="text-xs font-mono bg-primary/20 px-1.5 py-0.5 rounded text-primary ml-1">
              v2.1
            </span>
          </h2>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-100",
                )}
              >
                {link.label === "Security Keys" && isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-slate-800/50 rounded-lg px-3 py-1.5 border border-glass-border">
          <span className="size-2 rounded-full bg-solana-green mr-2" />
          <span className="text-xs font-mono text-slate-300">
            RPC: Mainnet-Beta
          </span>
        </div>
        <button className="p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-primary border border-glass-border transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <WalletButton />
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-red-400 border border-glass-border transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
