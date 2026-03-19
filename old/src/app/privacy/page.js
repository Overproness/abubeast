"use client";

import { Badge } from "@/components/ui/badge";
import { FeatureIcon, GlassCard, GradientOrb } from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  Bell,
  Clock,
  Database,
  Eye,
  Globe,
  Lock,
  Mail,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Personal Information",
          text: "We collect personal information you provide directly to us, such as when you create an account, verify your identity, or contact support. This may include your name, email address, and wallet addresses.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information about your use of our platform, including your IP address, browser type, device information, and usage patterns. This helps us improve our services and ensure security.",
        },
        {
          subtitle: "Blockchain Data",
          text: "When you interact with blockchain networks through our platform, certain transaction data becomes publicly available on the blockchain. We may collect and analyze this data to provide our services.",
        },
        {
          subtitle: "Trading Data",
          text: "We collect information about your trading activity, including transaction history, configured strategies, session key permissions, and performance metrics.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our trading platform, execute automated trades, and provide customer support.",
        },
        {
          subtitle: "Security and Compliance",
          text: "We use your information to detect and prevent fraud, comply with legal obligations, and ensure the security of our platform and users.",
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you important updates about your account, security alerts, trade notifications, and promotional communications (which you can opt out of).",
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to understand how our platform is used and to identify areas for improvement and new features.",
        },
      ],
    },
    {
      title: "Information Sharing",
      icon: <Globe className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Service Providers",
          text: "We may share your information with trusted third-party service providers who help us operate our platform, such as cloud hosting providers and analytics services.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, regulation, or legal process, or if we believe disclosure is necessary to protect our rights or the safety of our users.",
        },
        {
          subtitle: "Blockchain Networks",
          text: "Transaction data is inherently public on blockchain networks. When trades are executed, this information becomes visible on the Solana blockchain.",
        },
        {
          subtitle: "Consent",
          text: "We may share your information with your explicit consent or at your direction, such as when you choose to connect third-party services to your account.",
        },
      ],
    },
    {
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Encryption",
          text: "All session keys are encrypted using AES-256-GCM encryption. Your wallet's private keys never leave your device and are never stored on our servers.",
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls to ensure that only authorized personnel can access user data, and only when necessary for service provision.",
        },
        {
          subtitle: "Security Audits",
          text: "We conduct regular security audits and penetration testing to identify and address potential vulnerabilities in our systems.",
        },
      ],
    },
    {
      title: "Your Rights",
      icon: <UserCheck className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Access and Portability",
          text: "You can access your personal information through your account dashboard. You may also request a copy of your data in a portable format.",
        },
        {
          subtitle: "Correction",
          text: "You can update your profile information at any time through your account settings. Contact us if you need assistance correcting other data.",
        },
        {
          subtitle: "Deletion",
          text: "You can request deletion of your account and associated data. Note that some information may be retained as required by law or for legitimate business purposes.",
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of marketing communications at any time. You can also revoke trading permissions and session keys through your dashboard.",
        },
      ],
    },
    {
      title: "Cookies and Tracking",
      icon: <Bell className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Essential Cookies",
          text: "We use essential cookies to enable basic platform functionality, including authentication and security features.",
        },
        {
          subtitle: "Analytics Cookies",
          text: "We use analytics cookies to understand how users interact with our platform and to improve our services.",
        },
        {
          subtitle: "Preferences",
          text: "We use preference cookies to remember your settings and provide a personalized experience.",
        },
      ],
    },
    {
      title: "Data Retention",
      icon: <Trash2 className="w-5 h-5" />,
      subsections: [
        {
          subtitle: "Active Accounts",
          text: "We retain your data for as long as your account is active and as needed to provide you with our services.",
        },
        {
          subtitle: "Closed Accounts",
          text: "After account closure, we may retain certain data for a reasonable period to comply with legal obligations and resolve disputes.",
        },
        {
          subtitle: "Transaction Records",
          text: "Blockchain transaction records are permanent and cannot be deleted. We retain our internal records of transactions as required by law.",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Legal"
        badgeIcon={<Shield className="w-4 h-4 mr-2" />}
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="violet"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
        />

        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <div className="mb-8 text-center">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-2" />
              Last updated: December 1, 2024
            </Badge>
          </div>

          {/* Intro */}
          <GlassCard className="p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              At AbuBeast, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our automated trading platform. Please
              read this policy carefully. If you do not agree with the terms of
              this policy, please do not access our platform.
            </p>
          </GlassCard>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FeatureIcon>{section.icon}</FeatureIcon>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <div className="space-y-6">
                  {section.subsections.map((sub, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="font-medium mb-2">{sub.subtitle}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {sub.text}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Contact */}
          <GlassCard className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
            <Mail className="w-8 h-8 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Privacy Questions?</h3>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please
              contact our Data Protection Officer at{" "}
              <a
                href="mailto:privacy@abubeast.com"
                className="text-primary hover:underline"
              >
                privacy@abubeast.com
              </a>
            </p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
