/**
 * ABUBOT Trading Engine - Main orchestration engine
 * Coordinates all strategies, AI models, and risk management
 */

import { TRADING_CONFIG } from './config.js';
import StrategyManager from './strategies/strategyManager.js';
import { RiskManager } from '../risk/riskManager.js';
import { executeTrade } from '../services/tradingService.js';
import dbConnect from '../db/mongodb.js';
import Token from '../../models/Token.js';
import TradingPermission from '../../models/TradingPermission.js';
import TradeLog from '../../models/TradeLog.js';

export class ABUBOTTradingEngine {
    constructor() {
        this.strategyManager = new StrategyManager();
        this.riskManager = new RiskManager();
        this.isInitialized = false;
        this.isRunning = false;
        this.performanceMetrics = {
            totalTrades: 0,
            successfulTrades: 0,
            totalReturn: 0,
            winRate: 0,
            activePositions: 0
        };
        this.analysisHistory = [];
    }

    /**
     * Initialize the trading engine
     */
    async initialize() {
        try {
            console.log('[ABUBOT] Initializing trading engine...');

            // Initialize strategy manager
            await this.strategyManager.initialize();

            // Connect to database
            await dbConnect();

            this.isInitialized = true;
            console.log('[ABUBOT] Trading engine initialized successfully');

        } catch (error) {
            console.error('[ABUBOT] Initialization error:', error);
            throw error;
        }
    }

    /**
     * Start the trading engine
     */
    async start() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            this.isRunning = true;
            console.log('[ABUBOT] Trading engine started');

