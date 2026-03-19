"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Github,
  Mail,
  MessageCircle,
  Twitter,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/trading/automated", label: "Auto Trading" },
    ],
    company: [
      { href: "/about", label: "About Us" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
    resources: [
      { href: "/documentation", label: "Documentation" },
      { href: "/api-reference", label: "API Reference" },
      { href: "/guides", label: "Guides" },
      { href: "/support", label: "Support" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/gdpr", label: "GDPR" },
    ],
  };

  const socialLinks = [
    { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
    { href: "https://github.com", icon: Github, label: "GitHub" },
    { href: "https://discord.com", icon: MessageCircle, label: "Discord" },
    { href: "mailto:hello@abubeast.com", icon: Mail, label: "Email" },
  ];

  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        {/* <div className="py-12 border-b border-border/50">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Stay Ahead with <span className="gradient-text">AbuBeast</span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Get the latest updates on new features, trading strategies, and
              market insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                variant="glass"
                className="flex-1"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div> */}

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-neon group-hover:shadow-neon-lg transition-shadow duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Abu</span>
                <span className="text-foreground">Beast</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              AI-powered trading bot for Solana. Buy new tokens early, sell
              smart, maximize profits automatically.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Product
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Company
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Resources
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Legal
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AbuBeast. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Built on</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-400/10 border border-primary/20">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]" />
                <span className="text-sm font-medium gradient-text">
                  Solana
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
