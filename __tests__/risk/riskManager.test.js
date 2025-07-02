/**
 * Risk Manager Tests
 * Unit tests for the risk management system
 */

import { RiskManager } from '../../src/lib/risk/riskManager.js';

describe('RiskManager', () => {
    let riskManager;
    let mockTokenData;
    let mockPortfolio;

    beforeEach(() => {
        riskManager = new RiskManager();

        mockTokenData = {
            mint_address: 'test123',
            symbol: 'TEST',
            price: 0.001,
            market_cap: 50000,
            volume_24h: 10000,
            liquidity: 25000,
            holders: 1000,
            price_change_24h: 15.5
        };

        mockPortfolio = {
            totalValue: 1000,
            positions: [
                { symbol: 'SOL', value: 500, allocation: 0.5 },
                { symbol: 'USDC', value: 300, allocation: 0.3 },
                { symbol: 'TEST', value: 200, allocation: 0.2 }
            ],
            availableFunds: 200
        };
    });

    describe('Initialization', () => {
        it('should initialize with default risk parameters', () => {
            expect(riskManager.maxPositionSize).toBeDefined();
            expect(riskManager.maxDrawdown).toBeDefined();
            expect(riskManager.riskThreshold).toBeDefined();
        });

        it('should initialize with custom parameters', () => {
            const customRiskManager = new RiskManager({
                maxPositionSize: 0.1,
                maxDrawdown: 0.15,
                riskThreshold: 80
            });

            expect(customRiskManager.maxPositionSize).toBe(0.1);
            expect(customRiskManager.maxDrawdown).toBe(0.15);
            expect(customRiskManager.riskThreshold).toBe(80);
        });
    });

    describe('Risk Assessment', () => {
        it('should assess overall risk correctly', async () => {
            const riskAssessment = await riskManager.assessRisk(mockTokenData, mockPortfolio);

            expect(riskAssessment).toHaveProperty('riskScore');
            expect(riskAssessment).toHaveProperty('riskLevel');
            expect(riskAssessment).toHaveProperty('riskFactors');
            expect(riskAssessment).toHaveProperty('recommendation');

            expect(riskAssessment.riskScore).toBeGreaterThanOrEqual(0);
            expect(riskAssessment.riskScore).toBeLessThanOrEqual(100);
            expect(['low', 'moderate', 'high', 'extreme']).toContain(riskAssessment.riskLevel);
        });

        it('should identify high-risk scenarios', async () => {
            const highRiskToken = {
                ...mockTokenData,
                market_cap: 1000, // Very low market cap
                liquidity: 500,   // Very low liquidity
                price_change_24h: 500 // Extreme volatility
            };

            const riskAssessment = await riskManager.assessRisk(highRiskToken, mockPortfolio);

            expect(riskAssessment.riskScore).toBeGreaterThan(70);
            expect(riskAssessment.riskLevel).toMatch(/high|extreme/);
        });

        it('should identify low-risk scenarios', async () => {
            const lowRiskToken = {
                ...mockTokenData,
                market_cap: 10000000, // High market cap
                liquidity: 1000000,   // High liquidity
                price_change_24h: 2   // Low volatility
            };

            const riskAssessment = await riskManager.assessRisk(lowRiskToken, mockPortfolio);

            expect(riskAssessment.riskScore).toBeLessThan(40);
            expect(riskAssessment.riskLevel).toMatch(/low|moderate/);
        });
    });

    describe('Market Risk Analysis', () => {
        it('should calculate market risk correctly', () => {
            const marketRisk = riskManager.calculateMarketRisk(mockTokenData);

            expect(marketRisk).toHaveProperty('volatilityRisk');
            expect(marketRisk).toHaveProperty('liquidityRisk');
            expect(marketRisk).toHaveProperty('marketCapRisk');
            expect(marketRisk).toHaveProperty('volumeRisk');

            expect(marketRisk.volatilityRisk).toBeGreaterThanOrEqual(0);
            expect(marketRisk.liquidityRisk).toBeGreaterThanOrEqual(0);
            expect(marketRisk.marketCapRisk).toBeGreaterThanOrEqual(0);
            expect(marketRisk.volumeRisk).toBeGreaterThanOrEqual(0);
        });

        it('should penalize high volatility', () => {
            const highVolToken = { ...mockTokenData, price_change_24h: 100 };
            const lowVolToken = { ...mockTokenData, price_change_24h: 5 };

            const highVolRisk = riskManager.calculateMarketRisk(highVolToken);
            const lowVolRisk = riskManager.calculateMarketRisk(lowVolToken);

            expect(highVolRisk.volatilityRisk).toBeGreaterThan(lowVolRisk.volatilityRisk);
        });

        it('should penalize low liquidity', () => {
            const lowLiqToken = { ...mockTokenData, liquidity: 1000 };
            const highLiqToken = { ...mockTokenData, liquidity: 100000 };

            const lowLiqRisk = riskManager.calculateMarketRisk(lowLiqToken);
            const highLiqRisk = riskManager.calculateMarketRisk(highLiqToken);

            expect(lowLiqRisk.liquidityRisk).toBeGreaterThan(highLiqRisk.liquidityRisk);
        });
    });

    describe('Portfolio Risk Analysis', () => {
        it('should calculate portfolio risk metrics', () => {
            const portfolioRisk = riskManager.calculatePortfolioRisk(mockPortfolio);

            expect(portfolioRisk).toHaveProperty('concentrationRisk');
            expect(portfolioRisk).toHaveProperty('correlationRisk');
            expect(portfolioRisk).toHaveProperty('diversificationScore');
            expect(portfolioRisk).toHaveProperty('overallPortfolioRisk');

            expect(portfolioRisk.concentrationRisk).toBeGreaterThanOrEqual(0);
            expect(portfolioRisk.diversificationScore).toBeGreaterThanOrEqual(0);
        });

        it('should detect concentration risk', () => {
            const concentratedPortfolio = {
                ...mockPortfolio,
                positions: [
                    { symbol: 'SOL', value: 900, allocation: 0.9 },
                    { symbol: 'USDC', value: 100, allocation: 0.1 }
                ]
            };

            const portfolioRisk = riskManager.calculatePortfolioRisk(concentratedPortfolio);
            expect(portfolioRisk.concentrationRisk).toBeGreaterThan(50);
        });

        it('should favor diversified portfolios', () => {
            const diversifiedPortfolio = {
                ...mockPortfolio,
                positions: [
                    { symbol: 'SOL', value: 200, allocation: 0.2 },
                    { symbol: 'USDC', value: 200, allocation: 0.2 },
                    { symbol: 'BTC', value: 200, allocation: 0.2 },
                    { symbol: 'ETH', value: 200, allocation: 0.2 },
                    { symbol: 'TEST', value: 200, allocation: 0.2 }
                ]
            };

            const portfolioRisk = riskManager.calculatePortfolioRisk(diversifiedPortfolio);
            expect(portfolioRisk.diversificationScore).toBeGreaterThan(70);
        });
    });

    describe('Position Sizing', () => {
        it('should calculate safe position size', () => {
            const positionSize = riskManager.calculatePositionSize(
                mockTokenData,
                mockPortfolio,
                { riskScore: 30 }
            );

            expect(positionSize).toHaveProperty('recommendedSize');
            expect(positionSize).toHaveProperty('maxSize');
            expect(positionSize).toHaveProperty('reasoning');

            expect(positionSize.recommendedSize).toBeGreaterThan(0);
            expect(positionSize.maxSize).toBeGreaterThanOrEqual(positionSize.recommendedSize);
        });

        it('should reduce position size for high-risk tokens', () => {
            const lowRiskSize = riskManager.calculatePositionSize(
                mockTokenData,
                mockPortfolio,
                { riskScore: 20 }
            );

            const highRiskSize = riskManager.calculatePositionSize(
                mockTokenData,
                mockPortfolio,
                { riskScore: 80 }
            );

            expect(highRiskSize.recommendedSize).toBeLessThan(lowRiskSize.recommendedSize);
        });

        it('should respect available funds', () => {
            const positionSize = riskManager.calculatePositionSize(
                mockTokenData,
                mockPortfolio,
                { riskScore: 30 }
            );

            expect(positionSize.recommendedSize).toBeLessThanOrEqual(mockPortfolio.availableFunds);
        });

        it('should prevent overallocation', () => {
            const limitedFundsPortfolio = {
                ...mockPortfolio,
                availableFunds: 10 // Very limited funds
            };

            const positionSize = riskManager.calculatePositionSize(
                mockTokenData,
                limitedFundsPortfolio,
                { riskScore: 30 }
            );

            expect(positionSize.recommendedSize).toBeLessThanOrEqual(10);
        });
    });

    describe('Risk Limits and Controls', () => {
        it('should enforce maximum position size limits', () => {
            const result = riskManager.checkRiskLimits(mockTokenData, mockPortfolio, {
                positionSize: 1000, // Trying to invest more than available
                riskScore: 30
            });

            expect(result.approved).toBe(false);
            expect(result.reason).toContain('position size');
        });

        it('should enforce risk score limits', () => {
            const result = riskManager.checkRiskLimits(mockTokenData, mockPortfolio, {
                positionSize: 100,
                riskScore: 95 // Very high risk
            });

            expect(result.approved).toBe(false);
            expect(result.reason).toContain('risk score');
        });

        it('should approve safe trades', () => {
            const result = riskManager.checkRiskLimits(mockTokenData, mockPortfolio, {
                positionSize: 50,
                riskScore: 25
            });

            expect(result.approved).toBe(true);
        });

        it('should prevent excessive drawdown', () => {
            const portfolioWithLosses = {
                ...mockPortfolio,
                totalValue: 700, // 30% drawdown from 1000
                peakValue: 1000
            };

            const result = riskManager.checkRiskLimits(mockTokenData, portfolioWithLosses, {
                positionSize: 100,
                riskScore: 40
            });

            expect(result.approved).toBe(false);
            expect(result.reason).toContain('drawdown');
        });
    });

    describe('Security Risk Assessment', () => {
        it('should assess contract security risks', async () => {
            const securityRisk = await riskManager.assessSecurityRisk(mockTokenData);

            expect(securityRisk).toHaveProperty('contractRisk');
            expect(securityRisk).toHaveProperty('rugPullRisk');
            expect(securityRisk).toHaveProperty('honeypotRisk');
            expect(securityRisk).toHaveProperty('ownershipRisk');

            expect(securityRisk.contractRisk).toBeGreaterThanOrEqual(0);
            expect(securityRisk.rugPullRisk).toBeGreaterThanOrEqual(0);
        });

        it('should flag suspicious contracts', async () => {
            const suspiciousToken = {
                ...mockTokenData,
                liquidity_locked: false,
                owner_can_mint: true,
                high_tax: true
            };

            const securityRisk = await riskManager.assessSecurityRisk(suspiciousToken);

            expect(securityRisk.rugPullRisk).toBeGreaterThan(70);
            expect(securityRisk.contractRisk).toBeGreaterThan(50);
        });
    });

    describe('Dynamic Risk Adjustment', () => {
        it('should adjust risk parameters based on market conditions', () => {
            const bullMarketConditions = { volatility: 0.2, trend: 0.8 };
            const bearMarketConditions = { volatility: 0.8, trend: -0.6 };

            riskManager.adjustRiskParameters(bullMarketConditions);
            const bullRisk = riskManager.calculateMarketRisk(mockTokenData);

            riskManager.adjustRiskParameters(bearMarketConditions);
            const bearRisk = riskManager.calculateMarketRisk(mockTokenData);

            expect(bearRisk.volatilityRisk).toBeGreaterThan(bullRisk.volatilityRisk);
        });

        it('should maintain risk parameters within bounds', () => {
            const extremeConditions = { volatility: 2.0, trend: -2.0 };

            riskManager.adjustRiskParameters(extremeConditions);

            expect(riskManager.maxPositionSize).toBeGreaterThan(0);
            expect(riskManager.maxPositionSize).toBeLessThanOrEqual(1);
            expect(riskManager.riskThreshold).toBeGreaterThanOrEqual(0);
            expect(riskManager.riskThreshold).toBeLessThanOrEqual(100);
        });
    });

    describe('Risk Reporting', () => {
        it('should generate comprehensive risk reports', async () => {
            const riskReport = await riskManager.generateRiskReport(mockTokenData, mockPortfolio);

            expect(riskReport).toHaveProperty('timestamp');
            expect(riskReport).toHaveProperty('overallRisk');
            expect(riskReport).toHaveProperty('riskBreakdown');
            expect(riskReport).toHaveProperty('recommendations');
            expect(riskReport).toHaveProperty('alerts');

            expect(Array.isArray(riskReport.recommendations)).toBe(true);
            expect(Array.isArray(riskReport.alerts)).toBe(true);
        });

        it('should include risk mitigation suggestions', async () => {
            const riskReport = await riskManager.generateRiskReport(mockTokenData, mockPortfolio);

            expect(riskReport.recommendations.length).toBeGreaterThan(0);

            riskReport.recommendations.forEach(recommendation => {
                expect(recommendation).toHaveProperty('type');
                expect(recommendation).toHaveProperty('description');
                expect(recommendation).toHaveProperty('priority');
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle missing token data', async () => {
            const riskAssessment = await riskManager.assessRisk({}, mockPortfolio);

            expect(riskAssessment).toHaveProperty('riskScore');
            expect(riskAssessment.riskScore).toBeGreaterThan(80); // High risk for missing data
        });

        it('should handle invalid portfolio data', async () => {
            const riskAssessment = await riskManager.assessRisk(mockTokenData, null);

            expect(riskAssessment).toHaveProperty('riskScore');
            expect(riskAssessment).toHaveProperty('error');
        });

        it('should handle calculation errors gracefully', () => {
            const invalidToken = {
                ...mockTokenData,
                price: 'invalid',
                market_cap: null,
                liquidity: undefined
            };

            expect(() => {
                riskManager.calculateMarketRisk(invalidToken);
            }).not.toThrow();
        });
    });

    describe('Performance', () => {
        it('should complete risk assessment quickly', async () => {
            const startTime = Date.now();
            await riskManager.assessRisk(mockTokenData, mockPortfolio);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });

        it('should handle multiple concurrent assessments', async () => {
            const promises = Array(10).fill().map(() =>
                riskManager.assessRisk(mockTokenData, mockPortfolio)
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result).toHaveProperty('riskScore');
            });
        });
    });
});
