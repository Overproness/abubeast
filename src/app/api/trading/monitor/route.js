/**
 * Auto-Sell Monitor API Routes
 * POST /api/trading/monitor/add - Add token to monitoring
 * DELETE /api/trading/monitor/remove - Remove token from monitoring
 * GET /api/trading/monitor/list - List monitored tokens
 */

import { getTradingServices } from "@/initTradingBot";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      token_mint,
      token_pair_addr,
      token_account,
      liquidity_pool,
      metadata,
      triggers,
    } = body;

    if (!token_mint) {
      return NextResponse.json(
        { success: false, error: "token_mint is required" },
        { status: 400 }
      );
    }

    const { unifiedMonitor } = getTradingServices();

    if (!unifiedMonitor) {
      return NextResponse.json(
        { success: false, error: "Monitor not initialized" },
        { status: 503 }
      );
    }

    const success = await unifiedMonitor.addToken(
      token_mint,
      token_pair_addr,
      token_account,
      liquidity_pool,
      metadata,
      triggers
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Token ${token_mint} added to monitoring`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to add token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error adding token to monitor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token_mint = searchParams.get("token_mint");

    if (!token_mint) {
      return NextResponse.json(
        { success: false, error: "token_mint is required" },
        { status: 400 }
      );
    }

    const { unifiedMonitor } = getTradingServices();

    if (!unifiedMonitor) {
      return NextResponse.json(
        { success: false, error: "Monitor not initialized" },
        { status: 503 }
      );
    }

    await unifiedMonitor.removeToken(token_mint);

    return NextResponse.json({
      success: true,
      message: `Token ${token_mint} removed from monitoring`,
    });
  } catch (error) {
    console.error("Error removing token from monitor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { unifiedMonitor } = getTradingServices();

    if (!unifiedMonitor) {
      return NextResponse.json(
        { success: false, error: "Monitor not initialized" },
        { status: 503 }
      );
    }

    const tokens = unifiedMonitor.getMonitoredTokens();

    return NextResponse.json({
      success: true,
      tokens,
      count: tokens.length,
    });
  } catch (error) {
    console.error("Error listing monitored tokens:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
