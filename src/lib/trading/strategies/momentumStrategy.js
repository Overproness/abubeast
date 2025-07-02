/**
 * Momentum Strategy - Technical momentum analysis
 * ABUBOT Momentum Strategy Implementation
 */

import { TRADING_CONFIG, TRADING_STRATEGIES } from '../config.js';

export class MomentumStrategy {
    constructor() {
        this.name = TRADING_STRATEGIES.MOMENTUM.name;
        this.type = TRADING_STRATEGIES.MOMENTUM.type;
        this.config = TRADING_STRATEGIES.MOMENTUM;

        this.period = this.config.period; // 14
        this.buyThreshold = this.config.buyThreshold; // 0.05 (5%)
        this.sellThreshold = this.config.sellThreshold; // 0.03 (3%)
    }

    /**
     * Analyze token using momentum indicators
     */
    async analyzeToken(tokenData) {
        try {
            const analysis = {
                token: tokenData,
                timestamp: Date.now(),
                momentum: 0,
                rsi: 0,
                priceVelocity: 0,
                volumeMomentum: 0,
                confidence: 0,
                recommendation: null
            };

            // Calculate momentum indicators
            analysis.momentum = this.calculateMomentum(tokenData);
            analysis.rsi = this.calculateRSI(tokenData);
            analysis.priceVelocity = this.calculatePriceVelocity(tokenData);
            analysis.volumeMomentum = this.calculateVolumeMomentum(tokenData);

            // Calculate confidence score
            analysis.confidence = this.calculateConfidence(analysis);

            // Generate recommendation
            analysis.recommendation = this.generateMomentumRecommendation(analysis);

            return analysis;

        } catch (error) {
            console.error('[MomentumStrategy] Analysis error:', error);
            return {
                token: tokenData,
                error: error.message,
                recommendation: { action: 'AVOID', reason: 'Momentum analysis failed' }
            };
        }
    }

    /**
     * Calculate 14-period momentum
     */
    calculateMomentum(tokenData) {
        try {
            // Use 24h change as momentum proxy
            const change24h = tokenData.marketData?.change_24h || 0;

            // Normalize momentum to -1 to +1 range
            return Math.max(-1, Math.min(1, change24h / 100));

        } catch (error) {
            console.error('[MomentumStrategy] Momentum calculation error:', error);
            return 0;
        }
    }

    /**
     * Calculate RSI (Relative Strength Index)
     */
    calculateRSI(tokenData) {
        try {
            // Simplified RSI calculation using 24h change
            const change24h = tokenData.marketData?.change_24h || 0;

            // Convert change to RSI-like value
            if (change24h > 0) {
                return 50 + (change24h / 2); // Scale positive changes to 50-100
            } else {
                return 50 + (change24h / 2); // Scale negative changes to 0-50
            }

        } catch (error) {
            console.error('[MomentumStrategy] RSI calculation error:', error);
            return 50; // Neutral RSI
        }
    }

    /**
     * Calculate price velocity (rate of price change)
     */
    calculatePriceVelocity(tokenData) {
        try {
            // Use current price and 24h change to estimate velocity
            const price = tokenData.marketData?.price || 0;
            const change24h = tokenData.marketData?.change_24h || 0;

            if (price === 0) return 0;

            // Calculate velocity as price change per hour
            const velocity = (price * change24h / 100) / 24;

            // Normalize velocity
            return Math.max(-1, Math.min(1, velocity / price));

        } catch (error) {
            console.error('[MomentumStrategy] Price velocity calculation error:', error);
            return 0;
        }
    }

    /**
     * Calculate volume momentum
     */
    calculateVolumeMomentum(tokenData) {
        try {
            const volume24h = tokenData.marketData?.volume_24h || 0;
            const marketCap = tokenData.marketData?.market_cap || 0;

            if (marketCap === 0) return 0;

            // Volume to market cap ratio as momentum indicator
            const volumeRatio = volume24h / marketCap;

            // Normalize to 0-1 range
            return Math.min(1, volumeRatio * 10); // Scale by 10 for better range

        } catch (error) {
            console.error('[MomentumStrategy] Volume momentum calculation error:', error);
            return 0;
        }
    }

    /**
     * Calculate overall confidence score
     */
    calculateConfidence(analysis) {
        try {
            const factors = {
                momentum: Math.abs(analysis.momentum),
                rsi: analysis.rsi > 70 || analysis.rsi < 30 ? 1 : 0.5, // Extreme RSI = higher confidence
                priceVelocity: Math.abs(analysis.priceVelocity),
                volumeMomentum: analysis.volumeMomentum
            };

            // Weighted average of confidence factors
            const weights = {
                momentum: 0.4,
                rsi: 0.2,
                priceVelocity: 0.2,
                volumeMomentum: 0.2
            };

            let confidence = 0;
            Object.entries(factors).forEach(([factor, value]) => {
                confidence += value * weights[factor];
            });

            return Math.min(1, confidence);

        } catch (error) {
            console.error('[MomentumStrategy] Confidence calculation error:', error);
            return 0;
        }
    }

