"use client";

import Footer from "@/components/footer";
import LandingNavbar from "@/components/landing-navbar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  LineChart,
  PieChart,
  Search,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

const TOC = [
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "account-setup", label: "Account Setup", icon: Shield },
  { id: "connecting-wallet", label: "Connecting Your Wallet", icon: Wallet },
  { id: "dashboard-overview", label: "Dashboard Overview", icon: BarChart3 },
  { id: "portfolio-data", label: "Portfolio Data & Allocation", icon: PieChart },
  { id: "profit-loss", label: "Profit & Loss Calculations", icon: TrendingUp },
  { id: "performance-metrics", label: "Performance Metrics", icon: LineChart },
  { id: "risk-metrics", label: "Risk Metrics", icon: Shield },
  { id: "diversification", label: "Diversification Analysis", icon: PieChart },
  { id: "historical-data", label: "Historical Data & Analytics", icon: BarChart3 },
  { id: "trading-strategies", label: "Trading Strategies", icon: Zap },
  { id: "session-keys", label: "Session & Security Keys", icon: Shield },
  { id: "terminal", label: "Using the Terminal", icon: BookOpen },
  { id: "settings", label: "Settings & Preferences", icon: BookOpen },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 mb-16">
      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6 border-b border-white/10 pb-4">
        {title}
      </h2>
      <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 my-4 text-sm text-slate-300">
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3 my-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 items-start text-sm">
          <span className="size-6 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
            {i + 1}
          </span>
          <span className="text-slate-300">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredTOC = TOC.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            Documentation
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Everything you need to know about using AbuBeast — from setting up
            your account to understanding your portfolio analytics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          {/* Sidebar TOC */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="glassmorphism rounded-2xl p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search docs..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-600"
                />
              </div>
              <nav className="space-y-1">
                {filteredTOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-primary hover:bg-white/5 transition-colors group"
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            ref={contentRef}
            className="min-w-0"
          >
            <Section id="getting-started" title="Getting Started">
              <p>
                Welcome to AbuBeast, your AI-powered Solana trading companion. This guide
                will walk you through everything you need to know to get started and make
                the most of the platform.
              </p>
              <p>
                AbuBeast is a non-custodial trading bot that uses advanced AI algorithms
                to execute trades on the Solana blockchain. It connects directly to your
                wallet and trades on your behalf while you remain in full control of your
                funds at all times.
              </p>
              <InfoBox>
                AbuBeast never has direct access to your private keys. All transactions
                are signed by your wallet, ensuring you maintain full custody of your assets.
              </InfoBox>
            </Section>

            <Section id="account-setup" title="Account Setup">
              <p>
                Before you can access the trading dashboard, you need to create an account.
                This is a simple process that takes less than a minute.
              </p>
              <StepList
                steps={[
                  'Visit the AbuBeast homepage and click "Launch Terminal" or navigate to the signup page.',
                  "Enter your display name, email address, and create a strong password (at least 8 characters).",
                  "Confirm your password and click \"Create Account\".",
                  "You will be automatically logged in and redirected to the dashboard.",
                ]}
              />
              <p>
                Once your account is created, you can log in at any time using your email
                and password. Your account allows you to save settings, track your
                trading history, and manage your preferences across sessions.
              </p>
            </Section>

            <Section id="connecting-wallet" title="Connecting Your Wallet">
              <p>
                After logging in, you need to connect your Solana wallet to view your
                portfolio data and enable trading. AbuBeast supports three popular wallets:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                {[
                  { name: "Phantom", icon: "👻", desc: "The most popular Solana wallet with a clean interface" },
                  { name: "Solflare", icon: "🔥", desc: "Feature-rich wallet with built-in staking support" },
                  { name: "Backpack", icon: "🎒", desc: "Multi-chain wallet with xNFT support" },
                ].map((w) => (
                  <div key={w.name} className="glassmorphism rounded-xl p-4 text-center">
                    <span className="text-3xl">{w.icon}</span>
                    <h4 className="font-bold text-white mt-2">{w.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{w.desc}</p>
                  </div>
                ))}
              </div>
              <StepList
                steps={[
                  "Click the \"Connect Wallet\" button in the top right corner of the dashboard.",
                  "A dropdown will appear showing available wallets. Select your preferred wallet.",
                  "Your wallet extension will open a prompt asking you to approve the connection.",
                  "Once approved, your wallet address will appear in the navbar and your portfolio data will load.",
                ]}
              />
              <InfoBox>
                If your wallet extension is not installed, clicking on a wallet option will
                open the official download page for that wallet. Install the extension, create
                or import your wallet, then try connecting again.
              </InfoBox>
            </Section>

            <Section id="dashboard-overview" title="Dashboard Overview">
              <p>
                The dashboard is your central hub for monitoring all trading activity. Once
                your wallet is connected, you will see several key sections:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4 text-sm">
                <li><strong className="text-white">Bot Status Card</strong> — Shows whether automated trading is active or paused, along with today&apos;s key stats (trades, volume, P&L, win rate).</li>
                <li><strong className="text-white">Portfolio Chart</strong> — A visual representation of your portfolio performance over time, with 1-day, 1-week, and 1-month views.</li>
                <li><strong className="text-white">Session Key Panel</strong> — Displays the status of your active session key and remaining time.</li>
                <li><strong className="text-white">Live Activity Feed</strong> — Real-time log of all bot actions including trades, alerts, and wallet syncs.</li>
                <li><strong className="text-white">AI Intelligence</strong> — Shows the current AI market bias (bullish/bearish) and confidence level.</li>
                <li><strong className="text-white">Status Metrics</strong> — Bottom bar showing security score, execution latency, gas savings, and network health.</li>
              </ul>
            </Section>

            <Section id="portfolio-data" title="Portfolio Data & Allocation">
              <p>
                AbuBeast fetches your portfolio data directly from the Solana blockchain
                using your connected wallet address. Here is how it works:
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">How We Fetch Wallet Data</h3>
              <p>
                When you connect your wallet, AbuBeast queries the Solana RPC endpoint to
                retrieve your token accounts, SOL balance, and recent transaction history.
                This data is read-only — we never request write access unless you authorize
                a trade.
              </p>
              <StepList
                steps={[
                  "Your wallet public key is sent to our backend via a secure HTTPS connection.",
                  "We query the Solana RPC node (Mainnet-Beta by default) for all token accounts associated with your address.",
                  "Token balances are fetched along with current market prices from on-chain price oracles (Pyth, Switchboard).",
                  "Portfolio allocation is calculated as dollar value of each token divided by total portfolio dollar value.",
                ]}
              />
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Portfolio Allocation Calculation</h3>
              <p>
                Portfolio allocation shows what percentage of your total holdings each token
                represents. The formula is straightforward:
              </p>
              <div className="glassmorphism rounded-xl p-4 my-4 font-mono text-sm">
                <p className="text-primary">Allocation % = (Token Value in USD / Total Portfolio Value in USD) × 100</p>
              </div>
              <p>
                For example, if you hold 10 SOL worth $1,500 and your total portfolio is worth $5,000,
                your SOL allocation would be 30%. This is recalculated every time prices update, giving
                you a real-time view of how your funds are distributed.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Historical Portfolio Allocation</h3>
              <p>
                AbuBeast tracks your portfolio allocation over time by taking periodic snapshots.
                These snapshots are stored securely and allow you to see how your allocation has
                changed — for example, whether you have been gradually increasing your SOL position
                or diversifying into other tokens. You can view historical allocation data in 1-day,
                1-week, and 1-month intervals from the Portfolio Chart section.
              </p>
            </Section>

            <Section id="profit-loss" title="Profit & Loss Calculations">
              <p>
                Understanding your profit and loss (P&L) is essential to evaluating your
                trading performance. AbuBeast calculates P&L at multiple levels:
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Per-Trade P&L</h3>
              <p>
                For each trade executed by the bot, we calculate the P&L by comparing the
                entry price with the exit price, accounting for fees and slippage:
              </p>
              <div className="glassmorphism rounded-xl p-4 my-4 font-mono text-sm">
                <p className="text-primary">Trade P&L = (Exit Price - Entry Price) × Quantity - Fees</p>
              </div>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Daily P&L</h3>
              <p>
                Daily P&L is the sum of all individual trade P&Ls for the day, plus any
                unrealized gains or losses from open positions. This is what you see in
                the &quot;P&L Today&quot; metric on the dashboard.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Historical P&L</h3>
              <p>
                Historical P&L tracks your cumulative profit and loss over time. AbuBeast
                stores daily snapshots of your portfolio value, allowing you to see your
                total returns over any period. The historical P&L chart on the dashboard
                shows your portfolio value trajectory, making it easy to identify trends
                and evaluate long-term performance.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Unrealized vs Realized P&L</h3>
              <p>
                <strong className="text-white">Realized P&L</strong> comes from completed trades where
                you have already bought and sold. <strong className="text-white">Unrealized P&L</strong> is
                the current profit or loss on tokens you still hold, based on current market prices.
                The dashboard shows both so you always know your complete financial picture.
              </p>
            </Section>

            <Section id="performance-metrics" title="Performance Metrics">
              <p>
                AbuBeast provides several performance metrics to help you evaluate how well
                your trading strategies are working:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4 text-sm">
                <li><strong className="text-white">Win Rate</strong> — The percentage of trades that were profitable. Calculated as: (Winning Trades / Total Trades) × 100.</li>
                <li><strong className="text-white">Average Return per Trade</strong> — The mean P&L across all trades, giving you an idea of typical trade performance.</li>
                <li><strong className="text-white">Sharpe Ratio</strong> — Measures risk-adjusted returns. A higher Sharpe ratio means better returns relative to the risk taken. Calculated as: (Average Return - Risk-Free Rate) / Standard Deviation of Returns.</li>
                <li><strong className="text-white">Max Drawdown</strong> — The largest peak-to-trough decline in your portfolio value, showing your worst-case scenario during a given period.</li>
                <li><strong className="text-white">Total Volume</strong> — The total USD value of all trades executed by the bot.</li>
                <li><strong className="text-white">Execution Latency</strong> — Average time from trade signal to on-chain confirmation, measured in milliseconds.</li>
              </ul>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Historical Performance Metrics</h3>
              <p>
                All performance metrics are tracked historically. You can view how your win rate,
                Sharpe ratio, and other metrics have changed over time. This helps you understand
                whether your strategies are improving or if adjustments are needed. Historical data
                is available in daily, weekly, and monthly granularity.
              </p>
            </Section>

            <Section id="risk-metrics" title="Risk Metrics">
              <p>
                Managing risk is just as important as generating returns. AbuBeast provides
                comprehensive risk analysis:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4 text-sm">
                <li><strong className="text-white">Value at Risk (VaR)</strong> — Estimates the maximum potential loss over a given time period at a specific confidence level (typically 95%). For example, a 1-day VaR of $500 at 95% confidence means there is only a 5% chance of losing more than $500 in a day.</li>
                <li><strong className="text-white">Volatility</strong> — Measures how much your portfolio value fluctuates. Higher volatility means higher risk but also potentially higher returns.</li>
                <li><strong className="text-white">Beta</strong> — Measures your portfolio&apos;s sensitivity to overall Solana market movements. A beta of 1.0 means your portfolio moves in line with SOL. Greater than 1.0 means more volatile than the market.</li>
                <li><strong className="text-white">Max Drawdown Duration</strong> — How long it took to recover from the worst drawdown, helping you understand potential recovery timelines.</li>
                <li><strong className="text-white">Sortino Ratio</strong> — Similar to Sharpe ratio but only considers downside volatility, giving a more accurate picture of risk-adjusted returns for strategies with asymmetric return distributions.</li>
              </ul>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Historical Risk Analysis</h3>
              <p>
                Risk metrics are computed using rolling windows of historical data. AbuBeast
                recalculates these daily and stores the results, allowing you to see how your
                portfolio&apos;s risk profile has evolved over time. You can view historical risk
                data across daily, weekly, and monthly timeframes to identify trends and make
                informed decisions about your risk tolerance.
              </p>
            </Section>

            <Section id="diversification" title="Diversification Analysis">
              <p>
                Diversification helps reduce risk by spreading your investments across
                different tokens. AbuBeast measures diversification using several approaches:
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Concentration Score</h3>
              <p>
                We calculate a concentration score using the Herfindahl-Hirschman Index (HHI).
                A lower score indicates better diversification:
              </p>
              <div className="glassmorphism rounded-xl p-4 my-4 font-mono text-sm">
                <p className="text-primary">HHI = Sum of (Each Token&apos;s Allocation %)²</p>
                <p className="text-slate-400 mt-2">Example: If you hold 50% SOL and 50% USDC → HHI = 50² + 50² = 5,000 (well diversified)</p>
                <p className="text-slate-400">If you hold 100% SOL → HHI = 100² = 10,000 (fully concentrated)</p>
              </div>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Correlation Analysis</h3>
              <p>
                True diversification isn&apos;t just about holding many tokens — it&apos;s about holding tokens
                that don&apos;t move in the same direction at the same time. AbuBeast analyzes the price
                correlation between your held tokens. Tokens with low correlation provide better
                diversification benefits than tokens that tend to rise and fall together.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">Historical Diversification Tracking</h3>
              <p>
                AbuBeast tracks your diversification score over time, so you can see whether your
                portfolio is becoming more or less diversified. This is especially useful when the
                bot is actively trading — you can verify that the strategies are maintaining
                appropriate diversification levels. Historical diversification data includes
                both the HHI concentration score and pairwise correlation metrics, available
                across all standard timeframes.
              </p>
            </Section>

            <Section id="historical-data" title="Historical Data & Analytics">
              <p>
                AbuBeast maintains comprehensive historical records of all your trading data
                and portfolio metrics. Here is a summary of all historical data available:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {[
                  { title: "Historical Performance", desc: "Win rate, Sharpe ratio, average returns, and total volume tracked daily" },
                  { title: "Historical P&L", desc: "Per-trade, daily, weekly, and monthly profit and loss records" },
                  { title: "Historical Portfolio Allocation", desc: "Token distribution snapshots showing how your allocation changed over time" },
                  { title: "Historical Risk Metrics", desc: "VaR, volatility, beta, drawdown, and Sortino ratio computed on rolling windows" },
                  { title: "Historical Diversification", desc: "Concentration scores and correlation analysis tracked across all timeframes" },
                  { title: "Trade History", desc: "Complete record of every trade executed, including entry/exit prices, fees, and timestamps" },
                ].map((item) => (
                  <div key={item.title} className="glassmorphism rounded-xl p-4">
                    <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p>
                All historical data is accessible from the dashboard charts using the time period
                selectors (1D, 1W, 1M). The data is stored securely and associated with your
                account, so it persists across sessions and devices.
              </p>
            </Section>

            <Section id="trading-strategies" title="Trading Strategies">
              <p>
                AbuBeast offers several pre-built trading strategies, each designed for
                different market conditions and risk appetites:
              </p>
              <div className="space-y-4 my-6">
                {[
                  { name: "MEV Arbitrage V4", risk: "Medium", desc: "Exploits price differences across multiple Solana DEXes using Jito bundles for MEV extraction. Works best in volatile markets with high trading volume." },
                  { name: "Momentum Scalper", risk: "High", desc: "High-frequency scalping strategy that uses machine learning signals to identify short-term price momentum. Executes many small trades for incremental gains." },
                  { name: "Whale Follower", risk: "Low", desc: "Monitors and copies trades from top-performing Solana whale wallets. Lower risk because it follows proven traders with track records." },
                  { name: "DCA Auto-Invest", risk: "Low", desc: "Automatically dollar-cost averages into selected tokens on a schedule. Ideal for long-term accumulation with minimal active management." },
                ].map((s) => (
                  <div key={s.name} className="glassmorphism rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{s.name}</h4>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        s.risk === "High" ? "bg-red-500/20 text-red-400" :
                        s.risk === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-solana-green/20 text-solana-green"
                      )}>{s.risk} Risk</span>
                    </div>
                    <p className="text-sm text-slate-400">{s.desc}</p>
                  </div>
                ))}
              </div>
              <p>
                You can activate or deactivate strategies from the Strategies page. Only one
                strategy can be active at a time. Each strategy shows its 30-day historical PnL
                so you can compare performance before choosing.
              </p>
            </Section>

            <Section id="session-keys" title="Session & Security Keys">
              <p>
                Session keys are a core security feature of AbuBeast. They allow the bot to
                sign transactions on your behalf without requiring manual approval for each
                trade, while still maintaining strict limits on what the bot can do.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-3">How Session Keys Work</h3>
              <StepList
                steps={[
                  "When you authorize a session, a temporary keypair is generated.",
                  "You grant this keypair limited permissions — such as the ability to trade or swap tokens.",
                  "The bot uses this keypair to sign transactions within the limits you set (daily spending limit, max slippage).",
                  "The session key expires after the time limit you configure, or you can revoke it manually at any time.",
                  "Withdrawal access is always disabled for session keys — the bot can never transfer tokens out of your wallet.",
                ]}
              />
              <InfoBox>
                Session keys use Solana&apos;s native delegation framework. The temporary keypair
                is stored encrypted and is destroyed when the session expires or is revoked.
                You can view and manage all active sessions from the Security Keys page.
              </InfoBox>
            </Section>

            <Section id="terminal" title="Using the Terminal">
              <p>
                The Terminal provides a command-line interface for advanced users who prefer
                direct interaction with the AbuBeast engine. Available commands include:
              </p>
              <div className="glassmorphism rounded-xl p-4 my-4 font-mono text-sm space-y-2">
                <p><span className="text-primary">status</span> — Check bot status, active strategy, and uptime</p>
                <p><span className="text-primary">balance</span> — View current token balances</p>
                <p><span className="text-primary">trades</span> — List recent trade history</p>
                <p><span className="text-primary">pnl</span> — Show profit and loss summary</p>
                <p><span className="text-primary">help</span> — List all available commands</p>
              </div>
              <p>
                The terminal output is color-coded: green for system messages, cyan for your
                input, and white for command output. All commands are executed securely through
                the same API that powers the dashboard.
              </p>
            </Section>

            <Section id="settings" title="Settings & Preferences">
              <p>
                The Settings page lets you customize your AbuBeast experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4 text-sm">
                <li><strong className="text-white">Notifications</strong> — Toggle push notifications, trade alerts, and price alerts on or off.</li>
                <li><strong className="text-white">Network</strong> — Choose your preferred RPC endpoint (Mainnet-Beta, Devnet, or a custom RPC URL).</li>
                <li><strong className="text-white">Security</strong> — Enable two-factor authentication and manage active login sessions.</li>
              </ul>
              <p>
                All settings are saved to your account and will persist across devices and
                sessions. Changes take effect immediately after clicking &quot;Save Settings&quot;.
              </p>
            </Section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
