export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import { getTradingBotEngine } from "@/lib/trading/tradingBotEngine";
import TradeLog from "@/models/TradeLog";
import TradingSettings from "@/models/TradingSettings";
import { NextResponse } from "next/server";

/**
 * GET /api/trading/bot/status
 * Get trading bot status for user
 */
export async function GET(request) {
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

    await dbConnect();

    // Get user settings
    const settings = await TradingSettings.findOne({ userId: tokenData.id });

    if (!settings) {
      return NextResponse.json({
        success: true,
        botEnabled: false,
        message: "Bot not configured",
      });
    }

    // Reset daily stats if needed
    settings.resetDailyStatsIfNeeded();
    await settings.save();

    // Get recent trades
    const recentTrades = await TradeLog.find({
      userId: tokenData.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "tradeType tokenIn tokenOut amountIn amountOut signature status profitLoss createdAt"
      );

    // Get open positions
    const openPositions = await TradeLog.find({
      userId: tokenData.id,
      tradeType: "buy",
      status: "completed",
      "sellInfo.soldAt": { $exists: false },
    }).select("tokenOut amountOut tokenData createdAt");

    // Get bot engine status
    const botEngine = getTradingBotEngine();
    const engineStatus = botEngine.getStatus();

    return NextResponse.json({
      success: true,
      botEnabled: settings.botEnabled,
      stats: {
        totalTrades: settings.stats.totalTrades,
        todayTrades: settings.stats.todayTrades,
        todaySpent: settings.stats.todaySpent,
        totalProfit: settings.stats.totalProfit,
        totalLoss: settings.stats.totalLoss,
        winRate: settings.stats.winRate,
        lastTradeAt: settings.stats.lastTradeAt,
      },
      limits: {
        dailyTradesRemaining:
          settings.dailyLimits.maxTrades - settings.stats.todayTrades,
        dailySpendingRemaining:
          settings.dailyLimits.maxSpending - settings.stats.todaySpent,
      },
      recentTrades,
      openPositions: openPositions.map((p) => ({
        tokenMint: p.tokenOut,
        amount: p.amountOut,
        tokenData: p.tokenData,
        boughtAt: p.createdAt,
      })),
      engineStatus: {
        isRunning: engineStatus.isRunning,
        activeMonitors: engineStatus.activeMonitors,
        queueLength: engineStatus.queueLength,
      },
    });
  } catch (error) {
    console.error("[Bot Status] Error:", error);
    return NextResponse.json(
      { error: "Failed to get bot status", details: error.message },
      { status: 500 }
    );
  }
}
