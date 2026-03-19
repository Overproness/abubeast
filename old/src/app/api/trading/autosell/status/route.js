export const runtime = "nodejs";

/**
 * Auto-Sell Status API Route
 * GET /api/trading/autosell/status - Get current auto-sell configuration and status
 */

import { verifyToken } from "@/lib/auth/auth";
import { getTradingServices } from "@/initTradingBot";
import dbConnect from "@/lib/db/mongodb";
import TradingSettings from "@/models/TradingSettings";
import { NextResponse } from "next/server";

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

    // Get user's trading settings
    const settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      return NextResponse.json({
        success: true,
        autoSellEnabled: false,
        message: "No trading settings configured",
      });
    }

    // Get engine status
    const { autoSellEngine, unifiedMonitor } = getTradingServices();

    const engineStatus = {
      engineInitialized: !!autoSellEngine,
      monitorInitialized: !!unifiedMonitor,
      monitoredTokensCount: unifiedMonitor
        ? unifiedMonitor.getMonitoredTokensCount()
        : 0,
    };

    return NextResponse.json({
      success: true,
      autoSellEnabled: settings.autoSell.enabled,
      triggers: settings.autoSell.triggers,
      emergencySellSettings: {
        devSellThreshold: settings.autoSell.triggers.devSell?.threshold,
        whaleSellThreshold: settings.autoSell.triggers.whaleSell?.threshold,
        rugPullProtection: settings.autoSell.triggers.rugPull?.enabled,
      },
      stopLoss: {
        enabled: settings.autoSell.triggers.stopLoss?.enabled,
        percentage: settings.autoSell.triggers.stopLoss?.percentage,
      },
      takeProfit: {
        enabled: settings.autoSell.triggers.takeProfit?.enabled,
        percentage: settings.autoSell.triggers.takeProfit?.percentage,
      },
      engineStatus,
    });
  } catch (error) {
    console.error("Error fetching auto-sell status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trading/autosell/status - Update auto-sell configuration
 */
export async function PUT(request) {
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

    const body = await request.json();
    await dbConnect();

    // Get or create user's trading settings
    let settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      settings = new TradingSettings({
        userId: tokenData.id,
      });
    }

    // Update auto-sell settings
    if (typeof body.enabled !== "undefined") {
      settings.autoSell.enabled = body.enabled;
    }

    if (body.triggers) {
      if (body.triggers.devSell) {
        settings.autoSell.triggers.devSell = {
          ...settings.autoSell.triggers.devSell,
          ...body.triggers.devSell,
        };
      }
      if (body.triggers.whaleSell) {
        settings.autoSell.triggers.whaleSell = {
          ...settings.autoSell.triggers.whaleSell,
          ...body.triggers.whaleSell,
        };
      }
      if (body.triggers.rugPull) {
        settings.autoSell.triggers.rugPull = {
          ...settings.autoSell.triggers.rugPull,
          ...body.triggers.rugPull,
        };
      }
      if (body.triggers.stopLoss) {
        settings.autoSell.triggers.stopLoss = {
          ...settings.autoSell.triggers.stopLoss,
          ...body.triggers.stopLoss,
        };
      }
      if (body.triggers.takeProfit) {
        settings.autoSell.triggers.takeProfit = {
          ...settings.autoSell.triggers.takeProfit,
          ...body.triggers.takeProfit,
        };
      }
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Auto-sell settings updated successfully",
      settings: {
        enabled: settings.autoSell.enabled,
        triggers: settings.autoSell.triggers,
      },
    });
  } catch (error) {
    console.error("Error updating auto-sell settings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
