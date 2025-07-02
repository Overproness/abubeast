/**
 * Risk Manager - Advanced risk management and assessment
 * ABUBOT Risk Management Component
 */

import { TRADING_CONFIG } from '../trading/config.js';

export class RiskManager {
    constructor() {
        this.config = TRADING_CONFIG.RISK_MANAGEMENT;
        this.riskLimits = new Map();
        this.portfolioRisk = new Map();
        this.activePositions = new Map();
    }

    /**
     * Assess overall risk for a token trade
     */
    async assessRisk(tokenData, analysisData = {}) {
        try {
            const riskAssessment = {
                overallRisk: 0,
                riskFactors: {},
                riskScore: 0,
                riskLevel: 'low',
                recommendations: [],
                positionSizeLimit: 1,
                stopLossRecommendation: this.config.DEFAULT_STOP_LOSS
            };

            // 1. Market Risk Assessment
            riskAssessment.riskFactors.market = await this.assessMarketRisk(tokenData);

            // 2. Liquidity Risk Assessment
            riskAssessment.riskFactors.liquidity = this.assessLiquidityRisk(tokenData);

            // 3. Volatility Risk Assessment
            riskAssessment.riskFactors.volatility = this.assessVolatilityRisk(tokenData);

            // 4. Security Risk Assessment
            riskAssessment.riskFactors.security = this.assessSecurityRisk(analysisData);

            // 5. Concentration Risk Assessment
            riskAssessment.riskFactors.concentration = await this.assessConcentrationRisk(tokenData);

            // 6. Calculate Overall Risk Score
            riskAssessment.riskScore = this.calculateOverallRiskScore(riskAssessment.riskFactors);
            riskAssessment.overallRisk = riskAssessment.riskScore / 100;

            // 7. Determine Risk Level
            riskAssessment.riskLevel = this.determineRiskLevel(riskAssessment.riskScore);

            // 8. Generate Risk Recommendations
            riskAssessment.recommendations = this.generateRiskRecommendations(riskAssessment);

            // 9. Calculate Position Size Limit
            riskAssessment.positionSizeLimit = this.calculatePositionSizeLimit(riskAssessment);

            // 10. Recommend Stop Loss
            riskAssessment.stopLossRecommendation = this.recommendStopLoss(riskAssessment);

            return riskAssessment;

        } catch (error) {
            console.error('[RiskManager] Risk assessment error:', error);
            return {
                overallRisk: 1,
                riskScore: 100,
                riskLevel: 'extreme',
                recommendations: ['Risk assessment failed - avoid trade'],
                error: error.message
            };
        }
    }

    /**
     * Assess market risk factors
     */
    async assessMarketRisk(tokenData) {
        const marketRisk = {
            score: 0,
            factors: {},
            level: 'low'
        };

        try {
            const marketData = tokenData.marketData || {};

            // Market Cap Risk
            const marketCap = marketData.market_cap || 0;
            if (marketCap < 100000) {
                marketRisk.factors.marketCap = { risk: 80, reason: 'Very low market cap' };
            } else if (marketCap < 1000000) {
                marketRisk.factors.marketCap = { risk: 60, reason: 'Low market cap' };
            } else if (marketCap < 10000000) {
                marketRisk.factors.marketCap = { risk: 30, reason: 'Medium market cap' };
            } else {
                marketRisk.factors.marketCap = { risk: 10, reason: 'High market cap' };
            }

            // Price Change Risk
            const change24h = Math.abs(marketData.change_24h || 0);
            if (change24h > 50) {
                marketRisk.factors.priceChange = { risk: 90, reason: 'Extreme price volatility' };
            } else if (change24h > 25) {
                marketRisk.factors.priceChange = { risk: 70, reason: 'High price volatility' };
            } else if (change24h > 10) {
                marketRisk.factors.priceChange = { risk: 40, reason: 'Moderate price volatility' };
            } else {
                marketRisk.factors.priceChange = { risk: 20, reason: 'Low price volatility' };
            }

            // Age Risk (for new tokens)
            const tokenAge = this.estimateTokenAge(tokenData);
            if (tokenAge < 86400000) { // Less than 1 day
                marketRisk.factors.age = { risk: 80, reason: 'Very new token' };
            } else if (tokenAge < 604800000) { // Less than 1 week
                marketRisk.factors.age = { risk: 50, reason: 'New token' };
            } else {
                marketRisk.factors.age = { risk: 20, reason: 'Established token' };
            }

            // Calculate average market risk
            const riskValues = Object.values(marketRisk.factors).map(f => f.risk);
            marketRisk.score = riskValues.reduce((sum, risk) => sum + risk, 0) / riskValues.length;

            marketRisk.level = marketRisk.score > 70 ? 'high' :
                marketRisk.score > 40 ? 'medium' : 'low';

            return marketRisk;

        } catch (error) {
            console.error('[RiskManager] Market risk assessment error:', error);
            return { score: 100, factors: {}, level: 'extreme' };
        }
    }

