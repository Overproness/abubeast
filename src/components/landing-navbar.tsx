"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#security", label: "Security" },
  { href: "#speed", label: "Speed" },
  { href: "#roadmap", label: "Roadmap" },
];

export default function LandingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 w-full z-50 px-6 py-4"
      >
        <nav
          className={cn(
            "max-w-7xl mx-auto rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300",
            scrolled ? "glass shadow-lg" : "glass",
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-primary to-solana-purple rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-background-dark" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              AbuBeast
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              NETWORK: ONLINE
            </div>
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary/90 text-background-dark px-5 py-2 rounded-full text-sm font-bold transition-all glow-cyan"
            >
              Launch App
            </Link>
            <button
              className="md:hidden text-slate-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background-dark/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8"
          >
            <button
              className="absolute top-6 right-6 text-slate-300"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-bold hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary/90 text-background-dark px-8 py-3 rounded-full text-lg font-bold transition-all glow-cyan"
              onClick={() => setMobileOpen(false)}
            >
              Launch App
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
