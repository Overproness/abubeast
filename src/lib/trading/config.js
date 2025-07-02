/**
 * ABUBOT - AI Trading Bot Configuration
 * Complete Strategy Implementation for Solana Memecoin Trading
 */

// Core Trading Configuration
export const TRADING_CONFIG = {
    // System Configuration
    VERSION: "2.0.0",
    SYSTEM_NAME: "ABUBOT",

    // Risk Management
    RISK_MANAGEMENT: {
        DEFAULT_STOP_LOSS: -15, // 15% stop loss
        TAKE_PROFIT_FIRST: 20, // 20% first take profit
        TAKE_PROFIT_SECOND: 50, // 50% second take profit
        MAX_POSITION_SIZE_PERCENT: 5, // 5% of available funds max
        TRAILING_STOP_ACTIVATION: 15, // Activate trailing stop after 15% profit
        TRAILING_STOP_DISTANCE: 10, // 10% trailing distance
        MAX_DRAWDOWN: 20, // 20% maximum drawdown
        POSITION_LIMIT: 10, // 10% max per position
    },

    // Capitalization Blocks
    CAPITALIZATION_BLOCKS: {
        MICRO: {
            min: 0,
            max: 15000, // $15k
            maxAmount: 100, // 100 SOL
            slippage: 0.0,
            description: "Early discovery, high risk/reward"
        },
        SMALL: {
            min: 15000,
            max: 20000, // $20k
            maxAmount: 300, // 300 SOL
            slippage: 0.002,
            description: "Momentum building, viral potential"
        },
        MEDIUM: {
            min: 20000,
            max: 5000000, // $5M
            maxAmount: 800, // 800 SOL
            slippage: 0.001,
            description: "Established growth, stability"
        },
        LARGE: {
            min: 5000000,
            max: 10000000, // $10M
            maxAmount: 10000, // 10,000 SOL
            slippage: 0.0005,
            description: "Market leadership, lower risk"
        }
    },

    // Technical Indicators Configuration
    TECHNICAL_INDICATORS: {
        RSI: {
            period: 14,
            oversold: 30,
            overbought: 70
        },
        MACD: {
            fast: 12,
            slow: 26,
            signal: 9
        },
        BOLLINGER_BANDS: {
            period: 20,
            stdDev: 2
        },
        ADX: {
            period: 14,
            trendStrength: 25
        },
        ATR: {
            period: 14
        },
        FIBONACCI: {
            levels: [0.236, 0.382, 0.5, 0.618, 0.786]
        }
    },

    // AI/ML Model Configuration
    AI_MODELS: {
        XGBOOST: {
            successThreshold: 0.7,
            rugpullThreshold: 0.3,
            retrainInterval: 24 // hours
        },
        LSTM: {
            baseModel: {
                layers: [128, 64, 32],
                dropout: 0.3,
                denseNodes: [16, 1]
            },
            viralModel: {
                layers: [64, 32, 16],
                dropout: 0.2,
                denseNodes: [32, 1]
            }
        },
        RANDOM_FOREST: {
            trees: 100,
            maxDepth: 10,
            minSamplesSplit: 2
        }
    },

    // Social Sentiment Configuration
    SOCIAL_SENTIMENT: {
        TWITTER: {
            minMentionsBuy: 50,
            minMentionsHold: 30,
            minSentimentBuy: 0.5,
            minSentimentHold: 0.3
        },
        WHALE_SENTIMENT: {
            concentrationRiskThreshold: 0.3,
            whaleMovementThreshold: 100000
        }
    },

    // Security Analysis Configuration
    SECURITY: {
        CONTRACT_ANALYZER: {
            minSecurityScore: 85,
            vulnerabilityChecks: true,
            ownershipAnalysis: true,
            liquidityLockVerification: true
        },
        RUGCHECK: {
            minLockedLiquidity: 80, // 80%
            maxTaxBuy: 10, // 10%
            maxTaxSell: 10, // 10%
            honeypotDetection: true
        }
    },

    // Jupiter Integration
    JUPITER: {
        maxSlippage: 0.003, // 0.3%
        minSlippage: 0.001, // 0.1%
        mevProtection: true,
        bestPriceDiscovery: true
    },

    // Network Configuration
    NETWORKS: {
        SOLANA: {
            chainId: 101,
            rpcUrl: process.env.SOLANA_RPC_URL,
            stableTokens: {
                USDC: {
                    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                    decimals: 6
                },
                USDT: {
                    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                    decimals: 6
                }
            }
        }
    }
};

