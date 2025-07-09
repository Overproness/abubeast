/**
 * ABUBOT Engine Integration Tests
 * End-to-end tests for the main trading engine
 */

import { ABUBOTTradingEngine as AbubotEngine } from '../../src/lib/trading/abubotEngine.js';

// Mock external dependencies
jest.mock('../../src/lib/trading/strategies/strategyManager.js');
jest.mock('../../src/lib/risk/riskManager.js');
jest.mock('../../src/lib/execution/tradeExecutor.js');

describe('AbubotEngine Integration Tests', () => {
    let engine;
    let mockTokenData;

    beforeEach(async () => {
        engine = new AbubotEngine();

        mockTokenData = {
            mint_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: 'MEME',
            name: 'Test Meme Token',
            price: 0.00145,
            market_cap: 75000,
            volume_24h: 15000,
            price_change_24h: 25.5,
            liquidity: 35000,
            holders: 1500,
            created_at: Date.now() - 3600000 // 1 hour ago
        };

        await engine.initialize();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Engine Initialization', () => {
        it('should initialize all components successfully', async () => {
            const newEngine = new AbubotEngine();
            await newEngine.initialize();

            expect(newEngine.strategyManager).toBeDefined();
            expect(newEngine.riskManager).toBeDefined();
            expect(newEngine.tradeExecutor).toBeDefined();
            expect(newEngine.isInitialized).toBe(true);
        });

        it('should handle initialization errors gracefully', async () => {
            const newEngine = new AbubotEngine();

            // Mock initialization failure
            newEngine.strategyManager = {
                initialize: jest.fn().mockRejectedValue(new Error('Init failed'))
            };

            await expect(newEngine.initialize()).rejects.toThrow('Init failed');
        });
    });

    describe('Token Analysis Flow', () => {
        it('should complete full analysis flow successfully', async () => {
            // Mock strategy manager response
            engine.strategyManager.analyzeToken = jest.fn().mockResolvedValue({
                consensus: {
                    action: 'BUY',
                    confidence: 0.82,
                    reasoning: 'Strong viral potential detected'
                },
                strategies: {
                    quantum: { score: 85, recommendation: 'BUY' },
                    advanced: { score: 78, recommendation: 'BUY' },
                    momentum: { score: 72, recommendation: 'HOLD' }
                }
            });

            // Mock risk manager response
            engine.riskManager.assessRisk = jest.fn().mockResolvedValue({
                riskScore: 35,
                riskLevel: 'moderate',
                approved: true
            });

            const analysis = await engine.analyzeToken(mockTokenData.mint_address);

            expect(analysis).toHaveProperty('token');
            expect(analysis).toHaveProperty('analysis');
            expect(analysis).toHaveProperty('riskAssessment');
            expect(analysis).toHaveProperty('finalRecommendation');
            expect(analysis).toHaveProperty('timestamp');

            expect(analysis.finalRecommendation.action).toBe('BUY');
            expect(analysis.riskAssessment.approved).toBe(true);
        });

        it('should reject high-risk tokens', async () => {
            // Mock high-risk scenario
            engine.strategyManager.analyzeToken = jest.fn().mockResolvedValue({
                consensus: { action: 'BUY', confidence: 0.9 }
            });

            engine.riskManager.assessRisk = jest.fn().mockResolvedValue({
                riskScore: 85,
                riskLevel: 'high',
                approved: false,
                reason: 'Risk score exceeds threshold'
            });

            const analysis = await engine.analyzeToken(mockTokenData.mint_address);

            expect(analysis.finalRecommendation.action).toBe('AVOID');
            expect(analysis.riskAssessment.approved).toBe(false);
        });

        it('should handle token data fetching errors', async () => {
            engine.fetchTokenData = jest.fn().mockRejectedValue(new Error('Token not found'));

            const analysis = await engine.analyzeToken('invalid_address');

            expect(analysis).toHaveProperty('error');
            expect(analysis.finalRecommendation.action).toBe('AVOID');
        });

        it('should cache analysis results', async () => {
            engine.strategyManager.analyzeToken = jest.fn().mockResolvedValue({
                consensus: { action: 'BUY', confidence: 0.8 }
            });
            engine.riskManager.assessRisk = jest.fn().mockResolvedValue({
                riskScore: 30,
                approved: true
            });

            // First analysis
            await engine.analyzeToken(mockTokenData.mint_address);

            // Second analysis (should use cache)
            await engine.analyzeToken(mockTokenData.mint_address);

            // Strategy manager should only be called once due to caching
            expect(engine.strategyManager.analyzeToken).toHaveBeenCalledTimes(1);
        });
    });

    describe('Trading Execution Flow', () => {
        beforeEach(() => {
            // Mock successful analysis
            engine.strategyManager.analyzeToken = jest.fn().mockResolvedValue({
                consensus: {
                    action: 'BUY',
                    confidence: 0.85,
                    positionSize: { solAmount: 2.5 }
                }
            });

            engine.riskManager.assessRisk = jest.fn().mockResolvedValue({
                riskScore: 25,
                approved: true
            });

            engine.tradeExecutor.executeTrade = jest.fn().mockResolvedValue({
                success: true,
                transactionId: 'tx123',
                executedAmount: 2.5,
                executedPrice: 0.00145
            });
        });

        it('should execute trades for approved BUY recommendations', async () => {
            const result = await engine.executeTrade(mockTokenData.mint_address, {
                action: 'BUY',
                amount: 2.5
            });

            expect(result.success).toBe(true);
            expect(result).toHaveProperty('transactionId');
            expect(engine.tradeExecutor.executeTrade).toHaveBeenCalled();
        });

        it('should not execute trades for AVOID recommendations', async () => {
            const result = await engine.executeTrade(mockTokenData.mint_address, {
                action: 'AVOID'
            });

            expect(result.success).toBe(false);
            expect(result.reason).toContain('not recommended');
            expect(engine.tradeExecutor.executeTrade).not.toHaveBeenCalled();
        });

        it('should handle trade execution failures', async () => {
            engine.tradeExecutor.executeTrade = jest.fn().mockRejectedValue(
                new Error('Insufficient balance')
            );

            const result = await engine.executeTrade(mockTokenData.mint_address, {
                action: 'BUY',
                amount: 2.5
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Insufficient balance');
        });
    });

    describe('Portfolio Management', () => {
        it('should track active positions', async () => {
            // Mock successful trade
            engine.tradeExecutor.executeTrade = jest.fn().mockResolvedValue({
                success: true,
                transactionId: 'tx123',
                executedAmount: 2.5
            });

            await engine.executeTrade(mockTokenData.mint_address, {
                action: 'BUY',
                amount: 2.5
            });

            const positions = engine.getActivePositions();
            expect(positions).toHaveLength(1);
            expect(positions[0].symbol).toBe(mockTokenData.symbol);
        });

        it('should calculate portfolio metrics', () => {
            // Add mock positions
            engine.positions = [
                { symbol: 'MEME1', value: 100, pnl: 20 },
                { symbol: 'MEME2', value: 150, pnl: -10 },
                { symbol: 'MEME3', value: 200, pnl: 50 }
            ];

            const metrics = engine.getPortfolioMetrics();

            expect(metrics).toHaveProperty('totalValue');
            expect(metrics).toHaveProperty('totalPnL');
            expect(metrics).toHaveProperty('winRate');
            expect(metrics).toHaveProperty('sharpeRatio');

            expect(metrics.totalValue).toBe(450);
            expect(metrics.totalPnL).toBe(60);
        });

        it('should implement stop-loss protection', async () => {
            // Mock position with significant loss
            engine.positions = [{
                symbol: 'MEME',
                mintAddress: mockTokenData.mint_address,
                entryPrice: 0.002,
                currentPrice: 0.0015, // 25% loss
                stopLoss: -20, // 20% stop loss
                amount: 100
            }];

            engine.tradeExecutor.executeTrade = jest.fn().mockResolvedValue({
                success: true,
                transactionId: 'tx_stop_loss'
            });

            await engine.checkStopLoss();

            expect(engine.tradeExecutor.executeTrade).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'SELL',
                    reason: 'stop_loss_triggered'
                })
            );
        });

        it('should implement take-profit targets', async () => {
            // Mock position with significant gain
            engine.positions = [{
                symbol: 'MEME',
                mintAddress: mockTokenData.mint_address,
                entryPrice: 0.001,
                currentPrice: 0.0015, // 50% gain
                takeProfit: [30, 80], // Take profit targets
                amount: 100
            }];

            engine.tradeExecutor.executeTrade = jest.fn().mockResolvedValue({
                success: true,
                transactionId: 'tx_take_profit'
            });

            await engine.checkTakeProfit();

            expect(engine.tradeExecutor.executeTrade).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'SELL',
                    reason: 'take_profit_triggered'
                })
            );
        });
    });

    describe('Real-time Monitoring', () => {
        it('should monitor positions in real-time', async () => {
            const monitoringSpy = jest.spyOn(engine, 'monitorPositions');

            engine.startMonitoring();

            // Wait for monitoring cycle
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(monitoringSpy).toHaveBeenCalled();

            engine.stopMonitoring();
        });

        it('should detect market regime changes', async () => {
            const mockMarketData = {
                volatility: 0.8, // High volatility
                trend: -0.6,     // Bearish trend
                volume: 50000000 // High volume
            };

            engine.updateMarketConditions(mockMarketData);

            const conditions = engine.getMarketConditions();
            expect(conditions.regime).toBe('bearish_volatile');
            expect(conditions.riskAdjustment).toBeGreaterThan(1);
        });

        it('should adjust strategies based on market conditions', () => {
            const bearishConditions = {
                volatility: 0.9,
                trend: -0.8,
                volume: 100000000
            };

            engine.updateMarketConditions(bearishConditions);

            // Should increase risk thresholds in bearish conditions
            expect(engine.riskManager.riskThreshold).toBeGreaterThan(50);
        });
    });

    describe('Performance Analytics', () => {
        beforeEach(() => {
            // Mock trading history
            engine.tradingHistory = [
                { symbol: 'MEME1', action: 'BUY', pnl: 100, timestamp: Date.now() - 86400000 },
                { symbol: 'MEME2', action: 'BUY', pnl: -50, timestamp: Date.now() - 43200000 },
                { symbol: 'MEME3', action: 'BUY', pnl: 200, timestamp: Date.now() - 21600000 },
                { symbol: 'MEME4', action: 'BUY', pnl: -25, timestamp: Date.now() - 10800000 }
            ];
        });

        it('should calculate performance metrics correctly', () => {
            const performance = engine.getPerformanceMetrics();

            expect(performance).toHaveProperty('totalReturn');
            expect(performance).toHaveProperty('winRate');
            expect(performance).toHaveProperty('profitFactor');
            expect(performance).toHaveProperty('maxDrawdown');
            expect(performance).toHaveProperty('sharpeRatio');

            expect(performance.totalReturn).toBe(225); // 100 - 50 + 200 - 25
            expect(performance.winRate).toBe(0.5); // 2 wins out of 4 trades
        });

        it('should generate performance reports', () => {
            const report = engine.generatePerformanceReport('daily');

            expect(report).toHaveProperty('period');
            expect(report).toHaveProperty('metrics');
            expect(report).toHaveProperty('trades');
            expect(report).toHaveProperty('strategies');

            expect(report.period).toBe('daily');
            expect(Array.isArray(report.trades)).toBe(true);
        });

        it('should track strategy performance individually', () => {
            const strategyPerformance = engine.getStrategyPerformance();

            expect(strategyPerformance).toHaveProperty('quantum');
            expect(strategyPerformance).toHaveProperty('advanced');
            expect(strategyPerformance).toHaveProperty('momentum');

            Object.values(strategyPerformance).forEach(strategy => {
                expect(strategy).toHaveProperty('winRate');
                expect(strategy).toHaveProperty('avgReturn');
                expect(strategy).toHaveProperty('totalTrades');
            });
        });
    });

    describe('Error Handling and Recovery', () => {
        it('should handle network failures gracefully', async () => {
            engine.fetchTokenData = jest.fn().mockRejectedValue(
                new Error('Network timeout')
            );

            const analysis = await engine.analyzeToken(mockTokenData.mint_address);

            expect(analysis).toHaveProperty('error');
            expect(analysis.finalRecommendation.action).toBe('AVOID');
        });

        it('should implement circuit breaker for excessive losses', async () => {
            // Mock significant losses
            engine.portfolioMetrics = {
                totalPnL: -500, // $500 loss
                drawdown: 0.25  // 25% drawdown
            };

            const circuitBreakerTriggered = engine.checkCircuitBreaker();

            expect(circuitBreakerTriggered).toBe(true);
            expect(engine.tradingEnabled).toBe(false);
        });

        it('should recover from circuit breaker state', () => {
            engine.tradingEnabled = false;
            engine.circuitBreakerTime = Date.now() - 3600000; // 1 hour ago

            engine.checkCircuitBreakerRecovery();

            expect(engine.tradingEnabled).toBe(true);
        });

        it('should handle API rate limiting', async () => {
            let callCount = 0;
            engine.fetchTokenData = jest.fn().mockImplementation(() => {
                callCount++;
                if (callCount <= 3) {
                    throw new Error('Rate limit exceeded');
                }
                return mockTokenData;
            });

            const analysis = await engine.analyzeToken(mockTokenData.mint_address);

            expect(analysis).toHaveProperty('token');
            expect(callCount).toBeGreaterThan(1); // Should have retried
        });
    });

    describe('Configuration and Settings', () => {
        it('should update configuration dynamically', () => {
            const newConfig = {
                riskTolerance: 'conservative',
                maxPositionSize: 0.03,
                stopLossPercentage: 10
            };

            engine.updateConfiguration(newConfig);

            expect(engine.config.riskTolerance).toBe('conservative');
            expect(engine.config.maxPositionSize).toBe(0.03);
        });

        it('should validate configuration changes', () => {
            const invalidConfig = {
                maxPositionSize: -0.1, // Invalid negative value
                stopLossPercentage: 150 // Invalid percentage > 100
            };

            expect(() => {
                engine.updateConfiguration(invalidConfig);
            }).toThrow('Invalid configuration');
        });

        it('should support strategy enable/disable', () => {
            // Mock strategy manager methods
            const mockActiveStrategies = new Set(['quantum_memecoin', 'advanced_solana', 'enhanced']);
            
            engine.strategyManager.disableStrategy = jest.fn((strategyName) => {
                const strategyAliases = {
                    'quantum': 'quantum_memecoin',
                    'advanced': 'advanced_solana'
                };
                const actualName = strategyAliases[strategyName] || strategyName;
                mockActiveStrategies.delete(actualName);
            });
            
            engine.strategyManager.enableStrategy = jest.fn((strategyName) => {
                const strategyAliases = {
                    'quantum': 'quantum_memecoin',
                    'advanced': 'advanced_solana'
                };
                const actualName = strategyAliases[strategyName] || strategyName;
                mockActiveStrategies.add(actualName);
            });
            
            engine.strategyManager.getEnabledStrategies = jest.fn(() => {
                const reverseAliases = {
                    'quantum_memecoin': 'quantum',
                    'advanced_solana': 'advanced'
                };
                return Array.from(mockActiveStrategies).map(name => 
                    reverseAliases[name] || name
                );
            });

            engine.disableStrategy('quantum');

            const enabledStrategies = engine.getEnabledStrategies();
            expect(enabledStrategies).not.toContain('quantum');

            engine.enableStrategy('quantum');

            const reEnabledStrategies = engine.getEnabledStrategies();
            expect(reEnabledStrategies).toContain('quantum');
        });
    });

    describe('Logging and Monitoring', () => {
        it('should log all trading activities', async () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            await engine.analyzeToken(mockTokenData.mint_address);

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ABUBOT]')
            );

            logSpy.mockRestore();
        });

        it('should track system health metrics', () => {
            const healthMetrics = engine.getSystemHealth();

            expect(healthMetrics).toHaveProperty('uptime');
            expect(healthMetrics).toHaveProperty('memoryUsage');
            expect(healthMetrics).toHaveProperty('activePositions');
            expect(healthMetrics).toHaveProperty('tradingEnabled');
            expect(healthMetrics).toHaveProperty('lastUpdate');
        });

        it('should generate alerts for important events', async () => {
            const alertSpy = jest.spyOn(engine, 'sendAlert');

            // Trigger high-risk scenario
            engine.riskManager.assessRisk = jest.fn().mockResolvedValue({
                riskScore: 85,
                riskLevel: 'high',
                approved: false
            });

            await engine.analyzeToken(mockTokenData.mint_address);

            expect(alertSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'HIGH_RISK_TOKEN',
                    severity: 'warning'
                })
            );
        });
    });
});
