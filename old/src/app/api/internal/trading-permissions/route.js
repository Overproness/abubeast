import dbConnect from "@/lib/db/mongodb";
import TradingPermission from "@/models/TradingPermission";
import { NextResponse } from "next/server";

// Secure internal API endpoint for trading permissions

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

    // Check if user has trading permission for this wallet
    const permission = await TradingPermission.findOne({
      userId,
      walletAddress: wallet.toLowerCase(),
      active: true,
    }).lean();

    return NextResponse.json({
      hasPermission: !!permission,
      permission: permission || null,
    });
  } catch (error) {
    console.error("Error checking trading permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
