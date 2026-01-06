/**
 * Auto-Sell History API Route
 * GET /api/trading/autosell/history - Get auto-sell execution history
 */

import { getTradingServices } from "@/initTradingBot";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const { autoSellEngine } = getTradingServices();

    if (!autoSellEngine) {
      return NextResponse.json(
        { success: false, error: "Auto-sell engine not initialized" },
        { status: 503 }
      );
    }

    const history = autoSellEngine.getSellHistory(limit);
    const recent = autoSellEngine.getRecentSells();

    return NextResponse.json({
      success: true,
      history,
      recentSells: recent,
      count: history.length,
    });
  } catch (error) {
    console.error("Error fetching auto-sell history:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
