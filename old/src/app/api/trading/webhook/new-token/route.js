export const runtime = "nodejs";

import { getTradingBotEngine } from "@/lib/trading/tradingBotEngine";
import { NextResponse } from "next/server";

/**
 * POST /api/trading/webhook/new-token
 * Webhook endpoint for receiving new token notifications from monitoring service
 *
 * Expected payload:
 * {
 *   "address": "token_mint_address",
 *   "name": "Token Name",
 *   "symbol": "SYMBOL",
 *   "price": 0.00001,
 *   "liquidity": 1000,
 *   "marketCap": 50000,
 *   "age": 300,
 *   "lpBurn": "50",
 *   "mintAuthority": false,
 *   "freezeAuthority": false,
 *   "dev": "developer_wallet",
 *   "exchange": "Raydium",
 *   "poolAddress": "pool_address"
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Verify webhook secret (optional but recommended)
    const webhookSecret = request.headers.get("x-webhook-secret");
    if (
      process.env.WEBHOOK_SECRET &&
      webhookSecret !== process.env.WEBHOOK_SECRET
    ) {
      console.warn("[New Token Webhook] Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!body.address || !body.symbol) {
      return NextResponse.json(
        { error: "Missing required fields: address, symbol" },
        { status: 400 }
      );
    }

    console.log(
      `[New Token Webhook] Received token: ${body.symbol} (${body.address})`
    );

    // Prepare token data
    const tokenData = {
      address: body.address,
      name: body.name || body.symbol,
      symbol: body.symbol,
      price: parseFloat(body.price) || 0,
      liquidity: parseFloat(body.liquidity) || 0,
      marketCap: parseFloat(body.marketCap) || 0,
      age: parseInt(body.age) || 0,
      lpBurn: body.lpBurn || "0",
      mintAuthority:
        body.mintAuthority === true || body.mintAuthority === "true",
      freezeAuthority:
        body.freezeAuthority === true || body.freezeAuthority === "true",
      dev: body.dev || "",
      exchange: body.exchange || "Unknown",
      poolAddress: body.poolAddress || "",
      // Additional metadata
      website: body.website || "",
      twitter: body.twitter || "",
      telegram: body.telegram || "",
    };

    // Get bot engine and process the token
    const botEngine = getTradingBotEngine();

    // Start engine if not running
    if (!botEngine.isRunning) {
      console.log("[New Token Webhook] Starting bot engine...");
      await botEngine.start();
    }

    // Process the new token
    await botEngine.processNewToken(tokenData);

    return NextResponse.json({
      success: true,
      message: "Token received and queued for processing",
      token: {
        address: tokenData.address,
        symbol: tokenData.symbol,
      },
    });
  } catch (error) {
    console.error("[New Token Webhook] Error:", error);
    return NextResponse.json(
      { error: "Failed to process token", details: error.message },
      { status: 500 }
    );
  }
}