            // Start main trading loop
            this.startTradingLoop();

        } catch (error) {
            console.error('[ABUBOT] Start error:', error);
            throw error;
        }
    }

    /**
     * Stop the trading engine
     */
    async stop() {
        this.isRunning = false;
        console.log('[ABUBOT] Trading engine stopped');
    }

    /**
     * Main trading loop
     */
    async startTradingLoop() {
        while (this.isRunning) {
            try {
                await this.processTradingCycle();

                // Wait for next cycle (every 30 seconds)
                await this.sleep(30000);

            } catch (error) {
                console.error('[ABUBOT] Trading cycle error:', error);

                // Wait longer on error to avoid spam
                await this.sleep(60000);
            }
        }
    }

    /**
     * Process one complete trading cycle
     */
    async processTradingCycle() {
        try {
            console.log('[ABUBOT] Starting trading cycle...');

            // 1. Get new unanalyzed tokens
            const newTokens = await this.getNewTokens();

            if (newTokens.length === 0) {
                console.log('[ABUBOT] No new tokens to analyze');
                return;
            }

            console.log(`[ABUBOT] Found ${newTokens.length} new tokens to analyze`);

            // 2. Get active trading permissions
            const activePermissions = await this.getActiveTradingPermissions();

            if (activePermissions.length === 0) {
                console.log('[ABUBOT] No active trading permissions');
                return;
            }

            console.log(`[ABUBOT] Found ${activePermissions.length} active trading permissions`);

            // 3. Analyze each token and execute trades
            for (const token of newTokens) {
                try {
                    await this.processTokenForTrading(token, activePermissions);
                } catch (error) {
                    console.error(`[ABUBOT] Error processing token ${token.mint_address}:`, error);
                }
            }

            // 4. Mark tokens as analyzed
            await this.markTokensAsAnalyzed(newTokens);

            console.log('[ABUBOT] Trading cycle completed');

        } catch (error) {
            console.error('[ABUBOT] Trading cycle error:', error);
        }
    }

    /**
     * Process a single token for trading across all permissions
     */
    async processTokenForTrading(token, permissions) {
        try {
            console.log(`[ABUBOT] Analyzing token: ${token.symbol || token.mint_address}`);

            // 1. Comprehensive token analysis using all strategies
            const analysis = await this.strategyManager.analyzeToken(token);

            // Store analysis in history
            this.analysisHistory.push({
                token: token.mint_address,
                analysis: analysis,
                timestamp: Date.now()
            });

            // Keep only last 1000 analyses
            if (this.analysisHistory.length > 1000) {
                this.analysisHistory.shift();
            }

            // 2. Check if token passes initial filters
            if (!this.passesInitialFilters(analysis)) {
                console.log(`[ABUBOT] Token ${token.symbol} failed initial filters`);
                return;
            }

            console.log(`[ABUBOT] Token ${token.symbol} passed analysis - checking permissions`);

            // 3. Process each trading permission
            for (const permission of permissions) {
                try {
                    await this.processPermissionForToken(token, analysis, permission);
                } catch (error) {
                    console.error(`[ABUBOT] Error processing permission ${permission._id}:`, error);
                }
            }

        } catch (error) {
            console.error(`[ABUBOT] Error analyzing token ${token.mint_address}:`, error);
        }
    }

    /**
     * Process a specific permission for a token
     */
    async processPermissionForToken(token, analysis, permission) {
        try {
            const userId = permission.userId;
            const walletAddress = permission.walletAddress;

            // 1. Get user's trading settings
            const userSettings = await this.getUserTradingSettings(userId, walletAddress);

            // 2. Check if user wants to trade this type of token
            if (!this.isTokenEligibleForUser(token, analysis, userSettings)) {
                return;
            }

            // 3. Check if already traded this token
            const alreadyTraded = await this.hasAlreadyTraded(userId, walletAddress, token.mint_address);
            if (alreadyTraded) {
                return;
            }

            // 4. Check daily limits
            const dailyLimitOk = await this.checkDailyLimits(userId, walletAddress, userSettings);
            if (!dailyLimitOk) {
                return;
            }

            // 5. Generate final recommendation with user settings
            const recommendation = await this.strategyManager.generateFinalRecommendation(
                analysis,
                userSettings
            );

            // 6. Execute trade if recommended
            if (recommendation.action === 'BUY' || recommendation.action === 'BUY_SMALL') {
                await this.executeTradingRecommendation(
                    token,
                    recommendation,
                    permission,
                    userSettings
                );
            }

        } catch (error) {
            console.error(`[ABUBOT] Error processing permission for token:`, error);
        }
    }

    /**
     * Execute a trading recommendation
     */
    async executeTradingRecommendation(token, recommendation, permission, userSettings) {
        try {
            const userId = permission.userId;
            const walletAddress = permission.walletAddress;

            // 1. Calculate position size
            const positionSize = this.calculatePositionSize(
                recommendation,
                userSettings,
                token
            );

            if (positionSize <= 0) {
                console.log(`[ABUBOT] Position size too small for ${token.symbol}`);
                return;
            }

            // 2. Determine trade network and parameters
            const tradeParams = this.buildTradeParameters(token, positionSize, recommendation);

            // 3. Execute the trade
            console.log(`[ABUBOT] Executing trade for user ${userId}: ${positionSize} SOL on ${token.symbol}`);

            const tradeResult = await executeTrade(userId, tradeParams, {
                address: walletAddress,
                networkType: 'solana' // or determine from token
            });

            // 4. Create risk management orders (stop loss, take profit)
            if (tradeResult.success) {
                await this.createRiskManagementOrders(
                    userId,
                    walletAddress,
                    token,
                    tradeResult,
                    recommendation,
                    userSettings
                );

                // Update performance metrics
                this.updatePerformanceMetrics(tradeResult);

                console.log(`[ABUBOT] Successfully executed trade for ${token.symbol}`);
            }

        } catch (error) {
            console.error(`[ABUBOT] Trade execution error:`, error);

            // Log failed trade
            await this.logFailedTrade(token, recommendation, permission, error.message);
        }
    }

    /**
     * Calculate position size based on recommendation and user settings
     */
    calculatePositionSize(recommendation, userSettings, token) {
        let baseSize = userSettings.maxInvestmentPerToken || 100; // Default $100

        // Apply recommendation position multiplier
        if (recommendation.positionMultiplier) {
            baseSize *= recommendation.positionMultiplier;
        }

        // Apply strategy-specific sizing
        if (recommendation.details?.positionSize) {
            baseSize = Math.min(baseSize, recommendation.details.positionSize.solAmount * 50); // Convert SOL to USD estimate
        }

        // Apply risk-based sizing
        if (recommendation.confidence) {
            baseSize *= recommendation.confidence;
        }

        // Apply market cap based sizing
        const marketCap = token.marketData?.market_cap || 0;
        const capBlock = this.getCapitalizationBlock(marketCap);
        const maxForCap = TRADING_CONFIG.CAPITALIZATION_BLOCKS[capBlock].maxAmount;

        baseSize = Math.min(baseSize, maxForCap);

        return Math.max(10, baseSize); // Minimum $10
    }

    /**
     * Build trade parameters for execution
     */
    buildTradeParameters(token, positionSizeUSD, recommendation) {
        const chainId = 101; // Solana mainnet
        const stableToken = TRADING_CONFIG.NETWORKS.SOLANA.stableTokens.USDC;

        return {
            fromChainId: chainId,
            toChainId: chainId,
            fromTokenAddress: stableToken.address,
            toTokenAddress: token.mint_address,
            amount: this.convertUSDToTokenAmount(positionSizeUSD, stableToken.decimals),
            amountUSD: positionSizeUSD,
            slippage: recommendation.slippage || 0.005,
            strategy: recommendation.strategy || 'abubot_auto'
        };
    }

    /**
     * Create risk management orders (stop loss, take profit)
     */
    async createRiskManagementOrders(userId, walletAddress, token, tradeResult, recommendation, userSettings) {
        try {
            // Create stop loss order
            const stopLoss = recommendation.stopLoss || userSettings.stopLossPercentage || -15;
            await this.createStopLossOrder(
                userId,
                walletAddress,
                token,
                tradeResult,
                stopLoss
            );

            // Create take profit orders
            const takeProfits = recommendation.takeProfit || [
                userSettings.takeProfitPercentage || 25,
                (userSettings.takeProfitPercentage || 25) * 2
            ];

            for (let i = 0; i < takeProfits.length; i++) {
                await this.createTakeProfitOrder(
                    userId,
                    walletAddress,
                    token,
                    tradeResult,
                    takeProfits[i],
                    i === 0 ? 50 : 50 // Sell 50% at each level
                );
            }

        } catch (error) {
            console.error('[ABUBOT] Error creating risk management orders:', error);
        }
    }

    /**
     * Check if token passes initial filters
     */
    passesInitialFilters(analysis) {
        const recommendation = analysis.recommendation;

        // Must have a valid recommendation
        if (!recommendation || !recommendation.action) {
            return false;
        }

        // Must be a buy recommendation
        if (recommendation.action !== 'BUY' && recommendation.action !== 'BUY_SMALL') {
            return false;
        }

        // Must have minimum confidence
        if (recommendation.confidence < 0.3) {
            return false;
        }

        // Must have security score if available
        if (analysis.strategyResults?.quantum_memecoin?.signals?.security?.score < 50) {
            return false;
        }

        return true;
    }

    /**
     * Check if token is eligible for user's settings
     */
    isTokenEligibleForUser(token, analysis, userSettings) {
        const strategy = userSettings.tradingStrategy || 'moderate';
        const marketCap = token.marketData?.market_cap || 0;

        // Conservative users avoid very small caps
        if (strategy === 'conservative' && marketCap < 500000) {
            return false;
        }

        // Check user's allowed token types
        if (userSettings.allowedTokens === 'verified' && !token.verified) {
            return false;
        }

        // Check minimum confidence for user strategy
        const minConfidence = strategy === 'conservative' ? 0.7 :
            strategy === 'moderate' ? 0.5 : 0.3;

        if (analysis.recommendation.confidence < minConfidence) {
            return false;
        }

        return true;
    }

    // Helper methods

    async getNewTokens() {
        return await Token.find({ analyzed: { $ne: true } })
            .sort({ added_at: -1 })
            .limit(50)
            .lean();
    }

    async getActiveTradingPermissions() {
        return await TradingPermission.find({ active: true }).lean();
    }

    async markTokensAsAnalyzed(tokens) {
        const tokenIds = tokens.map(token => token._id);
        await Token.updateMany(
            { _id: { $in: tokenIds } },
            { analyzed: true, analyzed_at: new Date() }
        );
    }

    async getUserTradingSettings(userId, walletAddress) {
        // Fetch from API or database
        return {
            tradingStrategy: 'moderate',
            maxInvestmentPerToken: 100,
            maxDailyInvestment: 500,
            stopLossPercentage: 15,
            takeProfitPercentage: 25,
            allowedTokens: 'all'
        };
    }

    async hasAlreadyTraded(userId, walletAddress, tokenAddress) {
        const existing = await TradeLog.findOne({
            userId,
            walletAddress: walletAddress.toLowerCase(),
            toToken: tokenAddress,
            automated: true
        });
        return !!existing;
    }

    async checkDailyLimits(userId, walletAddress, userSettings) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const todaysTrades = await TradeLog.find({
            userId,
            walletAddress: walletAddress.toLowerCase(),
            timestamp: { $gte: oneDayAgo },
            automated: true
        });

        const dailySpent = todaysTrades.reduce((sum, trade) => {
            return sum + (trade.amountUSD || 0);
        }, 0);

        return dailySpent < (userSettings.maxDailyInvestment || 500);
    }

    getCapitalizationBlock(marketCap) {
        const blocks = TRADING_CONFIG.CAPITALIZATION_BLOCKS;

        if (marketCap <= blocks.MICRO.max) return 'MICRO';
        if (marketCap <= blocks.SMALL.max) return 'SMALL';
        if (marketCap <= blocks.MEDIUM.max) return 'MEDIUM';
        return 'LARGE';
    }

    convertUSDToTokenAmount(usdAmount, decimals) {
        // Simple conversion - in reality would get current USDC price
        return (usdAmount * Math.pow(10, decimals)).toString();
    }

    updatePerformanceMetrics(tradeResult) {
        this.performanceMetrics.totalTrades++;
        if (tradeResult.success) {
            this.performanceMetrics.successfulTrades++;
        }
        this.performanceMetrics.winRate = this.performanceMetrics.successfulTrades / this.performanceMetrics.totalTrades;
    }

    async createStopLossOrder(userId, walletAddress, token, tradeResult, stopLossPercent) {
        // Implementation for creating stop loss orders
        console.log(`[ABUBOT] Creating stop loss order: ${stopLossPercent}%`);
    }

    async createTakeProfitOrder(userId, walletAddress, token, tradeResult, takeProfitPercent, sellPercentage) {
        // Implementation for creating take profit orders
        console.log(`[ABUBOT] Creating take profit order: ${takeProfitPercent}%`);
    }

    async logFailedTrade(token, recommendation, permission, error) {
        console.error(`[ABUBOT] Failed trade log: ${token.symbol} - ${error}`);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get trading engine status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            performanceMetrics: this.performanceMetrics,
            activeStrategies: this.strategyManager.getActiveStrategies(),
            lastAnalysisCount: this.analysisHistory.length
        };
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        return {
            engine: this.performanceMetrics,
            strategies: this.strategyManager.getPerformanceSummary(),
            recentAnalyses: this.analysisHistory.slice(-10)
        };
    }
}

export default ABUBOTTradingEngine;
