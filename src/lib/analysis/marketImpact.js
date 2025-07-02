/**
 * Market Impact Analyzer
 * Analyzes the market impact of trading activities
 */

export class MarketImpactAnalyzer {
    constructor() {
        this.config = {
            slippageThreshold: 0.05,
            impactThreshold: 0.1
        };
    }

    /**
     * Analyze market impact for a token
     */
    async analyze(tokenData) {
        try {
            const impact = {
                impact: 0,
                slippage: 0,
                priceImpact: 0
            };

            // Calculate based on liquidity and volume
            const liquidity = tokenData.marketData?.liquidity || tokenData.liquidity?.total || 0;
            const volume24h = tokenData.marketData?.volume_24h || tokenData.volume_24h || 0;

            if (liquidity > 0 && volume24h > 0) {
                // Simple impact calculation
                impact.impact = Math.min(0.2, volume24h / liquidity);
                impact.slippage = impact.impact * 0.4;
                impact.priceImpact = impact.impact * 0.6;
            }

            return impact;

        } catch (error) {
            console.error('[MarketImpactAnalyzer] Analysis error:', error);
            return {
                impact: 0.1, // Default moderate impact
                slippage: 0.04,
                priceImpact: 0.06
            };
        }
    }
}

export default MarketImpactAnalyzer;
