/**
 * Quantum Memecoin Strategy Tests
 * Comprehensive unit tests for the quantum-inspired analysis strategy
 */

// Mock dependencies
jest.mock('../../../src/lib/ai/quantumEngine.js', () => ({
    QuantumEngine: jest.fn().mockImplementation(() => ({
        analyzeMarketState: jest.fn().mockResolvedValue({
            quantumScore: 0.75,
            coherenceLevel: 0.8,
            quantumMomentum: 0.65,
            probabilityUp: 0.72,
            entanglement: 0.6,
            superposition: ['bullish', 'volatile']
        })
    }))
}));

jest.mock('../../../src/lib/analysis/socialSentiment.js', () => ({
    SocialSentimentAnalyzer: jest.fn().mockImplementation(() => ({
        analyzeSentiment: jest.fn().mockResolvedValue({
            overallScore: 0.7,
            twitterScore: 0.75,
            telegramScore: 0.65,
            redditScore: 0.72,
            volume: 1500,
            trending: true,
            influencerMentions: 5
        })
    }))
}));

jest.mock('../../../src/lib/analysis/contractSecurity.js', () => ({
    ContractSecurityAnalyzer: jest.fn().mockImplementation(() => ({
        analyzeSecurity: jest.fn().mockResolvedValue({
            overallScore: 85,
            liquidity: { score: 90, locked: true },
            ownership: { score: 80, renounced: true },
            trading: { score: 85, restrictions: false },
            risks: []
        })
    }))
}));

jest.mock('../../../src/lib/risk/riskManager.js', () => ({
    RiskManager: jest.fn().mockImplementation(() => ({
        assessRisk: jest.fn().mockResolvedValue({
            overallRisk: 25,
            riskLevel: 'LOW',
            factors: {
                liquidity: 10,
                volatility: 20,
                market: 15
            }
        })
    }))
}));

jest.mock('../../../src/lib/trading/config.js', () => ({
    TRADING_STRATEGIES: {
        QUANTUM_MEMECOIN: {
            name: 'Quantum Memecoin Strategy',
            type: 'quantum_analysis',
            minConfidence: 0.7,
            maxPositionSize: 5,
            takeProfit: 200,
            stopLoss: 20,
            features: [
                'quantum_engine',
                'social_sentiment',
                'contract_security',
                'combined_scoring',
                'dynamic_position_sizing',
                'adaptive_slippage'
            ]
        }
    }
}));

import { QuantumMemecoinStrategy } from '../../../src/lib/trading/strategies/quantumMemecoinStrategy.js';

