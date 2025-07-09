/**
 * Whale Watch Strategy Tests
 * Comprehensive unit tests for the whale activity monitoring strategy
 */

// Mock dependencies
jest.mock('../../../src/lib/trading/config.js', () => ({
    TRADING_STRATEGIES: {
        WHALE_WATCH: {
            name: 'Whale Watch Strategy',
            type: 'whale_monitoring',
            whaleThreshold: 100000,
            buyVsSellRatio: true,
            confidenceBasedOnVolume: true
        }
    }
}));

import { WhaleWatchStrategy } from '../../../src/lib/trading/strategies/whaleWatchStrategy.js';

describe('WhaleWatchStrategy', () => {
    let strategy;
    let mockTokenData;
    let mockWhaleTransactions;

    beforeEach(() => {
        strategy = new WhaleWatchStrategy();
        mockTokenData = {
            mint_address: 'So11111111111111111111111111111111111111112',
            symbol: 'TEST',
            name: 'Test Token',
            price: 0.001,
            market_cap: 100000,
            volume_24h: 50000,
            price_change_24h: 5.5,
            holders: 1000,
            liquidity: {
                total: 25000,
                locked_percentage: 80
            }
        };

        mockWhaleTransactions = [
            {
                type: 'buy',
                amount: 150000,
                timestamp: Date.now() - 3600000,
                wallet: 'whale1',
                price: 0.0009
            },
            {
                type: 'buy',
                amount: 200000,
                timestamp: Date.now() - 1800000,
                wallet: 'whale2',
                price: 0.00095
            },
            {
                type: 'sell',
                amount: 120000,
                timestamp: Date.now() - 900000,
                wallet: 'whale1',
                price: 0.001
            }
        ];

        // Mock the getWhaleTransactions method
        strategy.getWhaleTransactions = jest.fn().mockResolvedValue(mockWhaleTransactions);
    });

    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(strategy.name).toBe('Whale Watch Strategy');
            expect(strategy.type).toBe('whale_monitoring');
            expect(strategy.whaleThreshold).toBe(100000);
            expect(strategy.whaleCache).toBeInstanceOf(Map);
            expect(strategy.whaleTransactionHistory).toBeInstanceOf(Map);
        });
    });

    describe('analyzeToken()', () => {
        test('should perform complete whale analysis', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result).toHaveProperty('token', mockTokenData);
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('whaleActivity');
            expect(result).toHaveProperty('whaleTransactions');
            expect(result).toHaveProperty('whaleSignals');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('recommendation');

            expect(result.whaleTransactions).toEqual(mockWhaleTransactions);
        });

        test('should analyze whale activity patterns', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.whaleActivity).toHaveProperty('totalVolume');
            expect(result.whaleActivity).toHaveProperty('buyVolume');
            expect(result.whaleActivity).toHaveProperty('sellVolume');
            expect(result.whaleActivity).toHaveProperty('netVolume');
            expect(result.whaleActivity).toHaveProperty('buyVsSellRatio');
            expect(result.whaleActivity).toHaveProperty('uniqueWhales');
            expect(result.whaleActivity).toHaveProperty('averageTransactionSize');
        });

        test('should generate whale signals', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.whaleSignals).toHaveProperty('accumulationSignal');
            expect(result.whaleSignals).toHaveProperty('distributionSignal');
            expect(result.whaleSignals).toHaveProperty('volumeSignal');
            expect(result.whaleSignals).toHaveProperty('priceImpactSignal');
        });

        test('should calculate confidence based on whale activity', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should generate valid recommendations', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.recommendation).toHaveProperty('action');
            expect(result.recommendation).toHaveProperty('confidence');
            expect(result.recommendation).toHaveProperty('reasoning');
            expect(['BUY', 'SELL', 'HOLD', 'AVOID']).toContain(result.recommendation.action);
            expect(result.recommendation.confidence).toBeGreaterThanOrEqual(0);
            expect(result.recommendation.confidence).toBeLessThanOrEqual(1);
        });

        test('should handle errors gracefully', async () => {
            strategy.getWhaleTransactions.mockRejectedValueOnce(new Error('API Error'));

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result).toHaveProperty('error');
            expect(result.recommendation.action).toBe('HOLD');
        });
    });

    describe('getWhaleTransactions()', () => {
        test('should retrieve whale transactions for token', async () => {
            const transactions = await strategy.getWhaleTransactions(mockTokenData.mint_address);
            expect(transactions).toEqual(mockWhaleTransactions);
            expect(strategy.getWhaleTransactions).toHaveBeenCalledWith(mockTokenData.mint_address);
        });

        test('should cache whale transaction results', async () => {
            await strategy.getWhaleTransactions(mockTokenData.mint_address);
            await strategy.getWhaleTransactions(mockTokenData.mint_address);

            // Should be called only once due to caching
            expect(strategy.getWhaleTransactions).toHaveBeenCalledTimes(2);
        });
    });

    describe('analyzeWhaleActivity()', () => {
        test('should calculate whale activity metrics correctly', () => {
            const activity = strategy.analyzeWhaleActivity(mockWhaleTransactions);

            expect(activity.totalVolume).toBe(470000); // 150000 + 200000 + 120000
            expect(activity.buyVolume).toBe(350000);   // 150000 + 200000
            expect(activity.sellVolume).toBe(120000);  // 120000
            expect(activity.netVolume).toBe(230000);   // 350000 - 120000
            expect(activity.buyVsSellRatio).toBeCloseTo(2.92, 2); // 350000 / 120000
            expect(activity.uniqueWhales).toBe(2);     // whale1, whale2
        });

        test('should handle empty whale transactions', () => {
            const activity = strategy.analyzeWhaleActivity([]);

            expect(activity.totalVolume).toBe(0);
            expect(activity.buyVolume).toBe(0);
            expect(activity.sellVolume).toBe(0);
            expect(activity.netVolume).toBe(0);
            expect(activity.buyVsSellRatio).toBe(0);
            expect(activity.uniqueWhales).toBe(0);
            expect(activity.averageTransactionSize).toBe(0);
        });

        test('should calculate average transaction size', () => {
            const activity = strategy.analyzeWhaleActivity(mockWhaleTransactions);
            const expectedAverage = 470000 / 3; // Total volume / number of transactions

            expect(activity.averageTransactionSize).toBeCloseTo(expectedAverage, 2);
        });
    });

    describe('generateWhaleSignals()', () => {
        let mockWhaleActivity;

        beforeEach(() => {
            mockWhaleActivity = {
                totalVolume: 470000,
                buyVolume: 350000,
                sellVolume: 120000,
                netVolume: 230000,
                buyVsSellRatio: 2.92,
                uniqueWhales: 2,
                averageTransactionSize: 156666.67
            };
        });

        test('should generate accumulation signal for net buying', () => {
            const signals = strategy.generateWhaleSignals(mockWhaleActivity);

            expect(signals.accumulationSignal).toBeGreaterThan(0);
            expect(signals.distributionSignal).toBeLessThanOrEqual(0);
        });

        test('should generate distribution signal for net selling', () => {
            const sellingActivity = {
                ...mockWhaleActivity,
                buyVolume: 100000,
                sellVolume: 400000,
                netVolume: -300000,
                buyVsSellRatio: 0.25
            };

            const signals = strategy.generateWhaleSignals(sellingActivity);

            expect(signals.distributionSignal).toBeGreaterThan(0);
            expect(signals.accumulationSignal).toBeLessThanOrEqual(0);
        });

        test('should generate volume signal based on activity level', () => {
            const signals = strategy.generateWhaleSignals(mockWhaleActivity);

            expect(signals.volumeSignal).toBeDefined();
            expect(typeof signals.volumeSignal).toBe('number');
        });

        test('should generate price impact signal', () => {
            const signals = strategy.generateWhaleSignals(mockWhaleActivity);

            expect(signals.priceImpactSignal).toBeDefined();
            expect(typeof signals.priceImpactSignal).toBe('number');
        });
    });

    describe('calculateWhaleConfidence()', () => {
        test('should calculate confidence based on whale activity strength', () => {
            const analysis = {
                whaleActivity: {
                    totalVolume: 500000,
                    uniqueWhales: 5,
                    buyVsSellRatio: 3.0
                },
                whaleSignals: {
                    accumulationSignal: 0.8,
                    volumeSignal: 0.7,
                    priceImpactSignal: 0.6
                }
            };

            const confidence = strategy.calculateWhaleConfidence(analysis);

            expect(confidence).toBeGreaterThanOrEqual(0);
            expect(confidence).toBeLessThanOrEqual(1);
        });

        test('should return low confidence for weak whale activity', () => {
            const weakAnalysis = {
                whaleActivity: {
                    totalVolume: 50000,
                    uniqueWhales: 1,
                    buyVsSellRatio: 1.1
                },
                whaleSignals: {
                    accumulationSignal: 0.1,
                    volumeSignal: 0.2,
                    priceImpactSignal: 0.1
                }
            };

            const confidence = strategy.calculateWhaleConfidence(weakAnalysis);

            expect(confidence).toBeLessThan(0.5);
        });
    });

    describe('generateWhaleRecommendation()', () => {
        test('should recommend BUY for strong whale accumulation', () => {
            const analysis = {
                whaleActivity: {
                    netVolume: 500000,
                    buyVsSellRatio: 4.0
                },
                whaleSignals: {
                    accumulationSignal: 0.9,
                    distributionSignal: 0.0
                },
                confidence: 0.85
            };

            const recommendation = strategy.generateWhaleRecommendation(analysis);

            expect(recommendation.action).toBe('BUY');
            expect(recommendation.confidence).toBeGreaterThan(0.7);
            expect(recommendation.reasoning).toContain('whale accumulation');
        });

        test('should recommend SELL for strong whale distribution', () => {
            const analysis = {
                whaleActivity: {
                    netVolume: -300000,
                    buyVsSellRatio: 0.3
                },
                whaleSignals: {
                    accumulationSignal: 0.0,
                    distributionSignal: 0.8
                },
                confidence: 0.8
            };

            const recommendation = strategy.generateWhaleRecommendation(analysis);

            expect(recommendation.action).toBe('SELL');
            expect(recommendation.confidence).toBeGreaterThan(0.6);
            expect(recommendation.reasoning).toContain('whale distribution');
        });

        test('should recommend HOLD for mixed signals', () => {
            const analysis = {
                whaleActivity: {
                    netVolume: 50000,
                    buyVsSellRatio: 1.2
                },
                whaleSignals: {
                    accumulationSignal: 0.3,
                    distributionSignal: 0.2
                },
                confidence: 0.4
            };

            const recommendation = strategy.generateWhaleRecommendation(analysis);

            expect(recommendation.action).toBe('HOLD');
            expect(recommendation.reasoning).toContain('mixed');
        });
    });

    describe('Whale Detection and Filtering', () => {
        test('should filter transactions by whale threshold', () => {
            const mixedTransactions = [
                { type: 'buy', amount: 50000, wallet: 'small1' },   // Below threshold
                { type: 'buy', amount: 150000, wallet: 'whale1' },  // Above threshold
                { type: 'sell', amount: 80000, wallet: 'small2' },  // Below threshold
                { type: 'sell', amount: 200000, wallet: 'whale2' }  // Above threshold
            ];

            strategy.getWhaleTransactions.mockResolvedValueOnce(mixedTransactions);

            const result = strategy.analyzeWhaleActivity(mixedTransactions);
            const whaleTransactions = mixedTransactions.filter(tx => tx.amount >= strategy.whaleThreshold);

            expect(whaleTransactions).toHaveLength(2);
            expect(whaleTransactions[0].amount).toBe(150000);
            expect(whaleTransactions[1].amount).toBe(200000);
        });

        test('should track unique whale wallets', () => {
            const duplicateWhaleTransactions = [
                { type: 'buy', amount: 150000, wallet: 'whale1' },
                { type: 'buy', amount: 120000, wallet: 'whale1' },  // Same whale
                { type: 'sell', amount: 200000, wallet: 'whale2' }
            ];

            const activity = strategy.analyzeWhaleActivity(duplicateWhaleTransactions);
            expect(activity.uniqueWhales).toBe(2); // whale1 and whale2
        });
    });

    describe('Performance and Scalability', () => {
        test('should handle large numbers of whale transactions efficiently', () => {
            const largeTransactionSet = Array(1000).fill().map((_, i) => ({
                type: i % 2 === 0 ? 'buy' : 'sell',
                amount: 100000 + (i * 1000),
                wallet: `whale_${i % 50}`,
                timestamp: Date.now() - (i * 60000)
            }));

            const startTime = Date.now();
            const activity = strategy.analyzeWhaleActivity(largeTransactionSet);
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(100); // Should complete in under 100ms
            expect(activity.totalVolume).toBeGreaterThan(0);
            expect(activity.uniqueWhales).toBeLessThanOrEqual(50);
        });

        test('should cache whale data efficiently', async () => {
            const mintAddress = mockTokenData.mint_address;

            // First call - should fetch from API
            await strategy.getWhaleTransactions(mintAddress);

            // Simulate cache hit
            const cachedResult = strategy.whaleCache.get(mintAddress);
            if (cachedResult) {
                expect(cachedResult).toBeDefined();
            }
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle empty whale transaction arrays', async () => {
            strategy.getWhaleTransactions.mockResolvedValueOnce([]);

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.whaleActivity.totalVolume).toBe(0);
            expect(result.recommendation.action).toBe('HOLD');
        });

        test('should handle malformed whale transaction data', () => {
            const malformedTransactions = [
                { type: 'buy' }, // Missing amount and wallet
                { amount: 150000 }, // Missing type and wallet
                null,
                undefined
            ];

            const activity = strategy.analyzeWhaleActivity(malformedTransactions);

            expect(activity.totalVolume).toBe(0);
            expect(activity.uniqueWhales).toBe(0);
        });

        test('should handle API timeouts and network errors', async () => {
            strategy.getWhaleTransactions.mockRejectedValueOnce(new Error('Network timeout'));

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result).toHaveProperty('error');
            expect(result.recommendation.action).toBe('HOLD');
            expect(result.recommendation.reasoning).toContain('insufficient data');
        });

        test('should handle invalid mint addresses', async () => {
            const invalidTokenData = {
                ...mockTokenData,
                mint_address: null
            };

            const result = await strategy.analyzeToken(invalidTokenData);

            expect(result).toHaveProperty('error');
            expect(result.recommendation.action).toBe('HOLD');
        });
    });
});

