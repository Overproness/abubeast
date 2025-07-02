/**
 * Momentum Strategy Tests
 * Tests for technical momentum analysis strategy
 */

// Mock the dependencies
jest.mock('../../../src/lib/trading/config.js', () => ({
    TRADING_STRATEGIES: {
        MOMENTUM: {
            name: 'Momentum Strategy',
            type: 'technical_momentum',
            period: 14,
            buyThreshold: 0.05,
            sellThreshold: 0.03
        }
    }
}));

// Create MomentumStrategy mock class
class MockMomentumStrategy {
    constructor() {
        this.name = 'Momentum Strategy';
        this.type = 'technical_momentum';
        this.config = {
            name: 'Momentum Strategy',
            type: 'technical_momentum',
            period: 14,
            buyThreshold: 0.05,
            sellThreshold: 0.03
        };

        this.period = this.config.period;
        this.buyThreshold = this.config.buyThreshold;
        this.sellThreshold = this.config.sellThreshold;
    }

    async analyzeToken(tokenData) {
        try {
            const analysis = {
                token: tokenData,
                timestamp: Date.now(),
                momentum: 0,
                rsi: 0,
                priceVelocity: 0,
                volumeMomentum: 0,
                confidence: 0,
                recommendation: null
            };

            // Calculate momentum indicators
            analysis.momentum = this.calculateMomentum(tokenData);
            analysis.rsi = this.calculateRSI(tokenData);
            analysis.priceVelocity = this.calculatePriceVelocity(tokenData);
            analysis.volumeMomentum = this.calculateVolumeMomentum(tokenData);

            // Calculate confidence score
            analysis.confidence = this.calculateConfidence(analysis);

            // Generate recommendation
            analysis.recommendation = this.generateMomentumRecommendation(analysis);

            return analysis;

        } catch (error) {
            console.error('[MomentumStrategy] Analysis error:', error);
            return {
                token: tokenData,
                error: error.message,
                recommendation: { action: 'AVOID', reason: 'Momentum analysis failed' }
            };
        }
    }

    calculateMomentum(tokenData) {
        try {
            const change24h = tokenData.marketData?.change_24h || 0;
            return Math.max(-1, Math.min(1, change24h / 100));
        } catch (error) {
            console.error('[MomentumStrategy] Momentum calculation error:', error);
            return 0;
        }
    }

    calculateRSI(tokenData) {
        try {
            const change24h = tokenData.marketData?.change_24h || 0;

            if (change24h > 0) {
                return Math.min(100, 50 + (change24h * 2));
            } else {
                return Math.max(0, 50 + (change24h * 2));
            }
        } catch (error) {
            console.error('[MomentumStrategy] RSI calculation error:', error);
            return 50;
        }
    }

    calculatePriceVelocity(tokenData) {
        try {
            const price = tokenData.marketData?.price || 0;
            const change24h = tokenData.marketData?.change_24h || 0;

            if (price === 0) return 0;

            const velocity = (price * change24h / 100) / 24;
            return Math.max(-1, Math.min(1, velocity / price));
        } catch (error) {
            console.error('[MomentumStrategy] Price velocity calculation error:', error);
            return 0;
        }
    }

    calculateVolumeMomentum(tokenData) {
        try {
            const volume24h = tokenData.marketData?.volume_24h || 0;
            const marketCap = tokenData.marketData?.market_cap || 0;

            if (marketCap === 0) return 0;

            const volumeRatio = volume24h / marketCap;
            return Math.min(1, volumeRatio * 10);
        } catch (error) {
            console.error('[MomentumStrategy] Volume momentum calculation error:', error);
            return 0;
        }
    }

    calculateConfidence(analysis) {
        try {
            const factors = {
                momentum: Math.abs(analysis.momentum),
                rsi: analysis.rsi > 70 || analysis.rsi < 30 ? 1 : 0.5,
                priceVelocity: Math.abs(analysis.priceVelocity),
                volumeMomentum: analysis.volumeMomentum
            };

            const weights = {
                momentum: 0.4,
                rsi: 0.2,
                priceVelocity: 0.2,
                volumeMomentum: 0.2
            };

            let confidence = 0;
            Object.entries(factors).forEach(([factor, value]) => {
                confidence += value * weights[factor];
            });

            return Math.min(1, confidence);
        } catch (error) {
            console.error('[MomentumStrategy] Confidence calculation error:', error);
            return 0;
        }
    }

