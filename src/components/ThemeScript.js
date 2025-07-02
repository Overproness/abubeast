"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";

export default function ThemeScript() {
  const { isDarkMode, isLoading } = useTheme();

  useEffect(() => {
    if (isLoading) return;

    const html = document.documentElement;

    if (isDarkMode) {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  }, [isDarkMode, isLoading]);

  return null;
}