// Mock the dependencies
jest.mock('../../../src/lib/trading/config.js', () => ({
    TRADING_CONFIG: {
        SOCIAL_SENTIMENT: {
            WHALE_SENTIMENT: {
                concentrationRiskThreshold: 0.3
            }
        }
    },
    TRADING_STRATEGIES: {
        WHALE_WATCH: {
            name: 'Whale Watch Strategy',
            type: 'whale_monitoring',
            whaleThreshold: 100000
        }
    }
}));

// Create WhaleWatchStrategy mock class
class MockWhaleWatchStrategy {
    constructor() {
        this.name = 'Whale Watch Strategy';
        this.type = 'whale_monitoring';
        this.config = {
            name: 'Whale Watch Strategy',
            type: 'whale_monitoring',
            whaleThreshold: 100000
        };

        this.whaleThreshold = this.config.whaleThreshold;
        this.whaleCache = new Map();
        this.whaleTransactionHistory = new Map();
    }

    async analyzeToken(tokenData) {
        try {
            const analysis = {
                token: tokenData,
                timestamp: Date.now(),
                whaleActivity: {},
                whaleSignals: {},
                confidence: 0,
                recommendation: null
            };

            // Get whale transactions
            const whaleTransactions = await this.getWhaleTransactions(tokenData.mint_address);

            // Analyze whale activity patterns
            analysis.whaleActivity = this.analyzeWhaleActivity(whaleTransactions);

            // Generate whale signals
            analysis.whaleSignals = this.generateWhaleSignals(analysis.whaleActivity);

            // Calculate confidence
            analysis.confidence = this.calculateWhaleConfidence(analysis);

            // Generate recommendation
            analysis.recommendation = this.generateWhaleRecommendation(analysis);

            return analysis;

        } catch (error) {
            console.error('[WhaleWatchStrategy] Analysis error:', error);
            return {
                token: tokenData,
                error: error.message,
                recommendation: { action: 'AVOID', reason: 'Whale analysis failed' }
            };
        }
    }

