import dbConnect from "@/lib/db/mongodb";
import TradeLog from "@/models/TradeLog";
import TradingPermission from "@/models/TradingPermission";
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
    if (!data.userId || !data.walletAddress || !data.amountUSD) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find trading permission to get settings
    const permission = await TradingPermission.findOne({
      userId: data.userId,
      walletAddress: data.walletAddress.toLowerCase(),
      active: true,
    }).lean();

    if (!permission) {
      return NextResponse.json(
        { error: "No active trading permission found for this wallet" },
        { status: 404 }
      );
    }

    // Get max daily limit from settings
    const maxDailyLimit = permission.customSettings?.maxDailyInvestment || 500;

    // Calculate daily spent amount
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const logs = await TradeLog.find({
      userId: data.userId,
      walletAddress: data.walletAddress.toLowerCase(),
      timestamp: { $gte: oneDayAgo },
      automated: true,
    }).lean();

    const dailySpentAmount = logs.reduce((sum, log) => {
      return sum + (log.fromAmountUSD || 0);
    }, 0);

    // Check if new amount exceeds limit
    if (dailySpentAmount + data.amountUSD > maxDailyLimit) {
      return NextResponse.json(
        {
          error: "DAILY_LIMIT_EXCEEDED",
          message: `Daily limit (${maxDailyLimit}) would be exceeded`,
          currentSpent: dailySpentAmount,
          maxLimit: maxDailyLimit,
          remaining: maxDailyLimit - dailySpentAmount,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      currentSpent: dailySpentAmount,
      maxLimit: maxDailyLimit,
      remaining: maxDailyLimit - dailySpentAmount,
      newTransactionAmount: data.amountUSD,
      willExceedLimit: false,
    });
  } catch (error) {
    console.error("Error checking trade limits:", error);
    return NextResponse.json(
      { error: "Failed to check trade limits" },
      { status: 500 }
    );
  }
}
