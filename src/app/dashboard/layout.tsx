"use client";

import { WalletProvider } from "@/providers/wallet-provider";
import DashboardNavbar from "@/components/dashboard-navbar";
import Footer from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <DashboardNavbar />
        <main className="flex-1">{children}</main>
        <Footer variant="dashboard" />
      </div>
    </WalletProvider>
  );
}
