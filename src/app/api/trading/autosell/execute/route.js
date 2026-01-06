/**
 * Manual Auto-Sell Execution API Route
 * POST /api/trading/autosell/execute - Manually trigger auto-sell for a token using session key
 */

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionBasedAutoSell } from "@/lib/trading/sessionBasedAutoSell";
import { getValidSessionKey } from "@/lib/trading/sessionKeyTrading";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tokenMint,
      walletAddress,
      triggerType,
      triggerDetails,
      sellPercentage,
    } = body;

    // Validate required fields
    if (!tokenMint || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: tokenMint, walletAddress" },
        { status: 400 }
      );
    }

    // Get user's valid session key
    const sessionKey = await getValidSessionKey(session.user.id, walletAddress);

    if (!sessionKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid session key found. Please authorize trading first.",
        },
        { status: 403 }
      );
    }

    // Check permissions
    if (!sessionKey.permissions.canTrade && !sessionKey.permissions.canSwap) {
      return NextResponse.json(
        {
          success: false,
          error: "Session key does not have trading permissions",
        },
        { status: 403 }
      );
    }

    // Execute auto-sell
    const autoSell = new SessionBasedAutoSell();
    const result = await autoSell.sellTokenForUser({
      userId: session.user.id,
      walletAddress,
      tokenMint,
      triggerType: triggerType || "manual",
      triggerDetails: triggerDetails || { source: "manual_api_call" },
      sellPercentage: sellPercentage || 100,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        signature: result.signature,
        amountSold: result.amountSold,
        solReceived: result.solReceived,
        message: "Auto-sell executed successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Auto-sell execution failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error executing auto-sell:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
