import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import TradingPermission from "@/models/TradingPermission";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { walletAddress, settings } = await request.json();

    // Validate input
    if (!walletAddress || !settings) {
      return NextResponse.json(
        { error: "Wallet address and settings are required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Check if trading permission exists
    const permission = await TradingPermission.findOne({
      userId: tokenData.userId,
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!permission) {
      return NextResponse.json(
        { error: "No trading permission found for this wallet" },
        { status: 404 }
      );
    }

    // Validate settings
    const validatedSettings = {
      strategy: ["conservative", "moderate", "aggressive", "custom"].includes(
        settings.strategy
      )
        ? settings.strategy
        : "moderate",
      allowedTokens: ["all", "verified", "trending", "whitelisted"].includes(
        settings.allowedTokens
      )
        ? settings.allowedTokens
        : "all",
      maxInvestmentPerToken:
        Number(settings.maxInvestmentPerToken) > 0
          ? Number(settings.maxInvestmentPerToken)
          : 100,
      maxDailyInvestment:
        Number(settings.maxDailyInvestment) > 0
          ? Number(settings.maxDailyInvestment)
          : 500,
      stopLossPercentage:
        Number(settings.stopLossPercentage) > 0
          ? Number(settings.stopLossPercentage)
          : 15,
      takeProfitPercentage:
        Number(settings.takeProfitPercentage) > 0
          ? Number(settings.takeProfitPercentage)
          : 25,
    };

    // Update the trading permission
    permission.tradingStrategy = validatedSettings.strategy;
    permission.customSettings = validatedSettings;
    permission.updatedAt = new Date();

    // Add to audit log
    permission.auditLog.push({
      action: "settings_updated",
      timestamp: new Date(),
      details: validatedSettings,
    });

    await permission.save();

    return NextResponse.json({
      success: true,
      message: "Trading settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating trading settings:", error);
    return NextResponse.json(
      { error: "Failed to update trading settings" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get trading settings for this wallet
    const permission = await TradingPermission.findOne({
      userId: tokenData.userId,
      walletAddress: walletAddress.toLowerCase(),
    }).lean();

    if (!permission) {
      return NextResponse.json(
        { error: "No trading permission found for this wallet" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: permission.customSettings || {},
      strategy: permission.tradingStrategy,
    });
  } catch (error) {
    console.error("Error fetching trading settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch trading settings" },
      { status: 500 }
    );
  }
}
