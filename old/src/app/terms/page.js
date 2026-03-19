"use client";

import { Badge } from "@/components/ui/badge";
import { FeatureIcon, GlassCard, GradientOrb } from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Mail,
  Scale,
  Shield,
  Users,
  XCircle,
} from "lucide-react";

export default function TermsOfServicePage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: <CheckCircle className="w-5 h-5" />,
      content: `By accessing and using AbuBeast's trading platform and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and AbuBeast.

If you do not agree to these terms, please do not use our services. Our platform provides cryptocurrency trading tools, analytics, and automated trading features. By using our services, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.`,
    },
    {
      title: "2. Platform Services",
      icon: <Globe className="w-5 h-5" />,
      content: `AbuBeast provides a comprehensive Solana trading platform that includes:

• AI-powered automated trading bot
• Real-time market data and token analysis
• Session key-based trading authorization
• Smart buy and sell strategy automation
• Portfolio tracking and management
• Cross-chain token swaps

Our services are provided "as is" and we reserve the right to modify, suspend, or discontinue any part of our platform at any time with reasonable notice.`,
    },
    {
      title: "3. User Responsibilities",
      icon: <Users className="w-5 h-5" />,
      content: `As a user of our platform, you agree to:

• Provide accurate and complete information during registration
• Maintain the confidentiality of your account credentials
• Use the platform in compliance with all applicable laws
• Not engage in any fraudulent or illegal activities
• Not attempt to manipulate markets or abuse the system
• Configure appropriate trading limits and risk parameters
• Understand that cryptocurrency trading involves significant risk

You are solely responsible for all activities that occur under your account and for any trading decisions made by the automated bot based on your configured settings.`,
    },
    {
      title: "4. Session Keys & Permissions",
      icon: <Shield className="w-5 h-5" />,
      content: `When you authorize our trading bot:

• A temporary session key is generated and encrypted
• You grant specific permissions for automated trading
• You set spending limits and expiration times
• Your wallet's private key never leaves your device
• You can revoke permissions at any time

By creating a session key, you authorize AbuBeast to execute trades on your behalf within the limits you specify. You remain fully responsible for the trading activities conducted under your session key.`,
    },
    {
      title: "5. Risk Disclosure",
      icon: <AlertCircle className="w-5 h-5" />,
      content: `Cryptocurrency trading involves substantial risk of loss. By using AbuBeast:

• You acknowledge that past performance does not guarantee future results
• You understand that you may lose some or all of your invested capital
• You accept that market conditions can change rapidly
• You recognize that automated trading carries additional risks
• You agree not to trade with funds you cannot afford to lose

AbuBeast does not provide financial advice. Our tools are for informational purposes only and should not be considered investment recommendations.`,
    },
    {
      title: "6. Prohibited Activities",
      icon: <XCircle className="w-5 h-5" />,
      content: `You agree NOT to:

• Use the platform for money laundering or illegal activities
• Attempt to hack, exploit, or reverse engineer our systems
• Create multiple accounts to circumvent limits
• Use bots or scripts not authorized by AbuBeast
• Interfere with other users' access to the platform
• Violate any applicable laws or regulations
• Misrepresent your identity or affiliation

Violation of these terms may result in immediate account termination.`,
    },
    {
      title: "7. Limitation of Liability",
      icon: <Scale className="w-5 h-5" />,
      content: `To the maximum extent permitted by law:

• AbuBeast is not liable for any trading losses you incur
• We are not responsible for network delays or transaction failures
• We do not guarantee uninterrupted access to our services
• We are not liable for third-party service failures
• Our total liability is limited to fees paid in the last 12 months

You agree to indemnify AbuBeast against any claims arising from your use of the platform.`,
    },
    {
      title: "8. Modifications to Terms",
      icon: <Clock className="w-5 h-5" />,
      content: `We may update these Terms of Service from time to time. When we do:

• We will notify you via email or platform notification
• Material changes will be highlighted for your review
• Continued use after changes constitutes acceptance
• You may terminate your account if you disagree with changes

We encourage you to review these terms periodically to stay informed of any updates.`,
    },
  ];

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Legal"
        badgeIcon={<FileText className="w-4 h-4 mr-2" />}
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our platform"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
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

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FeatureIcon>{section.icon}</FeatureIcon>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Contact */}
          <GlassCard className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
            <Mail className="w-8 h-8 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Questions?</h3>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:legal@abubeast.com"
                className="text-primary hover:underline"
              >
                legal@abubeast.com
              </a>
            </p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
