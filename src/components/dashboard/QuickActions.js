"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function QuickActions() {
  const { walletInfo } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
      whileHover={{ y: -5 }}
    >
      <motion.h3
        className="text-lg font-bold text-gray-900 dark:text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Quick Actions
      </motion.h3>
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <Link href="/swap" passHref>
          <motion.button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔄</span>
            <span>Swap Tokens</span>
          </motion.button>
        </Link>

        <Link href="/trading/automated" passHref>
          <motion.button
            className={`w-full ${
              walletInfo?.address
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
            } text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2`}
            variants={fadeInUp}
            whileHover={walletInfo?.address ? { scale: 1.05 } : {}}
            whileTap={walletInfo?.address ? { scale: 0.95 } : {}}
            disabled={!walletInfo?.address}
          >
            <span>🤖</span>
            <span>Automated Trading</span>
          </motion.button>
        </Link>

        <Link href="/portfolio" passHref>
          <motion.button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>📊</span>
            <span>View Portfolio</span>
          </motion.button>
        </Link>

        <Link href="/trading/automated?tab=manage" passHref>
          <motion.button
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⚙️</span>
            <span>Manage Sessions</span>
          </motion.button>
        </Link>
      </motion.div>

      {!walletInfo?.address && (
        <motion.p
          className="mt-4 text-xs text-center text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Connect a wallet to enable automated trading
        </motion.p>
      )}
    </motion.div>
  );
}
