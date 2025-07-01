"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TradingPanelPreview from "../components/TradingPanelPreview";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function HomePage() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  };

  const features = [
    {
      title: "Real-time Trading",
      description:
        "Execute trades instantly with our high-performance platform built for speed and reliability",
      icon: "⚡",
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Advanced Charts",
      description:
        "Analyze market trends with our interactive and customizable charts powered by TradingView",
      icon: "📊",
      color: "from-blue-400 to-cyan-500",
    },
    {
      title: "Portfolio Management",
      description:
        "Track and manage all your assets in one convenient place with real-time updates",
      icon: "💼",
      color: "from-green-400 to-emerald-500",
    },
    {
      title: "Secure Storage",
      description:
        "Your digital assets are protected with military-grade encryption and multi-layer security",
      icon: "🔒",
      color: "from-red-400 to-pink-500",
    },
    {
      title: "24/7 Support",
      description:
        "Our expert team is always available to assist you with dedicated customer service",
      icon: "🛠️",
      color: "from-purple-400 to-indigo-500",
    },
    {
      title: "Mobile Trading",
      description:
        "Trade on the go with our fully-featured mobile application for iOS and Android",
      icon: "📱",
      color: "from-teal-400 to-blue-500",
    },
  ];

  const stats = [
    { label: "Active Users", value: "50,000+", icon: "👥" },
    { label: "Trading Volume", value: "$2.5B+", icon: "💹" },
    { label: "Countries Served", value: "120+", icon: "🌍" },
    { label: "Uptime", value: "99.9%", icon: "⚡" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Trader",
      content:
        "AbuBeast has transformed my trading experience. The platform is incredibly fast and reliable.",
      avatar: "👩‍💼",
    },
    {
      name: "Michael Chen",
      role: "Crypto Investor",
      content:
        "The advanced charting tools and portfolio management features are exactly what I needed.",
      avatar: "👨‍💻",
    },
    {
      name: "Emma Davis",
      role: "DeFi Enthusiast",
      content:
        "Security and user experience are top-notch. I feel confident trading on this platform.",
      avatar: "👩‍🔬",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-24 pb-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              className="lg:w-1/2 space-y-8"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                🚀 Trusted by 50,000+ traders worldwide
              </motion.div>
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.span
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Next Generation
                </motion.span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Trading Platform
                </span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Trade crypto with confidence using our secure, reliable and
                intuitive platform. Advanced tools designed for both beginners
                and expert traders.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Link href="/auth/signup">
                  <motion.div {...scaleOnHover}>
                    <Button
                      size="lg"
                      className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Start Trading Free
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/features">
                  <motion.div {...scaleOnHover}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-6 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Explore Features
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center gap-8 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex -space-x-2"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white dark:border-gray-800"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    ))}
                  </motion.div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Join thousands of happy traders
                  </span>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                className="relative h-[500px] w-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl backdrop-blur-sm"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 40px rgba(147, 51, 234, 0.3)",
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <TradingPanelPreview />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center group"
                variants={fadeInUp}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200"
                  animate={{
                    rotateY: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
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
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              ✨ Powerful Features
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Everything You Need to
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
                {" "}
                Succeed
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover all the advanced tools and features designed to give you
              the edge in crypto trading
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white dark:bg-gray-900 overflow-hidden">
                  <CardContent className="p-8">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-200`}
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        scale: 1.2,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <motion.h3
                      className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-600 dark:text-gray-300 leading-relaxed"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                    >
                      {feature.description}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
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
              How It{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Works
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Get started with AbuBeast in just a few simple steps
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Create Account",
                description:
                  "Sign up in seconds with just your email. No complex verification required to get started.",
                icon: "👤",
              },
              {
                step: "02",
                title: "Connect Wallet",
                description:
                  "Link your favorite crypto wallet with our secure connection system. MetaMask, Phantom, and more supported.",
                icon: "🔗",
              },
              {
                step: "03",
                title: "Start Trading",
                description:
                  "Access advanced tools, real-time data, and execute trades with institutional-grade infrastructure.",
                icon: "🚀",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative text-center"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-2xl font-bold mb-6 shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  {item.step}
                </motion.div>
                <motion.div
                  className="text-4xl mb-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  // transition={{
                  //   duration: 0.5,
                  //   delay: i * 0.2 + 0.3,
                  //   type: "spring"
                  // }}
                  animate={{
                    rotateY: [0, 15, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 1,
                  }}
                >
                  {item.icon}
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 + 0.5 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  className="text-gray-600 dark:text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 + 0.7 }}
                >
                  {item.description}
                </motion.p>
                {i < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.3 + 1 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
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
              What Our{" "}
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
                Traders Say
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Join thousands of satisfied traders who trust AbuBeast for their
              crypto trading needs
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8">
                      <motion.div
                        className="flex items-center mb-6"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl mr-4"
                          whileHover={{
                            scale: 1.1,
                            rotate: 360,
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {testimonial.avatar}
                        </motion.div>
                        <div>
                          <motion.div
                            className="font-bold text-gray-900 dark:text-white"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                          >
                            {testimonial.name}
                          </motion.div>
                          <motion.div
                            className="text-sm text-gray-600 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                          >
                            {testimonial.role}
                          </motion.div>
                        </div>
                      </motion.div>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
                      >
                        "{testimonial.content}"
                      </motion.p>
                      <motion.div
                        className="flex text-yellow-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 + 0.6 }}
                      >
                        {[...Array(5)].map((_, starIndex) => (
                          <motion.span
                            key={starIndex}
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 0.5,
                              delay: starIndex * 0.1 + i * 0.3,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            ⭐
                          </motion.span>
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

      {/* Security Section */}
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
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                🔒 Bank-Grade Security
              </motion.div>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Your Assets Are
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
                  Secure
                </motion.span>
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                We implement multiple layers of security to protect your digital
                assets and personal information.
              </motion.p>
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {[
                  "256-bit SSL encryption",
                  "Multi-signature wallets",
                  "Cold storage protection",
                  "Regular security audits",
                  "24/7 monitoring systems",
                  "Insurance coverage",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center"
                    variants={fadeInLeft}
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                    <motion.span
                      className="text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                    >
                      {item}
                    </motion.span>
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
                className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl backdrop-blur-sm flex items-center justify-center"
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
                  🛡️
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Start Your
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
              Trading Journey?
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join thousands of traders who have already chosen AbuBeast for their
            crypto trading needs. Start your free account today and experience
            the difference.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/auth/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="px-12 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
                >
                  Create Free Account
                </Button>
              </motion.div>
            </Link>
            <Link href="/contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="px-12 py-6 text-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Contact Sales Team
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <motion.div
            className="mt-12 text-blue-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1 }}
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
              Trusted by traders worldwide
            </motion.p>
            <motion.div
              className="flex justify-center items-center gap-8 opacity-60"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.span variants={fadeInUp}>50,000+ Users</motion.span>
              <span>•</span>
              <motion.span variants={fadeInUp}>$2.5B+ Volume</motion.span>
              <span>•</span>
              <motion.span variants={fadeInUp}>99.9% Uptime</motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
