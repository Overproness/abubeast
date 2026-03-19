/**
 * Swapper API Routes
 * POST /api/trading/swap/execute - Execute swap using user's session key
 * GET /api/trading/swap - Health check
 */

import { getTradingServices } from "@/initTradingBot";
import { getValidSessionKey } from "@/lib/trading/sessionKeyTrading";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      walletAddress,
      inputMint,
      outputMint,
      amount,
      slippageBps,
    } = body;

    if (!userId || !walletAddress || !inputMint || !outputMint || !amount) {
      return NextResponse.json(
        {
          success: false,
          error:
            "userId, walletAddress, inputMint, outputMint, and amount are required",
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

    const result = await swapperService.executeSwap(
      sessionKey,
      inputMint,
      outputMint,
      amount,
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
    console.error("Error executing swap:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { swapperService } = getTradingServices();

    if (!swapperService) {
      return NextResponse.json(
        { success: false, error: "Swapper service not initialized" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Swapper service active (session-based mode)",
      mode: "session-based",
    });
  } catch (error) {
    console.error("Error checking swapper status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
