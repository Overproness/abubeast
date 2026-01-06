/**
 * Swapper Manual Sell API Route
 * POST /api/trading/swapper/sell - Manual sell using session key (swapper logic)
 */

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionBasedAutoSell } from "@/lib/trading/sessionBasedAutoSell";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/swapper/sell - Execute manual sell trade
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tokenMint, sellPercentage, walletAddress } = body;

    // Validate required fields
    if (!tokenMint || !walletAddress) {
      return NextResponse.json(
        {
          error: "Missing required fields: tokenMint, walletAddress",
        },
        { status: 400 }
      );
    }

    // Use SessionBasedAutoSell for sell (it handles the sell logic)
    const autoSell = new SessionBasedAutoSell();
    const result = await autoSell.sellTokenForUser({
      userId: session.user.id,
      walletAddress,
      tokenMint,
      triggerType: "manual",
      triggerDetails: { source: "manual_swapper_api" },
      sellPercentage: sellPercentage || 100,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        signature: result.signature,
        amountSold: result.amountSold,
        solReceived: result.solReceived,
        message: "Sell trade executed successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Sell trade failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error executing sell trade:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
