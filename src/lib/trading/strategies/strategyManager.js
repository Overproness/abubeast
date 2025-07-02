/**
 * Strategy Manager - Coordinates all trading strategies
 * ABUBOT Core Management Component
 */

import { TRADING_CONFIG, TRADING_STRATEGIES } from '../config.js';
import QuantumMemecoinStrategy from './quantumMemecoinStrategy.js';
import AdvancedSolanaStrategy from './advancedSolanaStrategy.js';
import EnhancedStrategy from './enhancedStrategy.js';
import MomentumStrategy from './momentumStrategy.js';
import WhaleWatchStrategy from './whaleWatchStrategy.js';

export class StrategyManager {
    constructor() {
        this.strategies = new Map();
        this.activeStrategies = new Set();
        this.strategyResults = new Map();
        this.performanceMetrics = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize all trading strategies
     */
    async initialize() {
        try {
            console.log('[StrategyManager] Initializing all strategies...');

            // Initialize core strategies
            this.strategies.set('quantum_memecoin', new QuantumMemecoinStrategy());
            this.strategies.set('advanced_solana', new AdvancedSolanaStrategy());
            this.strategies.set('enhanced', new EnhancedStrategy());
            this.strategies.set('momentum', new MomentumStrategy());
            this.strategies.set('whale_watch', new WhaleWatchStrategy());

            // Initialize each strategy
            for (const [name, strategy] of this.strategies) {
                try {
                    if (strategy.initialize) {
                        await strategy.initialize();
                    }
                    this.activeStrategies.add(name);
                    console.log(`[StrategyManager] Initialized ${name} strategy`);
                } catch (error) {
                    console.error(`[StrategyManager] Failed to initialize ${name}:`, error);
                }
            }

            this.isInitialized = true;
            console.log('[StrategyManager] All strategies initialized successfully');

        } catch (error) {
            console.error('[StrategyManager] Initialization error:', error);
            throw error;
        }
    }

    /**
     * Analyze token using all active strategies
     */
    async analyzeToken(tokenData, userSettings = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const analysis = {
                token: tokenData,
                timestamp: Date.now(),
                strategyResults: {},
                consensus: null,
                confidence: 0,
                recommendation: null
            };

            // Run analysis on all active strategies
            const strategyPromises = Array.from(this.activeStrategies).map(async (strategyName) => {
                try {
                    const strategy = this.strategies.get(strategyName);
                    const result = await strategy.analyzeToken(tokenData);
                    return { strategyName, result };
                } catch (error) {
                    console.error(`[StrategyManager] Strategy ${strategyName} analysis failed:`, error);
                    return {
                        strategyName,
                        result: {
                            error: error.message,
                            recommendation: { action: 'AVOID', reason: 'Analysis failed' }
                        }
                    };
                }
            });

            const strategyResults = await Promise.all(strategyPromises);

            // Store individual strategy results
            strategyResults.forEach(({ strategyName, result }) => {
                analysis.strategyResults[strategyName] = result;
                this.strategyResults.set(`${tokenData.mint_address}_${strategyName}`, result);
            });

            // Calculate consensus recommendation
            analysis.consensus = this.calculateConsensus(analysis.strategyResults);
            analysis.confidence = analysis.consensus.confidence;
            analysis.recommendation = this.generateFinalRecommendation(analysis, userSettings);

            return analysis;

        } catch (error) {
            console.error('[StrategyManager] Token analysis error:', error);
            return {
                token: tokenData,
                error: error.message,
                recommendation: { action: 'AVOID', reason: 'Analysis failed' }
            };
        }
    }

