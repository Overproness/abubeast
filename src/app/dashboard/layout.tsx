"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/providers/auth-provider";
import { WalletProvider } from "@/providers/wallet-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WalletProvider>
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <DashboardNavbar />
          <main className="flex-1">{children}</main>
          <Footer variant="dashboard" />
        </div>
      </WalletProvider>
    </AuthProvider>
  );
}
