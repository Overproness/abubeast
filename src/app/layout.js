import "@/styles/globals.css";
import { Poppins, Roboto_Mono } from "next/font/google";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ThemeScript from "../components/ThemeScript";
import ThemeStatus from "../components/ThemeStatus";
import TradingErrorBoundary from "../components/TradingErrorBoundary";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import "./reset.css";

// Configure the fonts with display: 'swap' for better performance
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata = {
  title: "AbuBeast - Next Generation Trading Platform",
  description:
    "Trade crypto with confidence using our secure, reliable and intuitive platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ThemeScript />
          <TradingErrorBoundary>
            <AuthProvider>
              <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <main className="flex-grow pt-20">{children}</main>
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
