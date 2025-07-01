"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import Link from "next/link";

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

export default function BlogPage() {
  const featuredPosts = [
    {
      slug: "welcome-to-abubeast",
      title: "Welcome to AbuBeast: The Future of Crypto Trading",
      excerpt:
        "Discover how AbuBeast is revolutionizing automated crypto trading with AI-powered insights and real-time market analysis.",
      date: "2024-12-01",
      author: "AbuBeast Team",
      category: "Announcements",
      readTime: "5 min read",
      featured: true,
      image: "/blog/welcome.jpg",
    },
    {
      slug: "ai-trading-strategies",
      title: "AI-Powered Trading Strategies: Maximizing Your Returns",
      excerpt:
        "Learn how our advanced AI algorithms analyze market patterns to identify profitable trading opportunities in real-time.",
      date: "2024-11-28",
      author: "Dr. Sarah Chen",
      category: "Trading",
      readTime: "8 min read",
      featured: true,
      image: "/blog/ai-trading.jpg",
    },
  ];

  const recentPosts = [
    {
      slug: "defi-trends-2024",
      title: "DeFi Trends to Watch in 2024",
      excerpt:
        "Explore the latest developments in decentralized finance and how they impact your trading strategy.",
      date: "2024-11-25",
      author: "Mike Rodriguez",
      category: "DeFi",
      readTime: "6 min read",
      image: "/blog/defi-trends.jpg",
    },
    {
      slug: "wallet-security-guide",
      title: "Ultimate Wallet Security Guide",
      excerpt:
        "Protect your crypto assets with our comprehensive security guide covering best practices and common pitfalls.",
      date: "2024-11-22",
      author: "Alex Thompson",
      category: "Security",
      readTime: "10 min read",
      image: "/blog/security.jpg",
    },
    {
      slug: "market-analysis-tools",
      title: "Advanced Market Analysis Tools",
      excerpt:
        "Master our technical analysis tools to make informed trading decisions and identify market opportunities.",
      date: "2024-11-20",
      author: "Emma Wilson",
      category: "Analysis",
      readTime: "7 min read",
      image: "/blog/analysis.jpg",
    },
    {
      slug: "crypto-portfolio-management",
      title: "Crypto Portfolio Management Best Practices",
      excerpt:
        "Learn how to diversify and manage your crypto portfolio for long-term success and risk mitigation.",
      date: "2024-11-18",
      author: "David Kim",
      category: "Portfolio",
      readTime: "9 min read",
      image: "/blog/portfolio.jpg",
    },
    {
      slug: "automated-trading-setup",
      title: "Setting Up Your First Automated Trading Bot",
      excerpt:
        "Step-by-step guide to configuring your automated trading preferences and monitoring performance.",
      date: "2024-11-15",
      author: "Lisa Chang",
      category: "Automation",
      readTime: "12 min read",
      image: "/blog/automation.jpg",
    },
    {
      slug: "yield-farming-strategies",
      title: "Advanced Yield Farming Strategies",
      excerpt:
        "Maximize your passive income with sophisticated yield farming techniques and risk management.",
      date: "2024-11-12",
      author: "Robert Taylor",
      category: "DeFi",
      readTime: "8 min read",
      image: "/blog/yield-farming.jpg",
    },
  ];

  const categories = [
    { name: "All", count: 12, active: true },
    { name: "Trading", count: 4 },
    { name: "DeFi", count: 3 },
    { name: "Security", count: 2 },
    { name: "Analysis", count: 2 },
    { name: "Automation", count: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <PageHeader
        title="AbuBeast Blog"
        subtitle="Insights, tutorials, and the latest in crypto trading"
        description="Stay updated with expert analysis, trading strategies, and platform updates from the AbuBeast team."
        gradient={true}
        size="large"
        animatedBlobs={true}
      />

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Featured Posts */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Featured Articles
            </motion.h2>
            <motion.div
              className="h-1 flex-1 ml-6 bg-gradient-to-r from-blue-500 to-transparent rounded"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ originX: 0 }}
            />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {featuredPosts.map((post, index) => (
              <motion.div key={post.slug} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-300 transform overflow-hidden">
                    <motion.div
                      className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-end"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-white">
                        <motion.span
                          className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {post.category}
                        </motion.span>
                        <motion.h3
                          className="text-xl font-bold"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1 + 0.2,
                          }}
                        >
                          {post.title}
                        </motion.h3>
                      </div>
                    </motion.div>
                    <CardContent className="p-6">
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      >
                        {post.excerpt}
                      </motion.p>
                      <motion.div
                        className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                      >
                        <span>By {post.author}</span>
                        <span>{post.readTime}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <Link href={`/blog/${post.slug}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              className="group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20"
                            >
                              Read More →
                            </Button>
                          </motion.div>
                        </Link>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Categories Filter */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex flex-wrap gap-2 justify-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  category.active
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
                variants={fadeInUp}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        {/* Recent Posts */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Latest Articles
            </motion.h2>
            <Link href="/blog/archive">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline">View All Posts</Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {recentPosts.map((post, index) => (
              <motion.div key={post.slug} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 transform">
                    <motion.div
                      className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 flex items-end"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.span
                        className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {post.category}
                      </motion.span>
                    </motion.div>
                    <CardContent className="p-6">
                      <motion.h3
                        className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.1,
                        }}
                      >
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.2,
                        }}
                      >
                        {post.excerpt}
                      </motion.p>
                      <motion.div
                        className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.3,
                        }}
                      >
                        <span>By {post.author}</span>
                        <span>{post.readTime}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.4,
                        }}
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <Link href={`/blog/${post.slug}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Read →
                            </Button>
                          </motion.div>
                        </Link>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Newsletter Signup */}
        <motion.section
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="px-8 py-12 text-center text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Stay in the Loop
            </motion.h2>
            <motion.p
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Get the latest crypto insights, trading tips, and platform updates
              delivered to your inbox weekly.
            </motion.p>
            <motion.div
              className="max-w-md mx-auto flex gap-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div className="flex-1" whileFocus={{ scale: 1.02 }}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Subscribe
                </Button>
              </motion.div>
            </motion.div>
            <motion.p
              className="text-sm text-blue-100 mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              No spam, unsubscribe anytime. We respect your privacy.
            </motion.p>
          </motion.div>
        </motion.section>

        {/* Popular Tags */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h3
            className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Popular Topics
          </motion.h3>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              "Bitcoin",
              "Ethereum",
              "DeFi",
              "NFTs",
              "Trading Bots",
              "Technical Analysis",
              "Market Insights",
              "Blockchain",
              "Yield Farming",
              "Portfolio Management",
              "Risk Management",
            ].map((tag, index) => (
              <motion.span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                variants={fadeInUp}
                whileHover={{
                  scale: 1.1,
                  y: -2,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                #{tag}
              </motion.span>
            ))}
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
}