    /**
     * Generate momentum-based recommendation
     */
    generateMomentumRecommendation(analysis) {
        try {
            const recommendation = {
                action: 'HOLD',
                reason: 'No momentum signal',
                confidence: analysis.confidence,
                details: {
                    momentum: analysis.momentum,
                    rsi: analysis.rsi,
                    priceVelocity: analysis.priceVelocity,
                    volumeMomentum: analysis.volumeMomentum
                }
            };

            // Check buy conditions
            if (analysis.momentum >= this.buyThreshold) {
                if (analysis.rsi < 70 && analysis.volumeMomentum > 0.3) {
                    recommendation.action = 'BUY';
                    recommendation.reason = `Strong upward momentum (${Math.round(analysis.momentum * 100)}%)`;
                } else if (analysis.rsi >= 70) {
                    recommendation.action = 'HOLD';
                    recommendation.reason = 'Positive momentum but RSI overbought';
                } else {
                    recommendation.action = 'BUY_SMALL';
                    recommendation.reason = 'Moderate momentum with low volume';
                }
            }
            // Check sell/avoid conditions
            else if (analysis.momentum <= -this.sellThreshold) {
                recommendation.action = 'AVOID';
                recommendation.reason = `Strong downward momentum (${Math.round(analysis.momentum * 100)}%)`;
            }
            // Check for sideways momentum
            else if (Math.abs(analysis.momentum) < 0.01) {
                recommendation.action = 'HOLD';
                recommendation.reason = 'Sideways momentum - waiting for signal';
            }

            // Adjust confidence based on supporting indicators
            if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
                // Boost confidence if multiple indicators align
                if (analysis.priceVelocity > 0 && analysis.volumeMomentum > 0.5) {
                    recommendation.confidence = Math.min(1, recommendation.confidence * 1.2);
                }

                // Reduce confidence if RSI is extreme
                if (analysis.rsi > 80) {
                    recommendation.confidence *= 0.8;
                    recommendation.reason += ' (RSI warning)';
                }
            }

            // Add momentum-specific parameters
            if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
                recommendation.stopLoss = this.calculateMomentumStopLoss(analysis);
                recommendation.takeProfit = this.calculateMomentumTakeProfit(analysis);
                recommendation.positionSize = this.calculateMomentumPositionSize(analysis);
            }

            return recommendation;

        } catch (error) {
            console.error('[MomentumStrategy] Recommendation generation error:', error);
            return {
                action: 'AVOID',
                reason: 'Recommendation generation failed',
                confidence: 0
            };
        }
    }

    /**
     * Calculate momentum-based stop loss
     */
    calculateMomentumStopLoss(analysis) {
        // Base stop loss
        let stopLoss = -15; // 15%

        // Adjust based on momentum strength
        if (analysis.momentum > 0.1) {
            stopLoss = -10; // Tighter stop for strong momentum
        } else if (analysis.momentum < 0.05) {
            stopLoss = -20; // Wider stop for weak momentum
        }

        // Adjust based on volatility (RSI extreme levels)
        if (analysis.rsi > 75 || analysis.rsi < 25) {
            stopLoss -= 5; // Wider stop for high volatility
        }

        return Math.max(-25, stopLoss); // Max 25% stop loss
    }

    /**
     * Calculate momentum-based take profit
     */
    calculateMomentumTakeProfit(analysis) {
        // Base take profit levels
        let takeProfit = [25, 50]; // 25% and 50%

        // Adjust based on momentum strength
        if (analysis.momentum > 0.1) {
            takeProfit = [30, 75]; // Higher targets for strong momentum
        } else if (analysis.momentum < 0.05) {
            takeProfit = [15, 30]; // Lower targets for weak momentum
        }

        // Adjust based on volume momentum
        if (analysis.volumeMomentum > 0.7) {
            takeProfit = takeProfit.map(tp => tp * 1.2); // Boost for high volume
        }

        return takeProfit;
    }

    /**
     * Calculate momentum-based position size
     */
    calculateMomentumPositionSize(analysis) {
        // Base position size
        let baseSize = 1; // 1 SOL

        // Adjust based on confidence
        baseSize *= analysis.confidence;

        // Adjust based on momentum strength
        if (analysis.momentum > 0.1) {
            baseSize *= 1.5; // Larger position for strong momentum
        } else if (analysis.momentum < 0.05) {
            baseSize *= 0.7; // Smaller position for weak momentum
        }

        // Adjust based on volume momentum
        if (analysis.volumeMomentum > 0.5) {
            baseSize *= 1.2; // Boost for good volume
        }

        return {
            solAmount: Math.max(0.1, Math.min(3, baseSize)),
            reasoning: 'Momentum-based sizing',
            momentumAdjusted: true
        };
    }

    /**
     * Get momentum strategy performance metrics
     */
    getPerformanceMetrics() {
        return {
            strategy: this.name,
            type: this.type,
            parameters: {
                period: this.period,
                buyThreshold: this.buyThreshold,
                sellThreshold: this.sellThreshold
            },
            // These would be calculated from historical data
            winRate: 0,
            avgReturn: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            totalTrades: 0
        };
    }
}

export default MomentumStrategy;
