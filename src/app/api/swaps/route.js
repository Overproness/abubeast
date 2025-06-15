import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import SwapHistory from "@/models/SwapHistory";
import { NextResponse } from "next/server";

// POST endpoint to save a new swap transaction
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      fromToken,
      toToken,
      fromChain,
      toChain,
      fromAmount,
      toAmount,
      txHash,
    } = data;

    // Validate required fields
    if (!fromToken || !toToken || !fromChain || !fromAmount || !txHash) {
      return NextResponse.json(
        { error: "Missing required swap details" },
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

    // Create new swap history record
    const swap = new SwapHistory({
      userId: tokenData.userId,
      fromToken,
      toToken,
      fromChain,
      toChain,
      fromAmount,
      toAmount,
      txHash,
      status: "completed",
      timestamp: new Date(),
    });

    await swap.save();

    return NextResponse.json({
      success: true,
      message: "Swap transaction saved",
      swapId: swap._id,
    });
  } catch (error) {
    console.error("Error saving swap transaction:", error);
    return NextResponse.json(
      { error: "Failed to save swap transaction" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's swap history
export async function GET(request) {
  try {
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

    // Get user's swap history
    const swaps = await SwapHistory.find({ userId: tokenData.userId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      swaps,
    });
  } catch (error) {
    console.error("Error retrieving swap history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve swap history" },
      { status: 500 }
    );
  }
}
