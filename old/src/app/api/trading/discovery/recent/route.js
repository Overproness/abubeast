/**
 * Recent Tokens API Route
 * GET /api/trading/discovery/recent - Get recently discovered tokens
 */

import { getTradingServices } from "@/initTradingBot";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const { tokenDiscovery } = getTradingServices();

    if (!tokenDiscovery) {
      return NextResponse.json(
        { success: false, error: "Token discovery not initialized" },
        { status: 503 }
      );
    }

    const tokens = await tokenDiscovery.getRecentTokens(limit);

    return NextResponse.json({
      success: true,
      tokens,
      count: tokens.length,
    });
  } catch (error) {
    console.error("Error fetching recent tokens:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
