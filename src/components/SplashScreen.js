"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete, minDisplayTime = 2000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 20;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);

    // Ensure minimum display time
    const timer = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 500); // Allow exit animation to complete
      }, remainingTime);
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo animation */}
        <div className="mb-12">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin mx-auto"></div>

            {/* Inner logo container */}
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-bold text-white animate-pulse">
                  AB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4 animate-fade-in">
            AbuBeast
          </h1>
          <p className="text-xl text-gray-300 animate-fade-in-delay">
            Professional Trading Platform
          </p>
        </div>

        {/* Loading animation */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2 mb-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1 backdrop-blur-sm">
              <div
                className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-8">
          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Real-time</span>
          </div>

          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 11H7v9a2 2 0 002 2h8a2 2 0 002-2V9h3l-1-1-9-9-9 9zm0 2v7h2v-7H9zm4 0v7h2v-7h-2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Secure</span>
          </div>

          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-pink-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 12h7v1.5h-7V12zm0-2.5h7V11h-7V9.5zm0-2.5h7V8.5h-7V7zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Advanced</span>
          </div>
        </div>

        {/* Version info */}
        <div
          className="text-xs text-gray-500 animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          v2.0.0 • Built for traders
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
