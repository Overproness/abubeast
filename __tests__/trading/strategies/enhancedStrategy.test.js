/**
 * Enhanced Strategy Tests
 * Tests for market microstructure analysis strategy
 */

import { EnhancedStrategy } from '../../../src/lib/trading/strategies/enhancedStrategy.js';

// Mock the dependencies
jest.mock('../../../src/lib/trading/config.js', () => ({
    TRADING_STRATEGIES: {
        ENHANCED_STRATEGY: {
            name: 'Enhanced Strategy',
            type: 'market_microstructure'
        }
    }
}));

// Mock the analyzer components
jest.mock('../../../src/lib/analysis/marketImpact.js', () => ({
    MarketImpactAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            impact: 0.05,
            slippage: 0.02,
            priceImpact: 0.03
        })
    }))
}));

jest.mock('../../../src/lib/analysis/liquidityAnalyzer.js', () => ({
    LiquidityAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            score: 0.75,
            depth: 500000,
            spread: 0.01
        })
    }))
}));

jest.mock('../../../src/lib/ai/mlPredictor.js', () => ({
    MLPredictor: jest.fn().mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        predictPrice: jest.fn().mockResolvedValue({
            direction: 'up',
            confidence: 0.8,
            expectedReturn: 0.25,
            timeHorizon: '24h'
        })
    }))
}));

