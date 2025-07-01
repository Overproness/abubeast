"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FeaturesPage() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
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

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  };
  const coreFeatures = [
    {
      icon: "⚡",
      title: "Lightning-Fast Execution",
      description:
        "Execute trades in milliseconds with our high-performance matching engine built for institutional speed",
      details: [
        "Sub-second order execution",
        "99.9% uptime guarantee",
        "Global server infrastructure",
        "Advanced order types (Limit, Market, Stop-Loss, Take-Profit)",
        "Real-time order book updates",
        "Latency optimization across all regions",
      ],
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: "📊",
      title: "Professional Charts",
      description:
        "Advanced charting powered by TradingView with 100+ technical indicators and drawing tools",
      details: [
        "Real-time market data feeds",
        "100+ technical indicators",
        "Custom indicator creation",
        "Multi-timeframe analysis",
        "Chart pattern recognition",
        "Drawing tools and annotations",
        "Price alerts and notifications",
        "Historical data backtesting",
      ],
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: "💼",
      title: "Portfolio Management",
      description:
        "Comprehensive portfolio tracking and performance analytics with real-time P&L calculations",
      details: [
        "Real-time P&L tracking",
        "Asset allocation insights",
        "Performance benchmarking",
        "Risk assessment tools",
        "Tax reporting and exports",
        "Portfolio rebalancing suggestions",
        "Historical performance analysis",
        "Multi-currency support",
      ],
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      description:
        "Bank-grade security with multi-layer protection systems and insurance coverage",
      details: [
        "256-bit SSL encryption",
        "Multi-signature wallets",
        "Cold storage protection (95% of funds)",
        "Regular security audits",
        "Two-factor authentication",
        "Withdrawal whitelisting",
        "Insurance coverage up to $100M",
        "Real-time fraud detection",
      ],
      color: "from-red-400 to-pink-500",
    },
    {
      icon: "🤖",
      title: "Automated Trading",
      description:
        "Advanced algorithmic trading with custom bot creation and strategy backtesting",
      details: [
        "Strategy backtesting engine",
        "Custom bot creation",
        "Pre-built trading strategies",
        "Risk management rules",
        "Performance optimization",
        "Paper trading mode",
        "Social trading - copy successful traders",
        "API integration for custom strategies",
      ],
      color: "from-purple-400 to-indigo-500",
    },
    {
      icon: "📱",
      title: "Mobile Excellence",
      description:
        "Full-featured native mobile apps for iOS and Android with all desktop features",
      details: [
        "Native iOS and Android apps",
        "Biometric authentication",
        "Push notifications",
        "Offline chart viewing",
        "Mobile-optimized trading interface",
        "Watch-only portfolio mode",
        "Price alerts and news",
        "Seamless desktop sync",
      ],
      color: "from-teal-400 to-blue-500",
    },
  ];

  const advancedFeatures = [
    {
      title: "Cross-Chain Trading",
      description:
        "Trade across multiple blockchains seamlessly with our bridge technology",
      icon: "🌐",
      highlight: "Multi-chain support",
      benefits: [
        "Ethereum, BSC, Polygon, Avalanche",
        "Automated bridge transactions",
        "Optimal route finding",
        "Gas fee optimization",
      ],
    },
    {
      title: "DeFi Integration",
      description:
        "Access decentralized finance protocols directly from our platform",
      icon: "🔗",
      highlight: "Yield farming",
      benefits: [
        "Liquidity mining",
        "Staking rewards",
        "Yield optimization",
        "Protocol governance",
      ],
    },
    {
      title: "NFT Marketplace",
      description:
        "Buy, sell, and trade NFTs with built-in rarity analysis tools",
      icon: "🎨",
      highlight: "Coming Q2 2024",
      benefits: [
        "Rarity scoring",
        "Floor price tracking",
        "Bulk trading",
        "Collection analytics",
      ],
    },
    {
      title: "Social Trading",
      description:
        "Follow and copy successful traders with transparent performance metrics",
      icon: "👥",
      highlight: "Copy trading",
      benefits: [
        "Trader leaderboards",
        "Performance transparency",
        "Risk metrics",
        "Automated copying",
      ],
    },
    {
      title: "Institutional Tools",
      description:
        "White-label solutions and advanced features for institutions",
      icon: "🏢",
      highlight: "Enterprise ready",
      benefits: [
        "Custom branding",
        "Advanced reporting",
        "Compliance tools",
        "Dedicated support",
      ],
    },
    {
      title: "AI-Powered Insights",
      description:
        "Machine learning algorithms provide market insights and trade suggestions",
      icon: "🧠",
      highlight: "Beta access",
      benefits: [
        "Market sentiment analysis",
        "Price predictions",
        "Trade suggestions",
        "Risk assessment",
      ],
    },
  ];

  const tradingTools = [
    {
      name: "Market Scanner",
      description:
        "Find opportunities with real-time market scanning and custom filters",
      icon: "🔍",
    },
    {
      name: "Price Alerts",
      description:
        "Never miss a trading opportunity with smart alerts and notifications",
      icon: "🔔",
    },
    {
      name: "Order Book",
      description: "Deep market depth visualization and analysis tools",
      icon: "📋",
    },
    {
      name: "Trade History",
      description: "Comprehensive trading history and performance analytics",
      icon: "📈",
    },
    {
      name: "Risk Calculator",
      description: "Built-in position sizing and risk management tools",
      icon: "⚖️",
    },
    {
      name: "News Feed",
      description:
        "Real-time crypto news and market analysis from trusted sources",
      icon: "📰",
    },
    {
      name: "Economic Calendar",
      description:
        "Track important events that might impact cryptocurrency markets",
      icon: "📅",
    },
    {
      name: "Screener",
      description:
        "Filter and sort cryptocurrencies based on technical and fundamental criteria",
      icon: "🎯",
    },
  ];

  const integrations = [
    {
      name: "TradingView",
      logo: "📊",
      description: "Advanced charting and technical analysis",
    },
    {
      name: "CoinGecko",
      logo: "🦎",
      description: "Market data and cryptocurrency information",
    },
    {
      name: "Chainlink",
      logo: "🔗",
      description: "Reliable price feeds and oracle data",
    },
    {
      name: "1inch",
      logo: "🔄",
      description: "DEX aggregation for best swap rates",
    },
    {
      name: "MetaMask",
      logo: "🦊",
      description: "Secure wallet integration",
    },
    {
      name: "WalletConnect",
      logo: "🔌",
      description: "Multiple wallet compatibility",
    },
  ];

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {" "}
      {/* Removed min-h-screen from here */}
      <PageHeader
        title="Comprehensive Trading Platform"
        subtitle="Everything you need for professional cryptocurrency trading"
        description="Discover our complete suite of tools, features, and integrations designed to give you the competitive edge in cryptocurrency markets. From beginner-friendly interfaces to institutional-grade tools."
        gradient
        animatedBlobs
        size="large"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button size="lg" asChild className="px-8 py-4 text-lg">
            <Link href="/auth/signup">Start Free Trial</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="px-8 py-4 text-lg"
          >
            <Link href="/demo">View Live Demo</Link>
          </Button>
        </div>
      </PageHeader>
      {/* Core Features */}
      <motion.section
        className="py-24 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Core{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Features
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Professional-grade trading tools built for traders of all
              experience levels, from beginners to institutions
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {coreFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    <CardContent className="p-8 relative">
                      <motion.div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}
                        animate={{
                          rotate: [0, 180, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <div className="relative">
                        <div className="flex items-start space-x-6">
                          <motion.div
                            className="text-5xl group-hover:scale-110 transition-transform duration-200"
                            whileHover={{
                              scale: 1.2,
                              rotate: [0, -10, 10, 0],
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {feature.icon}
                          </motion.div>
                          <div className="flex-1">
                            <motion.h3
                              className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                              {feature.title}
                            </motion.h3>
                            <motion.p
                              className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1 + 0.2,
                              }}
                            >
                              {feature.description}
                            </motion.p>
                            <motion.div
                              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                              variants={staggerContainer}
                              initial="initial"
                              whileInView="animate"
                              viewport={{ once: true }}
                            >
                              {feature.details.map((detail, i) => (
                                <motion.div
                                  key={i}
                                  className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                                  variants={fadeInUp}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <motion.span
                                    className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 0.3,
                                      delay: i * 0.05,
                                      type: "spring",
                                      stiffness: 200,
                                    }}
                                  />
                                  {detail}
                                </motion.div>
                              ))}
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* Advanced Features */}
      <motion.section
        className="py-24 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Advanced{" "}
              <motion.span
                className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Capabilities
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Cutting-edge features that put you ahead of the competition with
              the latest in blockchain and DeFi technology
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {advancedFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center hover:shadow-xl transition-all duration-300 group border-0 overflow-hidden">
                    <CardContent className="p-8 relative">
                      <motion.div
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      />
                      <motion.div
                        className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, 0],
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <motion.div
                        className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        {feature.highlight}
                      </motion.div>
                      <motion.h3
                        className="text-xl font-bold text-gray-900 dark:text-white mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      >
                        {feature.title}
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                      >
                        {feature.description}
                      </motion.p>
                      <motion.div
                        className="space-y-2"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                      >
                        {feature.benefits.map((benefit, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300"
                            variants={fadeInUp}
                            transition={{ delay: i * 0.05 }}
                          >
                            <motion.span
                              className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.3,
                                delay: i * 0.05,
                                type: "spring",
                                stiffness: 200,
                              }}
                            />
                            {benefit}
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* Trading Tools */}
      <motion.section
        className="py-24 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Professional Trading
                <motion.span
                  className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {" "}
                  Tools
                </motion.span>
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Access the same professional tools used by institutional
                traders, hedge funds, and market makers around the world
              </motion.p>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {tradingTools.map((tool, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    variants={fadeInLeft}
                    whileHover={{
                      x: 10,
                      scale: 1.02,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="text-2xl group-hover:scale-110 transition-transform duration-200"
                      whileHover={{
                        scale: 1.3,
                        rotate: [0, -10, 10, 0],
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {tool.icon}
                    </motion.div>
                    <div>
                      <motion.h4
                        className="font-semibold text-gray-900 dark:text-white mb-1"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        {tool.name}
                      </motion.h4>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05 + 0.1,
                        }}
                      >
                        {tool.description}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl backdrop-blur-sm flex items-center justify-center relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(34, 197, 94, 0.3)",
                    "0 0 60px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(34, 197, 94, 0.3)",
                  ],
                }}
              >
                <motion.div
                  className="text-8xl"
                  animate={{
                    rotateY: [0, 15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  📈
                </motion.div>
                <motion.div
                  className="absolute top-4 right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl text-white animate-pulse"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  💹
                </motion.div>
                <motion.div
                  className="absolute bottom-4 left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl text-white animate-bounce"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  📊
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                💡
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Integrations */}
      <motion.section
        className="py-24 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Powerful{" "}
              <motion.span
                className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Integrations
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              We've partnered with the best in the industry to provide you with
              seamless integrations and enhanced functionality
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {integrations.map((integration, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <motion.div
                        className="text-4xl mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.3,
                          rotate: 360,
                        }}
                      >
                        {integration.logo}
                      </motion.div>
                      <motion.h3
                        className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        {integration.name}
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 text-sm"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      >
                        {integration.description}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* API Section */}
      <motion.section
        className="py-24 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Developer{" "}
              <motion.span
                className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                API
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Build custom applications and trading strategies with our
              comprehensive REST and WebSocket APIs
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: "🚀",
                title: "REST API",
                description:
                  "Complete REST API for trading, account management, and market data access",
                features: [
                  "Order management",
                  "Account information",
                  "Trading history",
                  "Market data",
                ],
              },
              {
                icon: "⚡",
                title: "WebSocket",
                description:
                  "Real-time market data streams and order updates with low latency",
                features: [
                  "Live price feeds",
                  "Order book updates",
                  "Trade executions",
                  "Account updates",
                ],
              },
              {
                icon: "📚",
                title: "Documentation",
                description:
                  "Comprehensive guides, examples, and SDK libraries in multiple languages",
                features: [
                  "Python SDK",
                  "JavaScript SDK",
                  "Code examples",
                  "Interactive docs",
                ],
              },
            ].map((api, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <motion.div
                        className="text-4xl mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.3,
                          rotate: [0, -10, 10, 0],
                        }}
                      >
                        {api.icon}
                      </motion.div>
                      <motion.h3
                        className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        {api.title}
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      >
                        {api.description}
                      </motion.p>
                      <motion.ul
                        className="text-sm text-gray-600 dark:text-gray-300 space-y-1"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                      >
                        {api.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            variants={fadeInUp}
                            transition={{ delay: i * 0.05 }}
                          >
                            • {feature}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild>
                <Link href="/docs/api">Explore API Documentation</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      {/* Security Features */}
      <motion.section
        className="py-24 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Enterprise{" "}
              <motion.span
                className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Security
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Your security is our top priority. We implement multiple layers of
              protection to keep your assets safe
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: "🔐",
                title: "256-bit Encryption",
                desc: "Military-grade encryption for all data",
              },
              {
                icon: "🏦",
                title: "Cold Storage",
                desc: "95% of funds stored offline",
              },
              {
                icon: "🛡️",
                title: "Multi-sig Wallets",
                desc: "Multi-signature wallet protection",
              },
              {
                icon: "🔍",
                title: "Regular Audits",
                desc: "Third-party security audits",
              },
              {
                icon: "📱",
                title: "2FA Required",
                desc: "Two-factor authentication",
              },
              {
                icon: "💰",
                title: "Insurance",
                desc: "Up to $100M insurance coverage",
              },
              {
                icon: "🚨",
                title: "Fraud Detection",
                desc: "Real-time monitoring",
              },
              {
                icon: "✅",
                title: "Whitelisting",
                desc: "Withdrawal address whitelisting",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <motion.div
                        className="text-3xl mb-3"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, 0],
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <motion.h4
                        className="font-semibold text-gray-900 dark:text-white mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.2,
                        }}
                      >
                        {feature.title}
                      </motion.h4>
                      <motion.p
                        className="text-sm text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.3,
                        }}
                      >
                        {feature.desc}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* CTA Section */}
      <motion.section
        className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Experience
            <br />
            <motion.span
              className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              These Features?
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Start your free trial today and discover why thousands of traders
            choose AbuBeast for their cryptocurrency trading needs
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="px-12 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform transition-all duration-200"
                asChild
              >
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="px-12 py-6 text-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="mt-12 text-blue-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.p
              className="text-sm mb-4"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Join thousands of satisfied traders worldwide
            </motion.p>
            <motion.div
              className="flex justify-center items-center gap-8 opacity-80 text-sm"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.span
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                ✨ 14-day free trial
              </motion.span>
              <motion.span
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                🚀 No setup fees
              </motion.span>
              <motion.span
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                💬 24/7 support
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
