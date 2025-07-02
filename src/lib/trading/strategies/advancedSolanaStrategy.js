/**
 * Advanced Solana Strategy - Solana network-specific analysis
 * ABUBOT Advanced Solana Strategy Implementation
 */

import { TRADING_CONFIG, TRADING_STRATEGIES } from '../config.js';

export class AdvancedSolanaStrategy {
    constructor() {
        this.name = TRADING_STRATEGIES.ADVANCED_SOLANA?.name || 'Advanced Solana Strategy';
        this.type = TRADING_STRATEGIES.ADVANCED_SOLANA?.type || 'ml_enhanced';

        // Default configuration that matches test expectations
        const defaultConfig = {
            name: 'Advanced Solana Strategy',
            type: 'ml_enhanced',
            components: ['advanced_meme_predictor', 'meme_market_analyzer', 'risk_manager', 'position_manager'],
            features: ['viral_pattern_detection', 'whale_accumulation_analysis', 'community_growth_metrics', 'market_regime_detection', 'ml_price_prediction'],
            solanaMetrics: {
                minValidators: 50,
                maxStakeConcentration: 0.4,
                minNetworkHealth: 0.8,
                optimalTPS: 3000,
                maxBlockTime: 500
            },
            defiIntegration: {
                minLiquidityPools: 3,
                minTVL: 50000,
                protocolRiskThreshold: 0.6
            },
            networkAnalysis: {
                congestionThreshold: 0.7,
                validatorDecentralizationWeight: 0.3,
                ecosystemGrowthWeight: 0.4
            }
        };

        // Merge with any existing config, ensuring all required properties exist
        this.config = {
            ...defaultConfig,
            ...(TRADING_STRATEGIES.ADVANCED_SOLANA || {}),
            solanaMetrics: {
                ...defaultConfig.solanaMetrics,
                ...(TRADING_STRATEGIES.ADVANCED_SOLANA?.solanaMetrics || {})
            },
            defiIntegration: {
                ...defaultConfig.defiIntegration,
                ...(TRADING_STRATEGIES.ADVANCED_SOLANA?.defiIntegration || {})
            },
            networkAnalysis: {
                ...defaultConfig.networkAnalysis,
                ...(TRADING_STRATEGIES.ADVANCED_SOLANA?.networkAnalysis || {})
            }
        };
    }

    /**
     * Analyze token using Solana-specific metrics
     */
    async analyzeToken(tokenData) {
        try {
            if (!tokenData) {
                throw new Error('Invalid token data');
            }

            const analysis = {
                token: tokenData,
                timestamp: Date.now(),
                solanaMetrics: {},
                defiAnalysis: {},
                networkHealth: {},
                signals: {},
                confidence: 0,
                recommendation: null
            };

            // Analyze Solana network metrics
            analysis.solanaMetrics = this.analyzeSolanaMetrics(tokenData.solana || {});

            // Analyze DeFi integration
            analysis.defiAnalysis = this.analyzeDeFiIntegration(tokenData.defi || {});

            // Evaluate network health
            analysis.networkHealth = this.evaluateNetworkHealth(tokenData.solana || {});

            // Generate Solana-specific signals
            analysis.signals = this.generateSolanaSignals(tokenData);

            // Calculate confidence
            analysis.confidence = this.calculateAdvancedConfidence(analysis);

            // Generate recommendation
            analysis.recommendation = this.generateSolanaRecommendation(analysis);

            return analysis;

        } catch (error) {
            console.error('[AdvancedSolanaStrategy] Analysis error:', error);
            return {
                token: tokenData,
                timestamp: Date.now(),
                error: error.message,
                confidence: 0,
                solanaMetrics: {
                    validatorCount: 0,
                    stakeConcentration: 0,
                    networkHealth: 0,
                    throughput: 0,
                    blockTime: 0,
                    score: 0
                },
                defiAnalysis: {
                    liquidityPools: 0,
                    totalValueLocked: 0,
                    yieldOpportunities: false,
                    protocolIntegration: 0,
                    score: 0
                },
                networkHealth: { score: 0 },
                signals: {
                    validatorDecentralization: 0,
                    networkEfficiency: 0,
                    defiIntegration: 0,
                    ecosystemGrowth: 0,
                    networkRisk: 0,
                    signalStrength: 0
                },
                recommendation: {
                    action: 'AVOID',
                    confidence: 0,
                    reasoning: 'Analysis failed'
                }
            };
        }
    }