    /**
     * Assess liquidity risk
     */
    assessLiquidityRisk(tokenData) {
        const liquidityRisk = {
            score: 0,
            factors: {},
            level: 'low'
        };

        try {
            const marketData = tokenData.marketData || {};
            const volume24h = marketData.volume_24h || 0;
            const marketCap = marketData.market_cap || 0;

            // Volume to Market Cap Ratio
            const volumeRatio = marketCap > 0 ? volume24h / marketCap : 0;
            if (volumeRatio < 0.01) { // Less than 1%
                liquidityRisk.factors.volumeRatio = { risk: 80, reason: 'Very low trading volume' };
            } else if (volumeRatio < 0.05) { // Less than 5%
                liquidityRisk.factors.volumeRatio = { risk: 60, reason: 'Low trading volume' };
            } else if (volumeRatio < 0.2) { // Less than 20%
                liquidityRisk.factors.volumeRatio = { risk: 30, reason: 'Moderate trading volume' };
            } else {
                liquidityRisk.factors.volumeRatio = { risk: 10, reason: 'High trading volume' };
            }

            // Absolute Volume Risk
            if (volume24h < 1000) {
                liquidityRisk.factors.absoluteVolume = { risk: 90, reason: 'Extremely low volume' };
            } else if (volume24h < 10000) {
                liquidityRisk.factors.absoluteVolume = { risk: 70, reason: 'Low volume' };
            } else if (volume24h < 100000) {
                liquidityRisk.factors.absoluteVolume = { risk: 40, reason: 'Moderate volume' };
            } else {
                liquidityRisk.factors.absoluteVolume = { risk: 20, reason: 'Good volume' };
            }

            // Calculate average liquidity risk
            const riskValues = Object.values(liquidityRisk.factors).map(f => f.risk);
            liquidityRisk.score = riskValues.reduce((sum, risk) => sum + risk, 0) / riskValues.length;

            liquidityRisk.level = liquidityRisk.score > 70 ? 'high' :
                liquidityRisk.score > 40 ? 'medium' : 'low';

            return liquidityRisk;

        } catch (error) {
            console.error('[RiskManager] Liquidity risk assessment error:', error);
            return { score: 100, factors: {}, level: 'extreme' };
        }
    }

    /**
     * Assess volatility risk
     */
    assessVolatilityRisk(tokenData) {
        const volatilityRisk = {
            score: 0,
            factors: {},
            level: 'low'
        };

        try {
            const marketData = tokenData.marketData || {};
            const change24h = Math.abs(marketData.change_24h || 0);

            // 24h Change Volatility
            if (change24h > 100) {
                volatilityRisk.factors.change24h = { risk: 95, reason: 'Extreme volatility (>100%)' };
            } else if (change24h > 50) {
                volatilityRisk.factors.change24h = { risk: 80, reason: 'Very high volatility (>50%)' };
            } else if (change24h > 25) {
                volatilityRisk.factors.change24h = { risk: 60, reason: 'High volatility (>25%)' };
            } else if (change24h > 10) {
                volatilityRisk.factors.change24h = { risk: 40, reason: 'Moderate volatility (>10%)' };
            } else {
                volatilityRisk.factors.change24h = { risk: 20, reason: 'Low volatility' };
            }

            // Price Level Risk (very low prices can be more volatile)
            const price = marketData.price || 0;
            if (price < 0.00001) {
                volatilityRisk.factors.priceLevel = { risk: 70, reason: 'Extremely low price level' };
            } else if (price < 0.0001) {
                volatilityRisk.factors.priceLevel = { risk: 50, reason: 'Very low price level' };
            } else if (price < 0.001) {
                volatilityRisk.factors.priceLevel = { risk: 30, reason: 'Low price level' };
            } else {
                volatilityRisk.factors.priceLevel = { risk: 10, reason: 'Reasonable price level' };
            }

            // Calculate average volatility risk
            const riskValues = Object.values(volatilityRisk.factors).map(f => f.risk);
            volatilityRisk.score = riskValues.reduce((sum, risk) => sum + risk, 0) / riskValues.length;

            volatilityRisk.level = volatilityRisk.score > 70 ? 'high' :
                volatilityRisk.score > 40 ? 'medium' : 'low';

            return volatilityRisk;

        } catch (error) {
            console.error('[RiskManager] Volatility risk assessment error:', error);
            return { score: 100, factors: {}, level: 'extreme' };
        }
    }

