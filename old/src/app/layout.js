import "@/styles/globals.css";
import { Lora, Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ServiceInitializer from "../components/ServiceInitializer";
import ThemeScript from "../components/ThemeScript";
import ThemeStatus from "../components/ThemeStatus";
import TradingErrorBoundary from "../components/TradingErrorBoundary";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import "./reset.css";

// Configure fonts for tweakcn design system
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "AbuBeast - AI-Powered Solana Trading Bot",
  description:
    "Maximize your crypto profits with our intelligent trading bot. Auto-buy new tokens, smart sell strategies, and real-time analytics on the Solana blockchain.",
  keywords:
    "solana, trading bot, crypto, automated trading, DeFi, token trading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${lora.variable} ${robotoMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ThemeScript />
          <TradingErrorBoundary>
            <AuthProvider>
              <ServiceInitializer />
              <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
                <ThemeStatus />
              </div>
            </AuthProvider>
          </TradingErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
