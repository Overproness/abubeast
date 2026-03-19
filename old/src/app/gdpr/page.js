"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  AlertTriangle,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  Globe,
  Lock,
  Mail,
  Shield,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function GDPRPage() {
  const rights = [
    {
      title: "Right to Access",
      icon: <Eye className="w-5 h-5" />,
      description:
        "You have the right to request a copy of all personal data we hold about you.",
      action:
        "Request your data through your account settings or contact support.",
    },
    {
      title: "Right to Rectification",
      icon: <Edit className="w-5 h-5" />,
      description:
        "You can request corrections to any inaccurate or incomplete personal data.",
      action:
        "Update your profile information directly or contact our support team.",
    },
    {
      title: "Right to Erasure",
      icon: <Trash2 className="w-5 h-5" />,
      description:
        "You can request deletion of your personal data under certain circumstances.",
      action:
        "Submit a deletion request through your account settings or contact support.",
    },
    {
      title: "Right to Portability",
      icon: <Download className="w-5 h-5" />,
      description:
        "You can request your data in a machine-readable format for transfer.",
      action:
        "Export your data through account settings or request assistance from support.",
    },
    {
      title: "Right to Object",
      icon: <AlertTriangle className="w-5 h-5" />,
      description:
        "You can object to processing of your data for marketing or profiling purposes.",
      action:
        "Opt out through privacy settings or contact us to discuss your objections.",
    },
    {
      title: "Right to Restrict",
      icon: <Lock className="w-5 h-5" />,
      description:
        "You can request restriction of processing under specific circumstances.",
      action:
        "Contact our Data Protection Officer to discuss restriction requests.",
    },
  ];

  const sections = [
    {
      title: "Our Commitment to GDPR",
      icon: <Shield className="w-5 h-5" />,
      content:
        "At AbuBeast, we are fully committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR). As an automated trading platform serving users across the European Union and globally, we take our data protection responsibilities seriously. The GDPR grants you specific rights regarding your personal data and requires us to be transparent about how we collect, use, and protect your information.",
    },
    {
      title: "Legal Basis for Processing",
      icon: <FileText className="w-5 h-5" />,
      content:
        "We process your personal data under several legal bases: (1) Contract performance - to provide our trading services; (2) Legitimate interests - for security, fraud prevention, and platform improvement; (3) Legal obligations - to comply with financial regulations and anti-money laundering requirements; (4) Consent - for marketing communications and optional features, which you can withdraw at any time.",
    },
    {
      title: "Data We Collect",
      icon: <Database className="w-5 h-5" />,
      content:
        "We collect and process: account information (email, wallet addresses), trading data (transactions, preferences, session keys), usage data (IP addresses, device information), and security data (authentication logs). Blockchain transaction data is inherently public. We minimize data collection to what is necessary for providing our services.",
    },
    {
      title: "Data Retention",
      icon: <Clock className="w-5 h-5" />,
      content:
        "We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected. Account data is retained while your account is active. After account closure, we may retain certain data for a reasonable period to comply with legal obligations, resolve disputes, and prevent fraud. Blockchain transaction records are permanent and cannot be deleted.",
    },
    {
      title: "International Transfers",
      icon: <Globe className="w-5 h-5" />,
      content:
        "Your data may be transferred to and processed in countries outside the European Economic Area (EEA). When we transfer data internationally, we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission or certification under recognized frameworks.",
    },
    {
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
      content:
        "We implement robust technical and organizational measures to protect your data, including AES-256-GCM encryption for session keys, secure HTTPS connections, regular security audits, access controls, and employee training. Your wallet's private keys never leave your device and are never stored on our servers.",
    },
  ];

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Legal"
        badgeIcon={<Shield className="w-4 h-4 mr-2" />}
        title="GDPR Compliance"
        subtitle="Your data rights under the General Data Protection Regulation"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="violet"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
        />

        <div className="max-w-5xl mx-auto">
          {/* Last Updated */}
          <div className="mb-8 text-center">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-2" />
              Last updated: December 1, 2024
            </Badge>
          </div>

          {/* Your Rights Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <GradientText>Your Data Rights</GradientText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rights.map((right, index) => (
                <GlassCard key={index} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <FeatureIcon>{right.icon}</FeatureIcon>
                    <h3 className="font-semibold">{right.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {right.description}
                  </p>
                  <p className="text-xs text-primary">{right.action}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <GlassCard className="p-6 mb-12 bg-gradient-to-br from-primary/5 to-purple-400/5">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Exercise Your Rights
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Update Information
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Request Deletion
              </Button>
              <Button variant="outline" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Object to Processing
              </Button>
            </div>
          </GlassCard>

          {/* Detailed Sections */}
          <div className="space-y-6 mb-12">
            {sections.map((section, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FeatureIcon>{section.icon}</FeatureIcon>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </GlassCard>
            ))}
          </div>

          {/* Contact DPO */}
          <GlassCard className="p-8 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
            <Shield className="w-10 h-10 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Data Protection Officer
            </h3>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              If you have any questions about our GDPR compliance or wish to
              exercise your data rights, please contact our Data Protection
              Officer.
            </p>
            <div className="flex flex-col items-center gap-2">
              <a
                href="mailto:dpo@abubeast.com"
                className="text-primary hover:underline flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                dpo@abubeast.com
              </a>
              <p className="text-sm text-muted-foreground">
                We aim to respond to all requests within 30 days.
              </p>
            </div>
          </GlassCard>

          {/* Related Links */}
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link href="/privacy">
              <Button variant="ghost" size="sm">
                Privacy Policy →
              </Button>
            </Link>
            <Link href="/cookies">
              <Button variant="ghost" size="sm">
                Cookie Policy →
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="ghost" size="sm">
                Terms of Service →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
