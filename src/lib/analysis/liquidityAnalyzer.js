/**
 * Liquidity Analyzer
 * Analyzes liquidity conditions for tokens
 */

export class LiquidityAnalyzer {
    constructor() {
        this.config = {
            minLiquidity: 10000,
            goodLiquidityThreshold: 100000
        };
    }

    /**
     * Analyze liquidity conditions for a token
     */
    async analyze(tokenData) {
        try {
            const analysis = {
                score: 0,
                depth: 0,
                spread: 0
            };

            // Extract liquidity information
            const liquidity = tokenData.marketData?.liquidity || tokenData.liquidity?.total || 0;
            const volume24h = tokenData.marketData?.volume_24h || tokenData.volume_24h || 0;
            const marketCap = tokenData.marketData?.market_cap || tokenData.market_cap || 0;

            // Calculate liquidity depth
            analysis.depth = liquidity;

            // Calculate liquidity score (0-1)
            if (liquidity >= this.config.goodLiquidityThreshold) {
                analysis.score = 0.9;
            } else if (liquidity >= this.config.minLiquidity) {
                analysis.score = 0.5 + (liquidity / this.config.goodLiquidityThreshold) * 0.4;
            } else {
                analysis.score = (liquidity / this.config.minLiquidity) * 0.5;
            }

            // Adjust score based on volume/liquidity ratio
            if (volume24h > 0 && liquidity > 0) {
                const turnoverRatio = volume24h / liquidity;
                if (turnoverRatio > 2) {
                    analysis.score *= 1.2; // High activity is good
                } else if (turnoverRatio < 0.1) {
                    analysis.score *= 0.8; // Low activity is concerning
                }
            }

            // Calculate spread approximation
            if (liquidity > 0) {
                analysis.spread = Math.max(0.001, 1 / Math.sqrt(liquidity));
            } else {
                analysis.spread = 0.1; // High spread for no liquidity
            }

            // Ensure score is within bounds
            analysis.score = Math.max(0, Math.min(1, analysis.score));

            return analysis;

        } catch (error) {
            console.error('[LiquidityAnalyzer] Analysis error:', error);
            return {
                score: 0.3, // Default low score
                depth: 0,
                spread: 0.05
            };
        }
    }
}

export default LiquidityAnalyzer;
