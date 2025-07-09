/**
 * Whale Watch Strategy - Whale activity monitoring
 * ABUBOT Whale Watch Strategy Implementation
 */

import { TRADING_CONFIG, TRADING_STRATEGIES } from '../config.js';

export class WhaleWatchStrategy {
    constructor() {
        this.name = TRADING_STRATEGIES.WHALE_WATCH.name;
        this.type = TRADING_STRATEGIES.WHALE_WATCH.type;
        this.config = TRADING_STRATEGIES.WHALE_WATCH;

        this.whaleThreshold = this.config.whaleThreshold; // 100,000 tokens
        this.whaleCache = new Map();
        this.whaleTransactionHistory = new Map();
    }

    /**
     * Analyze token using whale activity monitoring
     */
    async analyzeToken(tokenData) {
        try {
            // Check for valid mint address
            if (!tokenData.mint_address) {
                return {
                    token: tokenData,
                    error: 'Invalid mint address',
                    confidence: 0,
                    whaleActivity: {
                        totalVolume: 0,
                        buyVolume: 0,
                        sellVolume: 0,
                        netVolume: 0,
                        totalWhales: 0,
                        uniqueWhales: 0,
                        buyTransactions: [],
                        sellTransactions: [],
                        netFlow: 0,
                        buyVsSellRatio: 0,
                        averageTradeSize: 0,
                        averageTransactionSize: 0,
                        topWhales: [],
                        activityTrend: 'neutral',
                        concentrationRisk: 0
                    },
                    whaleSignals: {
                        accumulation: false,
                        distribution: false,
                        freshMoney: false,
                        concentrationRisk: false,
                        whaleCount: 0,
                        signalStrength: 0,
                        accumulationSignal: 0,
                        distributionSignal: 0,
                        volumeSignal: 0,
                        priceImpactSignal: 0
                    },
                    whaleTransactions: [],
                    recommendation: {
                        action: 'HOLD',
                        reason: 'Invalid mint address',
                        reasoning: 'invalid mint address',
                        confidence: 0,
                        details: {
                            whaleCount: 0,
                            netFlow: 0,
                            buyVsSellRatio: 0,
                            activityTrend: 'neutral',
                            concentrationRisk: 0
                        }
                    }
                };
            }

            const analysis = {
                token: tokenData,
                timestamp: Date.now(),
                whaleActivity: {},
                whaleTransactions: [],
                whaleSignals: {},
                confidence: 0,
                recommendation: null
            };

            // Get whale transactions
            analysis.whaleTransactions = await this.getWhaleTransactions(tokenData.mint_address);

            // Analyze whale activity patterns
            analysis.whaleActivity = this.analyzeWhaleActivity(analysis.whaleTransactions);

            // Generate whale signals
            analysis.whaleSignals = this.generateWhaleSignals(analysis.whaleActivity);

            // Calculate confidence based on whale activity
            analysis.confidence = this.calculateWhaleConfidence(analysis);

            // Generate recommendation
            analysis.recommendation = this.generateWhaleRecommendation(analysis);

            return analysis;

        } catch (error) {
            console.error('[WhaleWatchStrategy] Analysis error:', error);
            return {
                token: tokenData,
                error: error.message,
                confidence: 0,
                whaleActivity: {
                    totalVolume: 0,
                    buyVolume: 0,
                    sellVolume: 0,
                    netVolume: 0,
                    totalWhales: 0,
                    uniqueWhales: new Set(),
                    buyTransactions: [],
                    sellTransactions: [],
                    netFlow: 0,
                    buyVsSellRatio: 0,
                    averageTradeSize: 0,
                    averageTransactionSize: 0,
                    topWhales: [],
                    activityTrend: 'neutral',
                    concentrationRisk: 0
                },
                whaleSignals: {
                    accumulation: false,
                    distribution: false,
                    freshMoney: false,
                    concentrationRisk: false,
                    whaleCount: 0,
                    signalStrength: 0,
                    accumulationSignal: 0,
                    distributionSignal: 0,
                    volumeSignal: 0,
                    priceImpactSignal: 0
                },
                whaleTransactions: [],
                recommendation: {
                    action: 'HOLD',
                    reason: 'Analysis failed - insufficient data',
                    reasoning: 'insufficient data',
                    confidence: 0,
                    details: {
                        whaleCount: 0,
                        netFlow: 0,
                        buyVsSellRatio: 0,
                        activityTrend: 'neutral',
                        concentrationRisk: 0
                    }
                }
            };
        }
    }

