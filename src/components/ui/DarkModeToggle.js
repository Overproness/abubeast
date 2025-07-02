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
        className={`w-16 h-8 bg-gray-200 rounded-full animate-pulse relative ${className}`}
      >
        <div className="absolute inset-1 w-6 h-6 bg-white rounded-full shadow-sm" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse relative ${className}`}
      >
        <div className="absolute inset-1 w-6 h-6 bg-white rounded-full shadow-sm" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full 
        p-1 transition-all duration-500 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800 
        group hover:scale-105 active:scale-95
        ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg shadow-blue-500/30"
            : "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 shadow-lg shadow-gray-500/20 hover:from-gray-300 hover:via-gray-400 hover:to-gray-300"
        }
        ${className}
      `}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <span className="sr-only">Toggle dark mode</span>

      {/* Toggle switch */}
      <div
        className={`
          inline-block h-6 w-6 transform rounded-full 
          bg-white shadow-lg ring-0 
          transition-all duration-500 ease-in-out 
          flex items-center justify-center 
          relative overflow-hidden
          ${isDarkMode ? "translate-x-8" : "translate-x-0"}
          ${
            isDarkMode
              ? "bg-gradient-to-br from-slate-50 to-white shadow-blue-500/50"
              : "bg-gradient-to-br from-white to-gray-50 shadow-gray-500/30"
          }
        `}
      >
        {/* Sun Icon */}
        <Sun
          className={`h-4 w-4 text-amber-500 absolute transition-all duration-500 transform ${
            isDarkMode
              ? "opacity-0 scale-0 rotate-180"
              : "opacity-100 scale-100 rotate-0"
          }`}
          strokeWidth={2.5}
        />

        {/* Moon Icon */}
        <Moon
          className={`h-4 w-4 text-indigo-600 absolute transition-all duration-500 transform ${
            isDarkMode
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-0 -rotate-180"
          }`}
          strokeWidth={2.5}
        />
      </div>

      {/* Background glow effect */}
      <div
        className={`
          absolute inset-0 rounded-full transition-all duration-500 ease-in-out -z-10
          ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-md"
              : "bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 blur-md"
          }
        `}
      />

      {/* Animated background elements for dark mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {/* Animated stars */}
          <div className="absolute top-1.5 left-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-60" />
          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100 opacity-80" />
          <div className="absolute bottom-1.5 right-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-200 opacity-70" />

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full" />
        </div>
      )}

      {/* Light mode subtle effects */}
      {!isDarkMode && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {/* Subtle radial rays */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-200/20 via-transparent to-transparent rounded-full" />
        </div>
      )}
    </button>
  );
}

export default DarkModeToggle;