    /**
     * Calculate consensus from all strategy results
     */
    calculateConsensus(strategyResults) {
        const votes = {
            BUY: 0,
            BUY_SMALL: 0,
            HOLD: 0,
            AVOID: 0
        };

        const confidences = [];
        const reasons = [];
        let totalWeight = 0;

        // Weight strategies based on their historical performance
        const strategyWeights = this.getStrategyWeights();

        Object.entries(strategyResults).forEach(([strategyName, result]) => {
            if (result.recommendation && result.recommendation.action) {
                const action = result.recommendation.action;
                const weight = strategyWeights[strategyName] || 1;

                if (votes.hasOwnProperty(action)) {
                    votes[action] += weight;
                } else {
                    votes.AVOID += weight; // Unknown actions default to AVOID
                }

                totalWeight += weight;

                if (result.recommendation.confidence) {
                    confidences.push(result.recommendation.confidence * weight);
                }

                if (result.recommendation.reason) {
                    reasons.push(`${strategyName}: ${result.recommendation.reason}`);
                }
            }
        });

        // Find consensus action
        let consensusAction = 'AVOID';
        let maxVotes = votes.AVOID;

        Object.entries(votes).forEach(([action, voteCount]) => {
            if (voteCount > maxVotes) {
                consensusAction = action;
                maxVotes = voteCount;
            }
        });

        // Calculate consensus confidence
        const consensusConfidence = totalWeight > 0 ?
            confidences.reduce((sum, conf) => sum + conf, 0) / totalWeight : 0;

        // Calculate consensus strength
        const consensusStrength = totalWeight > 0 ? maxVotes / totalWeight : 0;

        return {
            action: consensusAction,
            confidence: consensusConfidence,
            strength: consensusStrength,
            votes: votes,
            reasons: reasons,
            agreement: consensusStrength // How much strategies agree
        };
    }

    /**
     * Generate final recommendation based on consensus and user settings
     */
    generateFinalRecommendation(analysis, userSettings) {
        const consensus = analysis.consensus;
        const strategy = userSettings.tradingStrategy || 'moderate';

        // Apply user strategy filter
        let recommendation = {
            action: consensus.action,
            reason: `Consensus: ${consensus.action} (${Math.round(consensus.strength * 100)}% agreement)`,
            confidence: consensus.confidence,
            consensus: consensus,
            strategyCount: Object.keys(analysis.strategyResults).length
        };

        // Adjust based on user's risk tolerance
        if (strategy === 'conservative') {
            recommendation = this.applyConservativeFilter(recommendation, analysis);
        } else if (strategy === 'aggressive') {
            recommendation = this.applyAggressiveFilter(recommendation, analysis);
        }

        // Add strategy-specific details
        recommendation.details = this.extractStrategyDetails(analysis.strategyResults);

        return recommendation;
    }

    /**
     * Apply conservative filter to recommendation
     */
    applyConservativeFilter(recommendation, analysis) {
        const conservative = { ...recommendation };

        // Conservative users need higher consensus
        if (conservative.consensus.strength < 0.7) {
            conservative.action = 'HOLD';
            conservative.reason = 'Conservative: Insufficient consensus for action';
        }

        // Conservative users avoid new/risky tokens
        const securityScores = this.extractSecurityScores(analysis.strategyResults);
        const avgSecurityScore = securityScores.length > 0 ?
            securityScores.reduce((sum, score) => sum + score, 0) / securityScores.length : 0;

        if (avgSecurityScore < 80) {
            conservative.action = 'AVOID';
            conservative.reason = 'Conservative: Security score too low';
        }

        // Reduce position sizes for conservative users
        if (conservative.action === 'BUY') {
            conservative.positionMultiplier = 0.5;
        }

        return conservative;
    }

    /**
     * Apply aggressive filter to recommendation
     */
    applyAggressiveFilter(recommendation, analysis) {
        const aggressive = { ...recommendation };

        // Aggressive users can act on lower consensus
        if (aggressive.consensus.strength >= 0.4 && aggressive.action === 'HOLD') {
            // Check if any high-performing strategy recommends BUY
            const topStrategies = this.getTopPerformingStrategies(3);
            const topRecommendations = topStrategies.map(strategyName =>
                analysis.strategyResults[strategyName]?.recommendation?.action
            ).filter(action => action === 'BUY' || action === 'BUY_SMALL');

            if (topRecommendations.length > 0) {
                aggressive.action = 'BUY_SMALL';
                aggressive.reason = 'Aggressive: Top strategies suggest opportunity';
            }
        }

        // Increase position sizes for aggressive users
        if (aggressive.action === 'BUY' || aggressive.action === 'BUY_SMALL') {
            aggressive.positionMultiplier = aggressive.action === 'BUY' ? 1.5 : 1.2;
        }

        return aggressive;
    }

