export const runtime = "nodejs";

/**
 * Swapper Manual Trade API Route
 * POST /api/trading/swapper/buy - Manual buy using session key (swapper logic)
 * POST /api/trading/swapper/sell - Manual sell using session key (swapper logic)
 */

import { verifyToken } from "@/lib/auth/auth";
import { SessionBasedSwapper } from "@/lib/trading/sessionBasedSwapper";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/swapper/buy - Execute manual buy trade
 */
export async function POST(request) {
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

    const body = await request.json();
    const { tokenMint, amountInSol, slippage, walletAddress, tokenData: tokenInfo } = body;

    // Validate required fields
    if (!tokenMint || !amountInSol || !walletAddress) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: tokenMint, amountInSol, walletAddress",
        },
        { status: 400 }
      );
    }

    // Use SessionBasedSwapper for buy
    const swapper = new SessionBasedSwapper();
    const result = await swapper.buyTokenForUser({
      userId: tokenData.id,
      walletAddress,
      tokenMint,
      amountInSol: parseFloat(amountInSol),
      slippage: slippage || 5,
      tokenData: tokenInfo || {},
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        signature: result.signature,
        amountOut: result.amountOut,
        tradeLogId: result.tradeLogId,
        message: "Buy trade executed successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Buy trade failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error executing buy trade:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