    /**
     * Analyze Solana network metrics
     */
    analyzeSolanaMetrics(solanaData) {
        const metrics = {
            validatorCount: solanaData.validators || 0,
            stakeConcentration: solanaData.stake_concentration || 0,
            networkHealth: solanaData.network_health || 0,
            throughput: solanaData.tps || 0,
            blockTime: solanaData.block_time || 0,
            score: 0
        };

        // Calculate network score
        let score = 0;

        // Validator count scoring
        if (metrics.validatorCount >= this.config.solanaMetrics.minValidators) {
            score += 0.25;
        }

        // Stake concentration scoring (lower is better)
        if (metrics.stakeConcentration <= this.config.solanaMetrics.maxStakeConcentration) {
            score += 0.25;
        }

        // Network health scoring
        if (metrics.networkHealth >= this.config.solanaMetrics.minNetworkHealth) {
            score += 0.25;
        }

        // Throughput scoring
        if (metrics.throughput >= this.config.solanaMetrics.optimalTPS) {
            score += 0.15;
        }

        // Block time scoring (lower is better)
        if (metrics.blockTime <= this.config.solanaMetrics.maxBlockTime) {
            score += 0.1;
        }

        metrics.score = score;
        return metrics;
    }

    /**
     * Analyze DeFi integration
     */
    analyzeDeFiIntegration(defiData) {
        const analysis = {
            liquidityPools: defiData.liquidity_pools || 0,
            totalValueLocked: defiData.total_locked_value || 0,
            yieldOpportunities: defiData.yield_farming || false,
            protocolIntegration: defiData.lending_protocols || 0,
            liquidityScore: 0,
            yieldPotential: 0,
            protocolRisk: 0,
            score: 0
        };

        // Calculate liquidity score
        if (analysis.liquidityPools >= this.config.defiIntegration.minLiquidityPools) {
            analysis.liquidityScore += 0.4;
        }

        if (analysis.totalValueLocked >= this.config.defiIntegration.minTVL) {
            analysis.liquidityScore += 0.6;
        }

        // Calculate yield potential
        if (analysis.yieldOpportunities) {
            analysis.yieldPotential = 0.7;
            analysis.estimatedAPY = defiData.average_apy || 10;
        }

        // Calculate protocol risk
        if (analysis.liquidityPools < 2) {
            analysis.protocolRisk += 0.4;
        }

        if (analysis.totalValueLocked < 10000) {
            analysis.protocolRisk += 0.3;
        }

        // Overall DeFi score
        analysis.score = (analysis.liquidityScore + analysis.yieldPotential) / 2 - analysis.protocolRisk;
        analysis.score = Math.max(0, Math.min(1, analysis.score));

        return analysis;
    }

    /**
     * Evaluate network health
     */
    evaluateNetworkHealth(solanaData) {
        const health = {
            score: 0,
            factors: []
        };

        const validators = solanaData.validators || 0;
        const stakeConcentration = solanaData.stake_concentration || 0;
        const networkHealth = solanaData.network_health || 0;
        const tps = solanaData.tps || 0;
        const blockTime = solanaData.block_time || 0;

        // Check for optimal conditions
        if (validators >= 100 && stakeConcentration <= 0.3 && networkHealth >= 0.95 && tps >= 4000) {
            health.score = 0.9;
            health.factors.push('optimal');
            return health;
        }

        // Check for congestion
        if (tps < 1000 || blockTime > 800 || networkHealth < 0.7) {
            health.score = 0.3;
            health.factors.push('congestion');
            return health;
        }

        // Normal conditions
        health.score = (validators / 100) * 0.2 +
            (1 - stakeConcentration) * 0.3 +
            networkHealth * 0.3 +
            Math.min(tps / 3000, 1) * 0.2;

        health.score = Math.max(0, Math.min(1, health.score));
        health.factors.push('normal');

        return health;
    }

    /**
     * Generate Solana-specific signals
     */
    generateSolanaSignals(tokenData) {
        const signals = {
            validatorDecentralization: 0,
            networkEfficiency: 0,
            defiIntegration: 0,
            ecosystemGrowth: 0,
            networkRisk: 0,
            signalStrength: 0
        };

        const solana = tokenData.solana || {};
        const defi = tokenData.defi || {};

        // Validator decentralization signal
        if (solana.validators && solana.stake_concentration) {
            signals.validatorDecentralization = (solana.validators / 100) * (1 - solana.stake_concentration);
            signals.validatorDecentralization = Math.min(1, signals.validatorDecentralization);
        }

        // Network efficiency signal
        if (solana.tps && solana.block_time) {
            signals.networkEfficiency = Math.min(1, solana.tps / 3000) * (1000 / Math.max(solana.block_time, 100));
            signals.networkEfficiency = Math.min(1, signals.networkEfficiency);
        }

        // DeFi integration signal
        if (defi.liquidity_pools && defi.total_locked_value) {
            signals.defiIntegration = Math.min(1, (defi.liquidity_pools / 10) + (defi.total_locked_value / 100000));
        }

        // Ecosystem growth signal
        if (solana.ecosystem_projects && solana.developer_activity) {
            signals.ecosystemGrowth = Math.min(1, (solana.ecosystem_projects / 50) * solana.developer_activity);
        }

        // Network risk signal
        if (solana.recent_outages) {
            signals.networkRisk = Math.min(1, solana.recent_outages / 5);
        }

        // Also check for other risk factors
        if (solana.validators && solana.validators < 30) {
            signals.networkRisk = Math.max(signals.networkRisk, 0.8);
        }

        if (solana.stake_concentration && solana.stake_concentration > 0.7) {
            signals.networkRisk = Math.max(signals.networkRisk, 0.8);
        }

        if (solana.network_health && solana.network_health < 0.6) {
            signals.networkRisk = Math.max(signals.networkRisk, 0.7);
        }

        // Calculate overall signal strength
        signals.signalStrength = (signals.validatorDecentralization + signals.networkEfficiency +
            signals.defiIntegration + signals.ecosystemGrowth - signals.networkRisk) / 4;

        return signals;
    }

