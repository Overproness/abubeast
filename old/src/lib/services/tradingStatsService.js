import dbConnect from "@/lib/db/mongodb";
import TradeLog from "@/models/TradeLog";
import User from "@/models/User";

/**
 * Calculate and update trading statistics for a user
 * @param {string} userId - The user ID
 * @returns {Object} Updated trading statistics
 */
export async function calculateAndUpdateTradingStats(userId) {
    try {
        await dbConnect();

        // Get user to access their wallet addresses
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Get all wallet addresses for this user
        const walletAddresses = user.wallets.map(wallet => wallet.address.toLowerCase());

        if (walletAddresses.length === 0) {
            // No wallets connected, return default stats
            return {
                totalTrades: 0,
                winRate: 0,
                totalVolume: 0,
                daysActive: 0,
            };
        }

        // Calculate statistics from trade logs
        const stats = await calculateTradingStatistics(userId, walletAddresses);

        // Update user's trading stats
        await User.findByIdAndUpdate(userId, {
            'tradingStats.totalTrades': stats.totalTrades,
            'tradingStats.winRate': stats.winRate,
            'tradingStats.totalVolume': stats.totalVolume,
            'tradingStats.daysActive': stats.daysActive,
            'tradingStats.lastUpdated': new Date(),
        });

        return stats;
    } catch (error) {
        console.error("Error calculating trading stats:", error);
        throw error;
    }
}

/**
 * Calculate trading statistics from trade logs
 * @param {string} userId - The user ID
 * @param {string[]} walletAddresses - Array of wallet addresses
 * @returns {Object} Trading statistics
 */
async function calculateTradingStatistics(userId, walletAddresses) {
    try {
        // Get all completed trades for this user
        const trades = await TradeLog.find({
            userId,
            walletAddress: { $in: walletAddresses },
            status: "completed"
        }).sort({ timestamp: 1 });

        if (trades.length === 0) {
            return {
                totalTrades: 0,
                winRate: 0,
                totalVolume: 0,
                daysActive: 0,
            };
        }

        // Calculate total trades
        const totalTrades = trades.length;

        // Calculate win rate (trades with positive profit)
        const profitableTrades = trades.filter(trade => (trade.profitUSD || 0) > 0);
        const winRate = totalTrades > 0 ? (profitableTrades.length / totalTrades) * 100 : 0;

        // Calculate total volume (sum of all trade amounts in USD)
        const totalVolume = trades.reduce((sum, trade) => {
            // Use gasCostUSD as a proxy for trade volume if available
            // In a real implementation, you'd calculate the actual USD value of the trade
            const tradeValue = trade.gasCostUSD || 0;
            return sum + tradeValue;
        }, 0);

        // Calculate days active (unique days with trades)
        const tradeDates = trades.map(trade =>
            new Date(trade.timestamp).toDateString()
        );
        const uniqueDays = [...new Set(tradeDates)];
        const daysActive = uniqueDays.length;

        return {
            totalTrades,
            winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal place
            totalVolume: Math.round(totalVolume * 100) / 100, // Round to 2 decimal places
            daysActive,
        };
    } catch (error) {
        console.error("Error calculating trading statistics:", error);
        throw error;
    }
}

/**
 * Get recent trading activity for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Number of recent activities to return
 * @returns {Array} Array of recent trading activities
 */
export async function getRecentTradingActivity(userId, limit = 6) {
    try {
        await dbConnect();

        // Get user to access their wallet addresses
        const user = await User.findById(userId);
        if (!user || user.wallets.length === 0) {
            return [];
        }

        const walletAddresses = user.wallets.map(wallet => wallet.address.toLowerCase());

        // Get recent trades
        const trades = await TradeLog.find({
            userId,
            walletAddress: { $in: walletAddresses },
            status: "completed"
        })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        // Transform trades into activity format
        return trades.map(trade => {
            const profit = trade.profitUSD || 0;
            const isProfit = profit > 0;

            // Determine trade description
            let description = "";
            if (trade.tradeType === "buy") {
                description = `Bought ${formatTokenName(trade.toToken)} for $${formatAmount(trade.gasCostUSD || 0)}`;
            } else if (trade.tradeType === "sell") {
                description = `Sold ${formatTokenName(trade.fromToken)} for $${formatAmount(trade.gasCostUSD || 0)}`;
            } else {
                description = `Swapped ${formatTokenName(trade.fromToken)} for ${formatTokenName(trade.toToken)}`;
            }

            return {
                type: "trade",
                description,
                time: formatTimeAgo(trade.timestamp),
                profit: isProfit ? `+$${formatAmount(Math.abs(profit))}` : profit < 0 ? `-$${formatAmount(Math.abs(profit))}` : null,
            };
        });
    } catch (error) {
        console.error("Error getting recent trading activity:", error);
        return [];
    }
}

/**
 * Format token name from address (simplified version)
 * @param {string} tokenAddress - Token contract address
 * @returns {string} Formatted token name
 */
function formatTokenName(tokenAddress) {
    // In a real implementation, you'd look up the token symbol from a registry
    // For now, return a shortened version of the address
    if (!tokenAddress) return "UNKNOWN";

    // Common token mappings (you can expand this)
    const tokenMap = {
        "0xa0b86991c431e9c2be9a85bd0e8c71a9f1b6cc3d8": "USDC",
        "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
        "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
        // Add more token mappings as needed
    };

    return tokenMap[tokenAddress.toLowerCase()] || tokenAddress.slice(0, 8).toUpperCase();
}

/**
 * Format amount for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
function formatAmount(amount) {
    if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + "k";
    }
    return amount.toFixed(2);
}

/**
 * Format timestamp to relative time
 * @param {Date} timestamp - Timestamp to format
 * @returns {string} Formatted time ago
 */
function formatTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes < 1 ? "just now" : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
}

export default {
    calculateAndUpdateTradingStats,
    getRecentTradingActivity,
};
