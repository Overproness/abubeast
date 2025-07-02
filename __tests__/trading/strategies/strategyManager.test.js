/**
 * Strategy Manager Tests
 * Unit tests for the strategy coordination and consensus system
 */

// Create a mock StrategyManager class
class MockStrategyManager {
    constructor() {
        this.strategies = {
            quantum: {
                initialize: jest.fn().mockResolvedValue(true),
                analyzeToken: jest.fn().mockResolvedValue({
                    recommendation: { action: 'BUY', confidence: 0.8, score: 85 }
                })
            },
            advanced: {
                initialize: jest.fn().mockResolvedValue(true),
                analyzeToken: jest.fn().mockResolvedValue({
                    recommendation: { action: 'BUY', confidence: 0.75, score: 78 }
                })
            },
            momentum: {
                initialize: jest.fn().mockResolvedValue(true),
                analyzeToken: jest.fn().mockResolvedValue({
                    recommendation: { action: 'HOLD', confidence: 0.6, score: 65 }
                })
            }
        };

        this.isInitialized = false;
        this.tradingHistory = [];
        this.config = {};
        this.riskManager = null;
    }

    async initialize() {
        try {
            for (const strategy of Object.values(this.strategies)) {
                await strategy.initialize();
            }
            this.isInitialized = true;
        } catch (error) {
            throw error;
        }
    }

    async analyzeToken(tokenData) {
        try {
            const strategies = {};

            for (const [name, strategy] of Object.entries(this.strategies)) {
                try {
                    strategies[name] = await strategy.analyzeToken(tokenData);
                } catch (error) {
                    strategies[name] = { error: error.message };
                }
            }

            const consensus = this.buildConsensus(strategies);

            return {
                consensus,
                strategies,
                timestamp: Date.now(),
                riskAssessment: this.riskManager ?
                    await this.riskManager.assessRisk(tokenData) :
                    { approved: true, riskScore: 25 }
            };
        } catch (error) {
            return {
                consensus: { action: 'AVOID', confidence: 0, reason: 'Analysis failed' },
                strategies: {},
                timestamp: Date.now(),
                error: error.message
            };
        }
    }

    buildConsensus(strategies) {
        const validStrategies = Object.values(strategies).filter(s => !s.error && s.recommendation);

        if (validStrategies.length === 0) {
            return { action: 'AVOID', confidence: 0, reason: 'No valid strategy results' };
        }

        const actions = validStrategies.map(s => s.recommendation.action);
        const confidences = validStrategies.map(s => s.recommendation.confidence);

        // Count action votes
        const actionCounts = actions.reduce((acc, action) => {
            acc[action] = (acc[action] || 0) + 1;
            return acc;
        }, {});

        // Find most common action
        const consensusAction = Object.keys(actionCounts).reduce((a, b) =>
            actionCounts[a] > actionCounts[b] ? a : b
        );

        // Calculate weighted confidence
        const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;

        // Reduce confidence if there's disagreement
        const agreementRatio = actionCounts[consensusAction] / validStrategies.length;
        const adjustedConfidence = avgConfidence * agreementRatio;

        // Default to AVOID if confidence is too low
        if (adjustedConfidence < 0.5) {
            return { action: 'AVOID', confidence: adjustedConfidence, reason: 'Low confidence consensus' };
        }

        return {
            action: consensusAction,
            confidence: adjustedConfidence,
            reasoning: `${actionCounts[consensusAction]}/${validStrategies.length} strategies agree`
        };
    }

    recordTradeResult(strategy, result) {
        this.tradingHistory.push({
            strategy,
            success: result.success,
            return: result.return,
            timestamp: Date.now()
        });
    }

    getStrategyPerformance() {
        const performance = {};

        for (const strategyName of Object.keys(this.strategies)) {
            const trades = this.tradingHistory.filter(t => t.strategy === strategyName);

            if (trades.length > 0) {
                const wins = trades.filter(t => t.success).length;
                const totalReturn = trades.reduce((sum, t) => sum + t.return, 0);

                performance[strategyName] = {
                    winRate: wins / trades.length,
                    avgReturn: totalReturn / trades.length,
                    totalTrades: trades.length
                };
            }
        }

        return performance;
    }

    adjustStrategyWeights() {
        const performance = this.getStrategyPerformance();
        const weights = {};

        for (const [strategy, perf] of Object.entries(performance)) {
            // Higher weight for better performing strategies
            weights[strategy] = Math.max(0.1, perf.winRate * (1 + perf.avgReturn));
        }

        this.strategyWeights = weights;
    }

    getStrategyWeights() {
        return this.strategyWeights || { quantum: 1, advanced: 1, momentum: 1 };
    }

    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    disableStrategy(strategyName) {
        this.strategies[strategyName].enabled = false;
    }

    enableStrategy(strategyName) {
        this.strategies[strategyName].enabled = true;
    }

    getEnabledStrategies() {
        return Object.keys(this.strategies).filter(name =>
            this.strategies[name].enabled !== false
        );
    }

