"use client";

import { useTheme } from "@/context/ThemeContext";
import { getZIndexClass } from "@/lib/utils/zIndexLayers";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function DexScreenerChart({
  pairAddress,
  chain = "solana",
  isOpen,
  onClose,
  tokenSymbol,
}) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      setLoading(true);

      // Simulate loading time for iframe
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !pairAddress) return null;

  const chartTheme = isDarkMode ? "dark" : "light";
  const embedUrl = `https://dexscreener.com/${chain}/${pairAddress}?embed=1&loadChartSettings=0&chartDefaultOnMobile=1&chartTheme=${chartTheme}&theme=${chartTheme}&chartStyle=1&chartType=usd&interval=15`;

  return (
    <div className={`fixed inset-0 ${getZIndexClass('CHART_MODAL')} flex items-center justify-center`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-7xl mx-4 h-[90vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">📈</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {tokenSymbol ? `${tokenSymbol} Chart` : "Token Chart"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Powered by DexScreener •{" "}
                {chain.charAt(0).toUpperCase() + chain.slice(1)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors duration-200 group"
            aria-label="Close chart"
          >
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        {/* Chart Container */}
        <div className="relative w-full h-[calc(100%-5rem)]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading chart data...
                </p>
              </div>
            </div>
          )}

          {/* DexScreener Embed */}
          <div className="w-full h-full">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                #dexscreener-embed {
                  position: relative;
                  width: 100%;
                  height: 100%;
                }
                @media(min-width: 1400px) {
                  #dexscreener-embed {
                    height: 100%;
                  }
                }
                #dexscreener-embed iframe {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  top: 0;
                  left: 0;
                  border: 0;
                  border-radius: 0 0 12px 12px;
                }
              `,
              }}
            />
            <div id="dexscreener-embed">
              <iframe
                src={embedUrl}
                allow="clipboard-write"
                title={`${tokenSymbol || "Token"} Chart`}
                onLoad={() => setLoading(false)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Real-time price data and charts</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
