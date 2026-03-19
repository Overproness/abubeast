"use client";

import Footer from "@/components/footer";
import LandingNavbar from "@/components/landing-navbar";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm mb-12">
            Last updated: March 19, 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-slate-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using AbuBeast, you agree to be bound by these Terms of
                Service. If you do not agree to these terms, you may not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
              <p>
                AbuBeast is an AI-powered trading bot platform for the Solana blockchain.
                The platform provides automated trading execution, portfolio analytics,
                and risk management tools. AbuBeast operates in a non-custodial manner —
                we never take custody of your assets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Account Responsibilities</h2>
              <p>
                You are responsible for maintaining the security of your account credentials.
                You must use a strong password and should not share your login information
                with anyone. You are responsible for all activity that occurs under your
                account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Trading Risks</h2>
              <p>
                Trading cryptocurrencies involves significant risk of loss. Past performance
                does not guarantee future results. AbuBeast&apos;s automated strategies may
                result in losses. You should only trade with funds you can afford to lose.
                AbuBeast is not a financial advisor and does not provide financial advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Non-Custodial Nature</h2>
              <p>
                AbuBeast does not hold, store, or have access to your private keys or
                seed phrases. All transactions require your explicit authorization through
                session keys, which have strict time limits and permission boundaries.
                You maintain full control of your wallet at all times.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Session Keys</h2>
              <p>
                When you authorize a session key, you grant the bot limited permission to
                sign transactions on your behalf. Session keys expire automatically and
                can be revoked at any time. Withdrawal access is never granted to session
                keys.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Limitation of Liability</h2>
              <p>
                AbuBeast is provided &quot;as is&quot; without warranties of any kind. We are not
                liable for any trading losses, missed opportunities, technical failures,
                or any other damages arising from your use of the platform. This includes
                losses due to blockchain network issues, smart contract bugs, or market
                volatility.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Prohibited Uses</h2>
              <p>
                You may not use AbuBeast to engage in market manipulation, wash trading,
                or any other activity that violates applicable laws or regulations. You
                may not attempt to reverse engineer, decompile, or exploit the platform&apos;s
                systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be
                posted on this page. Continued use of the platform after modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at our discretion
                if we believe you have violated these terms. You may also delete your
                account at any time through the settings page or by contacting us.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
