import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    {
      title: "Starter",
      price: "Free",
      period: "Forever",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "Real-time market data",
        "Basic charting tools",
        "Portfolio tracking",
        "Mobile app access",
        "Email support",
        "Up to 10 trades/month",
      ],
      limitations: ["Limited advanced features", "Basic chart indicators only"],
      cta: {
        label: "Get Started Free",
        href: "/auth/signup",
        variant: "outline",
      },
      popular: false,
      color: "from-gray-500 to-gray-600",
    },
    {
      title: "Professional",
      price: "$29",
      period: "per month",
      description: "Advanced tools for serious traders and active investors",
      features: [
        "Everything in Starter",
        "Advanced charting (100+ indicators)",
        "Real-time news feed",
        "Price alerts & notifications",
        "API access (basic)",
        "Priority support",
        "Unlimited trades",
        "Portfolio analytics",
        "Risk management tools",
      ],
      limitations: [],
      cta: {
        label: "Start 14-Day Free Trial",
        href: "/auth/signup",
        variant: "default",
      },
      popular: true,
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "Contact us",
      description:
        "Tailored solutions for institutions and high-volume traders",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced API access",
        "White-label solutions",
        "SLA guarantees",
        "Compliance tools",
        "Custom reporting",
        "24/7 phone support",
      ],
      limitations: [],
      cta: { label: "Contact Sales", href: "/contact", variant: "outline" },
      popular: false,
      color: "from-purple-500 to-pink-600",
    },
  ];

  const features = [
    {
      category: "Trading Features",
      items: [
        {
          name: "Real-time Trading",
          starter: true,
          pro: true,
          enterprise: true,
        },
        { name: "Basic Charts", starter: true, pro: true, enterprise: true },
        {
          name: "Advanced Charts (100+ indicators)",
          starter: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "Order Types",
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Custom",
        },
        {
          name: "API Access",
          starter: false,
          pro: "Basic",
          enterprise: "Advanced",
        },
        {
          name: "Automated Trading",
          starter: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Portfolio & Analytics",
      items: [
        {
          name: "Portfolio Tracking",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Performance Analytics",
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Custom",
        },
        {
          name: "Risk Management",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Tax Reporting", starter: false, pro: true, enterprise: true },
        {
          name: "Custom Reports",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
    {
      category: "Support & Service",
      items: [
        { name: "Email Support", starter: true, pro: true, enterprise: true },
        {
          name: "Priority Support",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Phone Support", starter: false, pro: false, enterprise: true },
        {
          name: "Dedicated Account Manager",
          starter: false,
          pro: false,
          enterprise: true,
        },
        { name: "SLA Guarantee", starter: false, pro: false, enterprise: true },
      ],
    },
  ];

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer:
        "Yes, Professional plan comes with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin and Ethereum.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for all paid plans if you're not completely satisfied.",
    },
    {
      question: "Is there a discount for annual billing?",
      answer:
        "Yes, save 20% when you choose annual billing on any paid plan. Contact sales for custom enterprise pricing.",
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Simple, Transparent Pricing"
        subtitle="Choose the perfect plan for your trading needs"
        description="Start free and upgrade anytime. All plans include our core trading features with no hidden fees"
        gradient
      />

      {/* Pricing Cards */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-0 ${
                  tier.popular
                    ? "shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                    : "shadow-lg hover:shadow-xl"
                } transition-all duration-300`}
              >
                {tier.popular && (
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`}
                  />
                )}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span
                      className={`inline-flex px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${tier.color}`}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {tier.title}
                    </h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        {tier.price === "Custom" ? "" : "$"}
                        {tier.price === "Free"
                          ? "0"
                          : tier.price.replace("$", "")}
                      </span>
                      {tier.price !== "Custom" && tier.price !== "Free" && (
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          /{tier.period}
                        </span>
                      )}
                      {tier.price === "Custom" && (
                        <span className="text-2xl text-gray-600 dark:text-gray-400">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {tier.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {tier.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start opacity-60">
                        <span className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-gray-600 text-xs">×</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-3 ${
                      tier.popular
                        ? `bg-gradient-to-r ${tier.color} text-white hover:opacity-90`
                        : ""
                    }`}
                    variant={tier.cta.variant}
                    size="lg"
                    asChild
                  >
                    <Link href={tier.cta.href}>{tier.cta.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Feature{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Comparison
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Compare all features across our plans
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Features
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Starter
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Professional
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((category, categoryIndex) => (
                    <>
                      <tr
                        key={categoryIndex}
                        className="bg-blue-50 dark:bg-blue-900/20"
                      >
                        <td
                          colSpan={4}
                          className="py-3 px-6 font-semibold text-blue-700 dark:text-blue-300"
                        >
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item, itemIndex) => (
                        <tr
                          key={itemIndex}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="py-4 px-6 text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof item.starter === "boolean" ? (
                              item.starter ? (
                                <span className="text-green-500 text-xl">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xl">×</span>
                              )
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.starter}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof item.pro === "boolean" ? (
                              item.pro ? (
                                <span className="text-green-500 text-xl">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xl">×</span>
                              )
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.pro}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof item.enterprise === "boolean" ? (
                              item.enterprise ? (
                                <span className="text-green-500 text-xl">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xl">×</span>
                              )
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.enterprise}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Got questions? We've got answers
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Join thousands of traders who trust AbuBeast for their crypto
            trading needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4"
              asChild
            >
              <Link href="/auth/signup">Start Free Today</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-4"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
