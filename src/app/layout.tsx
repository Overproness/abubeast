import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ThemeScript from "@/components/ThemeScript";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export const metadata = {
  title: "AbuBeast - Web3 Platform",
  description:
    "Comprehensive web3 platform with multi-chain wallet integration, DeFi tools, and cross-chain functionality",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add Google Fonts via CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <ThemeScript />
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
              <Navbar />
              {/* Add padding-top to account for fixed navbar */}
              <main className="flex-1 pt-20">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
