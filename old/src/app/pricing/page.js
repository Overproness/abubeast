"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GradientOrb, GradientText } from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  HelpCircle,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);

  const tiers = [
    {
      name: "Starter",
      icon: <Zap className="w-6 h-6" />,
      price: { monthly: "Free", yearly: "Free" },
      period: "Forever",
      description:
        "Perfect for beginners exploring automated trading on Solana.",
      features: [
        { name: "Real-time market data", included: true },
        { name: "Basic token alerts", included: true },
        { name: "Portfolio tracking", included: true },
        { name: "1 active trading session", included: true },
        { name: "Up to $100/day trading limit", included: true },
        { name: "Community Discord access", included: true },
        { name: "AI trading strategies", included: false },
        { name: "Priority execution", included: false },
        { name: "Advanced analytics", included: false },
      ],
      cta: "Get Started",
      ctaVariant: "outline",
      popular: false,
    },
    {
      name: "Professional",
      icon: <Crown className="w-6 h-6" />,
      price: { monthly: "$49", yearly: "$39" },
      period: billingPeriod === "monthly" ? "/month" : "/month, billed yearly",
      description: "For serious traders who want to maximize their edge.",
      features: [
        { name: "Everything in Starter", included: true },
        { name: "AI-powered trading strategies", included: true },
        { name: "Unlimited trading sessions", included: true },
        { name: "Up to $10,000/day trading limit", included: true },
        { name: "Priority transaction routing", included: true },
        { name: "Advanced analytics dashboard", included: true },
        { name: "Smart sell automation", included: true },
        { name: "Copy trading access", included: true },
        { name: "Email + priority support", included: true },
      ],
      cta: "Start 14-Day Trial",
      ctaVariant: "default",
      popular: true,
    },
    {
      name: "Enterprise",
      icon: <Building2 className="w-6 h-6" />,
      price: { monthly: "Custom", yearly: "Custom" },
      period: "Contact us",
      description:
        "For institutions and high-volume traders requiring custom solutions.",
      features: [
        { name: "Everything in Professional", included: true },
        { name: "Unlimited trading limits", included: true },
        { name: "Custom trading algorithms", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Custom API integrations", included: true },
        { name: "White-label solutions", included: true },
        { name: "SLA guarantees", included: true },
        { name: "24/7 phone support", included: true },
        { name: "On-premise deployment option", included: true },
      ],
      cta: "Contact Sales",
      ctaVariant: "outline",
      popular: false,
    },
  ];

  const comparisons = [
    {
      category: "Trading Features",
      features: [
        {
          name: "Real-time market data",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Automated trading",
          starter: "Limited",
          pro: true,
          enterprise: true,
        },
        {
          name: "AI trading strategies",
          starter: false,
          pro: true,
          enterprise: "Custom",
        },
        {
          name: "Smart sell automation",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Copy trading", starter: false, pro: true, enterprise: true },
        {
          name: "Priority execution",
          starter: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Limits",
      features: [
        {
          name: "Daily trading limit",
          starter: "$100",
          pro: "$10,000",
          enterprise: "Unlimited",
        },
        {
          name: "Active sessions",
          starter: "1",
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
        {
          name: "API rate limits",
          starter: "100/min",
          pro: "1,000/min",
          enterprise: "Custom",
        },
      ],
    },
    {
      category: "Support",
      features: [
        {
          name: "Community Discord",
          starter: true,
          pro: true,
          enterprise: true,
        },
        { name: "Email support", starter: false, pro: true, enterprise: true },
        {
          name: "Priority support",
          starter: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "Dedicated manager",
          starter: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "24/7 phone support",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan anytime?",
      a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the remaining credit will be applied to future billing cycles.",
    },
    {
      q: "What happens when I reach my daily trading limit?",
      a: "When you reach your daily limit, the bot will stop executing new trades until the next day. Your existing positions remain unaffected. You can upgrade your plan for higher limits.",
    },
    {
      q: "Is there a free trial for the Professional plan?",
      a: "Yes! We offer a 14-day free trial of the Professional plan with full features. No credit card required to start. You can cancel anytime during the trial.",
    },
    {
      q: "How does the performance fee work?",
      a: "We charge a small performance fee only on profitable trades. This means we only make money when you make money. The exact percentage varies by plan and is disclosed in your dashboard.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Absolutely. There are no long-term commitments. You can cancel your subscription at any time, and you'll retain access until the end of your current billing period.",
    },
    {
      q: "Do you offer refunds?",
      a: "We offer a 7-day money-back guarantee for new subscribers. If you're not satisfied with our service, contact support within 7 days of your first payment for a full refund.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <PageHeader
        badge="Pricing"
        badgeIcon={<Sparkles className="w-4 h-4 mr-2" />}
        title="Simple, Transparent Pricing"
        subtitle="Start for free and upgrade as you grow. No hidden fees, cancel anytime."
        size="default"
      >
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              billingPeriod === "yearly"
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <Badge variant="success" className="text-xs">
              Save 20%
            </Badge>
          </button>
        </div>
      </PageHeader>

      {/* Pricing Cards */}
      <section className="relative py-20 -mt-8">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10"
        />

        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <GlassCard
                key={tier.name}
                className={`p-8 relative ${
                  tier.popular ? "ring-2 ring-primary shadow-neon" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="gradient" className="px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      tier.popular
                        ? "bg-gradient-to-br from-violet-600 to-purple-500 text-white"
                        : "bg-gradient-to-br from-primary/20 to-purple-400/20"
                    }`}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">
                      {tier.price[billingPeriod]}
                    </span>
                    {tier.price[billingPeriod] !== "Free" &&
                      tier.price[billingPeriod] !== "Custom" && (
                        <span className="text-muted-foreground text-sm">
                          {tier.period}
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-success shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span
                        className={
                          !feature.included ? "text-muted-foreground/50" : ""
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={
                    tier.name === "Enterprise" ? "/contact" : "/auth/signup"
                  }
                  className="block"
                >
                  <Button
                    variant={tier.ctaVariant}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative py-20 bg-foreground/[0.02]">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compare <GradientText>All Features</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              See exactly what you get with each plan.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <GlassCard className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-border/50 bg-foreground/5">
                <div className="text-sm font-medium text-muted-foreground">
                  Feature
                </div>
                <div className="text-center font-semibold">Starter</div>
                <div className="text-center font-semibold">Professional</div>
                <div className="text-center font-semibold">Enterprise</div>
              </div>

              {/* Table Body */}
              {comparisons.map((section, sectionIndex) => (
                <div key={section.category}>
                  <div className="px-6 py-4 bg-foreground/5 border-b border-border/50">
                    <span className="text-sm font-semibold">
                      {section.category}
                    </span>
                  </div>
                  {section.features.map((feature, featureIndex) => (
                    <div
                      key={feature.name}
                      className={`grid grid-cols-4 gap-4 px-6 py-4 ${
                        featureIndex < section.features.length - 1
                          ? "border-b border-border/30"
                          : ""
                      }`}
                    >
                      <div className="text-sm">{feature.name}</div>
                      <div className="text-center">
                        {typeof feature.starter === "boolean" ? (
                          feature.starter ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature.starter}</span>
                        )}
                      </div>
                      <div className="text-center">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature.pro}</span>
                        )}
                      </div>
                      <div className="text-center">
                        {typeof feature.enterprise === "boolean" ? (
                          feature.enterprise ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature.enterprise}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20">
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-10"
        />

        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <GradientText>Questions</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <GlassCard
                key={index}
                className="overflow-hidden cursor-pointer transition-all"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="p-6 flex items-center justify-between">
                  <h4 className="font-semibold pr-4">{faq.q}</h4>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </div>
                {openFaq === index && (
                  <div className="px-6 pb-6 -mt-2">
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-foreground/[0.02]">
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
                Ready to Start <GradientText>Trading</GradientText>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of traders using AbuBeast to automate their
                Solana trading. Start free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="xl" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="xl">
                    Talk to Sales
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
