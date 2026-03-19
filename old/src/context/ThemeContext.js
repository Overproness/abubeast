"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage or system preference - default to light
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      setIsDarkMode(saved === "dark");
    } else {
      // Default to light mode instead of system preference
      setIsDarkMode(false);
    }

    setIsLoading(false);
  }, []);

  // Apply theme to document with enhanced animations
  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    const body = document.body;

    // Add transition classes before theme change
    body.classList.add("theme-transition", "theme-switching");

    if (isDarkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
      // Update meta theme color for mobile browsers
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = "theme-color";
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = "#1f2937"; // dark theme color
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = "theme-color";
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = "#ffffff"; // light theme color
    }

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Remove transition classes after animation completes
    setTimeout(() => {
      body.classList.remove("theme-transition", "theme-switching");
    }, 400);
  }, [isDarkMode, isLoading]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
