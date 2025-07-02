"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import {
  Book,
  Bookmark,
  ChevronRight,
  Code,
  Download,
  ExternalLink,
  Play,
  Search,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function DocumentationPage() {
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

  const documentationSections = [
    {
      title: "Getting Started",
      icon: <Play className="w-6 h-6" />,
      description: "Learn the basics of using AbuBeast's trading platform",
      articles: [
        "Creating Your First Account",
        "Platform Overview and Navigation",
        "Setting Up Your Trading Profile",
        "Understanding the Dashboard",
        "Security Best Practices",
      ],
      color: "green",
    },
    {
      title: "Trading Guides",
      icon: <TrendingUp className="w-6 h-6" />,
      description:
        "Master cryptocurrency trading with our comprehensive guides",
      articles: [
        "Spot Trading Fundamentals",
        "Advanced Order Types",
        "Risk Management Strategies",
        "Technical Analysis Tools",
        "Portfolio Diversification",
      ],
      color: "blue",
    },
    {
      title: "Platform Features",
      icon: <Zap className="w-6 h-6" />,
      description:
        "Discover all the powerful features available on our platform",
      articles: [
        "Real-time Market Data",
        "Advanced Charting Tools",
        "Automated Trading Bots",
        "Social Trading Features",
        "Mobile App Functionality",
      ],
      color: "purple",
    },
    {
      title: "Security & Privacy",
      icon: <Shield className="w-6 h-6" />,
      description: "Protect your account and understand our security measures",
      articles: [
        "Two-Factor Authentication Setup",
        "Wallet Security Guidelines",
        "Privacy Settings Configuration",
        "Recognizing Phishing Attempts",
        "Account Recovery Procedures",
      ],
      color: "orange",
    },
    {
      title: "API Documentation",
      icon: <Code className="w-6 h-6" />,
      description: "Integrate with our platform using our comprehensive API",
      articles: [
        "REST API Reference",
        "WebSocket Connections",
        "Authentication Methods",
        "Rate Limiting Guidelines",
        "SDK Downloads",
      ],
      color: "indigo",
    },
    {
      title: "Community & Support",
      icon: <Users className="w-6 h-6" />,
      description: "Connect with other traders and get help when you need it",
      articles: [
        "Community Guidelines",
        "Discord Server Setup",
        "Reporting Issues",
        "Feature Requests",
        "Educational Resources",
      ],
      color: "pink",
    },
  ];

  const quickActions = [
    {
      title: "Search Documentation",
      icon: <Search className="w-5 h-5" />,
      description: "Find specific information quickly",
      action: "search",
    },
    {
      title: "Download PDFs",
      icon: <Download className="w-5 h-5" />,
      description: "Offline access to guides",
      action: "download",
    },
    {
      title: "Bookmark Pages",
      icon: <Bookmark className="w-5 h-5" />,
      description: "Save your favorite sections",
      action: "bookmark",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
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
      pink: {
        bg: isDarkMode ? "bg-pink-900/30" : "bg-pink-100",
        text: isDarkMode ? "text-pink-400" : "text-pink-600",
        border: isDarkMode ? "border-pink-800" : "border-pink-200",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-indigo-50 via-white to-blue-50"
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
                ? "bg-gradient-to-br from-indigo-900/20 via-blue-900/20 to-gray-900/40"
                : "bg-gradient-to-br from-indigo-100/50 via-blue-100/50 to-cyan-100/50"
            }`}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
              <Book
                className={`w-12 h-12 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${
              isDarkMode
                ? "bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
            }`}
          >
            Documentation
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Everything you need to know about using AbuBeast's trading platform.
            From beginner guides to advanced trading strategies and API
            documentation.
          </motion.p>

          {/* Quick Actions */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-800/70"
                    : "bg-white/80 text-gray-600 border border-gray-200 shadow-sm hover:bg-white hover:shadow-md"
                }`}
              >
                {action.icon}
                {action.title}
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className={`inline-block p-4 rounded-2xl ${
              isDarkMode
                ? "bg-indigo-900/30 border border-indigo-800"
                : "bg-indigo-50 border border-indigo-200"
            }`}
          >
            <p
              className={`text-lg font-medium ${
                isDarkMode ? "text-indigo-300" : "text-indigo-700"
              }`}
            >
              📚 Over 100+ articles and guides • 🔄 Updated weekly • 🌍
              Available in multiple languages
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Documentation Sections */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {documentationSections.map((section, index) => {
            const colorClasses = getColorClasses(section.color);
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                    : "bg-white/80 border-gray-200 hover:bg-white shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`p-3 rounded-2xl ${colorClasses.bg} ${colorClasses.text}`}
                  >
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {section.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.articles.map((article, articleIndex) => (
                    <div
                      key={articleIndex}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-opacity-50 cursor-pointer group ${
                        isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${colorClasses.bg} ${colorClasses.text}`}
                      />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {article}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${colorClasses.bg} ${colorClasses.text} hover:opacity-80`}
                  >
                    View All Articles
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`mt-16 p-8 rounded-3xl border text-center ${
            isDarkMode
              ? "bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border-gray-700"
              : "bg-gradient-to-r from-indigo-50 to-blue-50 border-gray-200"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-indigo-900/30 text-indigo-400"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <Book className="w-8 h-8" />
            </div>
          </div>

          <h3
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Full Documentation Coming Soon
          </h3>

          <p
            className={`text-lg mb-6 max-w-2xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We're working hard to create comprehensive documentation for all
            aspects of our platform. In the meantime, our support team is here
            to help with any questions you may have.
          </p>

          <div
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${
              isDarkMode
                ? "bg-gray-800/50 text-gray-300 border border-gray-700"
                : "bg-white/80 text-gray-600 border border-gray-200 shadow-sm"
            }`}
          >
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Documentation in development
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                isDarkMode
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
              }`}
            >
              <Users className="w-5 h-5" />
              Contact Support
            </motion.a>

            <motion.a
              href="/guides"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border transition-all duration-300 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800/50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Book className="w-5 h-5" />
              View Guides
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
