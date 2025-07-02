"use client";

import { motion } from "framer-motion";

export default function DashboardFooter() {
  const footerItems = [
    {
      icon: "🚀",
      title: "Lightning Fast",
      description: "Real-time data updates and instant trade execution",
    },
    {
      icon: "🔒",
      title: "Secure",
      description: "Bank-grade security with multi-layer protection",
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "Advanced analytics and insights for better trading",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {footerItems.map((item, index) => (
        <motion.div
          key={index}
          className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <motion.div
            className="text-3xl mb-3"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          >
            {item.icon}
          </motion.div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {item.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
