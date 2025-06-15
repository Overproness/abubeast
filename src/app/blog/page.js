import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Posts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Articles
            </h2>
            <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card
                key={post.slug}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-end">
                  <div className="text-white">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>By {post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="ghost"
                        className="group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20"
                      >
                        Read More →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories Filter */}
        <section>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  category.active
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Latest Articles
            </h2>
            <Link href="/blog/archive">
              <Button variant="outline">View All Posts</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Card
                key={post.slug}
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 flex items-end">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    {post.category}
                  </span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>By {post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Read →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
          <div className="px-8 py-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest crypto insights, trading tips, and platform updates
              delivered to your inbox weekly.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
              <Button
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </section>

        {/* Popular Tags */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Popular Topics
          </h3>
          <div className="flex flex-wrap gap-2">
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
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
