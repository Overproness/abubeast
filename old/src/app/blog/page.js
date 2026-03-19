"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GradientOrb } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const featuredPosts = [
    {
      slug: "welcome-to-abubeast",
      title: "Welcome to AbuBeast: The Future of AI-Powered Trading",
      excerpt:
        "Discover how AbuBeast is revolutionizing automated crypto trading with AI-powered insights and smart sell strategies on Solana.",
      date: "2024-12-01",
      author: "AbuBeast Team",
      category: "Announcements",
      readTime: "5 min",
      image: "/images/blog/welcome.jpg",
    },
    {
      slug: "smart-sell-strategies",
      title: "Master Smart Sell Strategies for Maximum Profits",
      excerpt:
        "Learn how our AI determines the optimal time to sell based on price action, volume, and market sentiment.",
      date: "2024-11-28",
      author: "Dr. Sarah Chen",
      category: "Trading",
      readTime: "8 min",
      image: "/images/blog/strategies.jpg",
    },
  ];

  const recentPosts = [
    {
      slug: "solana-token-analysis",
      title: "How to Analyze New Solana Tokens",
      excerpt:
        "Essential metrics and red flags to look for when evaluating newly launched tokens.",
      date: "2024-11-25",
      author: "Mike Rodriguez",
      category: "Analysis",
      readTime: "6 min",
    },
    {
      slug: "session-key-security",
      title: "Understanding Session Key Security",
      excerpt:
        "A deep dive into how session keys keep your funds safe during automated trading.",
      date: "2024-11-22",
      author: "Alex Thompson",
      category: "Security",
      readTime: "7 min",
    },
    {
      slug: "trading-bot-setup",
      title: "Setting Up Your First Trading Bot",
      excerpt:
        "Step-by-step guide to configuring automated trading for maximum efficiency.",
      date: "2024-11-20",
      author: "Emma Wilson",
      category: "Tutorial",
      readTime: "10 min",
    },
    {
      slug: "risk-management",
      title: "Risk Management in Automated Trading",
      excerpt:
        "Protect your capital with proper stop-loss and position sizing strategies.",
      date: "2024-11-18",
      author: "David Park",
      category: "Trading",
      readTime: "8 min",
    },
    {
      slug: "new-token-detection",
      title: "Early Token Detection: Finding Gems First",
      excerpt:
        "How AbuBeast identifies promising new tokens before they gain mainstream attention.",
      date: "2024-11-15",
      author: "Lisa Chang",
      category: "Features",
      readTime: "6 min",
    },
  ];

  const categories = [
    { id: "all", name: "All Posts", count: 12 },
    { id: "announcements", name: "Announcements", count: 3 },
    { id: "trading", name: "Trading", count: 4 },
    { id: "tutorial", name: "Tutorials", count: 3 },
    { id: "security", name: "Security", count: 2 },
  ];

  const filteredPosts = recentPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      post.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Blog"
        badgeIcon={<BookOpen className="w-4 h-4 mr-2" />}
        title="Insights & Updates"
        subtitle="Stay informed with the latest trading strategies, platform updates, and crypto insights"
        size="default"
      >
        <div className="max-w-xl mx-auto mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
              variant="glass"
            />
          </div>
        </div>
      </PageHeader>

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
        />
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-10 fixed"
        />

        {/* Featured Posts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <GlassCard
                key={post.slug}
                className="overflow-hidden group"
                hover
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-400/20 relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                  <Badge variant="gradient" className="absolute top-4 left-4">
                    {post.category}
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Read
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <GlassCard key={post.slug} className="p-6 group" hover>
                  <div className="flex gap-6">
                    <div className="hidden sm:block w-24 h-24 rounded-xl bg-gradient-to-br from-primary/10 to-purple-400/10 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.readTime} read
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Read More
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}

              {filteredPosts.length === 0 && (
                <GlassCard className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No articles found matching your criteria.
                  </p>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    <span className="text-sm">{cat.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {cat.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Newsletter */}
            <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-purple-400/10">
              <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest insights delivered to your inbox.
              </p>
              <div className="space-y-3">
                <Input placeholder="Your email" variant="glass" />
                <Button className="w-full">Subscribe</Button>
              </div>
            </GlassCard>

            {/* Popular Tags */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Solana",
                  "AI Trading",
                  "Session Keys",
                  "DeFi",
                  "Security",
                  "Tutorial",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-foreground/5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
