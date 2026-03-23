import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbuBeast | Cyber-Financial Minimalist Intelligence",
  description:
    "AI-powered Solana trading bot with lightning-fast execution. Non-custodial, secure, and autonomous.",
  keywords: ["solana", "trading bot", "defi", "crypto", "AI trading"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background-dark text-slate-100 font-[family-name:var(--font-display)] antialiased">
        {children}
      </body>
    </html>
  );
}