describe('QuantumMemecoinStrategy', () => {
    let strategy;
    let mockTokenData;

    beforeEach(() => {
        strategy = new QuantumMemecoinStrategy();
        mockTokenData = {
            mint_address: 'So11111111111111111111111111111111111111112',
            symbol: 'QTEST',
            name: 'Quantum Test Token',
            price: 0.001,
            market_cap: 100000,
            volume_24h: 50000,
            price_change_24h: 15.5,
            holders: 1000,
            liquidity: {
                total: 25000,
                locked_percentage: 80
            },
            social: {
                twitter_followers: 5000,
                telegram_members: 2000,
                reddit_subscribers: 1500
            },
            contract: {
                address: 'So11111111111111111111111111111111111111112',
                verified: true
            }
        };
    });

    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(strategy.name).toBe('Quantum Memecoin Strategy');
            expect(strategy.type).toBe('quantum_analysis');
            expect(strategy.quantumEngine).toBeDefined();
            expect(strategy.socialAnalyzer).toBeDefined();
            expect(strategy.securityAnalyzer).toBeDefined();
            expect(strategy.riskManager).toBeDefined();
            expect(strategy.lastAnalysis).toBeNull();
        });
    });

    describe('analyzeToken()', () => {
        test('should perform complete quantum analysis', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result).toHaveProperty('token', mockTokenData);
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('signals');
            expect(result).toHaveProperty('recommendation');

            expect(result.signals).toHaveProperty('quantum');
            expect(result.signals).toHaveProperty('social');
            expect(result.signals).toHaveProperty('security');
            expect(result.signals).toHaveProperty('risk');
        });

        test('should calculate quantum signals correctly', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.quantum).toHaveProperty('score');
            expect(result.signals.quantum).toHaveProperty('coherence');
            expect(result.signals.quantum).toHaveProperty('momentum');
            expect(result.signals.quantum).toHaveProperty('probability');

            expect(result.signals.quantum.score).toBe(0.75);
            expect(result.signals.quantum.coherence).toBe(0.8);
            expect(result.signals.quantum.momentum).toBe(0.65);
            expect(result.signals.quantum.probability).toBe(0.72);
        });

        test('should analyze social sentiment correctly', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.social).toHaveProperty('overallScore');
            expect(result.signals.social).toHaveProperty('platforms');
            expect(result.signals.social).toHaveProperty('volume');
            expect(result.signals.social).toHaveProperty('trending');

            expect(result.signals.social.overallScore).toBe(0.7);
            expect(result.signals.social.trending).toBe(true);
        });

        test('should evaluate contract security', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.security).toHaveProperty('overallScore');
            expect(result.signals.security).toHaveProperty('breakdown');
            expect(result.signals.security).toHaveProperty('risks');

            expect(result.signals.security.overallScore).toBe(85);
            expect(result.signals.security.risks).toEqual([]);
        });

        test('should assess risk factors', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.risk).toHaveProperty('overallRisk');
            expect(result.signals.risk).toHaveProperty('riskLevel');
            expect(result.signals.risk).toHaveProperty('factors');

            expect(result.signals.risk.overallRisk).toBe(25);
            expect(result.signals.risk.riskLevel).toBe('LOW');
        });

        test('should calculate overall confidence score', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
            expect(result.confidence).toBeGreaterThan(0.5); // Should be high given mock data
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

        test('should store analysis as lastAnalysis', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(strategy.lastAnalysis).toEqual(result);
        });

        test('should handle analysis errors gracefully', async () => {
            strategy.quantumEngine.analyzeMarketState.mockRejectedValueOnce(new Error('Quantum analysis failed'));

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result).toHaveProperty('error');
            expect(result.recommendation.action).toBe('AVOID');
        });
    });

    describe('Quantum Engine Analysis', () => {
        test('should utilize quantum coherence in decision making', async () => {
            // High coherence scenario
            strategy.quantumEngine.analyzeMarketState.mockResolvedValueOnce({
                quantumScore: 0.9,
                coherenceLevel: 0.95,
                quantumMomentum: 0.8,
                probabilityUp: 0.85
            });

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.quantum.coherence).toBe(0.95);
            expect(result.confidence).toBeGreaterThan(0.7);
        });

        test('should handle low quantum coherence', async () => {
            // Low coherence scenario
            strategy.quantumEngine.analyzeMarketState.mockResolvedValueOnce({
                quantumScore: 0.3,
                coherenceLevel: 0.2,
                quantumMomentum: 0.1,
                probabilityUp: 0.45
            });

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.quantum.coherence).toBe(0.2);
            expect(result.confidence).toBeLessThan(0.5);
        });

        test('should incorporate quantum momentum', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.quantum.momentum).toBeDefined();
            expect(typeof result.signals.quantum.momentum).toBe('number');
        });
    });

    describe('Social Sentiment Integration', () => {
        test('should weight different social platforms', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.social.platforms).toHaveProperty('twitter', 0.75);
            expect(result.signals.social.platforms).toHaveProperty('telegram', 0.65);
            expect(result.signals.social.platforms).toHaveProperty('reddit', 0.72);
        });

        test('should identify trending tokens', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.social.trending).toBe(true);
            expect(result.signals.social.volume).toBe(1500);
        });

        test('should handle low social activity', async () => {
            strategy.socialAnalyzer.analyzeSentiment.mockResolvedValueOnce({
                overallScore: 0.2,
                twitterScore: 0.1,
                telegramScore: 0.3,
                redditScore: 0.2,
                volume: 50,
                trending: false,
                influencerMentions: 0
            });

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.social.overallScore).toBe(0.2);
            expect(result.signals.social.trending).toBe(false);
        });
    });

    describe('Contract Security Assessment', () => {
        test('should evaluate liquidity security', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.security.breakdown).toHaveProperty('liquidity');
            expect(result.signals.security.breakdown.liquidity.score).toBe(90);
            expect(result.signals.security.breakdown.liquidity.locked).toBe(true);
        });

        test('should check ownership security', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.security.breakdown).toHaveProperty('ownership');
            expect(result.signals.security.breakdown.ownership.score).toBe(80);
            expect(result.signals.security.breakdown.ownership.renounced).toBe(true);
        });

        test('should identify security risks', async () => {
            strategy.securityAnalyzer.analyzeSecurity.mockResolvedValueOnce({
                overallScore: 45,
                liquidity: { score: 30, locked: false },
                ownership: { score: 60, renounced: false },
                trading: { score: 45, restrictions: true },
                risks: ['LOW_LIQUIDITY', 'OWNER_NOT_RENOUNCED']
            });

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.security.overallScore).toBe(45);
            expect(result.signals.security.risks).toContain('LOW_LIQUIDITY');
            expect(result.signals.security.risks).toContain('OWNER_NOT_RENOUNCED');
        });
    });

    describe('Risk Management Integration', () => {
        test('should assess multiple risk factors', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.risk.factors).toHaveProperty('liquidity', 10);
            expect(result.signals.risk.factors).toHaveProperty('volatility', 20);
            expect(result.signals.risk.factors).toHaveProperty('market', 15);
        });

        test('should classify risk levels correctly', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.risk.riskLevel).toBe('LOW');
            expect(result.signals.risk.overallRisk).toBe(25);
        });

        test('should handle high-risk scenarios', async () => {
            strategy.riskManager.assessRisk.mockResolvedValueOnce({
                overallRisk: 85,
                riskLevel: 'HIGH',
                factors: {
                    liquidity: 90,
                    volatility: 85,
                    market: 80
                }
            });

            const result = await strategy.analyzeToken(mockTokenData);

            expect(result.signals.risk.riskLevel).toBe('HIGH');
            expect(result.recommendation.action).toBe('AVOID');
        });
    });

    describe('Combined Scoring System', () => {
        test('should weight different signal types appropriately', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            // Test that confidence is calculated from all signals
            expect(result.confidence).toBeGreaterThan(0);

            // With good quantum (0.75), social (0.7), security (85/100), and low risk (25)
            // Overall confidence should be relatively high
            expect(result.confidence).toBeGreaterThan(0.6);
        });

        test('should handle conflicting signals', async () => {
            // Good quantum and social, but poor security
            strategy.securityAnalyzer.analyzeSecurity.mockResolvedValueOnce({
                overallScore: 30,
                liquidity: { score: 20, locked: false },
                ownership: { score: 40, renounced: false },
                trading: { score: 30, restrictions: true },
                risks: ['MULTIPLE_SECURITY_ISSUES']
            });

            const result = await strategy.analyzeToken(mockTokenData);

            // Confidence should be lower due to security concerns
            expect(result.confidence).toBeLessThan(0.6);
            expect(result.recommendation.action).toBeOneOf(['AVOID', 'HOLD']);
        });
    });

    describe('Dynamic Position Sizing', () => {
        test('should calculate position size based on confidence', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            if (result.recommendation.action === 'BUY') {
                expect(result.recommendation).toHaveProperty('positionSize');
                expect(result.recommendation.positionSize).toBeGreaterThan(0);
                expect(result.recommendation.positionSize).toBeLessThanOrEqual(5); // maxPositionSize
            }
        });

        test('should adjust position size for high confidence', async () => {
            // Setup high confidence scenario
            strategy.quantumEngine.analyzeMarketState.mockResolvedValueOnce({
                quantumScore: 0.95,
                coherenceLevel: 0.98,
                quantumMomentum: 0.9,
                probabilityUp: 0.92
            });

            const result = await strategy.analyzeToken(mockTokenData);

            if (result.recommendation.action === 'BUY') {
                expect(result.recommendation.positionSize).toBeGreaterThan(2);
            }
        });

        test('should reduce position size for lower confidence', async () => {
            // Setup moderate confidence scenario
            strategy.quantumEngine.analyzeMarketState.mockResolvedValueOnce({
                quantumScore: 0.6,
                coherenceLevel: 0.65,
                quantumMomentum: 0.55,
                probabilityUp: 0.62
            });

            const result = await strategy.analyzeToken(mockTokenData);

            if (result.recommendation.action === 'BUY') {
                expect(result.recommendation.positionSize).toBeLessThan(3);
            }
        });
    });

    describe('Adaptive Slippage', () => {
        test('should calculate slippage based on liquidity', async () => {
            const result = await strategy.analyzeToken(mockTokenData);

            if (result.recommendation.action === 'BUY') {
                expect(result.recommendation).toHaveProperty('slippage');
                expect(result.recommendation.slippage).toBeGreaterThan(0);
                expect(result.recommendation.slippage).toBeLessThan(0.1); // 10% max
            }
        });

        test('should increase slippage for low liquidity tokens', async () => {
            const lowLiquidityToken = {
                ...mockTokenData,
                liquidity: {
                    total: 5000, // Low liquidity
                    locked_percentage: 60
                },
                volume_24h: 10000 // Low volume
            };

            const result = await strategy.analyzeToken(lowLiquidityToken);

            if (result.recommendation.action === 'BUY') {
                expect(result.recommendation.slippage).toBeGreaterThan(0.01); // Higher slippage
            }
        });
    });

    describe('Performance and Edge Cases', () => {
        test('should complete analysis within reasonable time', async () => {
            const startTime = Date.now();

            await strategy.analyzeToken(mockTokenData);

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(2000); // 2 seconds max
        });

        test('should handle null token data', async () => {
            const result = await strategy.analyzeToken(null);

            expect(result).toHaveProperty('error');
            expect(result.recommendation.action).toBe('AVOID');
        });

        test('should handle malformed token data', async () => {
            const malformedData = { invalid: 'data' };

            const result = await strategy.analyzeToken(malformedData);

            expect(result).toBeDefined();
            // Should not throw and should return some result
        });

        test('should handle component failures gracefully', async () => {
            strategy.socialAnalyzer.analyzeSentiment.mockRejectedValueOnce(new Error('Social API down'));

            const result = await strategy.analyzeToken(mockTokenData);

            // Should still complete analysis with available data
            expect(result).toHaveProperty('signals');
            expect(result.signals.quantum).toBeDefined();
        });

        test('should handle multiple concurrent analyses', async () => {
            const promises = Array(5).fill().map(() =>
                strategy.analyzeToken(mockTokenData)
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result).toHaveProperty('recommendation');
            });
        });
    });
});


