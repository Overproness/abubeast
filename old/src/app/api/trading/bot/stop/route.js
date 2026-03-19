export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import TradingSettings from "@/models/TradingSettings";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/bot/stop
 * Disable the trading bot for a user
 */
export async function POST(request) {
  try {
    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData || !tokenData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get settings
    const settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      return NextResponse.json(
        { error: "Trading settings not found" },
        { status: 404 }
      );
    }

    // Disable bot
    settings.botEnabled = false;
    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Trading bot stopped successfully",
      botEnabled: false,
    });
  } catch (error) {
    console.error("[Bot Stop] Error:", error);
    return NextResponse.json(
      { error: "Failed to stop trading bot", details: error.message },
      { status: 500 }
    );
  }
}
