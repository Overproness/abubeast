"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function DarkModeToggle({ className = "" }) {
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, toggleTheme, isLoading } = useTheme();

  // Ensure component is mounted on client side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`w-10 h-10 rounded-lg animate-pulse relative ${className}`}
        style={{
          background: "rgba(var(--glass-bg), var(--glass-opacity))",
          backdropFilter: "blur(var(--glass-blur))",
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className={`w-10 h-10 rounded-lg animate-pulse relative ${className}`}
        style={{
          background: "rgba(var(--glass-bg), var(--glass-opacity))",
          backdropFilter: "blur(var(--glass-blur))",
        }}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 shrink-0 cursor-pointer rounded-lg
        transition-all duration-300 ease-in-out 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        group hover:-translate-y-0.5 active:scale-95
        ${className}
      `}
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)"
          : "rgba(var(--glass-bg), var(--glass-opacity))",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        border: `1px solid ${
          isDarkMode
            ? "rgba(124, 58, 237, 0.3)"
            : "rgba(var(--glass-border), var(--glass-border-opacity))"
        }`,
        boxShadow: isDarkMode
          ? "0 4px 15px rgba(124, 58, 237, 0.2)"
          : "var(--shadow-sm)",
      }}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <span className="sr-only">Toggle dark mode</span>

      {/* Icon Container */}
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
            isDarkMode
              ? "opacity-0 scale-0 rotate-90"
              : "opacity-100 scale-100 rotate-0 text-amber-500"
          }`}
          strokeWidth={2.5}
        />

        {/* Moon Icon */}
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
            isDarkMode
              ? "opacity-100 scale-100 rotate-0 text-primary"
              : "opacity-0 scale-0 -rotate-90"
          }`}
          strokeWidth={2.5}
        />
      </div>

      {/* Hover glow effect */}
      <div
        className={`
          absolute inset-0 rounded-lg transition-opacity duration-300 -z-10
          opacity-0 group-hover:opacity-100
        `}
        style={{
          boxShadow: isDarkMode
            ? "0 0 20px rgba(124, 58, 237, 0.4)"
            : "0 0 20px rgba(124, 58, 237, 0.2)",
        }}
      />

      {/* Animated background sparkles for dark mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-primary rounded-full animate-pulse opacity-40" />
          <div className="absolute top-1.5 right-3 w-0.5 h-0.5 bg-violet-400 rounded-full animate-pulse animation-delay-300 opacity-50" />
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-500 opacity-40" />
        </div>
      )}
    </button>
  );
}

export default DarkModeToggle;
