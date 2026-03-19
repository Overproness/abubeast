import dbConnect from "@/lib/db/mongodb";
import TradingPermission from "@/models/TradingPermission";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const wallet = searchParams.get("wallet");

    if (!userId || !wallet) {
      return NextResponse.json(
        { error: "User ID and wallet address are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get trading settings for this user and wallet
    const permission = await TradingPermission.findOne({
      userId,
      walletAddress: wallet.toLowerCase(),
      active: true,
    }).lean();

    if (!permission) {
      return NextResponse.json(
        { error: "No trading permission found" },
        { status: 404 }
      );
    }

    // Return settings with defaults for missing values
    const settings = {
      strategy: permission.tradingStrategy || "moderate",
      maxInvestmentPerToken:
        permission.customSettings?.maxInvestmentPerToken || 100,
      maxDailyInvestment: permission.customSettings?.maxDailyInvestment || 500,
      stopLossPercentage: permission.customSettings?.stopLossPercentage || 15,
      takeProfitPercentage:
        permission.customSettings?.takeProfitPercentage || 25,
      allowedTokens: permission.customSettings?.allowedTokens || "verified",
      slippageTolerance: permission.customSettings?.slippageTolerance || 0.5,
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching trading settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
