"use client";

import RealTimeTradingMonitor from "@/components/RealTimeTradingMonitor";
import SessionKeyAuthorization from "@/components/SessionKeyAuthorization";
import SessionKeyManager from "@/components/SessionKeyManager";
import TradingBotControl from "@/components/TradingBotControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  FileText,
  Key,
  Lock,
  Settings,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AutomatedTradingPage() {
  const { user, walletInfo, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAuthorization, setShowAuthorization] = useState(false);

  const handleSessionKeyCreated = (sessionKey) => {
    console.log("Session key created:", sessionKey);
    setShowAuthorization(false);
    setActiveTab("manage");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Bot className="w-4 h-4" /> },
    {
      id: "authorize",
      label: "Authorize Bot",
      icon: <Key className="w-4 h-4" />,
    },
    {
      id: "manage",
      label: "Manage Sessions",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: "monitor",
      label: "Live Monitor",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: "botcontrol",
      label: "Bot Control",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "docs",
      label: "Documentation",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <GradientOrb
          color="blue"
          className="w-[400px] h-[400px] top-0 right-0 opacity-20"
        />

        <GlassCard className="relative z-10 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access automated trading features.
          </p>
          <Link href="/auth/login">
            <Button className="gap-2">
              Log In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (!walletInfo?.address) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-20"
        />

        <GlassCard className="relative z-10 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-6">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Wallet Connection Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please connect a Solana wallet to enable automated trading.
          </p>
          <Link href="/dashboard">
            <Button className="gap-2">
              Connect Wallet
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <GradientOrb
        color="blue"
        className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
      />
      <GradientOrb
        color="violet"
        className="w-[400px] h-[400px] bottom-0 left-0 opacity-10 fixed"
      />

      <div className="relative z-10 section-container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="gradient" className="mb-4">
            <Bot className="w-4 h-4 mr-2" />
            AI Trading Bot
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <GradientText>Automated Trading</GradientText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Authorize our AI bot to trade on your behalf with customizable
            limits and permissions. 24/7 trading without manual intervention.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <GlassCard className="p-2">
            <nav className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-neon"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <GlassCard className="p-0 overflow-hidden">
          {activeTab === "overview" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-8">
                How Automated Trading Works
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  {
                    step: "01",
                    title: "Generate Session Key",
                    description:
                      "A temporary cryptographic keypair is generated on our server for signing transactions.",
                    icon: <Key className="w-6 h-6" />,
                  },
                  {
                    step: "02",
                    title: "Set Permissions",
                    description:
                      "Configure actions, spending limits, expiration time, and which tokens to trade.",
                    icon: <Settings className="w-6 h-6" />,
                  },
                  {
                    step: "03",
                    title: "Authorize with Signature",
                    description:
                      "Sign an authorization message with your wallet to grant the bot permission.",
                    icon: <Shield className="w-6 h-6" />,
                  },
                  {
                    step: "04",
                    title: "Bot Trades 24/7",
                    description:
                      "Our AI bot executes trades automatically within your configured limits.",
                    icon: <Bot className="w-6 h-6" />,
                  },
                ].map((item, index) => (
                  <GlassCard key={item.step} className="p-6 relative" hover>
                    <div className="text-4xl font-bold gradient-text opacity-30 absolute top-4 right-4">
                      {item.step}
                    </div>
                    <FeatureIcon className="mb-4">{item.icon}</FeatureIcon>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </GlassCard>
                ))}
              </div>

              {/* Security Features */}
              <div className="glass-card p-6 bg-primary/5 border-primary/20 rounded-2xl mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FeatureIcon>
                    <Shield className="w-6 h-6" />
                  </FeatureIcon>
                  <h3 className="text-xl font-semibold">Security Features</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "Session keys encrypted with AES-256-GCM",
                    "Your private key never leaves your device",
                    "Configurable spending limits",
                    "Keys auto-expire after set duration",
                    "Revoke access instantly anytime",
                    "Full audit trail of all actions",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setActiveTab("authorize")}
                size="lg"
                className="w-full md:w-auto gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {activeTab === "authorize" && (
            <SessionKeyAuthorization
              walletAddress={walletInfo.address}
              onSuccess={handleSessionKeyCreated}
            />
          )}

          {activeTab === "manage" && (
            <SessionKeyManager walletAddress={walletInfo.address} />
          )}

          {activeTab === "monitor" && (
            <div className="p-8">
              <RealTimeTradingMonitor walletAddress={walletInfo.address} />
            </div>
          )}

          {activeTab === "botcontrol" && (
            <div className="p-8">
              <TradingBotControl />
            </div>
          )}

          {activeTab === "docs" && (
            <div className="p-8 max-w-4xl">
              <h2 className="text-2xl font-bold mb-6">
                Technical Documentation
              </h2>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold mb-4">
                    What are Session Keys?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Session keys are temporary cryptographic keypairs that allow
                    our trading bot to sign and execute transactions on your
                    behalf without requiring your manual approval for each
                    trade. This enables true automated trading while maintaining
                    security through configurable permissions and spending
                    limits.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                  <div className="space-y-3">
                    {[
                      {
                        step: "Key Generation",
                        desc: "A new Solana keypair is generated on our secure server",
                      },
                      {
                        step: "Encryption",
                        desc: "The private key is encrypted using AES-256-GCM with a master encryption secret",
                      },
                      {
                        step: "Authorization",
                        desc: "You sign a message with your main wallet authorizing the session key",
                      },
                      {
                        step: "Storage",
                        desc: "The encrypted key is stored in our database along with your permissions",
                      },
                      {
                        step: "Trading",
                        desc: "The bot decrypts the key when needed to sign transactions within your limits",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{item.step}:</span>
                          <span className="text-muted-foreground ml-2">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="glass-card p-6 bg-warning/5 border-warning/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <h4 className="font-semibold">
                        Important Security Notes
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        Your main wallet private key NEVER leaves your browser
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        Session keys are separate keypairs with limited
                        permissions
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        All session keys are encrypted at rest with
                        military-grade encryption
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        Set conservative spending limits to minimize risk
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        Use short expiration times (24 hours recommended)
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4">
                    Recommended Settings
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full glass-table">
                      <thead>
                        <tr>
                          <th>Use Case</th>
                          <th>Expiration</th>
                          <th>Daily Limit</th>
                          <th>Max per Trade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-medium">Conservative</td>
                          <td>6-12 hours</td>
                          <td>$100-$500</td>
                          <td>$50-$100</td>
                        </tr>
                        <tr>
                          <td className="font-medium">Moderate</td>
                          <td>24 hours</td>
                          <td>$500-$2,000</td>
                          <td>$200-$500</td>
                        </tr>
                        <tr>
                          <td className="font-medium">Aggressive</td>
                          <td>1-3 days</td>
                          <td>$2,000-$10,000</td>
                          <td>$500-$2,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: "Can the bot withdraw all my funds?",
                        a: "No. Session keys only grant permission for specific actions (trading, swapping) within your configured limits. By default, transfer permissions are disabled.",
                      },
                      {
                        q: "What happens if I lose access?",
                        a: "You can always revoke session keys from your account dashboard. Additionally, all keys automatically expire after the time period you set.",
                      },
                      {
                        q: "Is my private key stored anywhere?",
                        a: "Your main wallet private key never leaves your browser. The session key is a separate, temporary key that is encrypted and stored on our servers.",
                      },
                    ].map((faq, index) => (
                      <GlassCard key={index} className="p-5">
                        <h4 className="font-semibold mb-2">{faq.q}</h4>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </GlassCard>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
