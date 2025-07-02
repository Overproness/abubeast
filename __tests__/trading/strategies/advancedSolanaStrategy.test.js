/**
 * Advanced Solana Strategy Tests
 * Tests for the Advanced Solana Trading Strategy
 */

import { AdvancedSolanaStrategy } from '../../../src/lib/trading/strategies/advancedSolanaStrategy.js';

describe('AdvancedSolanaStrategy', () => {
    let strategy;
    let mockTokenData;

    beforeEach(() => {
        strategy = new AdvancedSolanaStrategy();

        mockTokenData = {
            mint_address: 'So11111111111111111111111111111111111111112',
            name: 'Advanced Test Token',
            symbol: 'ADVSOL',
            price: 0.001,
            price_change_24h: 12.5,
            volume_24h: 50000,
            market_cap: 100000,
            holders: 1000,
            liquidity: {
                total: 25000,
                locked_percentage: 80
            },
            solana: {
                validators: 50,
                stake_concentration: 0.3,
                network_health: 0.95,
                tps: 2500,
                block_time: 400
            },
            defi: {
                liquidity_pools: 5,
                total_locked_value: 75000,
                yield_farming: true,
                lending_protocols: 3
            }
        };
    });

    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(strategy.name).toBeDefined();
            expect(strategy.type).toBeDefined();
            expect(strategy.config).toBeDefined();
        });

        test('should have advanced Solana configuration', () => {
            expect(strategy.config).toHaveProperty('solanaMetrics');
            expect(strategy.config).toHaveProperty('defiIntegration');
            expect(strategy.config).toHaveProperty('networkAnalysis');
        });
    });

    describe('analyzeToken()', () => {
        test('should perform complete advanced Solana analysis', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('solanaMetrics');
            expect(result).toHaveProperty('defiAnalysis');
            expect(result).toHaveProperty('networkHealth');
            expect(result).toHaveProperty('recommendation');
            expect(result).toHaveProperty('confidence');
        });

        test('should analyze Solana network metrics', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.solanaMetrics).toHaveProperty('validatorCount');
            expect(result.solanaMetrics).toHaveProperty('stakeConcentration');
            expect(result.solanaMetrics).toHaveProperty('networkHealth');
            expect(result.solanaMetrics).toHaveProperty('throughput');
            expect(result.solanaMetrics).toHaveProperty('blockTime');
        });

        test('should analyze DeFi integration', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.defiAnalysis).toHaveProperty('liquidityPools');
            expect(result.defiAnalysis).toHaveProperty('totalValueLocked');
            expect(result.defiAnalysis).toHaveProperty('yieldOpportunities');
            expect(result.defiAnalysis).toHaveProperty('protocolIntegration');
        });

        test('should generate valid recommendations', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.recommendation).toHaveProperty('action');
            expect(result.recommendation).toHaveProperty('confidence');
            expect(result.recommendation).toHaveProperty('reasoning');
            expect(['BUY', 'BUY_SMALL', 'SELL', 'HOLD', 'AVOID']).toContain(result.recommendation.action);
            expect(result.recommendation.confidence).toBeGreaterThanOrEqual(0);
            expect(result.recommendation.confidence).toBeLessThanOrEqual(1);
        });

        test('should handle analysis errors gracefully', async () => {
            const badTokenData = null;

            const result = await strategy.analyzeToken(badTokenData);

            expect(result).toHaveProperty('error');
            expect(result.recommendation.action).toBe('AVOID');
        });
    });

    describe('Solana Network Analysis', () => {
        test('should evaluate network health correctly', () => {
            const networkMetrics = {
                validators: 50,
                stake_concentration: 0.3,
                network_health: 0.95,
                tps: 2500,
                block_time: 400
            };

            const health = strategy.evaluateNetworkHealth(networkMetrics);

            expect(health).toHaveProperty('score');
            expect(health).toHaveProperty('factors');
            expect(health.score).toBeGreaterThanOrEqual(0);
            expect(health.score).toBeLessThanOrEqual(1);
        });

        test('should detect network congestion', () => {
            const congestedMetrics = {
                validators: 30,
                stake_concentration: 0.7,
                network_health: 0.6,
                tps: 500,
                block_time: 1000
            };

            const health = strategy.evaluateNetworkHealth(congestedMetrics);

            expect(health.score).toBeLessThan(0.5);
            expect(health.factors).toContain('congestion');
        });

        test('should identify optimal network conditions', () => {
            const optimalMetrics = {
                validators: 100,
                stake_concentration: 0.2,
                network_health: 0.98,
                tps: 5000,
                block_time: 300
            };

            const health = strategy.evaluateNetworkHealth(optimalMetrics);

            expect(health.score).toBeGreaterThan(0.8);
            expect(health.factors).toContain('optimal');
        });
    });

    describe('DeFi Integration Analysis', () => {
        test('should analyze liquidity pool depth', () => {
            const defiData = {
                liquidity_pools: 5,
                total_locked_value: 75000,
                yield_farming: true,
                lending_protocols: 3
            };

            const analysis = strategy.analyzeDeFiIntegration(defiData);

            expect(analysis).toHaveProperty('liquidityScore');
            expect(analysis).toHaveProperty('yieldPotential');
            expect(analysis).toHaveProperty('protocolRisk');
            expect(analysis.liquidityScore).toBeGreaterThanOrEqual(0);
            expect(analysis.liquidityScore).toBeLessThanOrEqual(1);
        });

        test('should evaluate yield farming opportunities', () => {
            const yieldData = {
                liquidity_pools: 10,
                total_locked_value: 200000,
                yield_farming: true,
                lending_protocols: 5,
                average_apy: 15.5
            };

            const analysis = strategy.analyzeDeFiIntegration(yieldData);

            expect(analysis.yieldPotential).toBeGreaterThan(0.5);
            expect(analysis).toHaveProperty('estimatedAPY');
        });

        test('should assess protocol risk', () => {
            const riskyData = {
                liquidity_pools: 1,
                total_locked_value: 5000,
                yield_farming: false,
                lending_protocols: 0
            };

            const analysis = strategy.analyzeDeFiIntegration(riskyData);

            expect(analysis.protocolRisk).toBeGreaterThan(0.5);
            expect(analysis.liquidityScore).toBeLessThan(0.3);
        });
    });

    describe('Advanced Solana Signals', () => {
        test('should generate validator decentralization signals', () => {
            const signals = strategy.generateSolanaSignals(mockTokenData);

            expect(signals).toHaveProperty('validatorDecentralization');
            expect(signals).toHaveProperty('networkEfficiency');
            expect(signals).toHaveProperty('defiIntegration');
            expect(signals).toHaveProperty('ecosystemGrowth');
        });

        test('should detect ecosystem expansion', () => {
            const expandingToken = {
                ...mockTokenData,
                solana: {
                    validators: 75,
                    stake_concentration: 0.25,
                    network_health: 0.96,
                    ecosystem_projects: 50,
                    developer_activity: 0.85
                }
            };

            const signals = strategy.generateSolanaSignals(expandingToken);

            expect(signals.ecosystemGrowth).toBeGreaterThan(0.7);
            expect(signals.signalStrength).toBeGreaterThan(0);
        });

        test('should identify network risks', () => {
            const riskyToken = {
                ...mockTokenData,
                solana: {
                    validators: 20,
                    stake_concentration: 0.8,
                    network_health: 0.5,
                    recent_outages: 3
                },
                defi: {
                    liquidity_pools: 0,
                    total_locked_value: 0,
                    yield_farming: false,
                    lending_protocols: 0
                }
            };

            const signals = strategy.generateSolanaSignals(riskyToken);

            expect(signals.networkRisk).toBeGreaterThan(0.5);
            expect(signals.signalStrength).toBeLessThan(0);
        });
    });

    describe('Confidence Calculation', () => {
        test('should calculate confidence based on multiple factors', () => {
            const analysis = {
                solanaMetrics: { score: 0.8 },
                defiAnalysis: { score: 0.7 },
                networkHealth: { score: 0.9 },
                signals: { signalStrength: 0.6 }
            };

            const confidence = strategy.calculateAdvancedConfidence(analysis);

            expect(confidence).toBeGreaterThanOrEqual(0);
            expect(confidence).toBeLessThanOrEqual(1);
            expect(confidence).toBeGreaterThan(0.5);
        });

        test('should return low confidence for poor metrics', () => {
            const poorAnalysis = {
                solanaMetrics: { score: 0.2 },
                defiAnalysis: { score: 0.1 },
                networkHealth: { score: 0.3 },
                signals: { signalStrength: -0.5 }
            };

            const confidence = strategy.calculateAdvancedConfidence(poorAnalysis);

            expect(confidence).toBeLessThan(0.4);
        });
    });

    describe('Position Sizing', () => {
        test('should calculate position size based on Solana metrics', () => {
            const analysis = {
                solanaMetrics: { score: 0.8 },
                defiAnalysis: { liquidityScore: 0.7 },
                networkHealth: { score: 0.9 },
                confidence: 0.8
            };

            const position = strategy.calculateSolanaPositionSize(analysis);

            expect(position).toHaveProperty('solAmount');
            expect(position).toHaveProperty('reasoning');
            expect(position.solAmount).toBeGreaterThan(0);
            expect(position.solAmount).toBeLessThanOrEqual(5);
        });

        test('should reduce position size for network risks', () => {
            const riskyAnalysis = {
                solanaMetrics: { score: 0.3 },
                defiAnalysis: { liquidityScore: 0.2 },
                networkHealth: { score: 0.4 },
                confidence: 0.3
            };

            const position = strategy.calculateSolanaPositionSize(riskyAnalysis);

            expect(position.solAmount).toBeLessThan(1);
        });
    });

    describe('Integration Tests', () => {
        test('should handle various Solana scenarios', async () => {
            const scenarios = [
                {
                    name: 'High Network Activity',
                    data: { ...mockTokenData, solana: { ...mockTokenData.solana, tps: 4000 } },
                    expectedAction: 'BUY'
                },
                {
                    name: 'Network Congestion',
                    data: { ...mockTokenData, solana: { ...mockTokenData.solana, tps: 300, block_time: 1500 } },
                    expectedAction: 'HOLD'
                },
                {
                    name: 'Strong DeFi Integration',
                    data: { ...mockTokenData, defi: { ...mockTokenData.defi, total_locked_value: 500000 } },
                    expectedAction: 'BUY'
                }
            ];

            for (const scenario of scenarios) {
                const analysis = await strategy.analyzeToken(scenario.data);

                if (scenario.expectedAction === 'BUY') {
                    expect(['BUY', 'BUY_SMALL']).toContain(analysis.recommendation.action);
                } else {
                    expect(analysis.recommendation.action).toBe(scenario.expectedAction);
                }
            }
        });

        test('should provide consistent analysis for same token', async () => {
            const analysis1 = await strategy.analyzeToken(mockTokenData);
            const analysis2 = await strategy.analyzeToken(mockTokenData);

            expect(analysis1.recommendation.action).toBe(analysis2.recommendation.action);
            expect(analysis1.confidence).toBeCloseTo(analysis2.confidence, 1);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle missing Solana data', async () => {
            const incompleteToken = {
                ...mockTokenData,
                solana: undefined
            };

            const result = await strategy.analyzeToken(incompleteToken);

            expect(result.recommendation.action).toBe('HOLD');
            expect(result.confidence).toBeLessThan(0.5);
        });

        test('should handle invalid network metrics', async () => {
            const invalidToken = {
                ...mockTokenData,
                solana: {
                    validators: -1,
                    stake_concentration: 1.5,
                    network_health: 2.0
                }
            };

            const result = await strategy.analyzeToken(invalidToken);

            expect(result).toHaveProperty('recommendation');
            expect(result.recommendation.action).toBe('AVOID');
        });
    });
});
