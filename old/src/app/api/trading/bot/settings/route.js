export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import TradingSettings from "@/models/TradingSettings";
import { NextResponse } from "next/server";

/**
 * GET /api/trading/bot/settings
 * Get user's trading bot settings
 */
export async function GET(request) {
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

    // Get or create settings
    let settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      // Create default settings
      settings = new TradingSettings({
        userId: tokenData.id,
        strategy: "moderate",
      });
      await settings.save();
    }

    // Reset daily stats if needed
    settings.resetDailyStatsIfNeeded();
    await settings.save();

    return NextResponse.json({
      success: true,
      settings: {
        botEnabled: settings.botEnabled,
        strategy: settings.strategy,
        perTradeLimits: settings.perTradeLimits,
        dailyLimits: settings.dailyLimits,
        tokenFilters: settings.tokenFilters,
        autoSell: settings.autoSell,
        riskManagement: settings.riskManagement,
        stats: settings.stats,
        notifications: settings.notifications,
      },
    });
  } catch (error) {
    console.error("[Bot Settings GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to get bot settings", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trading/bot/settings
 * Update user's trading bot settings
 */
export async function PUT(request) {
  try {
    const body = await request.json();

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

    // Get or create settings
    let settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      settings = new TradingSettings({
        userId: tokenData.id,
      });
    }

    // Update settings
    if (body.strategy !== undefined) {
      settings.strategy = body.strategy;

      // Apply default settings for strategy if requested
      if (body.applyDefaults) {
        const defaults = TradingSettings.getDefaultsForStrategy(body.strategy);
        Object.assign(settings.perTradeLimits, defaults.perTradeLimits);
        Object.assign(settings.dailyLimits, defaults.dailyLimits);
        Object.assign(settings.tokenFilters, defaults.tokenFilters);
        Object.assign(settings.autoSell, defaults.autoSell);
      }
    }

    if (body.perTradeLimits) {
      Object.assign(settings.perTradeLimits, body.perTradeLimits);
    }

    if (body.dailyLimits) {
      Object.assign(settings.dailyLimits, body.dailyLimits);
    }

    if (body.tokenFilters) {
      Object.assign(settings.tokenFilters, body.tokenFilters);
    }

    if (body.autoSell) {
      Object.assign(settings.autoSell, body.autoSell);
    }

    if (body.riskManagement) {
      Object.assign(settings.riskManagement, body.riskManagement);
    }

    if (body.notifications) {
      Object.assign(settings.notifications, body.notifications);
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        botEnabled: settings.botEnabled,
        strategy: settings.strategy,
        perTradeLimits: settings.perTradeLimits,
        dailyLimits: settings.dailyLimits,
        tokenFilters: settings.tokenFilters,
        autoSell: settings.autoSell,
        riskManagement: settings.riskManagement,
        notifications: settings.notifications,
      },
    });
  } catch (error) {
    console.error("[Bot Settings PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update bot settings", details: error.message },
      { status: 500 }
    );
  }
}