    /**
     * Extract strategy-specific details for final recommendation
     */
    extractStrategyDetails(strategyResults) {
        const details = {
            quantumScore: null,
            viralPotential: null,
            whaleActivity: null,
            securityScore: null,
            technicalSignals: {},
            riskFactors: []
        };

        // Extract Quantum Memecoin details
        if (strategyResults.quantum_memecoin) {
            const quantum = strategyResults.quantum_memecoin;
            details.quantumScore = quantum.confidence;
            if (quantum.signals) {
                details.technicalSignals.quantum = quantum.signals.quantum;
            }
        }

        // Extract Advanced Solana details
        if (strategyResults.advanced_solana) {
            const advanced = strategyResults.advanced_solana;
            details.viralPotential = advanced.viralMetrics?.viralProbability;
            details.whaleActivity = advanced.whaleAnalysis?.netAccumulation;
            if (advanced.mlScores) {
                details.technicalSignals.ml = advanced.mlScores;
            }
        }

        // Extract security details
        Object.values(strategyResults).forEach(result => {
            if (result.signals?.security?.score) {
                details.securityScore = result.signals.security.score;
            }
            if (result.riskAssessment?.riskScore) {
                details.riskFactors.push(`Risk Score: ${result.riskAssessment.riskScore}`);
            }
        });

        return details;
    }

    /**
     * Get strategy weights based on historical performance
     */
    getStrategyWeights() {
        // In a real implementation, these would be calculated from historical performance
        return {
            quantum_memecoin: 1.2, // Slightly higher weight for quantum analysis
            advanced_solana: 1.1,  // Good performance on ML predictions
            enhanced: 1.0,         // Standard weight
            momentum: 0.9,         // Lower weight for simple momentum
            whale_watch: 1.0       // Standard weight for whale analysis
        };
    }

    /**
     * Extract security scores from strategy results
     */
    extractSecurityScores(strategyResults) {
        const scores = [];

        Object.values(strategyResults).forEach(result => {
            if (result.signals?.security?.score) {
                scores.push(result.signals.security.score);
            }
        });

        return scores;
    }

    /**
     * Get top performing strategies
     */
    getTopPerformingStrategies(count = 3) {
        // In a real implementation, this would be based on actual performance metrics
        const performanceRanking = [
            'quantum_memecoin',
            'advanced_solana',
            'enhanced',
            'whale_watch',
            'momentum'
        ];

        return performanceRanking.slice(0, count);
    }

    /**
     * Update strategy performance metrics
     */
    updatePerformanceMetrics(strategyName, tradeResult) {
        if (!this.performanceMetrics.has(strategyName)) {
            this.performanceMetrics.set(strategyName, {
                totalTrades: 0,
                winningTrades: 0,
                totalReturn: 0,
                avgReturn: 0,
                winRate: 0,
                sharpeRatio: 0,
                maxDrawdown: 0
            });
        }

        const metrics = this.performanceMetrics.get(strategyName);
        metrics.totalTrades++;

        if (tradeResult.return > 0) {
            metrics.winningTrades++;
        }

        metrics.totalReturn += tradeResult.return;
        metrics.avgReturn = metrics.totalReturn / metrics.totalTrades;
        metrics.winRate = metrics.winningTrades / metrics.totalTrades;

        // Update other metrics as needed
        this.performanceMetrics.set(strategyName, metrics);
    }

    /**
     * Get performance summary for all strategies
     */
    getPerformanceSummary() {
        const summary = {};

        for (const [strategyName, metrics] of this.performanceMetrics) {
            summary[strategyName] = { ...metrics };
        }

        return summary;
    }

    /**
     * Enable/disable specific strategies
     */
    setStrategyActive(strategyName, active) {
        if (active) {
            this.activeStrategies.add(strategyName);
        } else {
            this.activeStrategies.delete(strategyName);
        }
    }

    /**
     * Get list of available strategies
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }

    /**
     * Get list of active strategies
     */
    getActiveStrategies() {
        return Array.from(this.activeStrategies);
    }
}

export default StrategyManager;
