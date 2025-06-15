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
    if (!data.walletAddress || !data.txHash) {
      return NextResponse.json(
        { error: "Wallet address and transaction hash are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the trading permission to get the user ID
    const permission = await TradingPermission.findOne({
      walletAddress: data.walletAddress.toLowerCase(),
      active: true,
    });

    if (!permission) {
      return NextResponse.json(
        { error: "No active trading permission found for this wallet" },
        { status: 404 }
      );
    }

    // Create trade log entry
    const tradeLog = new TradeLog({
      userId: permission.userId,
      walletAddress: data.walletAddress.toLowerCase(),
      txHash: data.txHash,
      fromToken: data.fromToken,
      toToken: data.toToken,
      fromAmount: data.fromAmount,
      toAmount: data.toAmount || null,
      expectedToAmount: data.expectedToAmount || null,
      status: data.status || "completed",
      timestamp: data.timestamp || new Date(),
      chainId: data.chainId || null,
      gasUsed: data.gasUsed || null,
      gasCostUSD: data.gasCostUSD || null,
    });

    await tradeLog.save();

    // Update trading permission with latest trade info
    permission.tradesExecuted += 1;
    permission.lastTradeAt = new Date();
    await permission.save();

    return NextResponse.json({
      success: true,
      logId: tradeLog._id,
    });
  } catch (error) {
    console.error("Error logging trade:", error);
    return NextResponse.json({ error: "Failed to log trade" }, { status: 500 });
  }
}

// GET endpoint for fetching trade logs
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

    // Get trade logs
    const logs = await TradeLog.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Error fetching trade logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade logs" },
      { status: 500 }
    );
  }
}
