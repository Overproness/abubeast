/**
 * Buy Token API Route
 * POST /api/trading/swap/buy - Buy token with SOL using user's session key
 */

import { getTradingServices } from "@/initTradingBot";
import { getValidSessionKey } from "@/lib/trading/sessionKeyTrading";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, walletAddress, tokenMint, solAmount, slippageBps } = body;

    if (!userId || !walletAddress || !tokenMint || !solAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, walletAddress, tokenMint, and solAmount are required",
        },
        { status: 400 }
      );
    }

    // Get user's valid session key
    const sessionKey = await getValidSessionKey(userId, walletAddress);

    if (!sessionKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid session key found. Please authorize trading first.",
        },
        { status: 403 }
      );
    }

    const { swapperService } = getTradingServices();

    if (!swapperService) {
      return NextResponse.json(
        { success: false, error: "Swapper service not initialized" },
        { status: 503 }
      );
    }

    const result = await swapperService.buyToken(
      sessionKey,
      tokenMint,
      solAmount,
      slippageBps || 1000
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error buying token:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