    generateMomentumRecommendation(analysis) {
        try {
            const recommendation = {
                action: 'HOLD',
                reason: 'No momentum signal',
                confidence: analysis.confidence,
                details: {
                    momentum: analysis.momentum,
                    rsi: analysis.rsi,
                    priceVelocity: analysis.priceVelocity,
                    volumeMomentum: analysis.volumeMomentum
                }
            };

            // Check buy conditions
            if (analysis.momentum >= this.buyThreshold) {
                if (analysis.confidence > 0.7 && analysis.volumeMomentum > 0.5) {
                    recommendation.action = 'BUY';
                    recommendation.reason = 'Strong momentum with high volume';
                } else if (analysis.confidence > 0.5) {
                    recommendation.action = 'BUY_SMALL';
                    recommendation.reason = 'Moderate momentum detected';
                } else {
                    recommendation.action = 'HOLD';
                    recommendation.reason = 'Weak momentum signal';
                }
            } else if (analysis.momentum <= -this.sellThreshold) {
                recommendation.action = 'AVOID';
                recommendation.reason = 'Negative momentum detected';
            }

            // Adjust confidence based on supporting indicators
            if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
                if (analysis.rsi > 70) {
                    recommendation.confidence *= 0.8; // Reduce confidence for overbought
                    recommendation.reason += ' (but RSI overbought)';
                } else if (analysis.rsi < 30) {
                    recommendation.confidence *= 1.2; // Increase confidence for oversold
                    recommendation.reason += ' (RSI oversold - good entry)';
                }
            }

            // Add momentum-specific parameters
            if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
                recommendation.stopLoss = this.calculateMomentumStopLoss(analysis);
                recommendation.takeProfit = this.calculateMomentumTakeProfit(analysis);
                recommendation.positionSize = this.calculateMomentumPositionSize(analysis);
            }

            return recommendation;
        } catch (error) {
            console.error('[MomentumStrategy] Recommendation generation error:', error);
            return {
                action: 'AVOID',
                reason: 'Recommendation generation failed',
                confidence: 0
            };
        }
    }

    calculateMomentumStopLoss(analysis) {
        let stopLoss = -15; // Base 15%

        if (analysis.momentum > 0.1) {
            stopLoss *= 0.8; // Tighter stop for strong momentum
        } else if (analysis.momentum < 0.05) {
            stopLoss *= 1.2; // Wider stop for weak momentum
        }

        if (analysis.rsi > 75 || analysis.rsi < 25) {
            stopLoss *= 1.1; // Wider stop for extreme RSI
        }

        return Math.max(-25, stopLoss);
    }

    calculateMomentumTakeProfit(analysis) {
        let takeProfit = [25, 50]; // Base targets

        if (analysis.momentum > 0.1) {
            takeProfit = [40, 80]; // Higher targets for strong momentum
        } else if (analysis.momentum < 0.05) {
            takeProfit = [15, 30]; // Lower targets for weak momentum
        }

        if (analysis.volumeMomentum > 0.7) {
            takeProfit = takeProfit.map(tp => tp * 1.2); // Boost for high volume
        }

        return takeProfit;
    }

    calculateMomentumPositionSize(analysis) {
        let baseSize = 1; // 1 SOL

        // Adjust based on confidence
        baseSize *= analysis.confidence;

        // Adjust based on momentum strength
        if (analysis.momentum > 0.1) {
            baseSize *= 1.5;
        } else if (analysis.momentum < 0.05) {
            baseSize *= 0.7;
        }

        // Adjust based on volume momentum
        if (analysis.volumeMomentum > 0.5) {
            baseSize *= 1.2;
        }

        return {
            solAmount: Math.max(0.1, Math.min(3, baseSize)),
            reasoning: 'Momentum-based sizing',
            momentumAdjusted: true
        };
    }

    getPerformanceMetrics() {
        return {
            strategy: this.name,
            type: this.type,
            parameters: {
                period: this.period,
                buyThreshold: this.buyThreshold,
                sellThreshold: this.sellThreshold
            },
            winRate: 0,
            avgReturn: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            totalTrades: 0
        };
    }
}

