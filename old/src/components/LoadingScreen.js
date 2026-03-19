"use client";

import { GradientOrb } from "@/components/ui/glass";
import { Bot, Shield, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoadingScreen({
  message = "Loading AbuBeast Trading Platform",
}) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  const loadingMessages = [
    "Initializing trading engine...",
    "Connecting to Solana network...",
    "Loading market data...",
    "Preparing your dashboard...",
    "Almost ready...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 300);

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const icons = [
    { Icon: Bot, delay: "0s" },
    { Icon: TrendingUp, delay: "0.2s" },
    { Icon: Zap, delay: "0.4s" },
    { Icon: Shield, delay: "0.6s" },
  ];

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden z-50">
      {/* Gradient orbs */}
      <GradientOrb
        color="blue"
        className="w-[600px] h-[600px] top-0 left-0 opacity-30"
      />
      <GradientOrb
        color="violet"
        className="w-[500px] h-[500px] bottom-0 right-0 opacity-30"
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--glass-border) 1px, transparent 1px), linear-gradient(90deg, var(--glass-border) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              AbuBeast
            </span>
          </h1>
          <p className="text-muted-foreground">AI-Powered Solana Trading</p>
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center gap-6 mb-8">
          {icons.map(({ Icon, delay }, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center animate-pulse"
              style={{ animationDelay: delay }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-64 md:w-80 mx-auto mb-4">
          <div className="h-2 bg-glass-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-muted-foreground text-sm animate-pulse">
          {currentMessage}
        </p>

        {/* Progress Percentage */}
        <p className="text-primary font-mono text-sm mt-2">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