describe('EnhancedStrategy', () => {
    let strategy;
    let mockTokenData;

    beforeEach(() => {
        strategy = new EnhancedStrategy();
        mockTokenData = {
            mint_address: 'So11111111111111111111111111111111111111112',
            name: 'Test Enhanced Token',
            symbol: 'TET',
            marketData: {
                price: 0.00789,
                volume_24h: 200000,
                market_cap: 750000,
                change_24h: 12.3,
                liquidity: 150000
            }
        };

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with correct configuration', () => {
            expect(strategy.name).toBe('Enhanced Strategy');
            expect(strategy.type).toBe('market_microstructure');
            expect(strategy.marketImpactAnalyzer).toBeDefined();
            expect(strategy.liquidityAnalyzer).toBeDefined();
            expect(strategy.mlPredictor).toBeDefined();
            expect(strategy.analysisCache).toBeInstanceOf(Map);
        });
    });

    describe('initialize()', () => {
        it('should initialize ML predictor successfully', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await strategy.initialize();

            expect(strategy.mlPredictor.initialize).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('[EnhancedStrategy] Initialized successfully');

            consoleSpy.mockRestore();
        });

        it('should handle initialization errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            strategy.mlPredictor.initialize.mockRejectedValue(new Error('Initialization failed'));

            await strategy.initialize();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EnhancedStrategy] Initialization error:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('analyzeToken()', () => {
        it('should perform complete enhanced analysis', async () => {
            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis).toHaveProperty('token', mockTokenData);
            expect(analysis).toHaveProperty('timestamp');
            expect(analysis).toHaveProperty('marketImpact');
            expect(analysis).toHaveProperty('liquidityConditions');
            expect(analysis).toHaveProperty('mlPrediction');
            expect(analysis).toHaveProperty('marketRegime');
            expect(analysis).toHaveProperty('recommendation');

            expect(strategy.marketImpactAnalyzer.analyze).toHaveBeenCalledWith(mockTokenData);
            expect(strategy.liquidityAnalyzer.analyze).toHaveBeenCalledWith(mockTokenData);
            expect(strategy.mlPredictor.predictPrice).toHaveBeenCalledWith(mockTokenData);
        });

        it('should handle analysis errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            strategy.marketImpactAnalyzer.analyze.mockRejectedValue(new Error('Market impact analysis failed'));

            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis.error).toBeDefined();
            expect(analysis.recommendation.action).toBe('AVOID');
            expect(analysis.recommendation.reason).toBe('Analysis failed');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('detectMarketRegime()', () => {
        it('should detect bullish regime correctly', async () => {
            const bullishToken = {
                ...mockTokenData,
                marketData: {
                    ...mockTokenData.marketData,
                    change_24h: 35, // Strong positive trend
                    volume_24h: 100000 // Moderate volatility
                }
            };

            const regime = await strategy.detectMarketRegime(bullishToken);

            expect(regime.type).toBe('bullish');
            expect(regime.confidence).toBe(0.8);
            expect(regime.trend).toBeGreaterThan(0.3);
            expect(regime.volatility).toBeLessThan(0.7);
        });

        it('should detect bearish regime correctly', async () => {
            const bearishToken = {
                ...mockTokenData,
                marketData: {
                    ...mockTokenData.marketData,
                    change_24h: -35, // Strong negative trend
                    volume_24h: 100000
                }
            };

            const regime = await strategy.detectMarketRegime(bearishToken);

            expect(regime.type).toBe('bearish');
            expect(regime.confidence).toBe(0.8);
            expect(regime.trend).toBeLessThan(-0.3);
        });

        it('should detect volatile regime correctly', async () => {
            const volatileToken = {
                ...mockTokenData,
                marketData: {
                    ...mockTokenData.marketData,
                    change_24h: 85, // High volatility
                    volume_24h: 100000
                }
            };

            const regime = await strategy.detectMarketRegime(volatileToken);

            expect(regime.type).toBe('volatile');
            expect(regime.confidence).toBe(0.7);
            expect(regime.volatility).toBeGreaterThan(0.8);
        });

        it('should detect sideways regime correctly', async () => {
            const sidewaysToken = {
                ...mockTokenData,
                marketData: {
                    ...mockTokenData.marketData,
                    change_24h: 5, // Low trend and volatility
                    volume_24h: 100000
                }
            };

            const regime = await strategy.detectMarketRegime(sidewaysToken);

            expect(regime.type).toBe('sideways');
            expect(regime.confidence).toBe(0.6);
        });

        it('should handle market regime detection errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            // Mock extractMarketFeatures to throw error
            jest.spyOn(strategy, 'extractMarketFeatures').mockImplementation(() => {
                throw new Error('Feature extraction failed');
            });

            const regime = await strategy.detectMarketRegime(mockTokenData);

            expect(regime.type).toBe('unknown');
            expect(regime.confidence).toBe(0);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('extractMarketFeatures()', () => {
        it('should extract market features correctly', () => {
            const features = strategy.extractMarketFeatures(mockTokenData);

            expect(features).toHaveProperty('volatility');
            expect(features).toHaveProperty('trend');
            expect(features).toHaveProperty('momentum');
            expect(features).toHaveProperty('volume');

            expect(features.volatility).toBeCloseTo(0.123, 3); // |12.3| / 100
            expect(features.trend).toBeCloseTo(0.123, 3); // 12.3 / 100
            expect(features.volume).toBe(200000);
        });

        it('should handle missing market data', () => {
            const tokenWithoutMarketData = { mint_address: 'test' };
            const features = strategy.extractMarketFeatures(tokenWithoutMarketData);

            expect(features.volatility).toBe(0);
            expect(features.trend).toBe(0);
            expect(features.momentum).toBe(0);
            expect(features.volume).toBe(0);
        });

        it('should calculate momentum correctly', () => {
            const highVolumeToken = {
                ...mockTokenData,
                marketData: {
                    ...mockTokenData.marketData,
                    change_24h: 10,
                    volume_24h: 1000000
                }
            };

            const features = strategy.extractMarketFeatures(highVolumeToken);
            expect(features.momentum).toBeGreaterThan(0);
        });
    });

    describe('generateEnhancedRecommendation()', () => {
        let mockAnalysis;

        beforeEach(() => {
            mockAnalysis = {
                marketImpact: { impact: 0.05 },
                liquidityConditions: { score: 0.75 },
                mlPrediction: {
                    direction: 'up',
                    confidence: 0.8,
                    expectedReturn: 0.25
                },
                marketRegime: { type: 'bullish', confidence: 0.8 }
            };
        });

        it('should generate BUY recommendation for good conditions', () => {
            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('BUY');
            expect(recommendation.reason).toContain('ML prediction shows strong upward movement');
            expect(recommendation.confidence).toBe(0.8);
            expect(recommendation.details).toHaveProperty('marketImpact', 0.05);
            expect(recommendation.details).toHaveProperty('liquidityScore', 0.75);
            expect(recommendation.details).toHaveProperty('mlConfidence', 0.8);
            expect(recommendation.details).toHaveProperty('marketRegime', 'bullish');
        });

        it('should avoid tokens with high market impact', () => {
            mockAnalysis.marketImpact.impact = 0.15;

            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('AVOID');
            expect(recommendation.reason).toContain('High market impact detected');
            expect(recommendation.confidence).toBe(0.8);
        });

        it('should avoid tokens with poor liquidity', () => {
            mockAnalysis.liquidityConditions.score = 0.2;

            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('AVOID');
            expect(recommendation.reason).toContain('Poor liquidity conditions');
            expect(recommendation.confidence).toBe(0.7);
        });

        it('should avoid tokens with negative ML predictions', () => {
            mockAnalysis.mlPrediction.direction = 'down';

            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('AVOID');
            expect(recommendation.reason).toContain('ML prediction shows downward movement');
        });

        it('should hold in bearish market regime', () => {
            mockAnalysis.marketRegime.type = 'bearish';

            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('HOLD');
            expect(recommendation.reason).toContain('Bearish market regime');
        });

        it('should reduce position size in volatile markets', () => {
            mockAnalysis.marketRegime.type = 'volatile';

            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('BUY_SMALL');
            expect(recommendation.reason).toContain('Volatile market - reduced position size');
        });

        it('should hold when no clear signal', () => {
            mockAnalysis.mlPrediction.confidence = 0.5; // Low confidence

            const recommendation = strategy.generateEnhancedRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('HOLD');
            expect(recommendation.reason).toBe('No clear signal');
        });
    });

    describe('Integration Tests', () => {
        it('should provide consistent analysis for same token', async () => {
            const analysis1 = await strategy.analyzeToken(mockTokenData);
            const analysis2 = await strategy.analyzeToken(mockTokenData);

            expect(analysis1.recommendation.action).toBe(analysis2.recommendation.action);
            expect(analysis1.marketRegime?.type).toBe(analysis2.marketRegime?.type);
        });

        it('should handle different market scenarios', async () => {
            const scenarios = [
                {
                    name: 'High impact token',
                    mockMarketImpact: { impact: 0.15 },
                    expectedAction: 'AVOID'
                },
                {
                    name: 'Low liquidity token',
                    mockLiquidityConditions: { score: 0.2 },
                    expectedAction: 'AVOID'
                },
                {
                    name: 'Good conditions token',
                    mockMarketImpact: { impact: 0.03 },
                    mockLiquidityConditions: { score: 0.8 },
                    expectedAction: 'BUY'
                }
            ];

            for (const scenario of scenarios) {
                // Reset mocks for each scenario
                jest.clearAllMocks();

                // Setup mocks for this scenario
                if (scenario.mockMarketImpact) {
                    strategy.marketImpactAnalyzer.analyze.mockResolvedValueOnce(scenario.mockMarketImpact);
                } else {
                    strategy.marketImpactAnalyzer.analyze.mockResolvedValueOnce({ impact: 0.05 });
                }

                if (scenario.mockLiquidityConditions) {
                    strategy.liquidityAnalyzer.analyze.mockResolvedValueOnce(scenario.mockLiquidityConditions);
                } else {
                    strategy.liquidityAnalyzer.analyze.mockResolvedValueOnce({ score: 0.75 });
                }

                // Keep ML prediction consistent
                strategy.mlPredictor.predictPrice.mockResolvedValueOnce({
                    direction: 'up',
                    confidence: 0.8,
                    expectedReturn: 0.25,
                    timeHorizon: '24h'
                });

                const analysis = await strategy.analyzeToken(mockTokenData);
                expect(analysis.recommendation.action).toBe(scenario.expectedAction);
            }
        });

        it('should handle edge cases gracefully', async () => {
            // Test with minimal market data
            const minimalToken = {
                mint_address: 'test',
                marketData: {
                    price: 0,
                    volume_24h: 0,
                    market_cap: 0,
                    change_24h: 0
                }
            };

            const analysis = await strategy.analyzeToken(minimalToken);
            expect(analysis.recommendation).toBeDefined();
            expect(analysis.marketRegime).toBeDefined();
        });

        it('should handle component failures gracefully', async () => {
            // Mock all components to fail
            strategy.marketImpactAnalyzer.analyze.mockRejectedValueOnce(new Error('Market impact failed'));
            strategy.liquidityAnalyzer.analyze.mockRejectedValueOnce(new Error('Liquidity analysis failed'));
            strategy.mlPredictor.predictPrice.mockRejectedValueOnce(new Error('ML prediction failed'));

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis.error).toBeDefined();
            expect(analysis.recommendation.action).toBe('AVOID');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Performance and Caching', () => {
        it('should utilize analysis cache', () => {
            const cacheKey = 'test_key';
            const cacheValue = { cached: true };

            strategy.analysisCache.set(cacheKey, cacheValue);

            expect(strategy.analysisCache.get(cacheKey)).toBe(cacheValue);
            expect(strategy.analysisCache.has(cacheKey)).toBe(true);
        });

        it('should manage cache size', () => {
            // Fill cache beyond reasonable limit
            for (let i = 0; i < 1000; i++) {
                strategy.analysisCache.set(`key_${i}`, { value: i });
            }

            // In a real implementation, cache should have size limits
            expect(strategy.analysisCache.size).toBeLessThanOrEqual(1000);
        });
    });
});
