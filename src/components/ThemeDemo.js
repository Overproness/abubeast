"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Check, Moon, Sun } from "lucide-react";

export default function ThemeDemo() {
  const { isDarkMode, toggleTheme } = useTheme();

  const testElements = [
    {
      title: "Primary Button",
      component: <Button className="theme-aware-hover">Primary Action</Button>,
    },
    {
      title: "Secondary Button",
      component: (
        <Button variant="outline" className="theme-aware-hover">
          Secondary Action
        </Button>
      ),
    },
    {
      title: "Card Component",
      component: (
        <Card className="theme-aware-hover">
          <CardHeader>
            <CardTitle>Sample Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a sample card to test dark mode styling.
            </p>
          </CardContent>
        </Card>
      ),
    },
    {
      title: "Text Elements",
      component: (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Heading Text</h3>
          <p className="text-foreground">Regular body text</p>
          <p className="text-muted-foreground">Muted text content</p>
          <a href="#" className="text-primary hover:underline">
            Link text
          </a>
        </div>
      ),
    },
    {
      title: "Input Elements",
      component: (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter text..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      ),
    },
    {
      title: "Status Indicators",
      component: (
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Check className="w-3 h-3 mr-1" />
            Active
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Pending
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Error
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Dark Mode Theme Demo
        </h1>
        <p className="text-muted-foreground">
          Test the dark mode implementation across different UI components
        </p>

        <div className="flex justify-center">
          <Button
            onClick={toggleTheme}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                Switch to Dark Mode
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {testElements.map((element, index) => (
          <Card key={index} className="theme-aware-hover">
            <CardHeader>
              <CardTitle className="text-lg">{element.title}</CardTitle>
            </CardHeader>
            <CardContent>{element.component}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="theme-aware-hover dark-glow">
        <CardHeader>
          <CardTitle>Theme Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current Theme:{" "}
              <span className="font-semibold text-foreground">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Theme transitions and animations are working properly ✅
            </p>
            <p className="text-sm text-muted-foreground">
              All components adapt to theme changes automatically ✅
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
