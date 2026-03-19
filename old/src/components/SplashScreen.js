"use client";

import { GradientOrb } from "@/components/ui/glass";
import { getZIndexClass } from "@/lib/utils/zIndexLayers";
import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete, minDisplayTime = 2000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 20;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);

    const timer = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 500);
      }, remainingTime);
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 ${getZIndexClass(
        "SPLASH_SCREEN"
      )} bg-background flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Gradient orbs */}
      <GradientOrb
        color="blue"
        className="w-[600px] h-[600px] top-[-200px] left-[-200px] opacity-40"
      />
      <GradientOrb
        color="violet"
        className="w-[500px] h-[500px] bottom-[-150px] right-[-150px] opacity-40"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--glass-border) 1px, transparent 1px), linear-gradient(90deg, var(--glass-border) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <div className="mb-8 relative">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse scale-150" />

          {/* Logo Container */}
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-500 p-[2px] animate-float">
            <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center">
              <span className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                AB
              </span>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              AbuBeast
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Solana Trading
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 md:w-64 mx-auto">
          <div className="h-1.5 bg-glass-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-200 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-3 animate-pulse">
            Initializing...
          </p>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              background: i % 2 === 0 ? "#7c3aed" : "#a855f7",
              opacity: 0.3,
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