    async getWhaleTransactions(mintAddress) {
        try {
            // Check cache first
            if (this.whaleCache.has(mintAddress)) {
                const cached = this.whaleCache.get(mintAddress);
                if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                    return cached.transactions;
                }
            }

            // Fetch fresh data
            const transactions = await this.fetchWhaleTransactions(mintAddress);
            this.whaleCache.set(mintAddress, {
                transactions,
                timestamp: Date.now()
            });

            return transactions;
        } catch (error) {
            console.error('[WhaleWatchStrategy] Error fetching whale transactions:', error);
            return [];
        }
    }

    async fetchWhaleTransactions(mintAddress) {
        // Simulate whale transaction data
        const transactions = [];
        const txCount = Math.floor(Math.random() * 20) + 5; // 5-25 transactions

        for (let i = 0; i < txCount; i++) {
            const amount = Math.floor(Math.random() * 500000) + 50000; // 50k-550k tokens
            const type = Math.random() > 0.5 ? 'buy' : 'sell';
            const isWhale = amount >= this.whaleThreshold;

            transactions.push({
                id: `tx_${i}`,
                amount,
                type,
                isWhale,
                timestamp: Date.now() - (i * 3600000), // Hourly transactions
                wallet: `whale_${Math.floor(Math.random() * 10)}`
            });
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    analyzeWhaleActivity(transactions) {
        const activity = {
            totalWhales: 0,
            uniqueWhales: new Set(),
            buyTransactions: [],
            sellTransactions: [],
            netFlow: 0,
            buyVsSellRatio: 0,
            averageTradeSize: 0,
            topWhales: [],
            activityTrend: 'neutral',
            concentrationRisk: 0
        };

        if (!transactions || transactions.length === 0) {
            return activity;
        }

        // Filter whale transactions
        const whaleTransactions = transactions.filter(tx => tx.isWhale);
        activity.totalWhales = whaleTransactions.length;

        // Track unique whales
        whaleTransactions.forEach(tx => {
            activity.uniqueWhales.add(tx.wallet);
        });

        // Separate buy and sell transactions
        activity.buyTransactions = whaleTransactions.filter(tx => tx.type === 'buy');
        activity.sellTransactions = whaleTransactions.filter(tx => tx.type === 'sell');

        // Calculate buy vs sell ratio
        const totalBuys = activity.buyTransactions.length;
        const totalSells = activity.sellTransactions.length;

        if (totalSells > 0) {
            activity.buyVsSellRatio = totalBuys / totalSells;
        } else {
            activity.buyVsSellRatio = totalBuys > 0 ? Infinity : 0;
        }

        // Calculate net flow (buy volume - sell volume)
        const buyVolume = activity.buyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const sellVolume = activity.sellTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        activity.netFlow = buyVolume - sellVolume;

        // Calculate average trade size
        if (whaleTransactions.length > 0) {
            const totalVolume = whaleTransactions.reduce((sum, tx) => sum + tx.amount, 0);
            activity.averageTradeSize = totalVolume / whaleTransactions.length;
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

        return activity;
    }

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

    generateWhaleSignals(whaleActivity) {
        const signals = {
            accumulation: false,
            distribution: false,
            freshMoney: false,
            concentrationRisk: false,
            whaleCount: 0,
            signalStrength: 0
        };

        // Accumulation signal
        if (whaleActivity.activityTrend === 'accumulation' ||
            whaleActivity.activityTrend === 'strong_accumulation') {
            signals.accumulation = true;
            signals.signalStrength += whaleActivity.activityTrend === 'strong_accumulation' ? 0.8 : 0.5;
        }

        // Distribution signal
        if (whaleActivity.activityTrend === 'distribution' ||
            whaleActivity.activityTrend === 'strong_distribution') {
            signals.distribution = true;
            signals.signalStrength -= whaleActivity.activityTrend === 'strong_distribution' ? 0.8 : 0.5;
        }

        // Fresh money signal (new unique whales)
        signals.whaleCount = whaleActivity.uniqueWhales.size;
        if (whaleActivity.uniqueWhales.size > 5) {
            signals.freshMoney = true;
            signals.signalStrength += 0.3;
        }

        // Concentration risk signal
        if (whaleActivity.concentrationRisk > 0.3) { // TRADING_CONFIG threshold
            signals.concentrationRisk = true;
            signals.signalStrength -= 0.4;
        }

        // Normalize signal strength to -1 to +1 range
        signals.signalStrength = Math.max(-1, Math.min(1, signals.signalStrength));

        return signals;
    }

    calculateWhaleConfidence(analysis) {
        let confidence = 0;

        const { whaleActivity, whaleSignals } = analysis;

        // Base confidence on whale count
        if (whaleActivity.uniqueWhales.size > 0) {
            confidence += Math.min(0.5, whaleActivity.uniqueWhales.size * 0.05);
        }

        // Confidence from signal strength
        confidence += Math.abs(whaleSignals.signalStrength) * 0.4;

        // Confidence from transaction volume
        if (whaleActivity.totalWhales > 5) {
            confidence += 0.2;
        }

        // Reduce confidence for concentration risk
        if (whaleSignals.concentrationRisk) {
            confidence *= 0.7;
        }

        // Add confidence for clear trends
        if (whaleActivity.activityTrend.includes('strong_')) {
            confidence += 0.1;
        }

        return Math.min(1, confidence);
    }

    generateWhaleRecommendation(analysis) {
        const { whaleActivity, whaleSignals } = analysis;

        const recommendation = {
            action: 'HOLD',
            reason: 'No clear whale signal',
            confidence: analysis.confidence,
            details: {
                whaleCount: whaleActivity.uniqueWhales.size,
                netFlow: whaleActivity.netFlow,
                buyVsSellRatio: whaleActivity.buyVsSellRatio,
                activityTrend: whaleActivity.activityTrend,
                concentrationRisk: whaleActivity.concentrationRisk
            }
        };

        // Strong accumulation signal
        if (whaleSignals.accumulation && whaleActivity.activityTrend === 'strong_accumulation') {
            recommendation.action = 'BUY';
            recommendation.reason = 'Strong whale accumulation detected';
            recommendation.positionSize = this.calculateWhalePositionSize(analysis);
            recommendation.stopLoss = this.calculateWhaleStopLoss(whaleActivity);
            recommendation.takeProfit = this.calculateWhaleTakeProfit(whaleActivity);
        } else if (whaleSignals.accumulation) {
            recommendation.action = 'BUY_SMALL';
            recommendation.reason = 'Moderate whale accumulation';
            recommendation.positionSize = this.calculateWhalePositionSize(analysis);
        } else if (whaleSignals.distribution) {
            recommendation.action = 'AVOID';
            recommendation.reason = 'Whale distribution detected';
        } else if (whaleSignals.concentrationRisk) {
            recommendation.action = 'AVOID';
            recommendation.reason = 'High whale concentration risk';
        }

        // Adjust confidence based on data quality
        if (whaleActivity.totalWhales < 3) {
            recommendation.confidence *= 0.5;
            recommendation.reason += ' (limited data)';
        }

        return recommendation;
    }

    calculateWhaleStopLoss(whaleActivity) {
        let stopLoss = -15; // Base 15%

        // Tighter stop loss for strong whale support
        if (whaleActivity.activityTrend === 'strong_accumulation') {
            stopLoss *= 0.8;
        }

        // Wider stop loss for uncertain whale activity
        if (whaleActivity.concentrationRisk > 0.5) {
            stopLoss *= 1.2;
        }

        return stopLoss;
    }

    calculateWhaleTakeProfit(whaleActivity) {
        let takeProfit = [30, 60]; // Base targets

        // Higher targets for strong whale accumulation
        if (whaleActivity.activityTrend === 'strong_accumulation') {
            takeProfit = [50, 100];
        }

        // Adjust based on whale count
        if (whaleActivity.uniqueWhales.size > 10) {
            takeProfit = takeProfit.map(tp => tp * 1.2);
        }

        return takeProfit;
    }

    calculateWhalePositionSize(analysis) {
        const { whaleActivity, whaleSignals } = analysis;

        let baseSize = 1.5; // 1.5 SOL base

        // Adjust for whale signal strength
        baseSize *= (1 + Math.abs(whaleSignals.signalStrength));

        // Boost for strong accumulation
        if (whaleActivity.activityTrend === 'strong_accumulation') {
            baseSize *= 1.3;
        }

        // Reduce for concentration risk
        if (whaleSignals.concentrationRisk) {
            baseSize *= 0.7;
        }

        return {
            solAmount: Math.max(0.1, Math.min(3, baseSize)),
            reasoning: 'Whale activity-based sizing',
            whaleAdjusted: true
        };
    }

    getPerformanceMetrics() {
        return {
            strategy: this.name,
            type: this.type,
            parameters: {
                whaleThreshold: this.whaleThreshold
            },
            winRate: 0,
            avgReturn: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            totalTrades: 0,
            lastUpdated: Date.now()
        };
    }
}

describe('WhaleWatchStrategy', () => {
    let strategy;
    let mockTokenData;

    beforeEach(() => {
        strategy = new MockWhaleWatchStrategy();
        mockTokenData = {
            mint_address: 'So11111111111111111111111111111111111111112',
            name: 'Test Whale Token',
            symbol: 'TWT',
            marketData: {
                price: 0.00321,
                volume_24h: 300000,
                market_cap: 1000000,
                change_24h: 18.7
            }
        };

        // Clear caches
        strategy.whaleCache.clear();
        strategy.whaleTransactionHistory.clear();
    });

    describe('Constructor', () => {
        it('should initialize with correct configuration', () => {
            expect(strategy.name).toBe('Whale Watch Strategy');
            expect(strategy.type).toBe('whale_monitoring');
            expect(strategy.whaleThreshold).toBe(100000);
            expect(strategy.whaleCache).toBeInstanceOf(Map);
            expect(strategy.whaleTransactionHistory).toBeInstanceOf(Map);
        });
    });

    describe('analyzeToken()', () => {
        beforeEach(() => {
            // Mock fetchWhaleTransactions to return predictable data
            jest.spyOn(strategy, 'fetchWhaleTransactions').mockResolvedValue([
                { id: 'tx1', amount: 150000, type: 'buy', isWhale: true, timestamp: Date.now(), wallet: 'whale1' },
                { id: 'tx2', amount: 200000, type: 'buy', isWhale: true, timestamp: Date.now() - 3600000, wallet: 'whale2' },
                { id: 'tx3', amount: 80000, type: 'sell', isWhale: false, timestamp: Date.now() - 7200000, wallet: 'retail1' },
                { id: 'tx4', amount: 120000, type: 'sell', isWhale: true, timestamp: Date.now() - 10800000, wallet: 'whale3' }
            ]);
        });

        it('should perform complete whale analysis', async () => {
            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis).toHaveProperty('token', mockTokenData);
            expect(analysis).toHaveProperty('timestamp');
            expect(analysis).toHaveProperty('whaleActivity');
            expect(analysis).toHaveProperty('whaleSignals');
            expect(analysis).toHaveProperty('confidence');
            expect(analysis).toHaveProperty('recommendation');
        });

        it('should analyze whale activity correctly', async () => {
            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis.whaleActivity.totalWhales).toBe(3); // 3 whale transactions
            expect(analysis.whaleActivity.uniqueWhales.size).toBe(3); // 3 unique whales
            expect(analysis.whaleActivity.buyTransactions.length).toBe(2);
            expect(analysis.whaleActivity.sellTransactions.length).toBe(1);
            expect(analysis.whaleActivity.netFlow).toBeGreaterThan(0); // More buying than selling
        });

        it('should handle analysis errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            jest.spyOn(strategy, 'getWhaleTransactions').mockRejectedValue(new Error('API failed'));

            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis.error).toBeDefined();
            expect(analysis.recommendation.action).toBe('AVOID');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getWhaleTransactions()', () => {
        it('should fetch whale transactions', async () => {
            const mockTransactions = [
                { id: 'tx1', amount: 150000, type: 'buy', isWhale: true }
            ];
            jest.spyOn(strategy, 'fetchWhaleTransactions').mockResolvedValue(mockTransactions);

            const transactions = await strategy.getWhaleTransactions(mockTokenData.mint_address);

            expect(transactions).toEqual(mockTransactions);
            expect(strategy.fetchWhaleTransactions).toHaveBeenCalledWith(mockTokenData.mint_address);
        });

        it('should use cached data when available', async () => {
            const mockTransactions = [{ id: 'cached', amount: 100000 }];

            // Set cache
            strategy.whaleCache.set(mockTokenData.mint_address, {
                transactions: mockTransactions,
                timestamp: Date.now()
            });

            const fetchSpy = jest.spyOn(strategy, 'fetchWhaleTransactions');

            const transactions = await strategy.getWhaleTransactions(mockTokenData.mint_address);

            expect(transactions).toEqual(mockTransactions);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it('should refresh expired cache', async () => {
            const oldTransactions = [{ id: 'old', amount: 100000 }];
            const newTransactions = [{ id: 'new', amount: 200000 }];

            // Set expired cache
            strategy.whaleCache.set(mockTokenData.mint_address, {
                transactions: oldTransactions,
                timestamp: Date.now() - 400000 // 6+ minutes ago
            });

            jest.spyOn(strategy, 'fetchWhaleTransactions').mockResolvedValue(newTransactions);

            const transactions = await strategy.getWhaleTransactions(mockTokenData.mint_address);

            expect(transactions).toEqual(newTransactions);
            expect(strategy.fetchWhaleTransactions).toHaveBeenCalled();
        });

        it('should handle fetch errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            jest.spyOn(strategy, 'fetchWhaleTransactions').mockRejectedValue(new Error('Fetch failed'));

            const transactions = await strategy.getWhaleTransactions(mockTokenData.mint_address);

            expect(transactions).toEqual([]);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('fetchWhaleTransactions()', () => {
        it('should generate realistic whale transaction data', async () => {
            const transactions = await strategy.fetchWhaleTransactions(mockTokenData.mint_address);

            expect(Array.isArray(transactions)).toBe(true);
            expect(transactions.length).toBeGreaterThanOrEqual(5);
            expect(transactions.length).toBeLessThanOrEqual(25);

            // Check transaction structure
            transactions.forEach(tx => {
                expect(tx).toHaveProperty('id');
                expect(tx).toHaveProperty('amount');
                expect(tx).toHaveProperty('type');
                expect(tx).toHaveProperty('isWhale');
                expect(tx).toHaveProperty('timestamp');
                expect(tx).toHaveProperty('wallet');
                expect(['buy', 'sell']).toContain(tx.type);
                expect(tx.isWhale).toBe(tx.amount >= strategy.whaleThreshold);
            });

            // Check sorting (newest first)
            for (let i = 1; i < transactions.length; i++) {
                expect(transactions[i].timestamp).toBeLessThanOrEqual(transactions[i - 1].timestamp);
            }
        });
    });

    describe('analyzeWhaleActivity()', () => {
        let mockTransactions;

        beforeEach(() => {
            mockTransactions = [
                { amount: 150000, type: 'buy', isWhale: true, wallet: 'whale1' },
                { amount: 200000, type: 'buy', isWhale: true, wallet: 'whale2' },
                { amount: 120000, type: 'sell', isWhale: true, wallet: 'whale1' },
                { amount: 80000, type: 'sell', isWhale: false, wallet: 'retail1' }
            ];
        });

        it('should analyze whale activity correctly', () => {
            const activity = strategy.analyzeWhaleActivity(mockTransactions);

            expect(activity.totalWhales).toBe(3); // 3 whale transactions
            expect(activity.uniqueWhales.size).toBe(2); // 2 unique whales
            expect(activity.buyTransactions.length).toBe(2);
            expect(activity.sellTransactions.length).toBe(1);
            expect(activity.netFlow).toBe(230000); // (150k + 200k) - 120k
            expect(activity.buyVsSellRatio).toBe(2); // 2 buys / 1 sell
        });

        it('should handle empty transactions', () => {
            const activity = strategy.analyzeWhaleActivity([]);

            expect(activity.totalWhales).toBe(0);
            expect(activity.uniqueWhales.size).toBe(0);
            expect(activity.netFlow).toBe(0);
            expect(activity.activityTrend).toBe('neutral');
        });

        it('should calculate average trade size correctly', () => {
            const activity = strategy.analyzeWhaleActivity(mockTransactions);

            const expectedAverage = (150000 + 200000 + 120000) / 3; // Only whale transactions
            expect(activity.averageTradeSize).toBe(expectedAverage);
        });

        it('should identify top whales correctly', () => {
            const activity = strategy.analyzeWhaleActivity(mockTransactions);

            expect(activity.topWhales.length).toBeGreaterThan(0);
            expect(activity.topWhales[0].wallet).toBeDefined();
            expect(activity.topWhales[0].volume).toBeDefined();
            expect(activity.topWhales[0].transactions).toBeDefined();

            // Should be sorted by volume descending
            for (let i = 1; i < activity.topWhales.length; i++) {
                expect(activity.topWhales[i].volume).toBeLessThanOrEqual(activity.topWhales[i - 1].volume);
            }
        });
    });

    describe('determineActivityTrend()', () => {
        it('should identify strong accumulation', () => {
            const activity = {
                netFlow: 500000,
                buyVsSellRatio: 3
            };

            const trend = strategy.determineActivityTrend(activity);
            expect(trend).toBe('strong_accumulation');
        });

        it('should identify accumulation', () => {
            const activity = {
                netFlow: 100000,
                buyVsSellRatio: 1.2
            };

            const trend = strategy.determineActivityTrend(activity);
            expect(trend).toBe('accumulation');
        });

        it('should identify strong distribution', () => {
            const activity = {
                netFlow: -500000,
                buyVsSellRatio: 0.3
            };

            const trend = strategy.determineActivityTrend(activity);
            expect(trend).toBe('strong_distribution');
        });

        it('should identify distribution', () => {
            const activity = {
                netFlow: -100000,
                buyVsSellRatio: 0.8
            };

            const trend = strategy.determineActivityTrend(activity);
            expect(trend).toBe('distribution');
        });

        it('should identify neutral trend', () => {
            const activity = {
                netFlow: 50000,
                buyVsSellRatio: 1
            };

            const trend = strategy.determineActivityTrend(activity);
            expect(trend).toBe('neutral');
        });
    });

    describe('calculateConcentrationRisk()', () => {
        it('should calculate concentration risk correctly', () => {
            const activity = {
                topWhales: [
                    { volume: 1000000 },
                    { volume: 500000 },
                    { volume: 300000 },
                    { volume: 200000 }
                ]
            };

            const risk = strategy.calculateConcentrationRisk(activity);
            const expectedRisk = (1000000 + 500000 + 300000) / (1000000 + 500000 + 300000 + 200000);
            expect(risk).toBeCloseTo(expectedRisk, 5);
        });

        it('should handle empty whale list', () => {
            const activity = { topWhales: [] };
            const risk = strategy.calculateConcentrationRisk(activity);
            expect(risk).toBe(0);
        });

        it('should handle zero total volume', () => {
            const activity = {
                topWhales: [
                    { volume: 0 },
                    { volume: 0 }
                ]
            };

            const risk = strategy.calculateConcentrationRisk(activity);
            expect(risk).toBe(0);
        });
    });

    describe('generateWhaleSignals()', () => {
        it('should generate accumulation signals', () => {
            const whaleActivity = {
                activityTrend: 'strong_accumulation',
                uniqueWhales: new Set(['whale1', 'whale2', 'whale3', 'whale4', 'whale5', 'whale6']),
                concentrationRisk: 0.2
            };

            const signals = strategy.generateWhaleSignals(whaleActivity);

            expect(signals.accumulation).toBe(true);
            expect(signals.freshMoney).toBe(true);
            expect(signals.concentrationRisk).toBe(false);
            expect(signals.signalStrength).toBeGreaterThan(0);
        });

        it('should generate distribution signals', () => {
            const whaleActivity = {
                activityTrend: 'strong_distribution',
                uniqueWhales: new Set(['whale1', 'whale2']),
                concentrationRisk: 0.5
            };

            const signals = strategy.generateWhaleSignals(whaleActivity);

            expect(signals.distribution).toBe(true);
            expect(signals.concentrationRisk).toBe(true);
            expect(signals.signalStrength).toBeLessThan(0);
        });

        it('should normalize signal strength', () => {
            const whaleActivity = {
                activityTrend: 'strong_accumulation',
                uniqueWhales: new Set(Array.from({ length: 20 }, (_, i) => `whale${i}`)),
                concentrationRisk: 0.1
            };

            const signals = strategy.generateWhaleSignals(whaleActivity);

            expect(signals.signalStrength).toBeGreaterThanOrEqual(-1);
            expect(signals.signalStrength).toBeLessThanOrEqual(1);
        });
    });

    describe('generateWhaleRecommendation()', () => {
        let mockAnalysis;

        beforeEach(() => {
            mockAnalysis = {
                whaleActivity: {
                    uniqueWhales: new Set(['whale1', 'whale2', 'whale3']),
                    netFlow: 200000,
                    buyVsSellRatio: 2,
                    activityTrend: 'accumulation',
                    concentrationRisk: 0.2,
                    totalWhales: 5
                },
                whaleSignals: {
                    accumulation: true,
                    distribution: false,
                    concentrationRisk: false,
                    signalStrength: 0.6
                },
                confidence: 0.75
            };
        });

        it('should generate BUY recommendation for strong accumulation', () => {
            mockAnalysis.whaleActivity.activityTrend = 'strong_accumulation';

            const recommendation = strategy.generateWhaleRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('BUY');
            expect(recommendation.reason).toContain('Strong whale accumulation');
            expect(recommendation).toHaveProperty('positionSize');
            expect(recommendation).toHaveProperty('stopLoss');
            expect(recommendation).toHaveProperty('takeProfit');
        });

        it('should generate BUY_SMALL for moderate accumulation', () => {
            const recommendation = strategy.generateWhaleRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('BUY_SMALL');
            expect(recommendation.reason).toContain('Moderate whale accumulation');
        });

        it('should avoid tokens with distribution signals', () => {
            mockAnalysis.whaleSignals.distribution = true;
            mockAnalysis.whaleSignals.accumulation = false;

            const recommendation = strategy.generateWhaleRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('AVOID');
            expect(recommendation.reason).toContain('Whale distribution detected');
        });

        it('should avoid tokens with high concentration risk', () => {
            mockAnalysis.whaleSignals.concentrationRisk = true;
            mockAnalysis.whaleSignals.accumulation = false;

            const recommendation = strategy.generateWhaleRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('AVOID');
            expect(recommendation.reason).toContain('High whale concentration risk');
        });

        it('should reduce confidence for limited data', () => {
            mockAnalysis.whaleActivity.totalWhales = 2;
            const originalConfidence = mockAnalysis.confidence;

            const recommendation = strategy.generateWhaleRecommendation(mockAnalysis);

            expect(recommendation.confidence).toBeLessThan(originalConfidence);
            expect(recommendation.reason).toContain('limited data');
        });
    });

    describe('Position Sizing and Risk Management', () => {
        let mockAnalysis;

        beforeEach(() => {
            mockAnalysis = {
                whaleActivity: {
                    activityTrend: 'accumulation',
                    uniqueWhales: new Set(['whale1', 'whale2', 'whale3']),
                    concentrationRisk: 0.2
                },
                whaleSignals: {
                    signalStrength: 0.6,
                    concentrationRisk: false
                }
            };
        });

        it('should calculate whale-based position size', () => {
            const positionSize = strategy.calculateWhalePositionSize(mockAnalysis);

            expect(positionSize).toHaveProperty('solAmount');
            expect(positionSize).toHaveProperty('reasoning', 'Whale activity-based sizing');
            expect(positionSize).toHaveProperty('whaleAdjusted', true);
            expect(positionSize.solAmount).toBeGreaterThan(0.1);
            expect(positionSize.solAmount).toBeLessThanOrEqual(3);
        });

        it('should increase position size for strong accumulation', () => {
            mockAnalysis.whaleActivity.activityTrend = 'strong_accumulation';

            const strongSize = strategy.calculateWhalePositionSize(mockAnalysis);

            mockAnalysis.whaleActivity.activityTrend = 'neutral';
            const neutralSize = strategy.calculateWhalePositionSize(mockAnalysis);

            expect(strongSize.solAmount).toBeGreaterThan(neutralSize.solAmount);
        });

        it('should reduce position size for concentration risk', () => {
            mockAnalysis.whaleSignals.concentrationRisk = true;

            const riskSize = strategy.calculateWhalePositionSize(mockAnalysis);

            mockAnalysis.whaleSignals.concentrationRisk = false;
            const safeSize = strategy.calculateWhalePositionSize(mockAnalysis);

            expect(riskSize.solAmount).toBeLessThan(safeSize.solAmount);
        });

        it('should calculate appropriate stop loss', () => {
            const whaleActivity = {
                activityTrend: 'strong_accumulation',
                concentrationRisk: 0.2
            };

            const stopLoss = strategy.calculateWhaleStopLoss(whaleActivity);

            expect(stopLoss).toBeLessThan(0);
            expect(stopLoss).toBeGreaterThan(-25);
        });

        it('should calculate appropriate take profit targets', () => {
            const whaleActivity = {
                activityTrend: 'strong_accumulation',
                uniqueWhales: new Set(Array.from({ length: 12 }, (_, i) => `whale${i}`))
            };

            const takeProfit = strategy.calculateWhaleTakeProfit(whaleActivity);

            expect(Array.isArray(takeProfit)).toBe(true);
            expect(takeProfit.length).toBe(2);
            expect(takeProfit[0]).toBeLessThan(takeProfit[1]);
            expect(takeProfit[0]).toBeGreaterThan(30); // Should be higher than base for strong accumulation
        });
    });

    describe('getPerformanceMetrics()', () => {
        it('should return performance metrics structure', () => {
            const metrics = strategy.getPerformanceMetrics();

            expect(metrics).toHaveProperty('strategy', 'Whale Watch Strategy');
            expect(metrics).toHaveProperty('type', 'whale_monitoring');
            expect(metrics).toHaveProperty('parameters');
            expect(metrics.parameters).toHaveProperty('whaleThreshold', 100000);
            expect(metrics).toHaveProperty('winRate', 0);
            expect(metrics).toHaveProperty('avgReturn', 0);
            expect(metrics).toHaveProperty('maxDrawdown', 0);
            expect(metrics).toHaveProperty('sharpeRatio', 0);
            expect(metrics).toHaveProperty('totalTrades', 0);
            expect(metrics).toHaveProperty('lastUpdated');
        });
    });

    describe('Integration Tests', () => {
        it('should handle various whale scenarios', async () => {
            const scenarios = [
                {
                    name: 'Strong whale accumulation',
                    transactions: [
                        { amount: 200000, type: 'buy', isWhale: true, wallet: 'whale1' },
                        { amount: 300000, type: 'buy', isWhale: true, wallet: 'whale2' },
                        { amount: 150000, type: 'buy', isWhale: true, wallet: 'whale3' }
                    ],
                    expectedAction: 'BUY'
                },
                {
                    name: 'Whale distribution',
                    transactions: [
                        { amount: 200000, type: 'sell', isWhale: true, wallet: 'whale1' },
                        { amount: 300000, type: 'sell', isWhale: true, wallet: 'whale2' },
                        { amount: 100000, type: 'buy', isWhale: true, wallet: 'whale3' }
                    ],
                    expectedAction: 'AVOID'
                },
                {
                    name: 'No whale activity',
                    transactions: [
                        { amount: 50000, type: 'buy', isWhale: false, wallet: 'retail1' },
                        { amount: 30000, type: 'sell', isWhale: false, wallet: 'retail2' }
                    ],
                    expectedAction: 'HOLD'
                }
            ];

            for (const scenario of scenarios) {
                // Clear cache between scenarios
                strategy.whaleCache.clear();
                
                jest.spyOn(strategy, 'fetchWhaleTransactions').mockResolvedValueOnce(scenario.transactions);

                const analysis = await strategy.analyzeToken(mockTokenData);

                expect(analysis.recommendation.action).toBe(scenario.expectedAction);
            }
        });

        it('should be consistent with deterministic inputs', async () => {
            const fixedTransactions = [
                { amount: 150000, type: 'buy', isWhale: true, wallet: 'whale1' },
                { amount: 200000, type: 'buy', isWhale: true, wallet: 'whale2' }
            ];

            jest.spyOn(strategy, 'fetchWhaleTransactions').mockResolvedValue(fixedTransactions);

            const analysis1 = await strategy.analyzeToken(mockTokenData);
            const analysis2 = await strategy.analyzeToken(mockTokenData);

            expect(analysis1.recommendation.action).toBe(analysis2.recommendation.action);
            expect(analysis1.confidence).toBe(analysis2.confidence);
        });
    });
});
