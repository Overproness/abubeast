export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import TradeLog from "@/models/TradeLog";
import { NextResponse } from "next/server";

/**
 * GET /api/trading/history
 * Get trading history for the authenticated user
 */
export async function GET(request) {
  try {
    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const tradeType = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    // Build query
    const query = { userId: tokenData.userId };

    if (tradeType) {
      query.tradeType = tradeType;
    }

    if (status) {
      query.status = status;
    }

    // Fetch trades
    const trades = await TradeLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Calculate statistics
    const stats = {
      totalTrades: trades.length,
      successfulTrades: trades.filter((t) => t.status === "completed").length,
      failedTrades: trades.filter((t) => t.status === "failed").length,
      totalVolume: trades
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + (t.inputAmount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      trades,
      stats,
    });
  } catch (error) {
    console.error("Error fetching trading history:", error);
    return NextResponse.json(
      { error: "Failed to fetch trading history" },
      { status: 500 }
    );
  }
}
