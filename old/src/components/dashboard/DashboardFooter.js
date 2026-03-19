"use client";

import { FeatureIcon, GlassCard } from "@/components/ui/glass";
import { BarChart3, Shield, Zap } from "lucide-react";

export default function DashboardFooter() {
  const footerItems = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Real-time data updates and instant trade execution",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure",
      description: "Bank-grade security with multi-layer protection",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      description: "Advanced analytics and insights for better trading",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {footerItems.map((item, index) => (
        <GlassCard
          key={index}
          className="p-6 text-center hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
        >
          <FeatureIcon className="mx-auto mb-4">{item.icon}</FeatureIcon>
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </GlassCard>
      ))}
    </div>
  );
}
