/**
 * Token Discovery Configuration API Route
 * GET/PUT /api/trading/discovery/config - Configure token discovery and monitoring
 */

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTradingServices } from "@/initTradingBot";
import dbConnect from "@/lib/db/mongodb";
import TradingSettings from "@/models/TradingSettings";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get user's trading settings
    const settings = await TradingSettings.findOne({ userId: session.user.id });

    if (!settings) {
      return NextResponse.json({
        success: true,
        discoveryEnabled: false,
        message: "No trading settings configured",
      });
    }

    // Get discovery service status
    const { tokenDiscovery } = getTradingServices();

    return NextResponse.json({
      success: true,
      discoveryEnabled: settings.botEnabled,
      tokenFilters: settings.tokenFilters,
      perTradeLimits: settings.perTradeLimits,
      dailyLimits: settings.dailyLimits,
      serviceStatus: {
        initialized: !!tokenDiscovery,
        processedTokensCount: tokenDiscovery
          ? tokenDiscovery.getProcessedCount()
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching discovery config:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    // Get or create user's trading settings
    let settings = await TradingSettings.findOne({ userId: session.user.id });

    if (!settings) {
      settings = new TradingSettings({
        userId: session.user.id,
      });
    }

    // Update token filters
    if (body.tokenFilters) {
      settings.tokenFilters = {
        ...settings.tokenFilters,
        ...body.tokenFilters,
      };
    }

    // Update per-trade limits
    if (body.perTradeLimits) {
      settings.perTradeLimits = {
        ...settings.perTradeLimits,
        ...body.perTradeLimits,
      };
    }

    // Update daily limits
    if (body.dailyLimits) {
      settings.dailyLimits = {
        ...settings.dailyLimits,
        ...body.dailyLimits,
      };
    }

    // Update bot enabled status
    if (typeof body.enabled !== "undefined") {
      settings.botEnabled = body.enabled;
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Discovery settings updated successfully",
      settings: {
        botEnabled: settings.botEnabled,
        tokenFilters: settings.tokenFilters,
        perTradeLimits: settings.perTradeLimits,
        dailyLimits: settings.dailyLimits,
      },
    });
  } catch (error) {
    console.error("Error updating discovery config:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
