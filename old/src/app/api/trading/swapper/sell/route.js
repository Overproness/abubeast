export const runtime = "nodejs";

/**
 * Swapper Manual Sell API Route
 * POST /api/trading/swapper/sell - Manual sell using session key (swapper logic)
 */

import { verifyToken } from "@/lib/auth/auth";
import { SessionBasedAutoSell } from "@/lib/trading/sessionBasedAutoSell";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/swapper/sell - Execute manual sell trade
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
      userId: tokenData.id,
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
