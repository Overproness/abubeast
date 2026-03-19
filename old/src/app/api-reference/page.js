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
  Book,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Database,
  Globe,
  Key,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function APIReferencePage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const plannedEndpoints = [
    {
      category: "Authentication",
      icon: <Key className="w-5 h-5" />,
      description: "Secure API key management and user authentication",
      endpoints: [
        { method: "POST", path: "/auth/api-keys", desc: "Generate API keys" },
        { method: "GET", path: "/auth/profile", desc: "Get user profile" },
        { method: "PUT", path: "/auth/profile", desc: "Update user profile" },
        {
          method: "DELETE",
          path: "/auth/api-keys/{id}",
          desc: "Revoke API key",
        },
      ],
    },
    {
      category: "Market Data",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Real-time and historical cryptocurrency market data",
      endpoints: [
        {
          method: "GET",
          path: "/market/tokens",
          desc: "List supported tokens",
        },
        { method: "GET", path: "/market/prices", desc: "Current token prices" },
        {
          method: "GET",
          path: "/market/history/{token}",
          desc: "Price history",
        },
        {
          method: "GET",
          path: "/market/orderbook/{pair}",
          desc: "Order book data",
        },
        { method: "WS", path: "/market/stream", desc: "Real-time updates" },
      ],
    },
    {
      category: "Trading",
      icon: <Zap className="w-5 h-5" />,
      description: "Execute trades and manage orders programmatically",
      endpoints: [
        { method: "POST", path: "/trading/orders", desc: "Place new order" },
        { method: "GET", path: "/trading/orders", desc: "List user orders" },
        { method: "PUT", path: "/trading/orders/{id}", desc: "Modify order" },
        {
          method: "DELETE",
          path: "/trading/orders/{id}",
          desc: "Cancel order",
        },
        { method: "GET", path: "/trading/history", desc: "Trade history" },
      ],
    },
    {
      category: "Portfolio",
      icon: <Database className="w-5 h-5" />,
      description: "Portfolio management and balance tracking",
      endpoints: [
        {
          method: "GET",
          path: "/portfolio/balances",
          desc: "Account balances",
        },
        {
          method: "GET",
          path: "/portfolio/history",
          desc: "Portfolio history",
        },
        {
          method: "GET",
          path: "/portfolio/performance",
          desc: "Performance metrics",
        },
        {
          method: "GET",
          path: "/portfolio/allocations",
          desc: "Asset allocation",
        },
      ],
    },
    {
      category: "Analytics",
      icon: <Globe className="w-5 h-5" />,
      description: "Advanced analytics and trading insights",
      endpoints: [
        { method: "GET", path: "/analytics/metrics", desc: "Trading metrics" },
        {
          method: "GET",
          path: "/analytics/pnl",
          desc: "Profit and loss analysis",
        },
        { method: "GET", path: "/analytics/risk", desc: "Risk assessment" },
        {
          method: "GET",
          path: "/analytics/leaderboard",
          desc: "Top performers",
        },
      ],
    },
    {
      category: "Session Keys",
      icon: <Shield className="w-5 h-5" />,
      description: "Manage automated trading permissions",
      endpoints: [
        {
          method: "POST",
          path: "/session-keys/authorize",
          desc: "Create session key",
        },
        { method: "GET", path: "/session-keys", desc: "List session keys" },
        {
          method: "DELETE",
          path: "/session-keys/{id}",
          desc: "Revoke session key",
        },
        {
          method: "GET",
          path: "/session-keys/{id}/status",
          desc: "Key status",
        },
      ],
    },
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-400";
      case "POST":
        return "bg-blue-500/20 text-blue-400";
      case "PUT":
        return "bg-yellow-500/20 text-yellow-400";
      case "DELETE":
        return "bg-red-500/20 text-red-400";
      case "WS":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Developers"
        badgeIcon={<Code className="w-4 h-4 mr-2" />}
        title="API Reference"
        subtitle="Programmatically access market data and execute trades"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="violet"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
        />

        {/* Coming Soon Banner */}
        <GlassCard className="p-6 mb-12 bg-gradient-to-br from-primary/10 to-purple-400/10">
          <div className="flex items-center gap-4">
            <FeatureIcon>
              <Clock className="w-5 h-5" />
            </FeatureIcon>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">API Coming Soon</h3>
              <p className="text-muted-foreground text-sm">
                Our REST API and WebSocket endpoints are currently in
                development. Below is a preview of the planned API structure.
              </p>
            </div>
            <Badge>Preview</Badge>
          </div>
        </GlassCard>

        {/* Quick Start */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            <GradientText>Quick Start</GradientText>
          </h2>
          <GlassCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Get API Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate an API key from your dashboard settings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Authenticate</h4>
                  <p className="text-sm text-muted-foreground">
                    Include your API key in the Authorization header
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Start Trading</h4>
                  <p className="text-sm text-muted-foreground">
                    Make requests to our endpoints and start trading
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Base URL */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Base URL</h3>
          <GlassCard className="p-4 font-mono text-sm flex items-center justify-between">
            <code className="text-primary">https://api.abubeast.com/v1</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard("https://api.abubeast.com/v1", "base")
              }
            >
              {copiedEndpoint === "base" ? (
                "Copied!"
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </GlassCard>
        </div>

        {/* Endpoints */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">
            <GradientText>Endpoints</GradientText>
          </h2>

          {plannedEndpoints.map((section, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FeatureIcon>{section.icon}</FeatureIcon>
                <div>
                  <h3 className="text-lg font-semibold">{section.category}</h3>
                  <p className="text-muted-foreground text-sm">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {section.endpoints.map((endpoint, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-glass-bg/50 hover:bg-glass-bg transition-colors group"
                  >
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${getMethodColor(
                        endpoint.method
                      )}`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-sm flex-1">
                      {endpoint.path}
                    </code>
                    <span className="text-muted-foreground text-sm hidden md:block">
                      {endpoint.desc}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        copyToClipboard(endpoint.path, `${index}-${i}`)
                      }
                    >
                      {copiedEndpoint === `${index}-${i}` ? (
                        "Copied!"
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Rate Limits */}
        <GlassCard className="mt-12 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FeatureIcon>
              <AlertTriangle className="w-5 h-5" />
            </FeatureIcon>
            <h3 className="text-lg font-semibold">Rate Limits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-glass-bg/50">
              <p className="text-2xl font-bold text-primary">100</p>
              <p className="text-muted-foreground text-sm">
                Requests per minute (Free)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-glass-bg/50">
              <p className="text-2xl font-bold text-primary">1,000</p>
              <p className="text-muted-foreground text-sm">
                Requests per minute (Pro)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-glass-bg/50">
              <p className="text-2xl font-bold text-primary">10,000</p>
              <p className="text-muted-foreground text-sm">
                Requests per minute (Enterprise)
              </p>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <GlassCard className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
          <Book className="w-10 h-10 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Check out our documentation for detailed examples and guides.
          </p>
          <Button size="lg">
            View Documentation <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </GlassCard>
      </div>
    </main>
  );
}