    /**
     * Assess security risk from analysis data
     */
    assessSecurityRisk(analysisData) {
        const securityRisk = {
            score: 0,
            factors: {},
            level: 'low'
        };

        try {
            // Security Score Risk (if available from contract analysis)
            if (analysisData.signals?.security?.score !== undefined) {
                const securityScore = analysisData.signals.security.score;
                const risk = Math.max(0, 100 - securityScore);
                securityRisk.factors.contractSecurity = {
                    risk: risk,
                    reason: `Contract security score: ${securityScore}`
                };
            }

            // Rug Pull Probability Risk
            if (analysisData.signals?.security?.rugProbability !== undefined) {
                const rugProb = analysisData.signals.security.rugProbability;
                const risk = rugProb * 100;
                securityRisk.factors.rugProbability = {
                    risk: risk,
                    reason: `Rug pull probability: ${Math.round(rugProb * 100)}%`
                };
            }

            // Liquidity Lock Risk
            if (analysisData.signals?.security?.liquidityLocked !== undefined) {
                const isLocked = analysisData.signals.security.liquidityLocked;
                securityRisk.factors.liquidityLock = {
                    risk: isLocked ? 20 : 80,
                    reason: isLocked ? 'Liquidity is locked' : 'Liquidity not locked'
                };
            }

            // If no security data available, assume medium risk
            if (Object.keys(securityRisk.factors).length === 0) {
                securityRisk.factors.unknown = {
                    risk: 50,
                    reason: 'Security analysis not available'
                };
            }

            // Calculate average security risk
            const riskValues = Object.values(securityRisk.factors).map(f => f.risk);
            securityRisk.score = riskValues.reduce((sum, risk) => sum + risk, 0) / riskValues.length;

            securityRisk.level = securityRisk.score > 70 ? 'high' :
                securityRisk.score > 40 ? 'medium' : 'low';

            return securityRisk;

        } catch (error) {
            console.error('[RiskManager] Security risk assessment error:', error);
            return { score: 100, factors: {}, level: 'extreme' };
        }
    }

    /**
     * Assess concentration risk
     */
    async assessConcentrationRisk(tokenData) {
        const concentrationRisk = {
            score: 0,
            factors: {},
            level: 'low'
        };

        try {
            // Holder Concentration Risk (simulated)
            const holderConcentration = this.estimateHolderConcentration(tokenData);
            if (holderConcentration > 0.5) { // Top holders own >50%
                concentrationRisk.factors.holderConcentration = {
                    risk: 80,
                    reason: 'High holder concentration'
                };
            } else if (holderConcentration > 0.3) {
                concentrationRisk.factors.holderConcentration = {
                    risk: 50,
                    reason: 'Moderate holder concentration'
                };
            } else {
                concentrationRisk.factors.holderConcentration = {
                    risk: 20,
                    reason: 'Good token distribution'
                };
            }

            // DEX Concentration Risk
            const dexConcentration = this.estimateDEXConcentration(tokenData);
            if (dexConcentration > 0.8) { // >80% on single DEX
                concentrationRisk.factors.dexConcentration = {
                    risk: 60,
                    reason: 'High DEX concentration'
                };
            } else {
                concentrationRisk.factors.dexConcentration = {
                    risk: 20,
                    reason: 'Good DEX distribution'
                };
            }

            // Calculate average concentration risk
            const riskValues = Object.values(concentrationRisk.factors).map(f => f.risk);
            concentrationRisk.score = riskValues.reduce((sum, risk) => sum + risk, 0) / riskValues.length;

            concentrationRisk.level = concentrationRisk.score > 70 ? 'high' :
                concentrationRisk.score > 40 ? 'medium' : 'low';

            return concentrationRisk;

        } catch (error) {
            console.error('[RiskManager] Concentration risk assessment error:', error);
            return { score: 100, factors: {}, level: 'extreme' };
        }
    }

    /**
     * Calculate overall risk score from all factors
     */
    calculateOverallRiskScore(riskFactors) {
        const weights = {
            market: 0.25,
            liquidity: 0.25,
            volatility: 0.20,
            security: 0.20,
            concentration: 0.10
        };

        let totalScore = 0;
        let totalWeight = 0;

        Object.entries(riskFactors).forEach(([factor, riskData]) => {
            if (riskData && riskData.score !== undefined && weights[factor]) {
                totalScore += riskData.score * weights[factor];
                totalWeight += weights[factor];
            }
        });

        return totalWeight > 0 ? totalScore / totalWeight : 100;
    }

