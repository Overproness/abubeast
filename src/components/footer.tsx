"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer({ variant = "landing" }: { variant?: "landing" | "dashboard" }) {
  if (variant === "dashboard") {
    return (
      <footer className="mt-auto border-t border-glass-border p-6 bg-background-dark/50 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-6">
            <p className="text-xs text-slate-500">© 2024 AbuBeast AI. Built for Solana.</p>
            <div className="flex gap-4">
              <Link href="/docs" className="text-xs text-slate-500 hover:text-primary transition-colors">Docs</Link>
              <Link href="/api-reference" className="text-xs text-slate-500 hover:text-primary transition-colors">API</Link>
              <Link href="/support" className="text-xs text-slate-500 hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-solana-green" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Mainnet Synchronized
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="size-6 bg-gradient-to-br from-primary to-solana-purple rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-background-dark" />
          </div>
          <span className="font-black tracking-tighter uppercase text-sm">AbuBeast</span>
        </div>
        <div className="flex gap-8 text-slate-500 text-sm">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Twitter (X)
          </a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Discord
          </a>
        </div>
        <p className="text-slate-600 text-xs font-mono">
          © 2024 AbuBeast Labs. Powered by Solana.
        </p>
      </div>
    </footer>
  );
}
