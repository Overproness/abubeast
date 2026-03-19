export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import { getTradingBotEngine } from "@/lib/trading/tradingBotEngine";
import SessionKey from "@/models/SessionKey";
import TradingSettings from "@/models/TradingSettings";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/bot/start
 * Enable the trading bot for a user
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

    // Check if user has a valid session key
    const sessionKey = await SessionKey.findOne({
      userId: tokenData.id,
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (!sessionKey) {
      return NextResponse.json(
        {
          error: "No active session key found",
          message:
            "Please authorize a session key before enabling the trading bot",
          requiresSessionKey: true,
        },
        { status: 403 }
      );
    }

    // Check if session key has trading permissions
    if (!sessionKey.permissions.canTrade && !sessionKey.permissions.canSwap) {
      return NextResponse.json(
        {
          error: "Session key does not have trading permissions",
          message: "Your session key needs trading/swap permissions",
        },
        { status: 403 }
      );
    }

    // Get or create settings
    let settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      settings = new TradingSettings({
        userId: tokenData.id,
      });
    }

    // Enable bot
    settings.botEnabled = true;
    await settings.save();

    // Start the global bot engine if not already running
    const botEngine = getTradingBotEngine();
    if (!botEngine.isRunning) {
      await botEngine.start();
    }

    return NextResponse.json({
      success: true,
      message: "Trading bot started successfully",
      botEnabled: true,
    });
  } catch (error) {
    console.error("[Bot Start] Error:", error);
    return NextResponse.json(
      { error: "Failed to start trading bot", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trading/bot/start
 * Stop the automated trading bot
 */
export async function DELETE(request) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Stop both services
    await stopTokenMonitoring();
    await stopEmergencySellMonitoring();

    return NextResponse.json({
      success: true,
      message: "Trading bot stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping trading bot:", error);
    return NextResponse.json(
      { error: "Failed to stop trading bot" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trading/bot/start
 * Get trading bot status
 */
export async function GET(request) {
  try {
    const tokenMonitor = getTokenMonitor();
    const emergencySell = getEmergencySellService();

    return NextResponse.json({
      success: true,
      status: {
        tokenMonitoring: {
          running: tokenMonitor.isRunning,
          processedTokens: tokenMonitor.processedTokens.size,
        },
        emergencySell: {
          running: emergencySell.isRunning,
        },
      },
    });
  } catch (error) {
    console.error("Error getting trading bot status:", error);
    return NextResponse.json(
      { error: "Failed to get bot status" },
      { status: 500 }
    );
  }
}