    /**
     * Determine risk level from score
     */
    determineRiskLevel(riskScore) {
        if (riskScore >= 80) return 'extreme';
        if (riskScore >= 60) return 'high';
        if (riskScore >= 40) return 'medium';
        if (riskScore >= 20) return 'low';
        return 'very_low';
    }

    /**
     * Generate risk-based recommendations
     */
    generateRiskRecommendations(riskAssessment) {
        const recommendations = [];
        const { riskScore, riskLevel, riskFactors } = riskAssessment;

        // Overall risk recommendations
        if (riskLevel === 'extreme') {
            recommendations.push('AVOID: Extreme risk detected - do not trade');
        } else if (riskLevel === 'high') {
            recommendations.push('HIGH RISK: Consider avoiding or use very small position');
        } else if (riskLevel === 'medium') {
            recommendations.push('MEDIUM RISK: Use reduced position size and tight stop loss');
        } else if (riskLevel === 'low') {
            recommendations.push('LOW RISK: Suitable for normal position sizing');
        }

        // Specific factor recommendations
        Object.entries(riskFactors).forEach(([factor, riskData]) => {
            if (riskData.level === 'high') {
                switch (factor) {
                    case 'market':
                        recommendations.push('Market Risk: Consider waiting for better market conditions');
                        break;
                    case 'liquidity':
                        recommendations.push('Liquidity Risk: Use smaller position and wider spreads');
                        break;
                    case 'volatility':
                        recommendations.push('Volatility Risk: Use tighter stop losses');
                        break;
                    case 'security':
                        recommendations.push('Security Risk: Verify contract security before trading');
                        break;
                    case 'concentration':
                        recommendations.push('Concentration Risk: Monitor for large holder movements');
                        break;
                }
            }
        });

        return recommendations;
    }

    /**
     * Calculate position size limit based on risk
     */
    calculatePositionSizeLimit(riskAssessment) {
        const { riskScore, riskLevel } = riskAssessment;

        // Base position size multiplier
        let sizeMultiplier = 1.0;

        // Adjust based on risk level
        switch (riskLevel) {
            case 'extreme':
                sizeMultiplier = 0; // No position
                break;
            case 'high':
                sizeMultiplier = 0.2; // 20% of normal
                break;
            case 'medium':
                sizeMultiplier = 0.5; // 50% of normal
                break;
            case 'low':
                sizeMultiplier = 0.8; // 80% of normal
                break;
            case 'very_low':
                sizeMultiplier = 1.0; // Full position
                break;
        }

        // Fine-tune based on exact risk score
        const scorePenalty = (riskScore - 20) / 100; // Penalty starts at 20
        sizeMultiplier *= Math.max(0, 1 - scorePenalty);

        return Math.max(0, Math.min(1, sizeMultiplier));
    }

    /**
     * Recommend stop loss based on risk assessment
     */
    recommendStopLoss(riskAssessment) {
        const { riskScore, riskLevel, riskFactors } = riskAssessment;

        let stopLoss = this.config.DEFAULT_STOP_LOSS; // -15%

        // Adjust based on risk level
        switch (riskLevel) {
            case 'extreme':
            case 'high':
                stopLoss = -10; // Tighter stop loss for high risk
                break;
            case 'medium':
                stopLoss = -12; // Slightly tighter
                break;
            case 'low':
                stopLoss = -15; // Normal
                break;
            case 'very_low':
                stopLoss = -18; // Wider for stable tokens
                break;
        }

        // Adjust for specific risk factors
        if (riskFactors.volatility?.level === 'high') {
            stopLoss = Math.max(stopLoss - 3, -25); // Tighter for high volatility
        }

        if (riskFactors.liquidity?.level === 'high') {
            stopLoss = Math.max(stopLoss - 2, -25); // Tighter for low liquidity
        }

        return stopLoss;
    }

    // Helper methods for risk calculations

    estimateTokenAge(tokenData) {
        // Simulate token age estimation
        // In real implementation, would check blockchain data
        return Math.random() * 30 * 86400000; // 0-30 days
    }

    estimateHolderConcentration(tokenData) {
        // Simulate holder concentration
        // In real implementation, would analyze token distribution
        return Math.random() * 0.8; // 0-80% concentration
    }

    estimateDEXConcentration(tokenData) {
        // Simulate DEX concentration
        // In real implementation, would check liquidity across DEXes
        return 0.6 + Math.random() * 0.3; // 60-90% concentration
    }
}

export default RiskManager;
