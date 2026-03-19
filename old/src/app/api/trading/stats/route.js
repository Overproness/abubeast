import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import SwapHistory from "@/models/SwapHistory";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    console.log("[Trading Stats API] Request received for wallet:", wallet);

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Verify user authentication (optional - allow public access)
    const token = request.cookies.get("token")?.value;
    console.log("[Trading Stats API] Token found:", !!token);

    let isAuthenticated = false;
    if (token) {
      try {
        const tokenData = await verifyToken(token);
        isAuthenticated = !!tokenData;
        console.log("[Trading Stats API] Token verification result:", isAuthenticated);
      } catch (error) {
        console.log("[Trading Stats API] Token verification failed:", error);
        // Continue without authentication
      }
    }

    await dbConnect();

    // Fetch trading history for stats calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trades = await SwapHistory.find({
      walletAddress: wallet,
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: -1 });

    // Calculate stats
    const totalTrades = trades.length;
    const successfulTrades = trades.filter(
      (t) => t.status === "completed" || t.status === "success"
    ).length;
    const successRate =
      totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;

    // Calculate returns (if profit/loss data available)
    let totalReturn = 0;
    let tradesWithReturn = 0;
    trades.forEach((trade) => {
      if (trade.profitLoss != null) {
        totalReturn += trade.profitLoss;
        tradesWithReturn++;
      }
    });
    const avgReturn =
      tradesWithReturn > 0 ? totalReturn / tradesWithReturn : 0;

    // Calculate daily volume (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const dailyTrades = trades.filter((t) => t.timestamp >= oneDayAgo);
    const dailyVolume = dailyTrades.reduce((sum, trade) => {
      return sum + (parseFloat(trade.inputAmount) || 0);
    }, 0);

    return NextResponse.json({
      totalTrades,
      successRate: parseFloat(successRate.toFixed(2)),
      avgReturn: parseFloat(avgReturn.toFixed(2)),
      dailyVolume: parseFloat(dailyVolume.toFixed(2)),
    });
  } catch (error) {
    console.error("[Trading Stats API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trading stats" },
      { status: 500 }
    );
  }
}
