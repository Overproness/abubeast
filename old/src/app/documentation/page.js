"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GradientOrb } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  ArrowRight,
  Book,
  Bot,
  ChevronRight,
  Code,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Play,
  Search,
  Shield,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const documentationSections = [
    {
      title: "Getting Started",
      icon: <Play className="w-6 h-6" />,
      description: "Learn the basics of using AbuBeast's trading platform",
      articles: [
        { title: "Creating Your Account", time: "3 min" },
        { title: "Connecting Your Wallet", time: "2 min" },
        { title: "Platform Overview", time: "5 min" },
        { title: "Your First Trade", time: "4 min" },
        { title: "Security Best Practices", time: "6 min" },
      ],
      color: "from-success to-emerald-600",
    },
    {
      title: "Automated Trading",
      icon: <Bot className="w-6 h-6" />,
      description: "Master our AI-powered trading bot and session keys",
      articles: [
        { title: "How Session Keys Work", time: "5 min" },
        { title: "Setting Trading Permissions", time: "4 min" },
        { title: "Configuring Buy Strategies", time: "6 min" },
        { title: "Smart Sell Automation", time: "7 min" },
        { title: "Risk Management Settings", time: "5 min" },
      ],
      color: "from-violet-600 to-purple-400",
    },
    {
      title: "Trading Guides",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Comprehensive guides for Solana token trading",
      articles: [
        { title: "Token Swap Basics", time: "4 min" },
        { title: "Understanding Slippage", time: "3 min" },
        { title: "Reading Token Metrics", time: "6 min" },
        { title: "Portfolio Management", time: "5 min" },
        { title: "Tax Reporting", time: "4 min" },
      ],
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Security & Privacy",
      icon: <Shield className="w-6 h-6" />,
      description: "Protect your account and understand our security measures",
      articles: [
        { title: "Wallet Security Guide", time: "5 min" },
        { title: "Session Key Encryption", time: "4 min" },
        { title: "Revoking Permissions", time: "2 min" },
        { title: "Recognizing Scams", time: "5 min" },
        { title: "Account Recovery", time: "3 min" },
      ],
      color: "from-warning to-orange-500",
    },
    {
      title: "API Documentation",
      icon: <Code className="w-6 h-6" />,
      description: "Integrate AbuBeast into your applications",
      articles: [
        { title: "API Overview", time: "5 min" },
        { title: "Authentication", time: "4 min" },
        { title: "Trading Endpoints", time: "8 min" },
        { title: "Webhook Integration", time: "6 min" },
        { title: "Rate Limits", time: "3 min" },
      ],
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "FAQs & Troubleshooting",
      icon: <HelpCircle className="w-6 h-6" />,
      description: "Common questions and solutions to issues",
      articles: [
        { title: "Transaction Failures", time: "4 min" },
        { title: "Wallet Connection Issues", time: "3 min" },
        { title: "Bot Not Trading", time: "5 min" },
        { title: "Billing Questions", time: "3 min" },
        { title: "Contact Support", time: "2 min" },
      ],
      color: "from-teal-500 to-cyan-600",
    },
  ];

  const quickLinks = [
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Tutorials",
      count: 15,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "API Reference",
      count: 32,
    },
    { icon: <Download className="w-5 h-5" />, title: "Downloads", count: 8 },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Guides",
      count: 24,
    },
  ];

  const popularArticles = [
    { title: "How to Set Up Automated Trading", views: "12.5k" },
    { title: "Understanding Session Keys", views: "9.8k" },
    { title: "Smart Sell Strategy Guide", views: "8.2k" },
    { title: "Connecting Phantom Wallet", views: "7.6k" },
    { title: "Trading Bot Best Practices", views: "6.4k" },
  ];

  const filteredSections = documentationSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.articles.some((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Documentation"
        badgeIcon={<Book className="w-4 h-4 mr-2" />}
        title="Learn AbuBeast"
        subtitle="Everything you need to master AI-powered trading on Solana"
        size="default"
      >
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
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

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <GlassCard
                  key={link.title}
                  className="p-4 text-center cursor-pointer transition-all hover:scale-105"
                  hover
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-2">
                    {link.icon}
                  </div>
                  <h4 className="font-medium text-sm mb-1">{link.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {link.count} items
                  </p>
                </GlassCard>
              ))}
            </div>

            {/* Documentation Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSections.map((section, index) => (
                <GlassCard key={section.title} className="p-6 h-full" hover>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white`}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.articles.length} articles
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.description}
                  </p>
                  <ul className="space-y-2">
                    {section.articles.slice(0, 3).map((article, i) => (
                      <li key={i}>
                        <a
                          href="#"
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-foreground/5 transition-colors group"
                        >
                          <span className="text-sm group-hover:text-primary transition-colors">
                            {article.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {article.time}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-4 text-sm text-primary hover:underline flex items-center justify-center gap-1">
                    View all articles
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Articles */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Popular Articles</h3>
              <ul className="space-y-3">
                {popularArticles.map((article, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors group"
                    >
                      <span className="text-xs text-muted-foreground mt-1">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm group-hover:text-primary transition-colors leading-tight">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {article.views} views
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Quick Start */}
            <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-purple-400/10">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Quick Start Guide</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                New to AbuBeast? Get started with our 5-minute quick start
                guide.
              </p>
              <Button className="w-full gap-2">
                Start Tutorial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </GlassCard>

            {/* Need Help */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-3">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to
                help.
              </p>
              <div className="space-y-2">
                <Link href="/contact">
                  <Button variant="outline" className="w-full gap-2">
                    Contact Support
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <a
                  href="https://discord.gg/abubeast"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="w-full gap-2">
                    Join Discord
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </GlassCard>

            {/* API Status */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">API Status</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
