"use client";

import { useTheme } from "@/context/ThemeContext";
import { Lightbulb, Moon } from "lucide-react";

export default function ThemeStatusIndicator() {
  const { isDarkMode } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border transition-all duration-300
          ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-600 text-gray-200"
              : "bg-white/80 border-gray-300 text-gray-800"
          }
        `}
      >
        {isDarkMode ? (
          <Moon className="w-4 h-4 text-blue-400" />
        ) : (
          <Lightbulb className="w-4 h-4 text-yellow-500" />
        )}
        <span className="text-xs font-medium">
          {isDarkMode ? "Dark" : "Light"} Mode
        </span>
      </div>
    </div>
  );
}