// Trading Strategies Configuration
export const TRADING_STRATEGIES = {
    // Core Strategies
    QUANTUM_MEMECOIN: {
        name: "Quantum Memecoin Strategy",
        type: "quantum_analysis",
        minConfidence: 0.7,
        maxPositionSize: 5, // SOL
        takeProfit: 200, // 200%
        stopLoss: 20, // 20%
        features: [
            "quantum_engine",
            "social_sentiment",
            "contract_security",
            "combined_scoring",
            "dynamic_position_sizing",
            "adaptive_slippage"
        ]
    },

    ADVANCED_SOLANA: {
        name: "Advanced Solana Strategy",
        type: "ml_enhanced",
        components: [
            "advanced_meme_predictor",
            "meme_market_analyzer",
            "risk_manager",
            "position_manager"
        ],
        features: [
            "viral_pattern_detection",
            "whale_accumulation_analysis",
            "community_growth_metrics",
            "market_regime_detection",
            "ml_price_prediction"
        ]
    },

    ENHANCED_STRATEGY: {
        name: "Enhanced Strategy",
        type: "market_microstructure",
        components: [
            "market_impact_analyzer",
            "liquidity_analyzer",
            "ml_predictor"
        ],
        features: [
            "market_impact_estimation",
            "liquidity_condition_analysis",
            "lstm_predictions",
            "market_regime_detection"
        ]
    },

    MOMENTUM: {
        name: "Momentum Strategy",
        type: "technical_momentum",
        period: 14,
        buyThreshold: 0.05, // 5%
        sellThreshold: 0.03, // 3%
        confidenceScoring: true
    },

    WHALE_WATCH: {
        name: "Whale Watch Strategy",
        type: "whale_monitoring",
        whaleThreshold: 100000, // tokens
        buyVsSellRatio: true,
        confidenceBasedOnVolume: true
    }
};

// Trading Options Based on Token Analysis
export const TRADING_OPTIONS = {
    OPTION_A: {
        name: "DEV_SELL",
        negativeSentimentThreshold: 0.3,
        profitTargets: {
            low: { min: 10, max: 20 },
            medium: { min: 20, max: 30 },
            high: { min: 30, max: 40 }
        }
    },
    OPTION_B: {
        name: "DEV_REBUY",
        negativeSentimentThreshold: 0.4,
        profitTargets: {
            low: { min: 15, max: 25 },
            medium: { min: 25, max: 35 },
            high: { min: 35, max: 45 }
        }
    },
    OPTION_C: {
        name: "NO_SELL",
        negativeSentimentThreshold: 0.5,
        profitTargets: {
            low: { min: 20, max: 30 },
            medium: { min: 30, max: 40 },
            high: { min: 40, max: 50 }
        }
    },
    OPTION_D: {
        name: "DEV_BURN",
        negativeSentimentThreshold: 0.6,
        profitTargets: {
            low: { min: 25, max: 35 },
            medium: { min: 35, max: 45 },
            high: { min: 45, max: 55 }
        }
    }
};

// Data Sources Configuration
export const DATA_SOURCES = {
    DEXSCREENER: {
        baseUrl: "https://api.dexscreener.com/latest/dex",
        rateLimit: 300 // requests per minute
    },
    GMGN: {
        baseUrl: "https://gmgn.ai/api",
        rateLimit: 60
    },
    KOLSCAN: {
        baseUrl: "https://api.kolscan.io",
        rateLimit: 100
    },
    HELIUS: {
        baseUrl: "https://api.helius.xyz",
        rateLimit: 100
    },
    RAYDIUM: {
        baseUrl: "https://api.raydium.io",
        rateLimit: 60
    },
    ORCA: {
        baseUrl: "https://api.orca.so",
        rateLimit: 60
    }
};

// Performance Metrics
export const PERFORMANCE_METRICS = {
    WIN_RATE_TARGET: 0.65, // 65%
    SHARPE_RATIO_TARGET: 1.5,
    MAX_DRAWDOWN_LIMIT: 0.2, // 20%
    PROFIT_FACTOR_TARGET: 2.0,
    CALMAR_RATIO_TARGET: 1.0
};

// Alert Configuration
export const ALERTS = {
    PRICE_ALERTS: {
        enabled: true,
        thresholds: [0.05, 0.1, 0.2] // 5%, 10%, 20%
    },
    POSITION_ALERTS: {
        enabled: true,
        stopLossTriggered: true,
        takeProfitTriggered: true,
        positionSizeExceeded: true
    },
    RISK_ALERTS: {
        enabled: true,
        drawdownExceeded: true,
        correlationRisk: true,
        liquidityRisk: true
    },
    SYSTEM_ALERTS: {
        enabled: true,
        errorThreshold: 5, // per hour
        performanceThreshold: 90 // seconds
    }
};

export default TRADING_CONFIG;
