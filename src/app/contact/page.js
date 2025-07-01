"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
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

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    msg: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStatus({
        submitted: true,
        success: true,
        msg: "Thank you for reaching out! We'll get back to you within 24 hours.",
      });

      setForm({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        submitted: true,
        success: false,
        msg: "Something went wrong. Please try again later or contact us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Support",
      description: "Get help with technical issues",
      contact: "support@abubeast.com",
      response: "Within 24 hours",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available on dashboard",
      response: "Instant response",
    },
    {
      icon: "📞",
      title: "Phone Support",
      description: "For urgent matters",
      contact: "+1 (555) 123-4567",
      response: "Mon-Fri, 9AM-6PM EST",
    },
    {
      icon: "🎮",
      title: "Discord Community",
      description: "Join our trading community",
      contact: "discord.gg/abubeast",
      response: "24/7 community support",
    },
  ];

  const faqs = [
    {
      question: "How do I get started with automated trading?",
      answer:
        "Connect your wallet, configure your trading preferences, and grant trading permissions. Our AI will start identifying opportunities based on your settings.",
    },
    {
      question: "Is my wallet secure with AbuBeast?",
      answer:
        "Absolutely. We never store your private keys. We only execute trades based on your pre-approved settings using secure smart contracts.",
    },
    {
      question: "What fees does AbuBeast charge?",
      answer:
        "We charge a small percentage of profitable trades only. No upfront fees, no hidden costs. You only pay when you make money.",
    },
    {
      question: "Can I cancel automated trading anytime?",
      answer:
        "Yes, you have full control. You can pause, modify, or completely stop automated trading at any time from your dashboard.",
    },
    {
      question: "Which wallets are supported?",
      answer:
        "We support MetaMask, Phantom, Coinbase Wallet, Trust Wallet, and many others through WalletConnect integration.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <PageHeader
        title="Get in Touch"
        subtitle="We're here to help you succeed"
        description="Have questions about AbuBeast? Need technical support? Want to share feedback? We'd love to hear from you."
        gradient={true}
        size="large"
        animatedBlobs={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Contact Methods */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Multiple Ways to{" "}
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
                Reach Us
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Choose the method that works best for you. Our team is ready to
              help with any questions or concerns.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <motion.div
                        className="text-4xl mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, 0],
                        }}
                      >
                        {method.icon}
                      </motion.div>
                      <motion.h3
                        className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        {method.title}
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      >
                        {method.description}
                      </motion.p>
                      <motion.p
                        className="font-medium text-blue-600 dark:text-blue-400 mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                      >
                        {method.contact}
                      </motion.p>
                      <motion.p
                        className="text-sm text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                      >
                        {method.response}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Contact Form */}
        <motion.section
          className="grid lg:grid-cols-2 gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Send us a{" "}
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
                Message
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Fill out the form below and we'll get back to you as soon as
              possible. Be sure to include as much detail as possible to help us
              assist you better.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  {status.submitted ? (
                    <motion.div
                      className={`text-center py-8 ${
                        status.success ? "text-green-600" : "text-red-600"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className={`text-6xl mb-4 ${
                          status.success ? "text-green-500" : "text-red-500"
                        }`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.6,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {status.success ? "✅" : "❌"}
                      </motion.div>
                      <motion.p
                        className="text-lg font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {status.msg}
                      </motion.p>
                      {status.success && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() =>
                              setStatus({
                                submitted: false,
                                success: false,
                                msg: "",
                              })
                            }
                            className="mt-4"
                            variant="outline"
                          >
                            Send Another Message
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.form
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div
                        className="grid md:grid-cols-2 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div variants={fadeInLeft}>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            name="name"
                            id="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1"
                            placeholder="John Doe"
                          />
                        </motion.div>
                        <motion.div variants={fadeInRight}>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            name="email"
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="mt-1"
                            placeholder="john@example.com"
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Label htmlFor="category">Category</Label>
                        <select
                          name="category"
                          id="category"
                          value={form.category}
                          onChange={handleChange}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select a category</option>
                          <option value="technical">Technical Support</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="trading">Trading Questions</option>
                          <option value="feature">Feature Requests</option>
                          <option value="partnership">
                            Partnership Inquiry
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          name="subject"
                          id="subject"
                          required
                          value={form.subject}
                          onChange={handleChange}
                          className="mt-1"
                          placeholder="How can we help you?"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          name="message"
                          id="message"
                          rows={6}
                          required
                          value={form.message}
                          onChange={handleChange}
                          className="mt-1"
                          placeholder="Please provide as much detail as possible..."
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <motion.svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </motion.svg>
                              Sending Message...
                            </div>
                          ) : (
                            "Send Message"
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Frequently Asked{" "}
              <motion.span
                className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Questions
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Quick answers to common questions. Can't find what you're looking
              for? Use the contact form or reach out directly.
            </motion.p>

            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {faqs.map((faq, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <motion.div
                    whileHover={{
                      y: -5,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <motion.h3
                          className="font-semibold text-gray-900 dark:text-white mb-3"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          {faq.question}
                        </motion.h3>
                        <motion.p
                          className="text-gray-600 dark:text-gray-300 leading-relaxed"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1 + 0.2,
                          }}
                        >
                          {faq.answer}
                        </motion.p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.h3
                className="font-semibold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Still have questions?
              </motion.h3>
              <motion.p
                className="text-gray-600 dark:text-gray-300 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Check out our comprehensive documentation or join our Discord
                community for more help.
              </motion.p>
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm">
                    Join Discord
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Meet Our{" "}
            <motion.span
              className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Team
            </motion.span>
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Sarah Chen",
                role: "CEO & Co-founder",
                bio: "Former Goldman Sachs quantitative analyst with 10+ years in algorithmic trading.",
                avatar: "👩‍💼",
              },
              {
                name: "Mike Rodriguez",
                role: "CTO & Co-founder",
                bio: "Blockchain engineer and former Google software architect specializing in DeFi protocols.",
                avatar: "👨‍💻",
              },
              {
                name: "Alex Thompson",
                role: "Head of Customer Success",
                bio: "Dedicated to ensuring every AbuBeast user achieves their trading goals.",
                avatar: "👨‍🎓",
              },
            ].map((member, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <motion.div
                        className="text-6xl mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, 0],
                        }}
                      >
                        {member.avatar}
                      </motion.div>
                      <motion.h3
                        className="text-xl font-semibold text-gray-900 dark:text-white mb-1"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                      >
                        {member.name}
                      </motion.h3>
                      <motion.p
                        className="text-blue-600 dark:text-blue-400 font-medium mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      >
                        {member.role}
                      </motion.p>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                      >
                        {member.bio}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
