"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen({
  message = "Loading AbuBeast Trading Platform",
}) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  const loadingMessages = [
    "Initializing trading engine...",
    "Connecting to blockchain networks...",
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-lg animate-bounce delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      {/* Floating trading icons */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float-slow opacity-10`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {i % 4 === 0 && (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
              </svg>
            )}
            {i % 4 === 1 && (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 14L12 9L17 14H7Z" />
              </svg>
            )}
            {i % 4 === 2 && (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 10L12 15L7 10H17Z" />
              </svg>
            )}
            {i % 4 === 3 && (
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-2xl mb-4 transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <span className="text-2xl font-bold text-white transform -rotate-12">
              AB
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            AbuBeast
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Professional Trading Platform
          </p>
        </div>

        {/* Loading animation */}
        <div className="mb-8">
          <div className="relative w-64 h-64 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>

            {/* Animated rings */}
            <div className="absolute inset-2 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-6 border-4 border-transparent border-r-purple-400 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-10 border-4 border-transparent border-b-pink-400 rounded-full animate-spin"></div>

            {/* Center content */}
            <div className="absolute inset-16 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {Math.round(progress)}%
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading message */}
        <div className="text-gray-300 text-sm animate-pulse">
          {currentMessage}
        </div>

        {/* Market ticker simulation */}
        <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>BTC</span>
            <span>ETH</span>
            <span>SOL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">$43,250 ↗</span>
            <span className="text-green-400">$2,340 ↗</span>
            <span className="text-red-400">$98.50 ↘</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