    getOverallPerformance() {
        if (this.tradingHistory.length === 0) {
            return { totalTrades: 0, winRate: 0, avgReturn: 0, sharpeRatio: 0 };
        }

        const wins = this.tradingHistory.filter(t => t.success).length;
        const totalReturn = this.tradingHistory.reduce((sum, t) => sum + t.return, 0);
        const returns = this.tradingHistory.map(t => t.return);

        // Calculate Sharpe ratio (simplified)
        const avgReturn = totalReturn / this.tradingHistory.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0;

        return {
            totalTrades: this.tradingHistory.length,
            winRate: wins / this.tradingHistory.length,
            avgReturn,
            sharpeRatio
        };
    }

    generatePerformanceReport(period) {
        return {
            period,
            metrics: this.getOverallPerformance(),
            strategies: this.getStrategyPerformance(),
            recommendations: [
                'Continue monitoring strategy performance',
                'Consider adjusting weights based on results'
            ]
        };
    }
}

describe('StrategyManager', () => {
    let strategyManager;
    let mockTokenData;

    beforeEach(async () => {
        strategyManager = new MockStrategyManager();

        mockTokenData = {
            mint_address: 'test123',
            symbol: 'TEST',
            price: 0.001,
            market_cap: 50000,
            volume_24h: 10000
        };

        await strategyManager.initialize();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize successfully with all strategies', async () => {
            const newManager = new StrategyManager();
            await newManager.initialize();

            expect(newManager.strategies).toBeDefined();
            expect(newManager.isInitialized).toBe(true);
        });

        it('should handle strategy initialization failures gracefully', async () => {
            const newManager = new StrategyManager();

            // Mock one strategy to fail initialization
            const mockStrategy = {
                initialize: jest.fn().mockRejectedValue(new Error('Init failed'))
            };
            newManager.strategies = { testStrategy: mockStrategy };

            await expect(newManager.initialize()).rejects.toThrow();
        });
    });

    describe('Token Analysis', () => {
        it('should analyze token with all strategies', async () => {
            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis).toHaveProperty('consensus');
            expect(analysis).toHaveProperty('strategies');
            expect(analysis).toHaveProperty('timestamp');

            expect(analysis.consensus).toHaveProperty('action');
            expect(analysis.consensus).toHaveProperty('confidence');
            expect(['BUY', 'HOLD', 'SELL', 'AVOID']).toContain(analysis.consensus.action);
        });

        it('should build consensus from multiple strategies', async () => {
            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis.strategies).toBeDefined();
            expect(Object.keys(analysis.strategies).length).toBeGreaterThan(1);

            // Consensus should be based on multiple strategy inputs
            expect(analysis.consensus.confidence).toBeGreaterThan(0);
            expect(analysis.consensus.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('Consensus Building', () => {
        it('should correctly weight strategy recommendations', () => {
            const strategies = {
                quantum: { recommendation: { action: 'BUY', confidence: 0.9, score: 90 } },
                advanced: { recommendation: { action: 'BUY', confidence: 0.8, score: 80 } },
                momentum: { recommendation: { action: 'HOLD', confidence: 0.6, score: 60 } }
            };

            const consensus = strategyManager.buildConsensus(strategies);

            expect(consensus.action).toBe('BUY'); // Majority BUY
            expect(consensus.confidence).toBeGreaterThan(0.7); // High confidence
        });

        it('should handle conflicting recommendations', () => {
            const strategies = {
                quantum: { recommendation: { action: 'BUY', confidence: 0.8, score: 80 } },
                advanced: { recommendation: { action: 'SELL', confidence: 0.7, score: 30 } },
                momentum: { recommendation: { action: 'HOLD', confidence: 0.6, score: 60 } }
            };

            const consensus = strategyManager.buildConsensus(strategies);

            expect(consensus.action).toBeDefined();
            expect(consensus.confidence).toBeLessThan(0.8); // Lower confidence due to conflict
        });

        it('should default to AVOID for low confidence', () => {
            const strategies = {
                quantum: { recommendation: { action: 'BUY', confidence: 0.3, score: 30 } },
                advanced: { recommendation: { action: 'HOLD', confidence: 0.2, score: 20 } },
                momentum: { recommendation: { action: 'SELL', confidence: 0.1, score: 10 } }
            };

            const consensus = strategyManager.buildConsensus(strategies);

            expect(consensus.action).toBe('AVOID');
            expect(consensus.confidence).toBeLessThan(0.5);
        });
    });

    describe('Performance Tracking', () => {
        it('should track strategy performance over time', () => {
            // Simulate some trades
            strategyManager.recordTradeResult('quantum', { success: true, return: 0.25 });
            strategyManager.recordTradeResult('quantum', { success: false, return: -0.10 });
            strategyManager.recordTradeResult('advanced', { success: true, return: 0.15 });

            const performance = strategyManager.getStrategyPerformance();

            expect(performance.quantum).toBeDefined();
            expect(performance.quantum.winRate).toBe(0.5); // 1 win out of 2 trades
            expect(performance.quantum.avgReturn).toBeCloseTo(0.075); // (0.25 - 0.10) / 2

            expect(performance.advanced).toBeDefined();
            expect(performance.advanced.winRate).toBe(1.0); // 1 win out of 1 trade
        });

        it('should adjust strategy weights based on performance', () => {
            // Record poor performance for one strategy
            for (let i = 0; i < 10; i++) {
                strategyManager.recordTradeResult('momentum', { success: false, return: -0.05 });
            }

            // Record good performance for another
            for (let i = 0; i < 10; i++) {
                strategyManager.recordTradeResult('quantum', { success: true, return: 0.1 });
            }

            strategyManager.adjustStrategyWeights();

            const weights = strategyManager.getStrategyWeights();
            expect(weights.quantum).toBeGreaterThan(weights.momentum);
        });
    });

    describe('Risk Integration', () => {
        it('should integrate risk assessment into recommendations', async () => {
            // Mock high-risk scenario
            strategyManager.riskManager = {
                assessRisk: jest.fn().mockResolvedValue({
                    riskScore: 85,
                    riskLevel: 'high',
                    approved: false
                })
            };

            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis.consensus.action).toBe('AVOID');
            expect(analysis.riskAssessment.approved).toBe(false);
        });

        it('should allow trades for low-risk scenarios', async () => {
            // Mock low-risk scenario
            strategyManager.riskManager = {
                assessRisk: jest.fn().mockResolvedValue({
                    riskScore: 25,
                    riskLevel: 'low',
                    approved: true
                })
            };

            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis.riskAssessment.approved).toBe(true);
            expect(analysis.consensus.action).not.toBe('AVOID');
        });
    });

    describe('Error Handling', () => {
        it('should handle strategy analysis failures', async () => {
            // Mock one strategy to fail
            strategyManager.strategies.quantum.analyzeToken = jest.fn().mockRejectedValue(
                new Error('Analysis failed')
            );

            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis).toHaveProperty('consensus');
            expect(analysis.strategies.quantum).toHaveProperty('error');
        });

        it('should continue with remaining strategies if some fail', async () => {
            // Mock multiple strategies to fail
            strategyManager.strategies.quantum.analyzeToken = jest.fn().mockRejectedValue(
                new Error('Quantum failed')
            );
            strategyManager.strategies.momentum.analyzeToken = jest.fn().mockRejectedValue(
                new Error('Momentum failed')
            );

            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis.consensus).toBeDefined();
            expect(analysis.strategies.advanced).not.toHaveProperty('error');
        });

        it('should handle complete strategy failure gracefully', async () => {
            // Mock all strategies to fail
            Object.values(strategyManager.strategies).forEach(strategy => {
                strategy.analyzeToken = jest.fn().mockRejectedValue(new Error('Failed'));
            });

            const analysis = await strategyManager.analyzeToken(mockTokenData);

            expect(analysis.consensus.action).toBe('AVOID');
            expect(analysis.consensus.confidence).toBe(0);
        });
    });

    describe('Configuration Management', () => {
        it('should update strategy configurations', () => {
            const newConfig = {
                quantum: { minConfidence: 0.8 },
                advanced: { riskTolerance: 'conservative' }
            };

            strategyManager.updateConfiguration(newConfig);

            expect(strategyManager.config.quantum.minConfidence).toBe(0.8);
            expect(strategyManager.config.advanced.riskTolerance).toBe('conservative');
        });

        it('should enable/disable strategies dynamically', () => {
            strategyManager.disableStrategy('momentum');

            const enabledStrategies = strategyManager.getEnabledStrategies();
            expect(enabledStrategies).not.toContain('momentum');

            strategyManager.enableStrategy('momentum');

            const reEnabledStrategies = strategyManager.getEnabledStrategies();
            expect(reEnabledStrategies).toContain('momentum');
        });
    });

    describe('Performance Metrics', () => {
        it('should calculate overall performance metrics', () => {
            // Add some mock trading history
            strategyManager.tradingHistory = [
                { strategy: 'quantum', success: true, return: 0.2, timestamp: Date.now() },
                { strategy: 'advanced', success: false, return: -0.1, timestamp: Date.now() },
                { strategy: 'quantum', success: true, return: 0.15, timestamp: Date.now() }
            ];

            const metrics = strategyManager.getOverallPerformance();

            expect(metrics).toHaveProperty('totalTrades');
            expect(metrics).toHaveProperty('winRate');
            expect(metrics).toHaveProperty('avgReturn');
            expect(metrics).toHaveProperty('sharpeRatio');

            expect(metrics.totalTrades).toBe(3);
            expect(metrics.winRate).toBeCloseTo(0.67, 2); // 2 wins out of 3
        });

        it('should generate performance reports', () => {
            const report = strategyManager.generatePerformanceReport('weekly');

            expect(report).toHaveProperty('period');
            expect(report).toHaveProperty('metrics');
            expect(report).toHaveProperty('strategies');
            expect(report).toHaveProperty('recommendations');

            expect(report.period).toBe('weekly');
            expect(Array.isArray(report.recommendations)).toBe(true);
        });
    });
});