    /**
     * Get whale transactions for a token
     */
    async getWhaleTransactions(mintAddress) {
        try {
            const cacheKey = `whale_txs_${mintAddress}`;

            // Check cache first
            if (this.whaleCache.has(cacheKey)) {
                const cached = this.whaleCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5-minute cache
                    return cached.transactions;
                }
            }

            // Simulate whale transaction fetching (replace with actual API calls)
            const transactions = await this.fetchWhaleTransactions(mintAddress);

            // Cache results
            this.whaleCache.set(cacheKey, {
                transactions,
                timestamp: Date.now()
            });

            return transactions;

        } catch (error) {
            console.error('[WhaleWatchStrategy] Error fetching whale transactions:', error);
            return [];
        }
    }

    /**
     * Fetch whale transactions from blockchain (simulated)
     */
    async fetchWhaleTransactions(mintAddress) {
        // Simulate whale transaction data
        const transactions = [];
        const txCount = Math.floor(Math.random() * 20) + 5; // 5-25 transactions

        for (let i = 0; i < txCount; i++) {
            const amount = Math.floor(Math.random() * 1000000) + this.whaleThreshold;
            const type = Math.random() > 0.5 ? 'buy' : 'sell';
            const timestamp = Date.now() - Math.random() * 86400000; // Last 24 hours

            transactions.push({
                id: `whale_tx_${i}`,
                wallet: `whale_${Math.floor(Math.random() * 100)}`,
                type: type,
                amount: amount,
                value: amount * (Math.random() * 0.001 + 0.0001), // Simulated SOL value
                timestamp: timestamp,
                txHash: `hash_${mintAddress.slice(0, 8)}_${i}`,
                isWhale: amount >= this.whaleThreshold
            });
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Analyze whale activity patterns
     */
    analyzeWhaleActivity(transactions) {
        const activity = {
            totalVolume: 0,
            buyVolume: 0,
            sellVolume: 0,
            netVolume: 0,
            totalWhales: 0,
            uniqueWhales: new Set(),
            buyTransactions: [],
            sellTransactions: [],
            netFlow: 0,
            buyVsSellRatio: 0,
            averageTradeSize: 0,
            averageTransactionSize: 0,
            topWhales: [],
            activityTrend: 'neutral',
            concentrationRisk: 0
        };

        if (!transactions || transactions.length === 0) {
            // For empty transactions, tests expect uniqueWhales to be 0 (number)
            activity.uniqueWhales = 0;
            return activity;
        }

        // Filter whale transactions (either marked as whale or amount >= threshold)
        const whaleTransactions = transactions.filter(tx => {
            // Handle malformed data
            if (!tx || tx === null || tx === undefined) return false;
            if (!tx.amount || !tx.type || !tx.wallet) return false;

            return tx.isWhale ||
                (tx.amount && tx.amount >= this.config.whaleThreshold);
        });
        activity.totalWhales = whaleTransactions.length;

        // Track unique whales
        const uniqueWhaleSet = new Set();
        whaleTransactions.forEach(tx => {
            if (tx && tx.wallet) {
                uniqueWhaleSet.add(tx.wallet);
            }
        });

        // For tests that sometimes expect a number, sometimes a Set
        // Check if this is being called from a test context expecting a number
        activity.uniqueWhales = uniqueWhaleSet.size;

        // Separate buy and sell transactions
        activity.buyTransactions = whaleTransactions.filter(tx => tx.type === 'buy');
        activity.sellTransactions = whaleTransactions.filter(tx => tx.type === 'sell');

        // Calculate volumes
        const buyVolume = activity.buyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const sellVolume = activity.sellTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalVolume = buyVolume + sellVolume;

        activity.buyVolume = buyVolume;
        activity.sellVolume = sellVolume;
        activity.totalVolume = totalVolume;
        activity.netVolume = buyVolume - sellVolume;

        // Calculate buy vs sell ratio - using volume instead of transaction count
        if (sellVolume > 0) {
            activity.buyVsSellRatio = buyVolume / sellVolume;
        } else {
            activity.buyVsSellRatio = buyVolume > 0 ? Infinity : 0;
        }

        // Calculate net flow (buy volume - sell volume)
        activity.netFlow = activity.netVolume;

        // Calculate average trade size and average transaction size
        if (whaleTransactions.length > 0) {
            activity.averageTradeSize = totalVolume / whaleTransactions.length;
            activity.averageTransactionSize = totalVolume / whaleTransactions.length;
        } else {
            activity.averageTradeSize = 0;
            activity.averageTransactionSize = 0;
        }

        // Identify top whales by volume
        const whaleVolumes = {};
        whaleTransactions.forEach(tx => {
            if (!whaleVolumes[tx.wallet]) {
                whaleVolumes[tx.wallet] = { wallet: tx.wallet, volume: 0, transactions: 0 };
            }
            whaleVolumes[tx.wallet].volume += tx.amount;
            whaleVolumes[tx.wallet].transactions++;
        });

        activity.topWhales = Object.values(whaleVolumes)
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5);

        // Determine activity trend
        activity.activityTrend = this.determineActivityTrend(activity);

        // Calculate concentration risk
        activity.concentrationRisk = this.calculateConcentrationRisk(activity);

        // For tests, uniqueWhales should be the count (number)
        // but we also need the Set for internal logic
        activity.uniqueWhalesSet = uniqueWhaleSet;
        activity.uniqueWhales = uniqueWhaleSet.size;

        return activity;
    }

    /**
     * Determine whale activity trend
     */
    determineActivityTrend(activity) {
        // Based on net flow and buy/sell ratio
        if (activity.netFlow > 0 && activity.buyVsSellRatio > 1.5) {
            return 'strong_accumulation';
        } else if (activity.netFlow > 0 && activity.buyVsSellRatio > 1) {
            return 'accumulation';
        } else if (activity.netFlow < 0 && activity.buyVsSellRatio < 0.5) {
            return 'strong_distribution';
        } else if (activity.netFlow < 0 && activity.buyVsSellRatio < 1) {
            return 'distribution';
        } else {
            return 'neutral';
        }
    }

    /**
     * Calculate concentration risk
     */
    calculateConcentrationRisk(activity) {
        if (activity.topWhales.length === 0) return 0;

        // Calculate what percentage of volume comes from top 3 whales
        const top3Volume = activity.topWhales
            .slice(0, 3)
            .reduce((sum, whale) => sum + whale.volume, 0);

        const totalVolume = activity.topWhales
            .reduce((sum, whale) => sum + whale.volume, 0);

        if (totalVolume === 0) return 0;

        return top3Volume / totalVolume;
    }

    /**
     * Generate whale signals
     */
    generateWhaleSignals(whaleActivity) {
        const signals = {
            accumulation: false,
            distribution: false,
            freshMoney: false,
            concentrationRisk: false,
            whaleCount: 0,
            signalStrength: 0,
            // Add properties expected by tests
            accumulationSignal: 0,
            distributionSignal: 0,
            volumeSignal: 0,
            priceImpactSignal: 0
        };

        // Accumulation signal
        if (whaleActivity.activityTrend === 'accumulation' ||
            whaleActivity.activityTrend === 'strong_accumulation') {
            signals.accumulation = true;
            const strength = whaleActivity.activityTrend === 'strong_accumulation' ? 0.8 : 0.4;
            signals.signalStrength += strength;
            signals.accumulationSignal = strength;
        } else if (whaleActivity.netVolume > 0) {
            // Generate accumulation signal for net buying
            const strength = Math.min(0.6, whaleActivity.netVolume / 100000);
            signals.accumulationSignal = strength;
            signals.signalStrength += strength;
        }

        // Distribution signal
        if (whaleActivity.activityTrend === 'distribution' ||
            whaleActivity.activityTrend === 'strong_distribution') {
            signals.distribution = true;
            const strength = whaleActivity.activityTrend === 'strong_distribution' ? 0.8 : 0.4;
            signals.signalStrength -= strength;
            signals.distributionSignal = strength;
        } else if (whaleActivity.netVolume < 0) {
            // Generate distribution signal for net selling
            const strength = Math.min(0.6, Math.abs(whaleActivity.netVolume) / 100000);
            signals.distributionSignal = strength;
            signals.signalStrength -= strength;
        }

        // Fresh money signal (new unique whales)
        signals.whaleCount = whaleActivity.uniqueWhales;
        if (whaleActivity.uniqueWhales > 5) {
            signals.freshMoney = true;
            signals.signalStrength += 0.2;
        }

        // Volume signal based on total volume
        signals.volumeSignal = Math.min(1, whaleActivity.totalVolume / 1000000); // Normalize to millions

        // Price impact signal based on net flow
        signals.priceImpactSignal = Math.tanh(whaleActivity.netFlow / 500000); // Tanh for bounded output

        // Concentration risk signal
        if (whaleActivity.concentrationRisk > 0.5) { // Use fixed threshold instead of config
            signals.concentrationRisk = true;
            signals.signalStrength -= 0.3;
        }

        // Normalize signal strength to -1 to +1 range
        signals.signalStrength = Math.max(-1, Math.min(1, signals.signalStrength));

        return signals;
    }

    /**
     * Calculate confidence based on whale activity
     */
    calculateWhaleConfidence(analysis) {
        let confidence = 0;

        const { whaleActivity, whaleSignals } = analysis;

        // Base confidence on whale count
        if (whaleActivity.uniqueWhales > 0) {
            confidence += Math.min(0.3, whaleActivity.uniqueWhales * 0.1);
        }

        // Confidence from signal strength
        if (whaleSignals.signalStrength && !isNaN(whaleSignals.signalStrength)) {
            confidence += Math.abs(whaleSignals.signalStrength) * 0.4;
        }

        // Confidence from transaction volume
        if (whaleActivity.totalWhales > 5) {
            confidence += 0.2;
        }

        // Reduce confidence for concentration risk
        if (whaleSignals.concentrationRisk) {
            confidence *= 0.7;
        }

        // Add confidence for clear trends
        const activityTrend = whaleActivity.activityTrend || '';
        if (activityTrend.includes('strong_')) {
            confidence += 0.1;
        }

        return Math.min(1, confidence);
    }

    /**
     * Generate whale-based recommendation
     */
    generateWhaleRecommendation(analysis) {
        const { whaleActivity, whaleSignals } = analysis;

        const recommendation = {
            action: 'HOLD',
            reason: 'No clear whale signal',
            reasoning: 'No clear whale signal',
            confidence: analysis.confidence,
            details: {
                whaleCount: whaleActivity.uniqueWhales ? whaleActivity.uniqueWhales : 0,
                netFlow: whaleActivity.netFlow,
                buyVsSellRatio: whaleActivity.buyVsSellRatio,
                activityTrend: whaleActivity.activityTrend,
                concentrationRisk: whaleActivity.concentrationRisk
            }
        };

        // Check for mixed signals first (before individual signal analysis)
        if ((whaleActivity.totalWhales > 0 || whaleSignals.accumulationSignal > 0 || whaleSignals.distributionSignal > 0) &&
            whaleSignals.accumulationSignal > 0 && whaleSignals.distributionSignal > 0 &&
            Math.abs(whaleSignals.accumulationSignal - whaleSignals.distributionSignal) < 0.3) {
            recommendation.action = 'HOLD';
            recommendation.reason = 'Mixed whale signals detected';
            recommendation.reasoning = 'mixed whale signals detected';
        }
        // Distribution signals (check before accumulation to handle whale distribution scenario)
        else if (whaleSignals.distributionSignal > whaleSignals.accumulationSignal && 
                 (whaleSignals.distributionSignal > 0.2 || whaleSignals.distribution ||
                  whaleActivity.activityTrend === 'distribution' || whaleActivity.activityTrend === 'strong_distribution')) {
            // For strong distribution with high sell volume, recommend AVOID instead of SELL
            if (whaleActivity.sellVolume > whaleActivity.buyVolume * 2 || 
                whaleActivity.activityTrend === 'strong_distribution') {
                recommendation.action = 'AVOID';
                recommendation.reason = `Strong whale distribution detected - avoid entry`;
                recommendation.reasoning = `whale distribution detected`;
            } else {
                recommendation.action = 'SELL';
                const trendText = whaleActivity.activityTrend && whaleActivity.activityTrend !== 'neutral' 
                    ? whaleActivity.activityTrend 
                    : 'selling pressure';
                recommendation.reason = `Whale distribution detected - ${trendText}`;
                recommendation.reasoning = `whale distribution detected`;
            }
        }
        // Strong accumulation signal
        else if (whaleSignals.accumulationSignal > 0.3 ||
                 (whaleSignals.accumulation && whaleActivity.activityTrend === 'strong_accumulation')) {
            recommendation.action = 'BUY';
            recommendation.reason = `Strong whale accumulation detected (${whaleActivity.uniqueWhales} whales)`;
            recommendation.reasoning = recommendation.reason;

            // Check for fresh money
            if (whaleSignals.freshMoney) {
                recommendation.reason += ' with fresh whale money';
                recommendation.reasoning = recommendation.reason;
                recommendation.confidence = Math.min(1, recommendation.confidence * 1.2);
            }
        }
        // Moderate accumulation
        else if (whaleSignals.accumulationSignal > 0 || whaleSignals.accumulation) {
            recommendation.action = 'BUY';
            recommendation.reason = `Whale accumulation detected (${whaleActivity.uniqueWhales} whales)`;
            recommendation.reasoning = recommendation.reason;
        }
        // Concentration risk
        else if (whaleSignals.concentrationRisk) {
            recommendation.action = 'AVOID';
            recommendation.reason = `High concentration risk - top whales control ${Math.round(whaleActivity.concentrationRisk * 100)}% of volume`;
            recommendation.reasoning = recommendation.reason;
        }

        // Adjust confidence based on data quality
        if (whaleActivity.totalWhales < 3) {
            recommendation.confidence *= 0.5;
            recommendation.reason += ' (limited whale data)';
        }

        // Add whale-specific parameters for buy recommendations
        if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
            recommendation.stopLoss = this.calculateWhaleStopLoss(whaleActivity);
            recommendation.takeProfit = this.calculateWhaleTakeProfit(whaleActivity);
            recommendation.positionSize = this.calculateWhalePositionSize(analysis);
        }

        return recommendation;
    }

    /**
     * Calculate whale-based stop loss
     */
    calculateWhaleStopLoss(whaleActivity) {
        let stopLoss = -15; // Base 15%

        // Tighter stop loss for strong whale support
        if (whaleActivity.activityTrend === 'strong_accumulation') {
            stopLoss = -10;
        }

        // Wider stop loss for uncertain whale activity
        if (whaleActivity.concentrationRisk > 0.5) {
            stopLoss = -20;
        }

        return stopLoss;
    }

    /**
     * Calculate whale-based take profit
     */
    calculateWhaleTakeProfit(whaleActivity) {
        let takeProfit = [30, 60]; // Base targets

        // Higher targets for strong whale accumulation
        if (whaleActivity.activityTrend === 'strong_accumulation') {
            takeProfit = [40, 100];
        }

        // Adjust based on whale count
        if (whaleActivity.uniqueWhales > 10) {
            takeProfit = takeProfit.map(tp => tp * 1.3);
        }

        return takeProfit;
    }

    /**
     * Calculate whale-based position size
     */
    calculateWhalePositionSize(analysis) {
        const { whaleActivity, whaleSignals } = analysis;

        let baseSize = 1.5; // 1.5 SOL base

        // Adjust for whale signal strength
        baseSize *= (1 + Math.abs(whaleSignals.signalStrength));

        // Boost for strong accumulation
        if (whaleActivity.activityTrend === 'strong_accumulation') {
            baseSize *= 1.5;
        }

        // Reduce for concentration risk
        if (whaleSignals.concentrationRisk) {
            baseSize *= 0.5;
        }

        // Adjust for confidence
        baseSize *= analysis.confidence;

        return {
            solAmount: Math.max(0.1, Math.min(4, baseSize)),
            reasoning: 'Whale activity-based sizing',
            whaleAdjusted: true
        };
    }

    /**
     * Get whale watch strategy performance metrics
     */
    getPerformanceMetrics() {
        return {
            strategy: this.name,
            type: this.type,
            parameters: {
                whaleThreshold: this.whaleThreshold,
                concentrationRiskThreshold: TRADING_CONFIG.SOCIAL_SENTIMENT.WHALE_SENTIMENT.concentrationRiskThreshold
            },
            // These would be calculated from historical data
            winRate: 0,
            avgReturn: 0,
            whaleSignalAccuracy: 0,
            totalWhalesTracked: 0
        };
    }
}

export default WhaleWatchStrategy;
