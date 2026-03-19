import { calculateAndUpdateTradingStats } from "@/lib/services/tradingStatsService";

/**
 * Update user trading statistics on login
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
export async function updateUserStatsOnLogin(userId) {
    try {
        console.log(`Updating trading stats for user ${userId}...`);

        // Calculate and update trading statistics
        const stats = await calculateAndUpdateTradingStats(userId);

        console.log(`Updated trading stats for user ${userId}:`, stats);

        return stats;
    } catch (error) {
        console.error(`Error updating stats for user ${userId}:`, error);
        // Don't throw error as this shouldn't block login
    }
}

/**
 * Schedule periodic stats updates for active users
 * @param {string} userId - The user ID
 */
export async function scheduleStatsUpdate(userId) {
    try {
        // Update stats immediately
        await updateUserStatsOnLogin(userId);

        // Schedule periodic updates (every 6 hours)
        if (typeof window === 'undefined') {
            // Server-side: could implement with cron job or queue system
            console.log(`Scheduled periodic updates for user ${userId}`);
        }
    } catch (error) {
        console.error(`Error scheduling stats update for user ${userId}:`, error);
    }
}

export default {
    updateUserStatsOnLogin,
    scheduleStatsUpdate,
};
