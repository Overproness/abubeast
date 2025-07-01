"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PricingPage() {
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

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  };
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
      <motion.section
        className="py-24 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {tiers.map((tier, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <Card
                  className={`relative overflow-hidden border-0 ${
                    tier.popular
                      ? "shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                      : "shadow-lg hover:shadow-xl"
                  } transition-all duration-300 h-full`}
                >
                  {tier.popular && (
                    <motion.div
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    />
                  )}
                  {tier.popular && (
                    <motion.div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.2 + 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <motion.span
                        className={`inline-flex px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${tier.color}`}
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(59, 130, 246, 0.3)",
                            "0 0 40px rgba(147, 51, 234, 0.3)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                      >
                        Most Popular
                      </motion.span>
                    </motion.div>
                  )}
                  <CardContent className="p-8">
                    <motion.div
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <motion.h3
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        {tier.title}
                      </motion.h3>
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1 + 0.4,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <motion.span
                          className="text-5xl font-bold text-gray-900 dark:text-white"
                          whileHover={{
                            scale: 1.1,
                            color: tier.popular ? "#3B82F6" : undefined,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {tier.price === "Custom" ? "" : "$"}
                          {tier.price === "Free"
                            ? "0"
                            : tier.price.replace("$", "")}
                        </motion.span>
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
                      </motion.div>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                      >
                        {tier.description}
                      </motion.p>
                    </motion.div>

                    <motion.ul
                      className="space-y-4 mb-8"
                      variants={staggerContainer}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                    >
                      {tier.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start"
                          variants={fadeInLeft}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.span
                            className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.5,
                              delay: i * 0.05,
                              type: "spring",
                              stiffness: 200,
                            }}
                            whileHover={{
                              scale: 1.2,
                              boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)",
                            }}
                          >
                            <span className="text-white text-xs">✓</span>
                          </motion.span>
                          <motion.span
                            className="text-gray-700 dark:text-gray-300"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.4,
                              delay: i * 0.05 + 0.2,
                            }}
                          >
                            {feature}
                          </motion.span>
                        </motion.li>
                      ))}
                      {tier.limitations.map((limitation, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start opacity-60"
                          variants={fadeInLeft}
                        >
                          <motion.span
                            className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.3,
                              delay: i * 0.05 + tier.features.length * 0.05,
                            }}
                          >
                            <span className="text-gray-600 text-xs">×</span>
                          </motion.span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {limitation}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
                      {...scaleOnHover}
                    >
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
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Comparison */}
      <motion.section
        className="py-24 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Feature{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Comparison
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Compare all features across our plans
            </motion.p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <motion.thead
                  className="bg-gray-50 dark:bg-gray-800"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
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
                </motion.thead>
                <tbody>
                  {features.map((category, categoryIndex) => (
                    <motion.tbody
                      key={categoryIndex}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: categoryIndex * 0.1 + 0.6,
                      }}
                    >
                      <motion.tr
                        className="bg-blue-50 dark:bg-blue-900/20"
                        whileHover={{
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                        }}
                      >
                        <td
                          colSpan={4}
                          className="py-3 px-6 font-semibold text-blue-700 dark:text-blue-300"
                        >
                          {category.category}
                        </td>
                      </motion.tr>
                      {category.items.map((item, itemIndex) => (
                        <motion.tr
                          key={itemIndex}
                          className="border-b border-gray-200 dark:border-gray-700"
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.4,
                            delay: categoryIndex * 0.1 + itemIndex * 0.05 + 0.8,
                          }}
                          whileHover={{
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                            x: 5,
                          }}
                        >
                          <td className="py-4 px-6 text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <motion.td
                            className="py-4 px-6 text-center"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {typeof item.starter === "boolean" ? (
                              item.starter ? (
                                <motion.span
                                  className="text-green-500 text-xl"
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, 0],
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    delay: Math.random() * 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                  }}
                                >
                                  ✓
                                </motion.span>
                              ) : (
                                <span className="text-gray-300 text-xl">×</span>
                              )
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.starter}
                              </span>
                            )}
                          </motion.td>
                          <motion.td
                            className="py-4 px-6 text-center"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {typeof item.pro === "boolean" ? (
                              item.pro ? (
                                <motion.span
                                  className="text-green-500 text-xl"
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, -5, 0],
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    delay: Math.random() * 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                  }}
                                >
                                  ✓
                                </motion.span>
                              ) : (
                                <span className="text-gray-300 text-xl">×</span>
                              )
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.pro}
                              </span>
                            )}
                          </motion.td>
                          <motion.td
                            className="py-4 px-6 text-center"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {typeof item.enterprise === "boolean" ? (
                              item.enterprise ? (
                                <motion.span
                                  className="text-green-500 text-xl"
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, 0],
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    delay: Math.random() * 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                  }}
                                >
                                  ✓
                                </motion.span>
                              ) : (
                                <span className="text-gray-300 text-xl">×</span>
                              )
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.enterprise}
                              </span>
                            )}
                          </motion.td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-24 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Frequently Asked{" "}
              <motion.span
                className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Questions
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Got questions? We've got answers
            </motion.p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-6">
                    <motion.h3
                      className="text-lg font-semibold text-gray-900 dark:text-white mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      {faq.question}
                    </motion.h3>
                    <motion.p
                      className="text-gray-600 dark:text-gray-300 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    >
                      {faq.answer}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Get{" "}
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
            >
              Started?
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join thousands of traders who trust AbuBeast for their crypto
            trading needs
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 shadow-lg hover:shadow-xl"
                asChild
              >
                <Link href="/auth/signup">Start Free Today</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 backdrop-blur-sm"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="mt-8 text-blue-100/80"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            // transition={{ duration: 0.6, delay: 1 }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <p className="text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
