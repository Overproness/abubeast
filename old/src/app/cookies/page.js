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
  CheckCircle,
  Clock,
  Cookie,
  Globe,
  Info,
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState } from "react";

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false,
  });

  const cookieTypes = [
    {
      id: "essential",
      title: "Essential Cookies",
      icon: <Shield className="w-5 h-5" />,
      status: "Always Active",
      required: true,
      description:
        "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you.",
      examples: [
        "User authentication and session management",
        "Security and fraud prevention",
        "Load balancing and website functionality",
        "Language and accessibility preferences",
      ],
    },
    {
      id: "analytics",
      title: "Analytics Cookies",
      icon: <Info className="w-5 h-5" />,
      status: "Optional",
      required: false,
      description:
        "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: [
        "Page views and user navigation patterns",
        "Feature usage and performance metrics",
        "Error tracking and debugging information",
        "A/B testing and optimization data",
      ],
    },
    {
      id: "functional",
      title: "Functional Cookies",
      icon: <Settings className="w-5 h-5" />,
      status: "Optional",
      required: false,
      description:
        "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.",
      examples: [
        "Dark mode and theme preferences",
        "Dashboard layout and customizations",
        "Trading pair preferences",
        "Notification settings and alerts",
      ],
    },
    {
      id: "marketing",
      title: "Marketing Cookies",
      icon: <Globe className="w-5 h-5" />,
      status: "Optional",
      required: false,
      description:
        "These cookies track your activity across websites to help advertisers deliver more relevant advertising to you.",
      examples: [
        "Social media integration and sharing",
        "Targeted advertising and remarketing",
        "Campaign performance tracking",
        "Third-party analytics and attribution",
      ],
    },
  ];

  const sections = [
    {
      title: "What Are Cookies?",
      icon: <Cookie className="w-5 h-5" />,
      content:
        "Cookies are small text files that are placed on your device when you visit a website. They help the website remember your preferences and provide a better user experience. Cookies can be 'persistent' (they remain on your device for a set period) or 'session-based' (they are deleted when you close your browser).",
    },
    {
      title: "How We Use Cookies",
      icon: <Info className="w-5 h-5" />,
      content:
        "We use cookies to provide essential website functionality, analyze site usage, personalize your experience, and deliver relevant content. Our automated trading platform relies on cookies for secure session management, wallet connection state, and trading preferences.",
    },
    {
      title: "Third-Party Cookies",
      icon: <Globe className="w-5 h-5" />,
      content:
        "Some cookies are placed by third-party services that appear on our pages. These include analytics providers (to help us understand usage), security services (to prevent fraud), and integration partners (such as wallet providers). We carefully select our partners and ensure they comply with privacy regulations.",
    },
    {
      title: "Managing Your Cookies",
      icon: <Settings className="w-5 h-5" />,
      content:
        "You can manage your cookie preferences using the controls below or through your browser settings. Note that disabling certain cookies may impact your experience on our platform. Essential cookies cannot be disabled as they are required for basic functionality.",
    },
  ];

  const togglePreference = (id) => {
    if (id === "essential") return;
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Legal"
        badgeIcon={<Cookie className="w-4 h-4 mr-2" />}
        title="Cookie Policy"
        subtitle="How we use cookies to improve your experience"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 left-0 opacity-10 fixed"
        />

        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <div className="mb-8 text-center">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-2" />
              Last updated: December 1, 2024
            </Badge>
          </div>

          {/* Info Sections */}
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

          {/* Cookie Types & Preferences */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <GradientText>Cookie Preferences</GradientText>
            </h2>
          </div>

          <div className="space-y-4">
            {cookieTypes.map((cookie) => (
              <GlassCard key={cookie.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FeatureIcon>{cookie.icon}</FeatureIcon>
                    <div>
                      <h3 className="font-semibold">{cookie.title}</h3>
                      <Badge
                        variant={cookie.required ? "default" : "outline"}
                        className="mt-1"
                      >
                        {cookie.status}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference(cookie.id)}
                    disabled={cookie.required}
                    className={`p-2 rounded-lg transition-colors ${
                      preferences[cookie.id]
                        ? "text-primary"
                        : "text-muted-foreground"
                    } ${
                      cookie.required
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-glass-bg"
                    }`}
                  >
                    {preferences[cookie.id] ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {cookie.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cookie.examples.map((example, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{example}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Save Preferences */}
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" size="lg">
              Reject All Optional
            </Button>
            <Button size="lg">Save Preferences</Button>
          </div>

          {/* Contact */}
          <GlassCard className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
            <Cookie className="w-8 h-8 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              Questions About Cookies?
            </h3>
            <p className="text-muted-foreground">
              If you have any questions about our use of cookies, please contact
              us at{" "}
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
