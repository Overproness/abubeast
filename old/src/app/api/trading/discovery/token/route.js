/**
 * Token Discovery API Routes
 * GET /api/trading/discovery/token?address=... - Get token data
 * GET /api/trading/discovery/recent - Get recently discovered tokens
 */

import { getTradingServices } from "@/initTradingBot";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const poolAddress = searchParams.get("pool");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "address parameter is required" },
        { status: 400 }
      );
    }

    const { tokenDiscovery } = getTradingServices();

    if (!tokenDiscovery) {
      return NextResponse.json(
        { success: false, error: "Token discovery not initialized" },
        { status: 503 }
      );
    }

    const tokenData = await tokenDiscovery.getTokenData(address, poolAddress);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch token data" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tokenData,
    });
  } catch (error) {
    console.error("Error fetching token data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
