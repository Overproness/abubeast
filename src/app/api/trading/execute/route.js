export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import {
  executeTradeWithSessionKey,
  getSessionKeyStatus,
} from "@/lib/trading/sessionKeyTrading";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/execute
 * Execute a trade using session key
 * This endpoint demonstrates how to integrate session keys with your trading logic
 */
export async function POST(request) {
  try {
    const {
      walletAddress,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
      slippage = 1,
    } = await request.json();

    // Validate input
    if (!walletAddress || !tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json(
        { error: "Missing required trade parameters" },
        { status: 400 }
      );
    }

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

    // Check if user has a valid session key
    const sessionKeyStatus = await getSessionKeyStatus(
      tokenData.id,
      walletAddress
    );

    if (!sessionKeyStatus.hasSessionKey || !sessionKeyStatus.isValid) {
      return NextResponse.json(
        {
          error: "No valid session key found",
          message: "Please authorize a session key to enable automated trading",
          requiresAuthorization: true,
        },
        { status: 403 }
      );
    }

    // Check if the session key has trading permission
    if (!sessionKeyStatus.permissions.canTrade) {
      return NextResponse.json(
        { error: "Session key does not have trading permission" },
        { status: 403 }
      );
    }

    // Check spending limits
    if (sessionKeyStatus.remainingDailyLimit !== null) {
      if (amountIn > sessionKeyStatus.remainingDailyLimit) {
        return NextResponse.json(
          {
            error: "Trade exceeds daily spending limit",
            remainingLimit: sessionKeyStatus.remainingDailyLimit,
          },
          { status: 403 }
        );
      }
    }

    // Execute the trade using session key
    const tradeResult = await executeTradeWithSessionKey({
      userId: tokenData.id,
      walletAddress,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
      slippage,
    });

    return NextResponse.json({
      success: true,
      trade: tradeResult,
      sessionKeyStatus: {
        expiresAt: sessionKeyStatus.expiresAt,
        remainingDailyLimit: sessionKeyStatus.remainingDailyLimit,
        transactionsCount: sessionKeyStatus.usageStats.transactionsCount + 1,
      },
    });
  } catch (error) {
    console.error("Error executing trade:", error);
    return NextResponse.json(
      {
        error: "Failed to execute trade",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trading/execute
 * Get trading status and session key info
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

    // Get wallet address from query params
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get session key status
    const sessionKeyStatus = await getSessionKeyStatus(
      tokenData.id,
      walletAddress
    );

    return NextResponse.json({
      success: true,
      canTrade: sessionKeyStatus.hasSessionKey && sessionKeyStatus.isValid,
      sessionKey: sessionKeyStatus,
    });
  } catch (error) {
    console.error("Error getting trading status:", error);
    return NextResponse.json(
      { error: "Failed to get trading status" },
      { status: 500 }
    );
  }
}
