import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Trade from "@/models/trade";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayStats, allTimeStats] = await Promise.all([
      // Today's aggregation
      Trade.aggregate([
        {
          $match: {
            userId: user.userId,
            createdAt: { $gte: todayStart },
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            tradesCount: { $sum: 1 },
            volume: { $sum: { $multiply: ["$fromAmount", "$priceAtExecution"] } },
            totalPnl: { $sum: { $ifNull: ["$pnl", 0] } },
            wins: {
              $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] },
            },
            withPnl: {
              $sum: { $cond: [{ $ifNull: ["$pnl", false] }, 1, 0] },
            },
          },
        },
      ]),
      // All-time win rate (trades with pnl data)
      Trade.aggregate([
        {
          $match: {
            userId: user.userId,
            status: "success",
            pnl: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            wins: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const today = todayStats[0] ?? {
      tradesCount: 0,
      volume: 0,
      totalPnl: 0,
      wins: 0,
      withPnl: 0,
    };

    const allTime = allTimeStats[0] ?? { total: 0, wins: 0 };

    const winRate =
      allTime.total > 0
        ? ((allTime.wins / allTime.total) * 100).toFixed(1)
        : null;

    const pnlToday =
      today.withPnl > 0
        ? `${today.totalPnl >= 0 ? "+" : ""}${today.totalPnl.toFixed(2)} SOL`
        : null;

    return NextResponse.json({
      tradesToday: today.tradesCount,
      volumeToday: today.volume,
      pnlToday,
      winRate,
    });
  } catch (error) {
    console.error("Trade stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