    /**
     * Calculate confidence based on multiple factors
     */
    calculateAdvancedConfidence(analysis) {
        let confidence = 0;

        // Weight different components
        confidence += analysis.solanaMetrics.score * 0.3;
        confidence += analysis.defiAnalysis.score * 0.25;
        confidence += analysis.networkHealth.score * 0.25;
        confidence += Math.abs(analysis.signals.signalStrength) * 0.2;

        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Generate Solana-specific recommendation
     */
    generateSolanaRecommendation(analysis) {
        const recommendation = {
            action: 'HOLD',
            confidence: analysis.confidence,
            reasoning: 'Neutral Solana conditions',
            details: {
                networkHealth: analysis.networkHealth.score,
                defiIntegration: analysis.defiAnalysis.score,
                validatorDecentralization: analysis.signals.validatorDecentralization
            }
        };

        // If solana data is missing or insufficient, return HOLD
        if (!analysis.solanaMetrics || analysis.solanaMetrics.validatorCount === 0) {
            recommendation.action = 'HOLD';
            recommendation.reasoning = 'Insufficient Solana network data';
            return recommendation;
        }

        // Check for invalid metrics (should return AVOID)
        if (analysis.solanaMetrics.validatorCount < 0 ||
            analysis.solanaMetrics.stakeConcentration > 1 ||
            analysis.solanaMetrics.networkHealth > 1) {
            recommendation.action = 'AVOID';
            recommendation.reasoning = 'Invalid network metrics detected';
            return recommendation;
        }

        // Strong positive signals
        if (analysis.confidence > 0.8 && analysis.signals.signalStrength > 0.6) {
            recommendation.action = 'BUY';
            recommendation.reasoning = 'Strong Solana network fundamentals and DeFi integration';
        }
        // Moderate positive signals
        else if (analysis.confidence > 0.6 && analysis.signals.signalStrength > 0.3) {
            recommendation.action = 'BUY_SMALL';
            recommendation.reasoning = 'Positive Solana metrics with moderate confidence';
        }
        // Network congestion or moderate issues - hold position
        else if (analysis.networkHealth.factors && analysis.networkHealth.factors.includes('congestion')) {
            recommendation.action = 'HOLD';
            recommendation.reasoning = 'Network congestion detected, waiting for improvement';
        }
        // Severe network risks detected
        else if (analysis.signals.networkRisk > 0.7) {
            recommendation.action = 'AVOID';
            recommendation.reasoning = 'Severe network risks detected';
        }
        // Poor overall metrics
        else if (analysis.confidence < 0.3) {
            recommendation.action = 'AVOID';
            recommendation.reasoning = 'Poor Solana network metrics';
        }

        // Add position sizing for buy recommendations
        if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
            recommendation.positionSize = this.calculateSolanaPositionSize(analysis);
        }

        return recommendation;
    }

    /**
     * Calculate position size based on Solana metrics
     */
    calculateSolanaPositionSize(analysis) {
        let baseSize = 1.5; // Base 1.5 SOL

        // Adjust for network health
        baseSize *= analysis.networkHealth.score;

        // Adjust for DeFi liquidity
        baseSize *= (0.5 + analysis.defiAnalysis.liquidityScore * 0.5);

        // Adjust for confidence
        baseSize *= analysis.confidence;

        // Risk adjustment for network issues
        if (analysis.signals && analysis.signals.networkRisk > 0.3) {
            baseSize *= 0.5;
        }

        return {
            solAmount: Math.max(0.1, Math.min(5, baseSize)),
            reasoning: 'Solana network metrics-based sizing',
            networkAdjusted: true
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            strategy: this.name,
            type: this.type,
            parameters: this.config,
            winRate: 0,
            avgReturn: 0,
            solanaNetworkAccuracy: 0
        };
    }
}

export default AdvancedSolanaStrategy;
