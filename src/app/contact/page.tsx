"use client";

import Footer from "@/components/footer";
import LandingNavbar from "@/components/landing-navbar";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen">
      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Contact Us
          </h1>
          <p className="text-slate-400 text-lg">
            Have a question, feedback, or need help? We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {submitted ? (
              <div className="glassmorphism rounded-2xl p-12 text-center">
                <div className="size-16 rounded-full bg-solana-green/10 border border-solana-green/30 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-solana-green" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Message Sent!
                </h2>
                <p className="text-slate-400">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glassmorphism rounded-2xl p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-background-dark font-bold text-sm hover:opacity-90 transition-all glow-cyan"
                >
                  Send Message
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-white">Email</h3>
              </div>
              <p className="text-sm text-slate-400">support@abubeast.com</p>
            </div>

            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-solana-green/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-solana-green" />
                </div>
                <h3 className="font-bold text-white">Response Time</h3>
              </div>
              <p className="text-sm text-slate-400">
                We typically respond within 24 hours during business days.
              </p>
            </div>

            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-solana-purple/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-solana-purple" />
                </div>
                <h3 className="font-bold text-white">Location</h3>
              </div>
              <p className="text-sm text-slate-400">
                Remote-first team, globally distributed.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
