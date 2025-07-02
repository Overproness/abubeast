/**
 * Trading Configuration Tests
 * Tests for the trading bot configuration
 */

import { TRADING_CONFIG, TRADING_STRATEGIES, TRADING_OPTIONS, DATA_SOURCES } from '../../src/lib/trading/config.js';

describe('Trading Configuration', () => {
    describe('TRADING_CONFIG', () => {
        it('should have required system configuration', () => {
            expect(TRADING_CONFIG.VERSION).toBeDefined();
            expect(TRADING_CONFIG.SYSTEM_NAME).toBe('ABUBOT');
            expect(TRADING_CONFIG.VERSION).toBe('2.0.0');
        });

        it('should have valid risk management settings', () => {
            const risk = TRADING_CONFIG.RISK_MANAGEMENT;
            expect(risk.DEFAULT_STOP_LOSS).toBe(-15);
            expect(risk.TAKE_PROFIT_FIRST).toBe(20);
            expect(risk.TAKE_PROFIT_SECOND).toBe(50);
            expect(risk.MAX_POSITION_SIZE_PERCENT).toBe(5);
            expect(risk.MAX_DRAWDOWN).toBe(20);
        });

        it('should have proper capitalization blocks', () => {
            const blocks = TRADING_CONFIG.CAPITALIZATION_BLOCKS;
            expect(blocks.MICRO).toBeDefined();
            expect(blocks.SMALL).toBeDefined();
            expect(blocks.MEDIUM).toBeDefined();
            expect(blocks.LARGE).toBeDefined();

            // Check MICRO block
            expect(blocks.MICRO.min).toBe(0);
            expect(blocks.MICRO.max).toBe(15000);
            expect(blocks.MICRO.maxAmount).toBe(100);
            expect(blocks.MICRO.slippage).toBe(0.0);
        });

        it('should have technical indicators configuration', () => {
            const indicators = TRADING_CONFIG.TECHNICAL_INDICATORS;
            expect(indicators.RSI).toBeDefined();
            expect(indicators.MACD).toBeDefined();
            expect(indicators.BOLLINGER_BANDS).toBeDefined();
            expect(indicators.ADX).toBeDefined();
            expect(indicators.ATR).toBeDefined();
            expect(indicators.FIBONACCI).toBeDefined();

            // Check RSI settings
            expect(indicators.RSI.period).toBe(14);
            expect(indicators.RSI.oversold).toBe(30);
            expect(indicators.RSI.overbought).toBe(70);
        });

        it('should have AI/ML model configuration', () => {
            const models = TRADING_CONFIG.AI_MODELS;
            expect(models.XGBOOST).toBeDefined();
            expect(models.LSTM).toBeDefined();
            expect(models.RANDOM_FOREST).toBeDefined();

            // Check XGBOOST settings
            expect(models.XGBOOST.successThreshold).toBe(0.7);
            expect(models.XGBOOST.rugpullThreshold).toBe(0.3);
            expect(models.XGBOOST.retrainInterval).toBe(24);
        });

        it('should have security configuration', () => {
            const security = TRADING_CONFIG.SECURITY;
            expect(security.CONTRACT_ANALYZER).toBeDefined();
            expect(security.RUGCHECK).toBeDefined();

            expect(security.CONTRACT_ANALYZER.minSecurityScore).toBe(85);
            expect(security.RUGCHECK.minLockedLiquidity).toBe(80);
            expect(security.RUGCHECK.maxTaxBuy).toBe(10);
            expect(security.RUGCHECK.maxTaxSell).toBe(10);
        });

        it('should have Jupiter integration settings', () => {
            const jupiter = TRADING_CONFIG.JUPITER;
            expect(jupiter.maxSlippage).toBe(0.003);
            expect(jupiter.minSlippage).toBe(0.001);
            expect(jupiter.mevProtection).toBe(true);
            expect(jupiter.bestPriceDiscovery).toBe(true);
        });

        it('should have network configuration', () => {
            const networks = TRADING_CONFIG.NETWORKS;
            expect(networks.SOLANA).toBeDefined();
            expect(networks.SOLANA.chainId).toBe(101);
            expect(networks.SOLANA.stableTokens.USDC).toBeDefined();
            expect(networks.SOLANA.stableTokens.USDT).toBeDefined();
        });
    });

    describe('TRADING_STRATEGIES', () => {
        it('should have all required strategies', () => {
            expect(TRADING_STRATEGIES.QUANTUM_MEMECOIN).toBeDefined();
            expect(TRADING_STRATEGIES.ADVANCED_SOLANA).toBeDefined();
            expect(TRADING_STRATEGIES.ENHANCED_STRATEGY).toBeDefined();
            expect(TRADING_STRATEGIES.MOMENTUM).toBeDefined();
            expect(TRADING_STRATEGIES.WHALE_WATCH).toBeDefined();
        });

        it('should have valid quantum memecoin strategy', () => {
            const strategy = TRADING_STRATEGIES.QUANTUM_MEMECOIN;
            expect(strategy.name).toBe('Quantum Memecoin Strategy');
            expect(strategy.type).toBe('quantum_analysis');
            expect(strategy.minConfidence).toBe(0.7);
            expect(strategy.maxPositionSize).toBe(5);
            expect(strategy.takeProfit).toBe(200);
            expect(strategy.stopLoss).toBe(20);
            expect(strategy.features).toContain('quantum_engine');
            expect(strategy.features).toContain('social_sentiment');
        });

        it('should have valid advanced solana strategy', () => {
            const strategy = TRADING_STRATEGIES.ADVANCED_SOLANA;
            expect(strategy.name).toBe('Advanced Solana Strategy');
            expect(strategy.type).toBe('ml_enhanced');
            expect(strategy.components).toContain('advanced_meme_predictor');
            expect(strategy.features).toContain('viral_pattern_detection');
            expect(strategy.features).toContain('whale_accumulation_analysis');
        });

        it('should have valid momentum strategy', () => {
            const strategy = TRADING_STRATEGIES.MOMENTUM;
            expect(strategy.name).toBe('Momentum Strategy');
            expect(strategy.type).toBe('technical_momentum');
            expect(strategy.period).toBe(14);
            expect(strategy.buyThreshold).toBe(0.05);
            expect(strategy.sellThreshold).toBe(0.03);
            expect(strategy.confidenceScoring).toBe(true);
        });
    });

    describe('TRADING_OPTIONS', () => {
        it('should have all trading options', () => {
            expect(TRADING_OPTIONS.OPTION_A).toBeDefined();
            expect(TRADING_OPTIONS.OPTION_B).toBeDefined();
            expect(TRADING_OPTIONS.OPTION_C).toBeDefined();
            expect(TRADING_OPTIONS.OPTION_D).toBeDefined();
        });

        it('should have valid option A (DEV_SELL)', () => {
            const option = TRADING_OPTIONS.OPTION_A;
            expect(option.name).toBe('DEV_SELL');
            expect(option.negativeSentimentThreshold).toBe(0.3);
            expect(option.profitTargets.low).toBeDefined();
            expect(option.profitTargets.medium).toBeDefined();
            expect(option.profitTargets.high).toBeDefined();
        });

        it('should have escalating thresholds', () => {
            expect(TRADING_OPTIONS.OPTION_A.negativeSentimentThreshold).toBeLessThan(
                TRADING_OPTIONS.OPTION_B.negativeSentimentThreshold
            );
            expect(TRADING_OPTIONS.OPTION_B.negativeSentimentThreshold).toBeLessThan(
                TRADING_OPTIONS.OPTION_C.negativeSentimentThreshold
            );
            expect(TRADING_OPTIONS.OPTION_C.negativeSentimentThreshold).toBeLessThan(
                TRADING_OPTIONS.OPTION_D.negativeSentimentThreshold
            );
        });
    });

    describe('DATA_SOURCES', () => {
        it('should have all required data sources', () => {
            expect(DATA_SOURCES.DEXSCREENER).toBeDefined();
            expect(DATA_SOURCES.GMGN).toBeDefined();
            expect(DATA_SOURCES.KOLSCAN).toBeDefined();
            expect(DATA_SOURCES.HELIUS).toBeDefined();
            expect(DATA_SOURCES.RAYDIUM).toBeDefined();
            expect(DATA_SOURCES.ORCA).toBeDefined();
        });

        it('should have valid rate limits', () => {
            Object.values(DATA_SOURCES).forEach(source => {
                expect(source.baseUrl).toBeDefined();
                expect(source.rateLimit).toBeGreaterThan(0);
                expect(typeof source.rateLimit).toBe('number');
            });
        });

        it('should have proper base URLs', () => {
            expect(DATA_SOURCES.DEXSCREENER.baseUrl).toBe('https://api.dexscreener.com/latest/dex');
            expect(DATA_SOURCES.GMGN.baseUrl).toBe('https://gmgn.ai/api');
            expect(DATA_SOURCES.KOLSCAN.baseUrl).toBe('https://api.kolscan.io');
        });
    });

    describe('Configuration Validation', () => {
        it('should have consistent risk settings', () => {
            const risk = TRADING_CONFIG.RISK_MANAGEMENT;
            expect(Math.abs(risk.DEFAULT_STOP_LOSS)).toBeGreaterThan(0);
            expect(risk.TAKE_PROFIT_FIRST).toBeGreaterThan(0);
            expect(risk.TAKE_PROFIT_SECOND).toBeGreaterThan(risk.TAKE_PROFIT_FIRST);
            expect(risk.MAX_POSITION_SIZE_PERCENT).toBeGreaterThan(0);
            expect(risk.MAX_POSITION_SIZE_PERCENT).toBeLessThanOrEqual(100);
        });

        it('should have valid slippage settings', () => {
            const blocks = TRADING_CONFIG.CAPITALIZATION_BLOCKS;
            Object.values(blocks).forEach(block => {
                expect(block.slippage).toBeGreaterThanOrEqual(0);
                expect(block.slippage).toBeLessThanOrEqual(1);
            });
        });

        it('should have proper market cap ranges', () => {
            const blocks = TRADING_CONFIG.CAPITALIZATION_BLOCKS;
            expect(blocks.MICRO.min).toBe(0);
            expect(blocks.SMALL.min).toBe(blocks.MICRO.max);
            expect(blocks.MEDIUM.min).toBe(blocks.SMALL.max);
            expect(blocks.LARGE.min).toBe(blocks.MEDIUM.max);
        });
    });
});
