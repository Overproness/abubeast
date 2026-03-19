"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [glitchText, setGlitchText] = useState("404");
  const [marketData, setMarketData] = useState([
    { symbol: "BTC", price: 43250, change: 2.3 },
    { symbol: "ETH", price: 2340, change: -1.2 },
    { symbol: "SOL", price: 98.5, change: 4.7 },
    { symbol: "ADA", price: 0.62, change: -0.8 },
  ]);

  useEffect(() => {
    // Glitch effect for 404 text
    const glitchInterval = setInterval(() => {
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const original = "404";
      let glitched = "";

      for (let i = 0; i < original.length; i++) {
        if (Math.random() < 0.1) {
          glitched +=
            glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          glitched += original[i];
        }
      }

      setGlitchText(glitched);

      setTimeout(() => setGlitchText("404"), 100);
    }, 2000);

    // Simulate market data updates
    const marketInterval = setInterval(() => {
      setMarketData((prev) =>
        prev.map((item) => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.02),
          change: (Math.random() - 0.5) * 10,
        }))
      );
    }, 3000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(marketInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-lg animate-bounce delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      {/* Trading chart background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 600">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Candlestick patterns */}
          {[...Array(20)].map((_, i) => (
            <g
              key={i}
              transform={`translate(${i * 50 + 25}, ${
                300 + Math.sin(i) * 100
              })`}
            >
              <rect
                x="-1"
                y="-30"
                width="2"
                height="60"
                fill="rgba(255,255,255,0.1)"
              />
              <rect
                x="-8"
                y="-15"
                width="16"
                height="30"
                fill={
                  i % 3 === 0
                    ? "rgba(34, 197, 94, 0.3)"
                    : "rgba(239, 68, 68, 0.3)"
                }
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Floating trading symbols */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          >
            {i % 5 === 0 && <span className="text-2xl">📈</span>}
            {i % 5 === 1 && <span className="text-2xl">📉</span>}
            {i % 5 === 2 && <span className="text-2xl">💹</span>}
            {i % 5 === 3 && <span className="text-2xl">💰</span>}
            {i % 5 === 4 && <span className="text-2xl">🚀</span>}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          {/* Large 404 with glitch effect */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4 tracking-wider">
              {glitchText}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto mb-6"></div>
          </div>

          {/* Trading-themed error message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Position Not Found
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              The trading pair you're looking for has been delisted or never
              existed
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-red-900/40 border border-red-500/50 rounded-xl">
              <svg
                className="w-6 h-6 text-red-400 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-red-300 font-semibold">
                TRADE_NOT_FOUND_ERROR
              </span>
            </div>
          </div>

          {/* Market overview widget */}
          <div className="mb-8 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 11H7v9a2 2 0 002 2h8a2 2 0 002-2V9h3l-1-1-9-9-9 9zm0 2v7h2v-7H9zm4 0v7h2v-7h-2z" />
              </svg>
              Live Market Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketData.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">
                    {item.symbol}
                  </div>
                  <div className="text-lg font-bold text-white">
                    ${item.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm flex items-center ${
                      item.change >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.change >= 0 ? "↗" : "↘"}{" "}
                    {Math.abs(item.change).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation suggestions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Where would you like to trade?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard"
                className="group bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 border border-blue-500/30 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Dashboard
                </h4>
                <p className="text-gray-300 text-sm">
                  View your portfolio and trading overview
                </p>
              </Link>

              <Link
                href="/swap"
                className="group bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/30 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Swap Tokens
                </h4>
                <p className="text-gray-300 text-sm">
                  Exchange cryptocurrencies instantly
                </p>
              </Link>

              <Link
                href="/trading"
                className="group bg-gradient-to-r from-green-600/20 to-blue-600/20 hover:from-green-600/40 hover:to-blue-600/40 border border-green-500/30 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Advanced Trading
                </h4>
                <p className="text-gray-300 text-sm">
                  Professional trading tools and charts
                </p>
              </Link>
            </div>
          </div>

          {/* Back to home button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Return to Trading Floor
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Error ID for debugging */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-xs text-gray-500">
              Error ID: 404-{Date.now().toString(36).toUpperCase()} •
              <span className="ml-2">
                Market Status:
                <span className="text-green-400 ml-1">🟢 ONLINE</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
            opacity: 0.1;
          }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
