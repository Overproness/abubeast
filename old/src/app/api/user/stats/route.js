import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import { calculateAndUpdateTradingStats, getRecentTradingActivity } from "@/lib/services/tradingStatsService";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Get user data
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Calculate fresh trading statistics
        const tradingStats = await calculateAndUpdateTradingStats(userId);

        // Get recent trading activity
        const recentActivity = await getRecentTradingActivity(userId);

        // Format stats for the frontend (matching the current hardcoded format)
        const stats = [
            {
                label: "Total Trades",
                value: tradingStats.totalTrades.toString(),
                change: "+12%", // You can calculate this from historical data
                color: "blue"
            },
            {
                label: "Win Rate",
                value: `${tradingStats.winRate.toFixed(1)}%`,
                change: "+2.1%", // You can calculate this from historical data
                color: "green"
            },
            {
                label: "Total Volume",
                value: `$${formatCurrency(tradingStats.totalVolume)}`,
                change: "+24%", // You can calculate this from historical data
                color: "purple",
            },
            {
                label: "Days Active",
                value: tradingStats.daysActive.toString(),
                change: "consecutive",
                color: "orange",
            },
        ];

        // Generate achievements based on trading stats
        const achievements = generateAchievements(tradingStats, user);

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                bio: user.bio || "",
                location: user.location || "",
                website: user.website || "",
                twitter: user.twitter || "",
                telegram: user.telegram || "",
                notifications: user.notifications || {
                    email: true,
                    trades: true,
                    security: true,
                    newsletter: false,
                },
            },
            stats,
            achievements,
            recentActivity,
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch user statistics" },
            { status: 500 }
        );
    }
}

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + "M";
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + "K";
    }
    return amount.toFixed(0);
}

/**
 * Generate achievements based on trading statistics
 * @param {Object} stats - Trading statistics
 * @param {Object} user - User object
 * @returns {Array} Array of achievements
 */
function generateAchievements(stats, user) {
    const achievements = [];

    // First Trade achievement
    achievements.push({
        title: "First Trade",
        description: "Completed your first automated trade",
        earned: stats.totalTrades > 0,
        date: stats.totalTrades > 0 ? "2024-10-15" : null,
    });

    // Profitable Week achievement
    achievements.push({
        title: "Profitable Week",
        description: "7 consecutive days of profits",
        earned: stats.daysActive >= 7 && stats.winRate > 50,
        date: stats.daysActive >= 7 && stats.winRate > 50 ? "2024-11-01" : null,
    });

    // High Roller achievement
    achievements.push({
        title: "High Roller",
        description: "Single trade over $1,000",
        earned: stats.totalVolume > 1000,
        date: stats.totalVolume > 1000 ? "2024-11-10" : null,
    });

    // Diamond Hands achievement
    achievements.push({
        title: "Diamond Hands",
        description: "Hold position for 30+ days",
        earned: false,
        progress: Math.min(stats.daysActive, 30),
    });

    // Diversified achievement
    achievements.push({
        title: "Diversified",
        description: "Trade 10+ different tokens",
        earned: false,
        progress: Math.min(stats.totalTrades, 10),
    });

    // Volume Trader achievement
    achievements.push({
        title: "Volume Trader",
        description: "Reach $100K total volume",
        earned: stats.totalVolume >= 100000,
        progress: Math.min(stats.totalVolume, 100000),
    });

    return achievements;
}
