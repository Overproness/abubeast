"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Zap as ZapIcon,
  Brain,
  CheckCircle,
  Wallet,
  ExternalLink,
  BadgeCheck,
  Globe,
  Code,
} from "lucide-react";
import Link from "next/link";
import LandingNavbar from "@/components/landing-navbar";
import Footer from "@/components/footer";
import { SplinePlaceholder } from "@/components/spline-scene";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-solana-purple/10 rounded-full blur-[120px]" />
      </div>

      <LandingNavbar />

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono"
            >
              <Brain className="w-4 h-4" />
              v2.0 AI-Core Deployment Live
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight"
            >
              Cyber-Financial <br />
              <span className="text-gradient">Minimalist</span> <br />
              Intelligence
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed"
            >
              Experience the next evolution of Solana trading with AI-powered
              autonomy and lightning-fast execution. Zero delay. Absolute
              precision.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="bg-primary hover:scale-105 transition-transform text-background-dark px-8 py-4 rounded-xl font-bold flex items-center gap-2 glow-cyan"
              >
                Launch Terminal <ZapIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/docs"
                className="glass hover:bg-white/5 px-8 py-4 rounded-xl font-bold border border-white/10 flex items-center gap-2"
              >
                Documentation <ExternalLink className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="pt-8 flex gap-8 border-t border-white/5"
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                  Total Volume
                </p>
                <p className="font-mono text-xl font-bold text-solana-green">
                  $2.4B+
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                  Avg Finality
                </p>
                <p className="font-mono text-xl font-bold text-primary">400ms</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                  Max Slippage
                </p>
                <p className="font-mono text-xl font-bold text-solana-purple">
                  0.01%
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative aspect-square lg:aspect-auto h-[500px] w-full flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-solana-purple/10 rounded-full blur-3xl opacity-50" />
            <div className="relative w-full h-full glass rounded-3xl overflow-hidden group">
              <SplinePlaceholder />
              <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-xl border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-mono">
                    CORE_STATUS
                  </span>
                  <span className="text-xs font-mono text-solana-green">
                    OPTIMIZED // ACTIVE
                  </span>
                </div>
                <div className="w-24 h-8 flex items-end gap-1">
                  {[20, 60, 40, 90, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                      className="flex-1 bg-primary/40 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <AnimatedSection className="mb-16 text-center space-y-4">
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-black"
          >
            Engineered for Superiority
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Leveraging Solana&apos;s unique architecture with custom neural
            processing for institutional-grade trading speeds.
          </motion.p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-3xl group hover:border-primary/50 transition-all"
          >
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Security First</h3>
            <p className="text-slate-400 leading-relaxed text-sm mb-6">
              Military-grade encryption for all private keys. Non-custodial
              architecture ensures you always retain full control of your assets.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CheckCircle className="w-3 h-3 text-solana-green" />
                AES-256 Encryption
              </li>
              <li className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CheckCircle className="w-3 h-3 text-solana-green" />
                Biometric Auth Ready
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-3xl group hover:border-solana-purple/50 transition-all"
          >
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-solana-purple/10 group-hover:border-solana-purple/20 transition-all">
              <ZapIcon className="w-7 h-7 text-solana-purple" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Execution</h3>
            <p className="text-slate-400 leading-relaxed text-sm mb-6">
              Harnessing Solana&apos;s parallel execution and 400ms block times.
              Front-run the competition with our custom validator network
              connections.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CheckCircle className="w-3 h-3 text-solana-green" />
                Jito Bundle Support
              </li>
              <li className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CheckCircle className="w-3 h-3 text-solana-green" />
                Low-Latency RPCs
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-3xl group hover:border-solana-green/50 transition-all"
          >
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-solana-green/10 group-hover:border-solana-green/20 transition-all">
              <Brain className="w-7 h-7 text-solana-green" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Autonomy</h3>
            <p className="text-slate-400 leading-relaxed text-sm mb-6">
              Zero-intervention logic driven by real-time market sentiment
              analysis and whale-watching algorithms. Set it and let the bot
              excel.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CheckCircle className="w-3 h-3 text-solana-green" />
                Sentiment Scraping
              </li>
              <li className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CheckCircle className="w-3 h-3 text-solana-green" />
                Auto-Risk Management
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center border-primary/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-solana-purple/10 blur-[100px] -z-10" />

          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Ready to ascend?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join over 45,000 traders maximizing their yield on Solana with the
            world&apos;s most advanced minimalist trading interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary/90 text-background-dark px-10 py-4 rounded-2xl font-bold transition-all glow-cyan flex items-center justify-center gap-2"
            >
              Connect Wallet <Wallet className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              View Docs <ExternalLink className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-widest">
                Audit Passed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-widest">
                Global Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-widest">
                Open API
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}
