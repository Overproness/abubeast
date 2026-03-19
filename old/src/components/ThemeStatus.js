"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeStatus() {
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, isLoading } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
        flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
        transition-all duration-300 backdrop-blur-sm border
        ${
          isDarkMode
            ? "bg-gray-900/80 text-gray-100 border-gray-700"
            : "bg-white/80 text-gray-900 border-gray-200"
        }
      `}
      >
        {isDarkMode ? (
          <>
            <Moon className="w-4 h-4 text-blue-400" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </>
        )}
      </div>
    </div>
  );
}
