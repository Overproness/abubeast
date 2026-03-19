"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
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
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        msg: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Get help with technical issues",
      contact: "support@abubeast.com",
      response: "Within 24 hours",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available on dashboard",
      response: "Instant response",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "For urgent matters",
      contact: "+1 (555) 123-4567",
      response: "Mon-Fri, 9AM-6PM EST",
    },
  ];

  const faqs = [
    {
      q: "How do I get started with automated trading?",
      a: "Connect your Phantom wallet, configure your trading preferences, and grant trading permissions. Our AI will start identifying opportunities based on your settings.",
    },
    {
      q: "Is my wallet secure with AbuBeast?",
      a: "Absolutely. We never store your private keys. We only execute trades based on your pre-approved settings using secure session keys.",
    },
    {
      q: "What fees does AbuBeast charge?",
      a: "We charge a small percentage of profitable trades only. No upfront fees, no hidden costs. You only pay when you make money.",
    },
    {
      q: "Can I cancel automated trading anytime?",
      a: "Yes, you have full control. You can pause, modify, or completely stop automated trading at any time from your dashboard.",
    },
    {
      q: "Which wallets are supported?",
      a: "We currently support Phantom wallet for Solana trading. More wallet integrations are coming soon.",
    },
  ];

  const categories = [
    { value: "", label: "Select a category" },
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "partnership", label: "Partnership" },
    { value: "enterprise", label: "Enterprise Sales" },
    { value: "feedback", label: "Feedback & Suggestions" },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <PageHeader
        badge="Contact Us"
        badgeIcon={<MessageSquare className="w-4 h-4 mr-2" />}
        title="Get in Touch"
        subtitle="Have questions about AbuBeast? Need technical support? We'd love to hear from you."
        size="default"
      />

      {/* Contact Methods */}
      <section className="relative py-16 -mt-8">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <GlassCard key={method.title} className="p-6 text-center" hover>
                <FeatureIcon className="mx-auto mb-4">
                  {method.icon}
                </FeatureIcon>
                <h3 className="font-semibold text-lg mb-1">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {method.description}
                </p>
                <p className="font-medium text-primary mb-1">
                  {method.contact}
                </p>
                <p className="text-xs text-muted-foreground">
                  {method.response}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="relative py-20">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10"
        />
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-10"
        />

        <div className="section-container">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>

                {status.submitted && status.success ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
                      <Check className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">{status.msg}</p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setStatus({ submitted: false, success: false, msg: "" })
                      }
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                          variant="glass"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          variant="glass"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          className="w-full h-11 px-4 rounded-xl glass-input bg-transparent text-foreground"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          placeholder="Brief description"
                          required
                          variant="glass"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl glass-input bg-transparent text-foreground resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </GlassCard>
            </div>

            {/* Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4">Office Location</h3>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p>123 Blockchain Street</p>
                    <p>San Francisco, CA 94102</p>
                    <p>United States</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Mon - Fri: 9:00 AM - 6:00 PM EST
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Weekend: Closed
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Join Our Community
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with thousands of traders on Discord. Get help, share
                  strategies, and stay updated on the latest features.
                </p>
                <Button variant="outline" className="w-full gap-2">
                  Join Discord
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </GlassCard>

              <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-purple-400/10">
                <h3 className="font-semibold text-lg mb-2">
                  Enterprise Solutions
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need custom solutions for your institution? Our enterprise
                  team can help with API integrations, white-label solutions,
                  and more.
                </p>
                <Button className="w-full gap-2">
                  Contact Sales
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 bg-foreground/[0.02]">
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
              Quick answers to common questions.
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
    </main>
  );
}
