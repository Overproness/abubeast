"use client";

import { Button } from "@/components/ui/button";
import { FeatureIcon, GlassCard, GradientOrb } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header.jsx";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Check,
  Globe,
  Loader2,
  Mail,
  Monitor,
  Moon,
  Save,
  Settings,
  Shield,
  Smartphone,
  Sun,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, isAuthenticated, authChecked } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState({
    // Display
    theme: "system",
    language: "en",

    // Notifications
    emailNotifications: true,
    tradeAlerts: true,
    priceAlerts: true,
    securityAlerts: true,
    marketingEmails: false,

    // Trading
    defaultSlippage: "1",
    autoApprove: false,
    priorityFee: "medium",

    // Privacy
    showBalance: true,
    showActivity: false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/auth/login?from=/settings");
    }
  }, [authChecked, isAuthenticated, router]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!authChecked || !isAuthenticated) return null;

  const Toggle = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-foreground/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Settings"
        badgeIcon={<Settings className="w-4 h-4 mr-2" />}
        title="Preferences"
        subtitle="Customize your AbuBeast experience"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[400px] h-[400px] top-0 right-0 opacity-10 fixed"
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Display Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FeatureIcon>
                <Monitor className="w-5 h-5" />
              </FeatureIcon>
              <h2 className="text-xl font-semibold">Display</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred appearance
                  </p>
                </div>
                <div className="flex gap-2">
                  {[
                    {
                      value: "light",
                      icon: <Sun className="w-4 h-4" />,
                      label: "Light",
                    },
                    {
                      value: "dark",
                      icon: <Moon className="w-4 h-4" />,
                      label: "Dark",
                    },
                    {
                      value: "system",
                      icon: <Monitor className="w-4 h-4" />,
                      label: "System",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleChange("theme", option.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                        settings.theme === option.value
                          ? "bg-primary text-white"
                          : "glass-card hover:bg-foreground/5"
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language
                  </p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  className="h-10 px-4 rounded-lg glass-input bg-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Notification Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FeatureIcon>
                <Bell className="w-5 h-5" />
              </FeatureIcon>
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: "emailNotifications",
                  icon: <Mail className="w-4 h-4" />,
                  label: "Email Notifications",
                  desc: "Receive updates via email",
                },
                {
                  key: "tradeAlerts",
                  icon: <TrendingUp className="w-4 h-4" />,
                  label: "Trade Alerts",
                  desc: "Get notified when trades execute",
                },
                {
                  key: "priceAlerts",
                  icon: <Smartphone className="w-4 h-4" />,
                  label: "Price Alerts",
                  desc: "Alerts when tokens hit target prices",
                },
                {
                  key: "securityAlerts",
                  icon: <Shield className="w-4 h-4" />,
                  label: "Security Alerts",
                  desc: "Important security notifications",
                },
                {
                  key: "marketingEmails",
                  icon: <Globe className="w-4 h-4" />,
                  label: "Marketing Emails",
                  desc: "Product updates and newsletters",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <div>
                      <Label className="text-base font-medium">
                        {item.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    enabled={settings[item.key]}
                    onToggle={() => handleToggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Trading Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FeatureIcon>
                <TrendingUp className="w-5 h-5" />
              </FeatureIcon>
              <h2 className="text-xl font-semibold">Trading</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Default Slippage
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Maximum slippage tolerance for swaps
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.defaultSlippage}
                    onChange={(e) =>
                      handleChange("defaultSlippage", e.target.value)
                    }
                    className="w-20 text-center"
                    variant="glass"
                    min="0.1"
                    max="50"
                    step="0.1"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Priority Fee</Label>
                  <p className="text-sm text-muted-foreground">
                    Transaction priority on Solana
                  </p>
                </div>
                <div className="flex gap-2">
                  {["low", "medium", "high", "turbo"].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleChange("priorityFee", option)}
                      className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                        settings.priorityFee === option
                          ? "bg-primary text-white"
                          : "glass-card hover:bg-foreground/5"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border/50">
                <div>
                  <Label className="text-base font-medium">
                    Auto-Approve Trades
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow bot to trade without confirmation
                  </p>
                </div>
                <Toggle
                  enabled={settings.autoApprove}
                  onToggle={() => handleToggle("autoApprove")}
                />
              </div>
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FeatureIcon>
                <Shield className="w-5 h-5" />
              </FeatureIcon>
              <h2 className="text-xl font-semibold">Privacy</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: "showBalance",
                  label: "Show Balance",
                  desc: "Display wallet balance on dashboard",
                },
                {
                  key: "showActivity",
                  label: "Public Activity",
                  desc: "Allow others to see your trading activity",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div>
                    <Label className="text-base font-medium">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Toggle
                    enabled={settings[item.key]}
                    onToggle={() => handleToggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              className="gap-2 min-w-[150px]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
