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
  ArrowRight,
  Brain,
  Building2,
  CheckCircle,
  Clock,
  Heart,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const milestones = [
    {
      year: "2021",
      title: "Vision Born",
      description:
        "AbuBeast was founded with a mission to democratize Solana trading through AI",
    },
    {
      year: "2022",
      title: "Platform Launch",
      description:
        "Released our MVP with core automated trading features on Solana",
    },
    {
      year: "2023",
      title: "AI Integration",
      description:
        "Integrated advanced AI for market analysis and smart sell strategies",
    },
    {
      year: "2024",
      title: "Scaling Up",
      description:
        "Expanded to handle millions in daily trading volume with sub-second execution",
    },
  ];

  const achievements = [
    { number: "50K+", label: "Active Traders", icon: Users, color: "blue" },
    {
      number: "$2.5B+",
      label: "Trading Volume",
      icon: TrendingUp,
      color: "violet",
    },
    { number: "99.9%", label: "Uptime", icon: Clock, color: "blue" },
    { number: "150ms", label: "Avg. Execution", icon: Zap, color: "violet" },
  ];

  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security First",
      description:
        "Your assets are protected with military-grade encryption. Your private keys never leave your wallet.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Speed Matters",
      description:
        "In crypto, milliseconds count. Our infrastructure is optimized for the fastest possible execution.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered",
      description:
        "Our algorithms learn and adapt, continuously improving trading strategies based on market data.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "User-Centric",
      description:
        "Every feature is designed with our users in mind. Your success is our success.",
    },
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Co-Founder",
      image: "/images/team/alex.jpg",
    },
    {
      name: "Sarah Park",
      role: "CTO & Co-Founder",
      image: "/images/team/sarah.jpg",
    },
    {
      name: "Marcus Johnson",
      role: "Head of AI",
      image: "/images/team/marcus.jpg",
    },
    {
      name: "Emily Zhang",
      role: "Lead Developer",
      image: "/images/team/emily.jpg",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <PageHeader
        badge="About AbuBeast"
        badgeIcon={<Building2 className="w-4 h-4 mr-2" />}
        title="Pioneering AI-Powered Solana Trading"
        subtitle="We're on a mission to make crypto trading accessible, secure, and profitable for everyone through intelligent automation."
        size="large"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Join Our Platform
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              Get in Touch
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Achievement Stats */}
      <section className="relative py-16 -mt-12 z-20">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((stat, index) => (
              <GlassCard key={stat.label} className="p-6 text-center" hover>
                <div
                  className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${
                    stat.color === "blue"
                      ? "from-primary/20 to-primary/5"
                      : "from-purple-400/20 to-purple-400/5"
                  } flex items-center justify-center mb-4`}
                >
                  <stat.icon
                    className={`w-6 h-6 ${
                      stat.color === "blue" ? "text-primary" : "text-purple-400"
                    }`}
                  />
                </div>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 overflow-hidden">
        <GradientOrb
          color="blue"
          className="w-[400px] h-[400px] top-0 right-0 opacity-10"
        />

        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="gradient" className="mb-6">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering <GradientText>Every Trader</GradientText> with AI
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that everyone deserves access to sophisticated
                trading tools. Our AI-powered platform levels the playing field,
                giving retail traders the same advantages that were once
                reserved for institutions.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                AbuBeast was born from frustration with the complexity of crypto
                trading. We saw traders losing money not because of bad
                instincts, but because they couldn't react fast enough or
                analyze enough data. So we built a solution that never sleeps,
                never panics, and always executes with precision.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>24/7 Automated Trading</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>AI Market Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Smart Sell Strategies</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <GlassCard className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                    <FeatureIcon>
                      <Rocket className="w-6 h-6" />
                    </FeatureIcon>
                    <div>
                      <h4 className="font-semibold">Early Token Detection</h4>
                      <p className="text-sm text-muted-foreground">
                        Find opportunities before the crowd
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                    <FeatureIcon>
                      <Brain className="w-6 h-6" />
                    </FeatureIcon>
                    <div>
                      <h4 className="font-semibold">AI-Powered Decisions</h4>
                      <p className="text-sm text-muted-foreground">
                        Data-driven buy/sell timing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                    <FeatureIcon>
                      <Sparkles className="w-6 h-6" />
                    </FeatureIcon>
                    <div>
                      <h4 className="font-semibold">Profit Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Maximize gains, minimize losses
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="relative py-20 bg-foreground/[0.02]">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Core Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What <GradientText>Drives Us</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our values shape every decision we make and every feature we
              build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <GlassCard key={value.title} className="p-6" hover>
                <FeatureIcon className="mb-4">{value.icon}</FeatureIcon>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-20 overflow-hidden">
        <GradientOrb
          color="violet"
          className="w-[500px] h-[500px] bottom-0 left-0 opacity-10"
        />

        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="gradient" className="mb-6">
              <Clock className="w-4 h-4 mr-2" />
              Our Journey
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The <GradientText>AbuBeast Story</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              From a simple idea to a platform trusted by thousands of traders.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-600 via-purple-500 to-violet-600/50" />

            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative flex items-center gap-8 mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Year badge */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white font-bold shadow-neon">
                    {milestone.year}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${
                    index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"
                  }`}
                >
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {milestone.description}
                    </p>
                  </GlassCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="section-container">
          <GlassCard className="p-12 md:p-16 text-center relative overflow-hidden">
            <GradientOrb
              color="blue"
              className="w-[300px] h-[300px] -top-20 -right-20 opacity-20"
            />
            <GradientOrb
              color="violet"
              className="w-[250px] h-[250px] -bottom-20 -left-20 opacity-20"
            />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <GradientText>Start Trading</GradientText>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of traders who are already using AbuBeast to
                automate their Solana trading and maximize profits.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="xl" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="xl">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
