"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  BookOpen,
  Bot,
  ChevronRight,
  Clock,
  Play,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const guideCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Play className="w-5 h-5" />,
      description:
        "Essential guides for new users to get up and running quickly",
      level: "Beginner",
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
    },
    {
      id: "trading-strategies",
      title: "Trading Strategies",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Advanced trading techniques and proven strategies",
      level: "Intermediate",
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
          description: "Understanding charts, patterns, and indicators",
          duration: "30 min",
          featured: true,
        },
        {
          title: "Risk Management",
          description: "Protect your capital with proper risk management",
          duration: "18 min",
          featured: false,
        },
      ],
    },
    {
      id: "automated-trading",
      title: "Automated Trading",
      icon: <Bot className="w-5 h-5" />,
      description: "Set up and optimize AI-powered automated trading",
      level: "Advanced",
      guides: [
        {
          title: "Session Key Authorization",
          description:
            "Securely authorize automated trading with limited permissions",
          duration: "15 min",
          featured: true,
        },
        {
          title: "Bot Configuration",
          description: "Configure your trading bot for optimal performance",
          duration: "20 min",
          featured: true,
        },
        {
          title: "Understanding AI Strategies",
          description: "How our AI analyzes new token launches",
          duration: "25 min",
          featured: false,
        },
        {
          title: "Monitoring & Optimization",
          description: "Track performance and fine-tune your bot settings",
          duration: "18 min",
          featured: false,
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      icon: <Shield className="w-5 h-5" />,
      description: "Protect your assets with best practices",
      level: "All Levels",
      guides: [
        {
          title: "Wallet Security Best Practices",
          description: "Keep your Solana wallet secure",
          duration: "15 min",
          featured: true,
        },
        {
          title: "Understanding Session Keys",
          description: "How session keys protect your main wallet",
          duration: "12 min",
          featured: false,
        },
        {
          title: "Recognizing Scams",
          description: "Identify and avoid common crypto scams",
          duration: "10 min",
          featured: true,
        },
        {
          title: "Emergency Procedures",
          description: "What to do if you suspect a security breach",
          duration: "8 min",
          featured: false,
        },
      ],
    },
  ];

  const categories = [
    { id: "all", label: "All Guides" },
    { id: "getting-started", label: "Getting Started" },
    { id: "trading-strategies", label: "Trading" },
    { id: "automated-trading", label: "Automation" },
    { id: "security", label: "Security" },
  ];

  const filteredCategories =
    selectedCategory === "all"
      ? guideCategories
      : guideCategories.filter((cat) => cat.id === selectedCategory);

  const featuredGuides = guideCategories
    .flatMap((cat) =>
      cat.guides
        .filter((g) => g.featured)
        .map((g) => ({ ...g, category: cat.title, categoryIcon: cat.icon }))
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Learn"
        badgeIcon={<BookOpen className="w-4 h-4 mr-2" />}
        title="Trading Guides"
        subtitle="Master cryptocurrency trading with our comprehensive guides"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 left-0 opacity-10 fixed"
        />

        {/* Featured Guides */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            <GradientText>Featured Guides</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGuides.map((guide, index) => (
              <GlassCard
                key={index}
                className="p-6 hover:scale-[1.02] transition-transform cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FeatureIcon>{guide.categoryIcon}</FeatureIcon>
                  <Badge variant="outline">{guide.category}</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {guide.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {guide.duration}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:text-primary"
                  >
                    Read Guide <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Guide Categories */}
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-6">
                <FeatureIcon>{category.icon}</FeatureIcon>
                <div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {category.level}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.guides.map((guide, index) => (
                  <GlassCard
                    key={index}
                    className="p-5 hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {guide.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {guide.duration}
                        </span>
                        {guide.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <GlassCard className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
          <Zap className="w-10 h-10 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Ready to Start Trading?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Put your knowledge into practice with our AI-powered trading
            platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/trading/automated">
              <Button size="lg">Start Trading</Button>
            </Link>
            <Link href="/documentation">
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
