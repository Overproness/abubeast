"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BentoGrid,
  BentoItem,
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Check,
  DollarSign,
  Eye,
  Lock,
  RefreshCcw,
  Rocket,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI-Powered Trading Bot",
      description:
        "Our intelligent bot analyzes market conditions 24/7 and executes trades automatically based on your configured strategies.",
      details: [
        "24/7 automated trading",
        "Customizable trading parameters",
        "Multiple strategy support",
        "Risk management built-in",
      ],
      span: "col-span-1 md:col-span-2",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "New Token Detection",
      description:
        "Be among the first to discover and invest in newly launched Solana tokens before they gain mainstream attention.",
      details: [
        "Real-time token monitoring",
        "Liquidity analysis",
        "Rug-pull detection",
        "Smart filtering",
      ],
      span: "col-span-1",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Sell Strategies",
      description:
        "Our AI determines the optimal time to sell based on price action, volume, holder distribution, and market sentiment.",
      details: [
        "Take-profit automation",
        "Stop-loss protection",
        "Trailing stops",
        "Pattern recognition",
      ],
      span: "col-span-1",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast Execution",
      description:
        "Execute trades in milliseconds with our optimized infrastructure built specifically for Solana's high-speed network.",
      details: [
        "Sub-second execution",
        "Priority transaction routing",
        "MEV protection",
        "Jito bundle support",
      ],
      span: "col-span-1 md:col-span-2",
    },
  ];

  const advancedFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description:
        "Military-grade encryption protects your session keys. Your wallet private keys never leave your device.",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-Time Monitoring",
      description:
        "Watch your trades execute in real-time with live P&L tracking and detailed transaction logs.",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Full Control",
      description:
        "Set spending limits, configure permissions, and revoke access instantly. You're always in control.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Gain insights from comprehensive trading analytics, performance metrics, and historical data.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Instant Notifications",
      description:
        "Get notified instantly when trades execute, reach targets, or when market conditions change.",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Multi-Wallet Support",
      description:
        "Connect multiple Phantom wallets and manage them all from a single dashboard.",
    },
  ];

  const tradingCapabilities = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Sniper Mode",
      description:
        "Instantly buy tokens at launch with customizable slippage and gas settings.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Copy Trading",
      description:
        "Follow successful traders and automatically mirror their positions.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "DCA Automation",
      description:
        "Set up dollar-cost averaging strategies that execute automatically.",
    },
    {
      icon: <RefreshCcw className="w-6 h-6" />,
      title: "Auto-Compounding",
      description:
        "Reinvest profits automatically to maximize compound growth.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <PageHeader
        badge="Platform Features"
        badgeIcon={<Sparkles className="w-4 h-4 mr-2" />}
        title="Everything You Need to Trade Smarter"
        subtitle="Powerful AI-driven features designed to help you catch early opportunities and maximize profits on Solana."
        size="large"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Trading
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Core Features Bento Grid */}
      <section className="relative py-20">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10"
        />

        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="gradient" className="mb-6">
              <Bot className="w-4 h-4 mr-2" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by <GradientText>Advanced AI</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our core features work together to give you an unfair advantage in
              the Solana ecosystem.
            </p>
          </div>

          <BentoGrid cols={3}>
            {coreFeatures.map((feature, index) => (
              <BentoItem key={feature.title} className={feature.span}>
                <FeatureIcon className="mb-4">{feature.icon}</FeatureIcon>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </BentoItem>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Trading Capabilities */}
      <section className="relative py-20 bg-foreground/[0.02]">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trading Modes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Multiple Ways to <GradientText>Profit</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from various trading strategies that fit your risk
              tolerance and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tradingCapabilities.map((cap, index) => (
              <GlassCard key={cap.title} className="p-6 text-center" hover>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-4">
                  {cap.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {cap.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="relative py-20 overflow-hidden">
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-10"
        />

        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="gradient" className="mb-6">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <GradientText>Serious Traders</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional-grade tools that give you the edge in every trade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <GlassCard key={feature.title} className="p-6" hover>
                <FeatureIcon className="mb-4">{feature.icon}</FeatureIcon>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="relative py-20 bg-foreground/[0.02]">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="gradient" className="mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Your Assets, <GradientText>Fully Protected</GradientText>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We've built AbuBeast with security as the foundation. Your
                private keys never leave your wallet, and our session key system
                ensures you maintain full control at all times.
              </p>

              <div className="space-y-4">
                {[
                  "Private keys never stored on our servers",
                  "AES-256-GCM encryption for session keys",
                  "Configurable spending limits per day",
                  "Instant revocation of bot access",
                  "Full audit trail of all transactions",
                  "Regular third-party security audits",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Session Key Security</h4>
                    <p className="text-sm text-muted-foreground">
                      How we protect your trades
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      text: "Temporary key generated on our secure server",
                    },
                    { step: 2, text: "Key encrypted with AES-256-GCM" },
                    {
                      step: 3,
                      text: "You sign authorization with your wallet",
                    },
                    { step: 4, text: "Bot trades within your limits" },
                    { step: 5, text: "Key auto-expires or can be revoked" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {item.step}
                        </span>
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="relative py-20">
        <div className="section-container">
          <GlassCard className="p-8 md:p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: "150ms", label: "Average Execution Time" },
                { value: "99.9%", label: "Platform Uptime" },
                { value: "50K+", label: "Active Traders" },
                { value: "$2.5B+", label: "Total Volume Traded" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={index < 3 ? "md:border-r border-border/50" : ""}
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
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
                Ready to <GradientText>Automate Your Trading</GradientText>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Start using AI-powered trading today and never miss another
                opportunity on Solana.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="xl" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/trading/automated">
                  <Button variant="outline" size="xl">
                    Learn More
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
