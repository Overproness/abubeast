"use client";

import Footer from "@/components/footer";
import LandingNavbar from "@/components/landing-navbar";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm mb-12">
            Last updated: March 19, 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-slate-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p>
                When you create an account, we collect your email address, display name, and an
                encrypted version of your password. When you connect a wallet, we store your
                public wallet address. We do not collect or store private keys, seed phrases,
                or any other wallet secrets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to provide and improve our services, including
                authenticating your account, displaying your portfolio data, executing
                trades on your behalf (only when authorized via session keys), and
                sending notifications you have opted into.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Blockchain Data</h2>
              <p>
                AbuBeast reads publicly available blockchain data associated with your wallet
                address. This includes token balances, transaction history, and account
                information. This data is already publicly accessible on the Solana blockchain
                and is not considered private information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Data Security</h2>
              <p>
                We implement industry-standard security measures including encrypted storage,
                HTTPS-only communication, httpOnly cookies for session management, and bcrypt
                password hashing. Session keys are encrypted at rest and destroyed upon
                expiration or revocation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. Trading
                history and performance metrics are retained to provide historical analytics.
                You may request deletion of your account and associated data at any time by
                contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Third-Party Services</h2>
              <p>
                We interact with Solana RPC nodes and on-chain price oracles (Pyth, Switchboard)
                to fetch market data. We do not sell, rent, or share your personal information
                with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
              <p>
                We use a single httpOnly authentication cookie to manage your login session.
                We do not use tracking cookies, advertising cookies, or any third-party
                analytics cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Any changes will be
                posted on this page with an updated revision date. Continued use of the
                platform after changes constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Contact</h2>
              <p>
                If you have questions about this privacy policy or your data, please reach
                out via our contact page.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
