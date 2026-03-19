"use client";

import { GlassCard } from "@/components/ui/glass";

const TradingPanelPreview = ({ className = "" }) => {
  return (
    <GlassCard className={`p-4 h-full w-full overflow-hidden ${className}`}>
      {/* Window Header */}
      <div className="bg-glass-bg/50 h-8 rounded-lg mb-3 flex items-center px-3">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="mx-auto text-sm text-muted-foreground">
          AbuBeast Trading Interface
        </div>
      </div>

      <div className="h-[calc(100%-2rem)] grid grid-cols-3 gap-3">
        {/* Main Chart Area */}
        <div className="col-span-2 bg-glass-bg/30 rounded-lg p-3">
          <div className="h-40 rounded-lg overflow-hidden border border-glass-border">
            {/* Trading chart placeholder */}
            <div className="w-full h-full bg-gradient-to-r from-primary/5 to-purple-400/5 relative">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#00C8FF" />
                    <stop offset="100%" stopColor="#8A2BE2" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,35 L5,30 L10,32 L15,25 L20,28 L25,20 L30,22 L35,15 L40,18 L45,10 L50,12 L55,5 L60,8 L65,3 L70,6 L75,2 L80,4 L85,1 L90,5 L95,3 L100,5"
                  fill="none"
                  stroke="url(#chartGradient)"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-glass-bg/50 border border-glass-border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Buy Order</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div className="bg-glass-bg p-1 rounded text-xs text-center">
                  Price
                </div>
                <div className="bg-glass-bg p-1 rounded text-xs text-center">
                  Amount
                </div>
                <div className="bg-glass-bg p-1 rounded text-xs text-center">
                  Total
                </div>
              </div>
            </div>
            <div className="bg-glass-bg/50 border border-glass-border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Sell Order</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div className="bg-glass-bg p-1 rounded text-xs text-center">
                  Price
                </div>
                <div className="bg-glass-bg p-1 rounded text-xs text-center">
                  Amount
                </div>
                <div className="bg-glass-bg p-1 rounded text-xs text-center">
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="bg-glass-bg/30 rounded-lg p-3 flex flex-col">
          <div className="text-sm font-medium mb-2">Order Panel</div>
          <div className="bg-glass-bg/50 border border-glass-border rounded-lg p-2 mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Order Type</span>
            </div>
            <div className="flex space-x-1 mb-2">
              <div className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs py-1 px-2 rounded">
                Buy
              </div>
              <div className="bg-glass-bg text-muted-foreground text-xs py-1 px-2 rounded">
                Sell
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-glass-bg p-1.5 rounded text-xs">Price</div>
              <div className="bg-glass-bg p-1.5 rounded text-xs">Amount</div>
              <div className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-center py-1.5 rounded text-xs font-medium">
                Place Order
              </div>
            </div>
          </div>
          <div className="bg-glass-bg/50 border border-glass-border rounded-lg p-2 text-xs">
            <div className="font-medium mb-1">Balance</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SOL</span>
              <span className="text-primary font-medium">125.50</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">USDC</span>
              <span className="text-primary font-medium">$15,430</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TradingPanelPreview;