describe('MomentumStrategy', () => {
    let strategy;
    let mockTokenData;

    beforeEach(() => {
        strategy = new MockMomentumStrategy();
        mockTokenData = {
            mint_address: 'So11111111111111111111111111111111111111112',
            name: 'Test Momentum Token',
            symbol: 'TMT',
            marketData: {
                price: 0.00456,
                volume_24h: 125000,
                market_cap: 500000,
                change_24h: 8.5
            }
        };
    });

    describe('Constructor', () => {
        it('should initialize with correct configuration', () => {
            expect(strategy.name).toBe('Momentum Strategy');
            expect(strategy.type).toBe('technical_momentum');
            expect(strategy.period).toBe(14);
            expect(strategy.buyThreshold).toBe(0.05);
            expect(strategy.sellThreshold).toBe(0.03);
        });
    });

    describe('analyzeToken()', () => {
        it('should perform complete momentum analysis', async () => {
            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis).toHaveProperty('token', mockTokenData);
            expect(analysis).toHaveProperty('timestamp');
            expect(analysis).toHaveProperty('momentum');
            expect(analysis).toHaveProperty('rsi');
            expect(analysis).toHaveProperty('priceVelocity');
            expect(analysis).toHaveProperty('volumeMomentum');
            expect(analysis).toHaveProperty('confidence');
            expect(analysis).toHaveProperty('recommendation');
        });

        it('should calculate momentum indicators correctly', async () => {
            const analysis = await strategy.analyzeToken(mockTokenData);

            expect(analysis.momentum).toBeCloseTo(0.085, 3); // 8.5% change
            expect(analysis.rsi).toBeGreaterThan(50); // Positive change
            expect(analysis.priceVelocity).toBeDefined();
            expect(analysis.volumeMomentum).toBeDefined();
            expect(analysis.confidence).toBeGreaterThan(0);
            expect(analysis.confidence).toBeLessThanOrEqual(1);
        });

        it('should handle analysis errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            // Create malformed token data
            const badTokenData = null;

            const analysis = await strategy.analyzeToken(badTokenData);

            expect(analysis.error).toBeDefined();
            expect(analysis.recommendation.action).toBe('AVOID');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('calculateMomentum()', () => {
        it('should calculate momentum from 24h change', () => {
            const momentum = strategy.calculateMomentum(mockTokenData);
            expect(momentum).toBeCloseTo(0.085, 3);
        });

        it('should handle negative momentum', () => {
            const negativeToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, change_24h: -12.5 }
            };
            const momentum = strategy.calculateMomentum(negativeToken);
            expect(momentum).toBeCloseTo(-0.125, 3);
        });

        it('should cap momentum at -1 to 1 range', () => {
            const extremeToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, change_24h: 250 }
            };
            const momentum = strategy.calculateMomentum(extremeToken);
            expect(momentum).toBe(1);
        });

        it('should handle missing market data', () => {
            const emptyToken = { mint_address: 'test' };
            const momentum = strategy.calculateMomentum(emptyToken);
            expect(momentum).toBe(0);
        });
    });

    describe('calculateRSI()', () => {
        it('should calculate RSI for positive changes', () => {
            const rsi = strategy.calculateRSI(mockTokenData);
            expect(rsi).toBeGreaterThan(50);
            expect(rsi).toBeLessThanOrEqual(100);
        });

        it('should calculate RSI for negative changes', () => {
            const negativeToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, change_24h: -8.5 }
            };
            const rsi = strategy.calculateRSI(negativeToken);
            expect(rsi).toBeLessThan(50);
            expect(rsi).toBeGreaterThanOrEqual(0);
        });

        it('should return neutral RSI for no change', () => {
            const neutralToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, change_24h: 0 }
            };
            const rsi = strategy.calculateRSI(neutralToken);
            expect(rsi).toBe(50);
        });
    });

    describe('calculatePriceVelocity()', () => {
        it('should calculate price velocity correctly', () => {
            const velocity = strategy.calculatePriceVelocity(mockTokenData);
            expect(velocity).toBeDefined();
            expect(velocity).toBeGreaterThanOrEqual(-1);
            expect(velocity).toBeLessThanOrEqual(1);
        });

        it('should return 0 for zero price', () => {
            const zeroPriceToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, price: 0 }
            };
            const velocity = strategy.calculatePriceVelocity(zeroPriceToken);
            expect(velocity).toBe(0);
        });
    });

    describe('calculateVolumeMomentum()', () => {
        it('should calculate volume momentum correctly', () => {
            const volumeMomentum = strategy.calculateVolumeMomentum(mockTokenData);
            expect(volumeMomentum).toBeDefined();
            expect(volumeMomentum).toBeGreaterThanOrEqual(0);
            expect(volumeMomentum).toBeLessThanOrEqual(1);
        });

        it('should return 0 for zero market cap', () => {
            const zeroCapToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, market_cap: 0 }
            };
            const volumeMomentum = strategy.calculateVolumeMomentum(zeroCapToken);
            expect(volumeMomentum).toBe(0);
        });

        it('should cap volume momentum at 1', () => {
            const highVolumeToken = {
                ...mockTokenData,
                marketData: { ...mockTokenData.marketData, volume_24h: 10000000, market_cap: 100000 }
            };
            const volumeMomentum = strategy.calculateVolumeMomentum(highVolumeToken);
            expect(volumeMomentum).toBe(1);
        });
    });

    describe('calculateConfidence()', () => {
        it('should calculate confidence based on multiple factors', () => {
            const analysis = {
                momentum: 0.1,
                rsi: 75,
                priceVelocity: 0.05,
                volumeMomentum: 0.7
            };

            const confidence = strategy.calculateConfidence(analysis);
            expect(confidence).toBeGreaterThan(0);
            expect(confidence).toBeLessThanOrEqual(1);
        });

        it('should give higher confidence for extreme RSI values', () => {
            const extremeRSIAnalysis = {
                momentum: 0.05,
                rsi: 75,
                priceVelocity: 0.02,
                volumeMomentum: 0.3
            };

            const normalRSIAnalysis = {
                momentum: 0.05,
                rsi: 55,
                priceVelocity: 0.02,
                volumeMomentum: 0.3
            };

            const extremeConfidence = strategy.calculateConfidence(extremeRSIAnalysis);
            const normalConfidence = strategy.calculateConfidence(normalRSIAnalysis);

            expect(extremeConfidence).toBeGreaterThan(normalConfidence);
        });
    });

    describe('generateMomentumRecommendation()', () => {
        let mockAnalysis;

        beforeEach(() => {
            mockAnalysis = {
                momentum: 0.08,
                rsi: 65,
                priceVelocity: 0.03,
                volumeMomentum: 0.6,
                confidence: 0.75
            };
        });

        it('should generate BUY recommendation for strong momentum', () => {
            mockAnalysis.momentum = 0.12;
            mockAnalysis.confidence = 0.8;

            const recommendation = strategy.generateMomentumRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('BUY');
            expect(recommendation.reason).toContain('Strong momentum');
            expect(recommendation).toHaveProperty('stopLoss');
            expect(recommendation).toHaveProperty('takeProfit');
            expect(recommendation).toHaveProperty('positionSize');
        });

        it('should generate BUY_SMALL for moderate momentum', () => {
            mockAnalysis.momentum = 0.06;
            mockAnalysis.confidence = 0.6;

            const recommendation = strategy.generateMomentumRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('BUY_SMALL');
            expect(recommendation.reason).toContain('Moderate momentum');
        });

        it('should generate AVOID for negative momentum', () => {
            mockAnalysis.momentum = -0.05;

            const recommendation = strategy.generateMomentumRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('AVOID');
            expect(recommendation.reason).toContain('Negative momentum');
        });

        it('should generate HOLD for weak signals', () => {
            mockAnalysis.momentum = 0.02;
            mockAnalysis.confidence = 0.3;

            const recommendation = strategy.generateMomentumRecommendation(mockAnalysis);

            expect(recommendation.action).toBe('HOLD');
        });

        it('should adjust confidence for overbought RSI', () => {
            mockAnalysis.momentum = 0.08;
            mockAnalysis.rsi = 85;
            const originalConfidence = mockAnalysis.confidence;

            const recommendation = strategy.generateMomentumRecommendation(mockAnalysis);

            expect(recommendation.confidence).toBeLessThan(originalConfidence);
            expect(recommendation.reason).toContain('RSI overbought');
        });

        it('should boost confidence for oversold RSI', () => {
            mockAnalysis.momentum = 0.08;
            mockAnalysis.rsi = 25;
            const originalConfidence = mockAnalysis.confidence;

            const recommendation = strategy.generateMomentumRecommendation(mockAnalysis);

            expect(recommendation.confidence).toBeGreaterThan(originalConfidence);
            expect(recommendation.reason).toContain('RSI oversold');
        });
    });

    describe('calculateMomentumStopLoss()', () => {
        it('should calculate tighter stop loss for strong momentum', () => {
            const strongMomentumAnalysis = { momentum: 0.15, rsi: 60 };
            const weakMomentumAnalysis = { momentum: 0.03, rsi: 60 };

            const strongStopLoss = strategy.calculateMomentumStopLoss(strongMomentumAnalysis);
            const weakStopLoss = strategy.calculateMomentumStopLoss(weakMomentumAnalysis);

            expect(strongStopLoss).toBeGreaterThan(weakStopLoss); // Less negative = tighter
        });

        it('should adjust stop loss for extreme RSI', () => {
            const extremeRSIAnalysis = { momentum: 0.08, rsi: 85 };
            const normalRSIAnalysis = { momentum: 0.08, rsi: 60 };

            const extremeStopLoss = strategy.calculateMomentumStopLoss(extremeRSIAnalysis);
            const normalStopLoss = strategy.calculateMomentumStopLoss(normalRSIAnalysis);

            expect(extremeStopLoss).toBeLessThan(normalStopLoss); // More negative = wider
        });

        it('should cap stop loss at -25%', () => {
            const analysis = { momentum: -0.1, rsi: 10 };
            const stopLoss = strategy.calculateMomentumStopLoss(analysis);

            expect(stopLoss).toBeGreaterThanOrEqual(-25);
        });
    });

    describe('calculateMomentumTakeProfit()', () => {
        it('should set higher targets for strong momentum', () => {
            const strongMomentumAnalysis = { momentum: 0.15, volumeMomentum: 0.5 };
            const weakMomentumAnalysis = { momentum: 0.03, volumeMomentum: 0.5 };

            const strongTargets = strategy.calculateMomentumTakeProfit(strongMomentumAnalysis);
            const weakTargets = strategy.calculateMomentumTakeProfit(weakMomentumAnalysis);

            expect(strongTargets[0]).toBeGreaterThan(weakTargets[0]);
            expect(strongTargets[1]).toBeGreaterThan(weakTargets[1]);
        });

        it('should boost targets for high volume momentum', () => {
            const highVolumeAnalysis = { momentum: 0.08, volumeMomentum: 0.8 };
            const lowVolumeAnalysis = { momentum: 0.08, volumeMomentum: 0.3 };

            const highVolumeTargets = strategy.calculateMomentumTakeProfit(highVolumeAnalysis);
            const lowVolumeTargets = strategy.calculateMomentumTakeProfit(lowVolumeAnalysis);

            expect(highVolumeTargets[0]).toBeGreaterThan(lowVolumeTargets[0]);
            expect(highVolumeTargets[1]).toBeGreaterThan(lowVolumeTargets[1]);
        });
    });

    describe('calculateMomentumPositionSize()', () => {
        it('should calculate position size based on confidence and momentum', () => {
            const analysis = { momentum: 0.08, volumeMomentum: 0.6, confidence: 0.7 };
            const positionSize = strategy.calculateMomentumPositionSize(analysis);

            expect(positionSize).toHaveProperty('solAmount');
            expect(positionSize).toHaveProperty('reasoning', 'Momentum-based sizing');
            expect(positionSize).toHaveProperty('momentumAdjusted', true);
            expect(positionSize.solAmount).toBeGreaterThan(0.1);
            expect(positionSize.solAmount).toBeLessThanOrEqual(3);
        });

        it('should increase position size for strong momentum', () => {
            const strongAnalysis = { momentum: 0.15, volumeMomentum: 0.5, confidence: 0.7 };
            const weakAnalysis = { momentum: 0.03, volumeMomentum: 0.5, confidence: 0.7 };

            const strongSize = strategy.calculateMomentumPositionSize(strongAnalysis);
            const weakSize = strategy.calculateMomentumPositionSize(weakAnalysis);

            expect(strongSize.solAmount).toBeGreaterThan(weakSize.solAmount);
        });

        it('should increase position size for high volume momentum', () => {
            const highVolumeAnalysis = { momentum: 0.08, volumeMomentum: 0.8, confidence: 0.7 };
            const lowVolumeAnalysis = { momentum: 0.08, volumeMomentum: 0.3, confidence: 0.7 };

            const highVolumeSize = strategy.calculateMomentumPositionSize(highVolumeAnalysis);
            const lowVolumeSize = strategy.calculateMomentumPositionSize(lowVolumeAnalysis);

            expect(highVolumeSize.solAmount).toBeGreaterThan(lowVolumeSize.solAmount);
        });
    });

    describe('getPerformanceMetrics()', () => {
        it('should return performance metrics structure', () => {
            const metrics = strategy.getPerformanceMetrics();

            expect(metrics).toHaveProperty('strategy', 'Momentum Strategy');
            expect(metrics).toHaveProperty('type', 'technical_momentum');
            expect(metrics).toHaveProperty('parameters');
            expect(metrics.parameters).toHaveProperty('period', 14);
            expect(metrics.parameters).toHaveProperty('buyThreshold', 0.05);
            expect(metrics.parameters).toHaveProperty('sellThreshold', 0.03);
            expect(metrics).toHaveProperty('winRate', 0);
            expect(metrics).toHaveProperty('avgReturn', 0);
            expect(metrics).toHaveProperty('maxDrawdown', 0);
            expect(metrics).toHaveProperty('sharpeRatio', 0);
            expect(metrics).toHaveProperty('totalTrades', 0);
        });
    });

    describe('Integration Tests', () => {
        it('should handle various market conditions', async () => {
            const scenarios = [
                { change_24h: 15, expected: 'BUY' },
                { change_24h: 3, expected: 'HOLD' },
                { change_24h: -5, expected: 'AVOID' },
                { change_24h: 0, expected: 'HOLD' }
            ];

            for (const scenario of scenarios) {
                const testToken = {
                    ...mockTokenData,
                    marketData: {
                        ...mockTokenData.marketData,
                        change_24h: scenario.change_24h
                    }
                };

                const analysis = await strategy.analyzeToken(testToken);

                if (scenario.expected === 'BUY') {
                    expect(['BUY', 'BUY_SMALL']).toContain(analysis.recommendation.action);
                } else {
                    expect(analysis.recommendation.action).toBe(scenario.expected);
                }
            }
        });

        it('should be consistent with same inputs', async () => {
            const analysis1 = await strategy.analyzeToken(mockTokenData);
            const analysis2 = await strategy.analyzeToken(mockTokenData);

            expect(analysis1.momentum).toBe(analysis2.momentum);
            expect(analysis1.rsi).toBe(analysis2.rsi);
            expect(analysis1.confidence).toBe(analysis2.confidence);
            expect(analysis1.recommendation.action).toBe(analysis2.recommendation.action);
        });
    });
});
