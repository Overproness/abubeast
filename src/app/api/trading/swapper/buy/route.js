/**
 * Swapper Manual Trade API Route
 * POST /api/trading/swapper/buy - Manual buy using session key (swapper logic)
 * POST /api/trading/swapper/sell - Manual sell using session key (swapper logic)
 */

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionBasedSwapper } from "@/lib/trading/sessionBasedSwapper";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/swapper/buy - Execute manual buy trade
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tokenMint, amountInSol, slippage, walletAddress, tokenData } = body;

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
      userId: session.user.id,
      walletAddress,
      tokenMint,
      amountInSol: parseFloat(amountInSol),
      slippage: slippage || 5,
      tokenData: tokenData || {},
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
