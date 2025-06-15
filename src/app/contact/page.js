"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Contact() {
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
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Multiple Ways to Reach Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the method that works best for you. Our team is ready to
              help with any questions or concerns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{method.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {method.description}
                  </p>
                  <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                    {method.contact}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {method.response}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a Message
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Fill out the form below and we'll get back to you as soon as
              possible. Be sure to include as much detail as possible to help us
              assist you better.
            </p>

            <Card className="shadow-xl">
              <CardContent className="p-8">
                {status.submitted ? (
                  <div
                    className={`text-center py-8 ${
                      status.success ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <div
                      className={`text-6xl mb-4 ${
                        status.success ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {status.success ? "✅" : "❌"}
                    </div>
                    <p className="text-lg font-medium">{status.msg}</p>
                    {status.success && (
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
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
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
                      </div>
                      <div>
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
                      </div>
                    </div>

                    <div>
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
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
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
                    </div>

                    <div>
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
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
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
                          </svg>
                          Sending Message...
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Quick answers to common questions. Can't find what you're looking
              for? Use the contact form or reach out directly.
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Check out our comprehensive documentation or join our Discord
                community for more help.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  View Documentation
                </Button>
                <Button variant="outline" size="sm">
                  Join Discord
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
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
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
