"use client";

import { motion } from "framer-motion";

export default function TokenDiscoverySection({
  tokens = [],
  loading = false,
  onTokenClick,
  onRefreshData,
}) {
  console.log(
    "[TokenDiscoverySection] Received tokens:",
    tokens?.length || 0,
    tokens
  );

  return (
    <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Token Discovery
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {tokens?.length || 0} tokens tracked
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {tokens?.filter((t) => !t.processed)?.length || 0} pending
            enrichment
          </div>
        </div>
      </div>

      {loading && (!tokens || tokens.length === 0) ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : !tokens || tokens.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No tokens found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            New tokens will appear here as they are discovered and added to our
            database. Check browser console for debugging info.
          </p>
          <button
            onClick={onRefreshData}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Refresh Data
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.slice(0, 50).map((token, index) => (
            <motion.div
              key={token.address || token.mint_address || token._id || index}
              className="flex items-center justify-between p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 cursor-pointer"
              onClick={() =>
                onTokenClick(
                  token.address || token.mint_address,
                  token.chain || "solana"
                )
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {token.symbol?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {token.symbol || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {token.name || "No name available"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to view chart
                </p>
                <div
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    token.processed
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {token.processed ? "Enriched" : "Pending"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
