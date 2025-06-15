import dbConnect from "@/lib/db/mongodb";
import TradeError from "@/models/TradeError";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.userId || !data.walletAddress || !data.error) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create trade error entry for monitoring and debugging
    const tradeError = new TradeError({
      userId: data.userId,
      walletAddress: data.walletAddress.toLowerCase(),
      error: data.error,
      tradeInfo: data.tradeInfo || {},
      timestamp: data.timestamp || new Date(),
    });

    await tradeError.save();

    return NextResponse.json({
      success: true,
      errorId: tradeError._id,
    });
  } catch (error) {
    console.error("Error logging trade error:", error);
    return NextResponse.json(
      { error: "Failed to log trade error" },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching trade errors
export async function GET(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const walletAddress = searchParams.get("wallet");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: "User ID or wallet address required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build query based on provided parameters
    const query = {};
    if (userId) query.userId = userId;
    if (walletAddress) query.walletAddress = walletAddress.toLowerCase();

    // Get trade errors
    const errors = await TradeError.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      errors,
    });
  } catch (error) {
    console.error("Error fetching trade errors:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade errors" },
      { status: 500 }
    );
  }
}
