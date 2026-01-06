export const runtime = "nodejs";

import { getTradingBotEngine } from "@/lib/trading/tradingBotEngine";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/webhook/emergency
 * Webhook endpoint for receiving emergency sell events
 *
 * Expected payload:
 * {
 *   "tokenMint": "token_address",
 *   "eventType": "dev_sell" | "whale_sell" | "rug_pull",
 *   "eventData": {
 *     "walletAddress": "address_that_sold",
 *     "percentSold": 10.5,
 *     "amountSold": 1000000,
 *     "timestamp": 1234567890
 *   }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Verify webhook secret
    const webhookSecret = request.headers.get("x-webhook-secret");
    if (
      process.env.WEBHOOK_SECRET &&
      webhookSecret !== process.env.WEBHOOK_SECRET
    ) {
      console.warn("[Emergency Webhook] Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!body.tokenMint || !body.eventType) {
      return NextResponse.json(
        { error: "Missing required fields: tokenMint, eventType" },
        { status: 400 }
      );
    }

    console.log(
      `[Emergency Webhook] Received emergency event: ${body.eventType} for ${body.tokenMint}`
    );

    // Get bot engine
    const botEngine = getTradingBotEngine();

    if (!botEngine.isRunning) {
      console.warn("[Emergency Webhook] Bot engine not running");
      return NextResponse.json(
        {
          success: false,
          message: "Bot engine is not running",
        },
        { status: 503 }
      );
    }

    // Handle emergency event
    await botEngine.handleEmergencyEvent({
      tokenMint: body.tokenMint,
      eventType: body.eventType,
      eventData: body.eventData || {},
    });

    return NextResponse.json({
      success: true,
      message: "Emergency event processed",
      tokenMint: body.tokenMint,
      eventType: body.eventType,
    });
  } catch (error) {
    console.error("[Emergency Webhook] Error:", error);
    return NextResponse.json(
      { error: "Failed to process emergency event", details: error.message },
      { status: 500 }
    );
  }
}
