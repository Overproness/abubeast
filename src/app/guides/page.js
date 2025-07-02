"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  Play,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function GuidesPage() {
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

  const guideCategories = [
    {
      title: "Getting Started",
      icon: <Play className="w-6 h-6" />,
      description:
        "Essential guides for new users to get up and running quickly",
      level: "Beginner",
      time: "5-15 min",
      guides: [
        {
          title: "Your First Trade",
          description:
            "Step-by-step guide to making your first cryptocurrency trade",
          duration: "10 min",
          featured: true,
        },
        {
          title: "Platform Navigation",
          description: "Learn to navigate the AbuBeast trading interface",
          duration: "5 min",
          featured: false,
        },
        {
          title: "Account Security Setup",
          description: "Essential security measures to protect your account",
          duration: "15 min",
          featured: true,
        },
        {
          title: "Understanding Order Types",
          description: "Market orders, limit orders, and stop losses explained",
          duration: "12 min",
          featured: false,
        },
      ],
      color: "green",
    },
    {
      title: "Trading Strategies",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Advanced trading techniques and proven strategies",
      level: "Intermediate",
      time: "15-30 min",
      guides: [
        {
          title: "Day Trading Fundamentals",
          description: "Learn the basics of profitable day trading",
          duration: "25 min",
          featured: true,
        },
        {
          title: "Swing Trading Guide",
          description: "Medium-term trading strategies for busy traders",
          duration: "20 min",
          featured: false,
        },
        {
          title: "Technical Analysis Basics",
          description: "Reading charts and identifying trading opportunities",
          duration: "30 min",
          featured: true,
        },
        {
          title: "Risk Management Rules",
          description: "Protect your capital with proper risk management",
          duration: "18 min",
          featured: false,
        },
      ],
      color: "blue",
    },
    {
      title: "Advanced Features",
      icon: <Zap className="w-6 h-6" />,
      description: "Master the advanced tools and features of our platform",
      level: "Advanced",
      time: "20-45 min",
      guides: [
        {
          title: "Automated Trading Bots",
          description:
            "Set up and configure trading bots for automated strategies",
          duration: "35 min",
          featured: true,
        },
        {
          title: "Portfolio Optimization",
          description: "Advanced portfolio management and rebalancing",
          duration: "25 min",
          featured: false,
        },
        {
          title: "API Integration",
          description: "Connect external tools and build custom solutions",
          duration: "45 min",
          featured: false,
        },
        {
          title: "Advanced Charting",
          description: "Master professional charting tools and indicators",
          duration: "30 min",
          featured: true,
        },
      ],
      color: "purple",
    },
    {
      title: "Security & Safety",
      icon: <Shield className="w-6 h-6" />,
      description: "Protect yourself and your assets in the crypto space",
      level: "All Levels",
      time: "10-20 min",
      guides: [
        {
          title: "Wallet Security Best Practices",
          description:
            "Keep your cryptocurrency safe with proper wallet security",
          duration: "15 min",
          featured: true,
        },
        {
          title: "Recognizing Scams",
          description: "Common cryptocurrency scams and how to avoid them",
          duration: "12 min",
          featured: false,
        },
        {
          title: "Privacy Protection",
          description: "Maintain privacy while trading cryptocurrencies",
          duration: "18 min",
          featured: false,
        },
        {
          title: "Emergency Procedures",
          description: "What to do if your account is compromised",
          duration: "10 min",
          featured: true,
        },
      ],
      color: "red",
    },
    {
      title: "Market Analysis",
      icon: <Target className="w-6 h-6" />,
      description: "Learn to analyze markets and make informed decisions",
      level: "Intermediate",
      time: "20-40 min",
      guides: [
        {
          title: "Fundamental Analysis",
          description:
            "Evaluate cryptocurrency projects and market fundamentals",
          duration: "35 min",
          featured: true,
        },
        {
          title: "Market Sentiment Analysis",
          description:
            "Understanding market psychology and sentiment indicators",
          duration: "25 min",
          featured: false,
        },
        {
          title: "On-Chain Analysis",
          description: "Use blockchain data to inform trading decisions",
          duration: "40 min",
          featured: false,
        },
        {
          title: "News Trading Strategies",
          description: "Trade around news events and market announcements",
          duration: "20 min",
          featured: true,
        },
      ],
      color: "orange",
    },
    {
      title: "Community & Social",
      icon: <Users className="w-6 h-6" />,
      description: "Connect with other traders and learn from the community",
      level: "All Levels",
      time: "5-15 min",
      guides: [
        {
          title: "Joining Trading Communities",
          description: "Find and participate in helpful trading communities",
          duration: "8 min",
          featured: false,
        },
        {
          title: "Social Trading Features",
          description: "Follow successful traders and copy their strategies",
          duration: "15 min",
          featured: true,
        },
        {
          title: "Sharing Your Analysis",
          description: "Share insights and get feedback from the community",
          duration: "10 min",
          featured: false,
        },
        {
          title: "Learning from Others",
          description: "How to learn effectively from experienced traders",
          duration: "12 min",
          featured: false,
        },
      ],
      color: "pink",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: isDarkMode ? "bg-green-900/30" : "bg-green-100",
        text: isDarkMode ? "text-green-400" : "text-green-600",
        border: isDarkMode ? "border-green-800" : "border-green-200",
        badge: isDarkMode
          ? "bg-green-900/50 text-green-300"
          : "bg-green-100 text-green-700",
      },
      blue: {
        bg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
        text: isDarkMode ? "text-blue-400" : "text-blue-600",
        border: isDarkMode ? "border-blue-800" : "border-blue-200",
        badge: isDarkMode
          ? "bg-blue-900/50 text-blue-300"
          : "bg-blue-100 text-blue-700",
      },
      purple: {
        bg: isDarkMode ? "bg-purple-900/30" : "bg-purple-100",
        text: isDarkMode ? "text-purple-400" : "text-purple-600",
        border: isDarkMode ? "border-purple-800" : "border-purple-200",
        badge: isDarkMode
          ? "bg-purple-900/50 text-purple-300"
          : "bg-purple-100 text-purple-700",
      },
      red: {
        bg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
        text: isDarkMode ? "text-red-400" : "text-red-600",
        border: isDarkMode ? "border-red-800" : "border-red-200",
        badge: isDarkMode
          ? "bg-red-900/50 text-red-300"
          : "bg-red-100 text-red-700",
      },
      orange: {
        bg: isDarkMode ? "bg-orange-900/30" : "bg-orange-100",
        text: isDarkMode ? "text-orange-400" : "text-orange-600",
        border: isDarkMode ? "border-orange-800" : "border-orange-200",
        badge: isDarkMode
          ? "bg-orange-900/50 text-orange-300"
          : "bg-orange-100 text-orange-700",
      },
      pink: {
        bg: isDarkMode ? "bg-pink-900/30" : "bg-pink-100",
        text: isDarkMode ? "text-pink-400" : "text-pink-600",
        border: isDarkMode ? "border-pink-800" : "border-pink-200",
        badge: isDarkMode
          ? "bg-pink-900/50 text-pink-300"
          : "bg-pink-100 text-pink-700",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-emerald-50 via-white to-teal-50"
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
                ? "bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-gray-900/40"
                : "bg-gradient-to-br from-emerald-100/50 via-teal-100/50 to-cyan-100/50"
            }`}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
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
              <BookOpen
                className={`w-12 h-12 ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${
              isDarkMode
                ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
            }`}
          >
            Trading Guides
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Learn cryptocurrency trading from the ground up with our
            comprehensive guides. From beginner basics to advanced strategies,
            we've got you covered.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isDarkMode
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              <Award className="w-4 h-4" />
              50+ Guides
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isDarkMode
                  ? "bg-teal-900/30 text-teal-400 border border-teal-800"
                  : "bg-teal-100 text-teal-700 border border-teal-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              Updated Weekly
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isDarkMode
                  ? "bg-cyan-900/30 text-cyan-400 border border-cyan-800"
                  : "bg-cyan-100 text-cyan-700 border border-cyan-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Community Verified
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Guide Categories */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {guideCategories.map((category, index) => {
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
                {/* Category Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${colorClasses.bg} ${colorClasses.text}`}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {category.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Info */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}
                  >
                    {category.level}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {category.time}
                  </span>
                </div>

                {/* Guide List */}
                <div className="space-y-3">
                  {category.guides.map((guide, guideIndex) => (
                    <div
                      key={guideIndex}
                      className={`p-4 rounded-xl transition-all duration-200 cursor-pointer group ${
                        isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-semibold text-sm ${
                                isDarkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {guide.title}
                            </h4>
                            {guide.featured && (
                              <Star
                                className={`w-3 h-3 ${colorClasses.text}`}
                              />
                            )}
                          </div>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {guide.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className={`text-xs ${
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              {guide.duration}
                            </span>
                            {guide.featured && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  isDarkMode
                                    ? "bg-yellow-900/30 text-yellow-400"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${colorClasses.bg} ${colorClasses.text} hover:opacity-80`}
                  >
                    View All {category.title} Guides
                    <ChevronRight className="w-4 h-4" />
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
              ? "bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-gray-700"
              : "bg-gradient-to-r from-emerald-50 to-teal-50 border-gray-200"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-emerald-900/30 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <BookOpen className="w-8 h-8" />
            </div>
          </div>

          <h3
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Full Guide Library Coming Soon
          </h3>

          <p
            className={`text-lg mb-6 max-w-2xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We're creating comprehensive trading guides covering every aspect of
            cryptocurrency trading. Our expert team is working to bring you the
            most valuable educational content.
          </p>

          <div
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-8 ${
              isDarkMode
                ? "bg-gray-800/50 text-gray-300 border border-gray-700"
                : "bg-white/80 text-gray-600 border border-gray-200 shadow-sm"
            }`}
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Guides in development
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                isDarkMode
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
              }`}
            >
              <Users className="w-5 h-5" />
              Request a Guide
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
              <BookOpen className="w-5 h-5" />
              View Documentation
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
