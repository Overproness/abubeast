"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  DollarSign,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Timer,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      title: "Smart Token Detection",
      description:
        "AI-powered detection of newly launched tokens on Solana. Be among the first to buy promising tokens.",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-violet-600 to-purple-400",
    },
    {
      title: "Intelligent Sell Strategy",
      description:
        "Our algorithm analyzes market conditions, liquidity, and momentum to determine the optimal exit point.",
      icon: <Brain className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      title: "Real-Time Analytics",
      description:
        "Track your portfolio performance, trade history, and profit/loss with comprehensive dashboards.",
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Secure Wallet Integration",
      description:
        "Connect your wallet securely. Your keys stay with you. We only execute trades you authorize.",
      icon: <Shield className="w-6 h-6" />,
      gradient: "from-orange-400 to-red-400",
    },
    {
      title: "24/7 Automated Trading",
      description:
        "Set your parameters and let the bot trade for you around the clock. Never miss an opportunity.",
      icon: <Bot className="w-6 h-6" />,
      gradient: "from-violet-600 to-purple-500",
    },
    {
      title: "Risk Management",
      description:
        "Built-in stop-loss, take-profit, and position sizing to protect your capital automatically.",
      icon: <Lock className="w-6 h-6" />,
      gradient: "from-yellow-400 to-orange-400",
    },
  ];

  const stats = [
    {
      value: "$50M+",
      label: "Trading Volume",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      value: "15,000+",
      label: "Active Traders",
      icon: <Users className="w-6 h-6" />,
    },
    { value: "99.9%", label: "Uptime", icon: <Activity className="w-6 h-6" /> },
    {
      value: "<50ms",
      label: "Execution Speed",
      icon: <Timer className="w-6 h-6" />,
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Connect Wallet",
      description:
        "Link your Solana wallet securely. We support Phantom, Solflare, and more.",
    },
    {
      step: "02",
      title: "Configure Strategy",
      description:
        "Set your trading parameters, risk tolerance, and target tokens.",
    },
    {
      step: "03",
      title: "Authorize Bot",
      description:
        "Grant permission for the bot to execute trades on your behalf.",
    },
    {
      step: "04",
      title: "Earn Profits",
      description:
        "Watch as the bot automatically buys and sells for maximum returns.",
    },
  ];

  const partners = [
    { name: "Solana", logo: "SOL" },
    { name: "Jupiter", logo: "JUP" },
    { name: "Raydium", logo: "RAY" },
    { name: "Orca", logo: "ORCA" },
    { name: "Phantom", logo: "👻" },
    { name: "Solflare", logo: "🔥" },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        {/* Gradient Orbs - More visible with stronger colors */}
        <div className="absolute inset-0 overflow-hidden">
          <GradientOrb
            color="blue"
            className="w-[600px] h-[600px] top-1/4 -right-20 opacity-90 blur-3xl"
          />
          <GradientOrb
            color="violet"
            className="w-[500px] h-[500px] bottom-1/4 -left-20 opacity-80 blur-3xl animation-delay-2000"
          />
        </div>

        {/* Main hero section - Centered container */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Badge variant="gradient" className="px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Trading on Solana
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight max-w-5xl mx-auto"
            >
              Trade Smarter with
              <br />
              <span className="gradient-text">Automated Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              Our AI-powered bot detects newly launched tokens, buys early, and
              sells at the perfect moment. Maximize your profits on Solana with
              intelligent trading strategies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/auth/signup">
                <Button size="xl" className="gap-2 min-w-[200px]">
                  <Wallet className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="xl" className="min-w-[200px]">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Hero Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-20 w-full max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <GlassCard
                    key={index}
                    className="p-6 text-center backdrop-blur-sm"
                  >
                    <div className="flex justify-center mb-3">
                      <FeatureIcon>{stat.icon}</FeatureIcon>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 border-y border-border/50">
        <div className="section-container">
          <p className="text-center text-muted-foreground mb-8">
            Trusted by traders and integrated with
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-2xl">{partner.logo}</span>
                <span className="font-semibold">{partner.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="gradient" className="mb-4">
              Our Features
            </Badge>
            <h2 className="section-title">
              Innovative Features of <GradientText>AbuBeast</GradientText>
            </h2>
            <p className="section-subtitle mx-auto">
              Our platform combines advanced AI, real-time analytics, and
              user-friendly design to provide an unparalleled trading
              experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard hover className="p-6 h-full group">
                  <div
                    className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-card/50">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="gradient" className="mb-4">
              How It Works
            </Badge>
            <h2 className="section-title">
              Start Trading in <GradientText>4 Simple Steps</GradientText>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                <GlassCard className="p-6 h-full text-center relative z-10">
                  <div className="text-5xl font-bold gradient-text mb-4 opacity-50">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </GlassCard>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-violet-600 to-purple-500" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="section-padding relative overflow-hidden">
        {/* <GradientOrb
          color="blue"
          className="w-[200px] h-[200px] top-0 right-0 opacity-20"
        />
        <GradientOrb
          color="violet"
          className="w-[100px] h-[100px] bottom-0 left-0 opacity-20"
        /> */}

        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="gradient" className="mb-4">
                Dashboard
              </Badge>
              <h2 className="section-title">
                All-in-One Trading <GradientText>Dashboard</GradientText>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our comprehensive dashboard provides everything you need to
                monitor your trades, analyze performance, and optimize your
                strategies in real-time.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Real-time portfolio tracking",
                  "Trade history and analytics",
                  "Profit/Loss visualization",
                  "Custom alerts and notifications",
                  "Multi-wallet support",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/dashboard">
                <Button className="gap-2">
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <GlassCard className="p-6">
                {/* Mock Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Portfolio Overview</h4>
                    <Badge variant="success">+24.5%</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold gradient-text">
                        $45,231.89
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        Today's P/L
                      </p>
                      <p className="text-2xl font-bold text-success">
                        +$2,341.50
                      </p>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="h-40 glass-card rounded-xl flex items-end justify-around p-4">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 95, 75, 88, 92].map(
                      (height, i) => (
                        <div
                          key={i}
                          className="w-4 rounded-t bg-gradient-to-t from-violet-600 to-purple-500 opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 glass-card p-3 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">
                        Active Trades
                      </p>
                      <p className="text-lg font-bold">12</p>
                    </div>
                    <div className="flex-1 glass-card p-3 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-bold text-success">78%</p>
                    </div>
                    <div className="flex-1 glass-card p-3 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">
                        Tokens Traded
                      </p>
                      <p className="text-lg font-bold">156</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="section-padding bg-card/50 border-y border-border/50">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="gradient" className="mb-4">
              Pricing
            </Badge>
            <h2 className="section-title">
              Simple, Transparent <GradientText>Pricing</GradientText>
            </h2>
            <p className="section-subtitle mx-auto">
              No hidden fees. Pay only for what you use.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for trying out",
                features: [
                  "5 trades per day",
                  "Basic analytics",
                  "Email support",
                ],
              },
              {
                name: "Pro",
                price: "$49",
                period: "/month",
                description: "For serious traders",
                features: [
                  "Unlimited trades",
                  "Advanced analytics",
                  "Priority support",
                  "Custom strategies",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For institutions",
                features: [
                  "Everything in Pro",
                  "Dedicated account manager",
                  "API access",
                  "Custom integrations",
                ],
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard
                  className={`p-6 h-full relative ${
                    plan.popular ? "border-primary" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="gradient">Most Popular</Badge>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold gradient-text">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button variant="link" className="gap-2">
                View all pricing details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="gradient" className="mb-4">
              FAQ
            </Badge>
            <h2 className="section-title">
              Have Questions? <GradientText>We've Got Answers</GradientText>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "What is AbuBeast?",
                a: "AbuBeast is an AI-powered trading bot that automatically buys newly launched tokens on Solana and sells them at optimal times for maximum profit.",
              },
              {
                q: "How do I start using AbuBeast?",
                a: "Simply connect your Solana wallet, configure your trading parameters, and authorize the bot. It will start trading automatically.",
              },
              {
                q: "Is my wallet secure?",
                a: "Yes! Your private keys never leave your wallet. We only request permission to execute trades that you've authorized.",
              },
              {
                q: "What chains do you support?",
                a: "Currently, we support Solana. We're working on adding support for other chains in the future.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <h4 className="font-semibold mb-2 text-foreground">
                    {faq.q}
                  </h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-400/10" />
        {/* <GradientOrb
          color="blue"
          className="w-[400px] h-[400px] top-0 left-1/4 opacity-20"
        /> */}

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <GlassCard className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start <GradientText>Trading Smarter?</GradientText>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of traders who are already maximizing their
                profits with AbuBeast. Get started in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="xl" className="gap-2 min-w-[200px]">
                    <Rocket className="w-5 h-5" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="xl" className="min-w-[200px]">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
