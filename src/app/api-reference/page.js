"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Book,
  Code,
  Database,
  Globe,
  Key,
  Shield,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function APIReferencePage() {
  const { isDarkMode } = useTheme();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const plannedEndpoints = [
    {
      category: "Authentication",
      icon: <Key className="w-6 h-6" />,
      description: "Secure API key management and user authentication",
      endpoints: [
        "POST /auth/api-keys - Generate API keys",
        "GET /auth/profile - Get user profile",
        "PUT /auth/profile - Update user profile",
        "DELETE /auth/api-keys/{id} - Revoke API key",
      ],
      color: "red",
    },
    {
      category: "Market Data",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Real-time and historical cryptocurrency market data",
      endpoints: [
        "GET /market/tokens - List supported tokens",
        "GET /market/prices - Current token prices",
        "GET /market/history/{token} - Price history",
        "GET /market/orderbook/{pair} - Order book data",
        "WebSocket /market/stream - Real-time updates",
      ],
      color: "green",
    },
    {
      category: "Trading",
      icon: <Zap className="w-6 h-6" />,
      description: "Execute trades and manage orders programmatically",
      endpoints: [
        "POST /trading/orders - Place new order",
        "GET /trading/orders - List user orders",
        "PUT /trading/orders/{id} - Modify order",
        "DELETE /trading/orders/{id} - Cancel order",
        "GET /trading/history - Trade history",
      ],
      color: "blue",
    },
    {
      category: "Portfolio",
      icon: <Database className="w-6 h-6" />,
      description: "Portfolio management and balance tracking",
      endpoints: [
        "GET /portfolio/balances - Account balances",
        "GET /portfolio/history - Portfolio history",
        "GET /portfolio/performance - Performance metrics",
        "GET /portfolio/allocations - Asset allocation",
      ],
      color: "purple",
    },
    {
      category: "Analytics",
      icon: <Globe className="w-6 h-6" />,
      description: "Advanced analytics and trading insights",
      endpoints: [
        "GET /analytics/metrics - Trading metrics",
        "GET /analytics/pnl - Profit and loss analysis",
        "GET /analytics/risk - Risk assessment",
        "GET /analytics/reports - Custom reports",
      ],
      color: "orange",
    },
    {
      category: "Webhooks",
      icon: <Shield className="w-6 h-6" />,
      description: "Real-time notifications and event streaming",
      endpoints: [
        "POST /webhooks - Create webhook",
        "GET /webhooks - List webhooks",
        "PUT /webhooks/{id} - Update webhook",
        "DELETE /webhooks/{id} - Delete webhook",
      ],
      color: "indigo",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
        text: isDarkMode ? "text-red-400" : "text-red-600",
        border: isDarkMode ? "border-red-800" : "border-red-200",
      },
      green: {
        bg: isDarkMode ? "bg-green-900/30" : "bg-green-100",
        text: isDarkMode ? "text-green-400" : "text-green-600",
        border: isDarkMode ? "border-green-800" : "border-green-200",
      },
      blue: {
        bg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
        text: isDarkMode ? "text-blue-400" : "text-blue-600",
        border: isDarkMode ? "border-blue-800" : "border-blue-200",
      },
      purple: {
        bg: isDarkMode ? "bg-purple-900/30" : "bg-purple-100",
        text: isDarkMode ? "text-purple-400" : "text-purple-600",
        border: isDarkMode ? "border-purple-800" : "border-purple-200",
      },
      orange: {
        bg: isDarkMode ? "bg-orange-900/30" : "bg-orange-100",
        text: isDarkMode ? "text-orange-400" : "text-orange-600",
        border: isDarkMode ? "border-orange-800" : "border-orange-200",
      },
      indigo: {
        bg: isDarkMode ? "bg-indigo-900/30" : "bg-indigo-100",
        text: isDarkMode ? "text-indigo-400" : "text-indigo-600",
        border: isDarkMode ? "border-indigo-800" : "border-indigo-200",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-white to-gray-50"
      }`}
    >
      {/* Header Section */}
      <motion.div
        className="relative py-20 lg:py-32"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-br from-slate-900/20 via-gray-900/20 to-gray-900/40"
                : "bg-gradient-to-br from-slate-100/50 via-gray-100/50 to-gray-100/50"
            }`}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white/80 border border-gray-200 shadow-lg"
              }`}
            >
              <Code
                className={`w-12 h-12 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${
              isDarkMode
                ? "bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent"
            }`}
          >
            API Reference
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Programmatic access to AbuBeast's trading platform. Build powerful
            applications with our comprehensive REST API and WebSocket
            connections.
          </motion.p>

          {/* Status Notice */}
          <motion.div
            variants={fadeInUp}
            className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border ${
              isDarkMode
                ? "bg-yellow-900/20 border-yellow-800 text-yellow-300"
                : "bg-yellow-50 border-yellow-200 text-yellow-700"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">API Currently in Development</span>
          </motion.div>
        </div>
      </motion.div>

      {/* API Status Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`p-8 rounded-3xl border mb-16 ${
            isDarkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white/80 border-gray-200 shadow-lg"
          }`}
        >
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  isDarkMode
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                <Terminal className="w-8 h-8" />
              </div>
            </div>

            <h2
              className={`text-3xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              API Coming Soon
            </h2>

            <p
              className={`text-lg mb-8 max-w-3xl mx-auto leading-relaxed ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              We're currently developing a comprehensive API that will allow
              developers to integrate with our trading platform. The API will
              provide programmatic access to all major platform features
              including market data, trading, portfolio management, and more.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode
                    ? "bg-gray-700/30 border border-gray-600"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    isDarkMode
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Zap className="w-6 h-6" />
                </div>
                <h3
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  RESTful API
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Standard HTTP endpoints for all platform operations
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode
                    ? "bg-gray-700/30 border border-gray-600"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    isDarkMode
                      ? "bg-green-900/30 text-green-400"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <Globe className="w-6 h-6" />
                </div>
                <h3
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  WebSocket Streams
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Real-time data feeds and order updates
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode
                    ? "bg-gray-700/30 border border-gray-600"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    isDarkMode
                      ? "bg-purple-900/30 text-purple-400"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <h3
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Secure Authentication
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  API keys with granular permissions
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Planned API Endpoints */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2
            className={`text-3xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Planned API Endpoints
          </h2>
          <p
            className={`text-lg max-w-3xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Here's a preview of the endpoints we're planning to include in our
            API
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {plannedEndpoints.map((category, index) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                    : "bg-white/80 border-gray-200 hover:bg-white shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`p-3 rounded-2xl ${colorClasses.bg} ${colorClasses.text}`}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {category.category}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.endpoints.map((endpoint, endpointIndex) => (
                    <div
                      key={endpointIndex}
                      className={`p-3 rounded-xl font-mono text-sm transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700/30 text-gray-300"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {endpoint}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${
                      isDarkMode
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    In Development
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Get Notified Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`mt-16 p-8 rounded-3xl border text-center ${
            isDarkMode
              ? "bg-gradient-to-r from-slate-900/20 to-gray-900/20 border-gray-700"
              : "bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-slate-900/30 text-slate-400"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Users className="w-8 h-8" />
            </div>
          </div>

          <h3
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Get Notified When Our API Launches
          </h3>

          <p
            className={`text-lg mb-6 max-w-2xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Be among the first to know when our API becomes available. We'll
            send you documentation, SDKs, and early access information.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-600 hover:bg-slate-700 text-white shadow-lg shadow-slate-600/25"
                  : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg shadow-slate-600/25"
              }`}
            >
              <Users className="w-5 h-5" />
              Join Waitlist
            </motion.a>

            <motion.a
              href="/documentation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border transition-all duration-300 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800/50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Book className="w-5 h-5" />
              View Documentation
            </motion.a>
          </div>

          <div
            className={`mt-8 p-4 rounded-xl ${
              isDarkMode
                ? "bg-gray-800/30 border border-gray-700"
                : "bg-white/50 border border-gray-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <strong>Expected Launch:</strong> Q1 2025 •
              <strong> Features:</strong> REST API, WebSocket, SDKs for popular
              languages •<strong> Rate Limits:</strong> Generous limits for all
              users
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
