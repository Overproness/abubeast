import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import SwapHistory from "@/models/SwapHistory";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log(
      "[Trading Activity API] Request received for wallet:",
      wallet,
      "limit:",
      limit
    );

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Verify user authentication (optional - allow public access)
    const token = request.cookies.get("token")?.value;
    console.log("[Trading Activity API] Token found:", !!token);

    let isAuthenticated = false;
    if (token) {
      try {
        const tokenData = await verifyToken(token);
        isAuthenticated = !!tokenData;
        console.log(
          "[Trading Activity API] Token verification result:",
          isAuthenticated
        );
      } catch (error) {
        console.log("[Trading Activity API] Token verification failed:", error);
        // Continue without authentication
      }
    }

    await dbConnect();

    // Fetch recent trading activity
    const trades = await SwapHistory.find({
      walletAddress: wallet,
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Format activities
    const activities = trades.map((trade) => ({
      type: trade.swapType || "swap",
      token: trade.outputToken || trade.tokenSymbol || "Unknown",
      inputToken: trade.inputToken,
      outputToken: trade.outputToken,
      amount: parseFloat(trade.outputAmount || trade.amount || 0),
      inputAmount: parseFloat(trade.inputAmount || 0),
      price: parseFloat(trade.price || 0),
      time: formatTimeAgo(trade.timestamp),
      timestamp: trade.timestamp,
      txHash: trade.txHash || trade.signature,
      status: trade.status,
      profitLoss: trade.profitLoss,
    }));

    return NextResponse.json({
      activities,
      total: trades.length,
    });
  } catch (error) {
    console.error("[Trading Activity API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trading activity" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "Unknown";

  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return past.toLocaleDateString();
}
