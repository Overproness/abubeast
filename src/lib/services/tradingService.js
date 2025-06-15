import { LiFi } from "@lifi/sdk";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import bs58 from "bs58"; // For Solana keypair decoding
import { ethers } from "ethers";

/**
 * Service to handle automated trading operations
 */

// Initialize LiFi instance
const lifi = new LiFi({
  integrator: "AbuBeast",
});

// Common ERC20 ABI for approvals
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

/**
 * Execute a trade for a user based on their permissions and settings
 *
 * @param {string} userId - The user ID
 * @param {Object} tradeInfo - Trade details
 * @param {Object} wallet - Wallet connection details
 */
export async function executeTrade(userId, tradeInfo, wallet) {
  try {
    // First, validate that we have permission to trade
    const permission = await getAndValidateTradingPermission(
      userId,
      wallet.address
    );

    if (!permission || !permission.active) {
      throw new Error("No active trading permission for this wallet");
    }

    // Get user's trading settings
    const settings = await getUserTradingSettings(userId, wallet.address);

    // Check if trade is within the user's limits
    if (!isTradeWithinLimits(tradeInfo, settings)) {
      throw new Error("Trade exceeds user's configured limits");
    }

    // Check if we're approaching daily limits
    await checkAndRecordDailyUsage(userId, wallet.address, tradeInfo.amountUSD);

    // Execute the trade based on wallet type
    if (wallet.networkType === "ethereum" || wallet.networkType === "evm") {
      return await executeEVMTrade(tradeInfo, wallet, settings, permission);
    } else if (wallet.networkType === "solana") {
      return await executeSolanaTrade(tradeInfo, wallet, settings, permission);
    } else {
      throw new Error(`Unsupported network type: ${wallet.networkType}`);
    }
  } catch (error) {
    console.error("Trade execution error:", error);

    // Log the failed trade attempt
    await logTradeError(userId, wallet.address, tradeInfo, error.message);

    throw error;
  }
}

/**
 * Get and validate that we have trading permission for this wallet
 */
async function getAndValidateTradingPermission(userId, walletAddress) {
  try {
    const response = await fetch(
      `/api/internal/trading-permissions?userId=${userId}&wallet=${walletAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.INTERNAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.permission || !data.hasPermission) {
      return null;
    }

    return data.permission;
  } catch (error) {
    console.error("Error validating trading permission:", error);
    return null;
  }
}

/**
 * Track daily trading usage to enforce limits
 */
async function checkAndRecordDailyUsage(userId, walletAddress, amountUSD) {
  try {
    const response = await fetch("/api/internal/trade-limits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        userId,
        walletAddress,
        amountUSD,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.error === "DAILY_LIMIT_EXCEEDED") {
        throw new Error("Daily trading limit exceeded");
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking daily limits:", error);
    throw error;
  }
}

/**
 * Get user's trading settings
 */
async function getUserTradingSettings(userId, walletAddress) {
  // Implementation to fetch user's trading settings from the database

  // Example implementation:
  const response = await fetch(
    `/api/internal/trading-settings?userId=${userId}&wallet=${walletAddress}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.INTERNAL_API_KEY, // For secure internal API calls
      },
    }
  );

  if (!response.ok) {
    return {
      strategy: "moderate",
      maxInvestmentPerToken: 100,
      maxDailyInvestment: 500,
      stopLossPercentage: 15,
      takeProfitPercentage: 25,
      allowedTokens: "verified",
    };
  }

  const data = await response.json();
  return data.settings;
}

/**
 * Check if a trade is within the user's configured limits
 */
function isTradeWithinLimits(tradeInfo, settings) {
  // Check if token amount is within max investment per token
  if (tradeInfo.amountUSD > settings.maxInvestmentPerToken) {
    return false;
  }

  // Check if daily spent amount is below max daily investment
  // This requires tracking daily spending somewhere
  // Simplified check for example purposes
  if (
    tradeInfo.dailyTotalUSD &&
    tradeInfo.dailyTotalUSD > settings.maxDailyInvestment
  ) {
    return false;
  }

  return true;
}

/**
 * Execute a trade on an EVM compatible chain
 */
async function executeEVMTrade(tradeInfo, wallet, settings, permission) {
  try {
    // Create the route request
    const routeRequest = {
      fromChainId: tradeInfo.fromChainId,
      toChainId: tradeInfo.toChainId,
      fromTokenAddress: tradeInfo.fromTokenAddress,
      toTokenAddress: tradeInfo.toTokenAddress,
      fromAddress: wallet.address,
      fromAmount: tradeInfo.amount,
      slippage: settings.slippageTolerance || 0.5,
    };

    // Get the best route
    const routeResponse = await lifi.getRoutes(routeRequest);

    if (!routeResponse.routes || routeResponse.routes.length === 0) {
      throw new Error("No routes found for this trade");
    }

    const bestRoute = routeResponse.routes[0];

    // Prepare transaction
    const transactionRequest = await lifi.getStepTransaction(
      bestRoute.steps[0]
    );

    // Load backend signer key from environment or secure storage
    const provider = new ethers.JsonRpcProvider(
      process.env.JSON_RPC_PROVIDER_URL
    );
    const backendSigner = new ethers.Wallet(
      process.env.BACKEND_PRIVATE_KEY,
      provider
    );

    // Check if we need to handle token approvals first
    if (tradeInfo.fromTokenAddress !== ethers.ZeroAddress) {
      // Not native token (ETH, BNB, etc)
      await ensureTokenApproval(
        tradeInfo.fromChainId,
        tradeInfo.fromTokenAddress,
        wallet.address,
        transactionRequest.transactionRequest.to,
        tradeInfo.amount,
        permission
      );
    }

    // Execute the transaction
    const tx = await backendSigner.sendTransaction(
      transactionRequest.transactionRequest
    );
    await tx.wait();

    // Log the transaction
    await logTradeTransaction(wallet.address, {
      txHash: tx.hash,
      fromToken: tradeInfo.fromTokenAddress,
      toToken: tradeInfo.toTokenAddress,
      fromAmount: tradeInfo.amount,
      expectedToAmount: bestRoute.toAmount,
      status: "completed",
      chainId: tradeInfo.fromChainId,
      gasUsed: tx.gasUsed?.toString(),
      gasCostUSD: bestRoute.gasCostUSD || null,
    });

    return {
      success: true,
      txHash: tx.hash,
      fromAmount: tradeInfo.amount,
      toAmount: bestRoute.toAmount,
      route: bestRoute,
    };
  } catch (error) {
    console.error("EVM trade execution error:", error);
    throw error;
  }
}

/**
 * Check and handle token approvals for ERC20 tokens
 */
async function ensureTokenApproval(
  chainId,
  tokenAddress,
  walletAddress,
  spenderAddress,
  amount,
  permission
) {
  const provider = new ethers.JsonRpcProvider(getChainRpcUrl(chainId));

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  const currentAllowance = await tokenContract.allowance(
    walletAddress,
    spenderAddress
  );

  // Check if allowance is sufficient
  if (currentAllowance >= amount) {
    return true;
  }

  // Need to send approval transaction
  // This requires specific delegation permission from the user in their signature
  if (!permission.allowsApprovals) {
    throw new Error("Trading permission doesn't include token approvals");
  }

  // Create approval transaction
  const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);
  const tokenWithSigner = tokenContract.connect(wallet);

  const maxApproval = ethers.parseUnits("1000000000", 18); // A large amount

  const tx = await tokenWithSigner.approve(spenderAddress, maxApproval, {
    gasLimit: 100000, // Set an appropriate gas limit
  });

  await tx.wait();
  return true;
}

/**
 * Get RPC URL for a specific chain
 */
function getChainRpcUrl(chainId) {
  const chainConfigs = {
    1: process.env.ETHEREUM_RPC_URL,
    56: process.env.BSC_RPC_URL,
    137: process.env.POLYGON_RPC_URL,
    42161: process.env.ARBITRUM_RPC_URL,
    // Add more chains as needed
  };

  return chainConfigs[chainId] || process.env.DEFAULT_RPC_URL;
}

/**
 * Execute a trade on Solana
 */
async function executeSolanaTrade(tradeInfo, wallet, settings, permission) {
  try {
    // Connect to Solana network
    const connection = new Connection(process.env.SOLANA_RPC_URL);

    // Load backend keypair from base58 encoded private key string
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
    const backendKeypair = Keypair.fromSecretKey(secretKey);

    // For a real implementation, integrate with Jupiter aggregator
    // For this example, we'll just create a placeholder transaction
    const transaction = new Transaction();

    // Add relevant instructions (in a real implementation)
    // transaction.add(...jupiterSwapInstructions);

    transaction.feePayer = backendKeypair.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Sign the transaction with our backend keypair
    transaction.sign(backendKeypair);

    // Send the transaction
    const txId = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    // Wait for confirmation (with timeout)
    const confirmationPromise = connection.confirmTransaction(txId);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Transaction confirmation timeout")),
        60000
      )
    );

    await Promise.race([confirmationPromise, timeoutPromise]);

    // Log the transaction
    await logTradeTransaction(wallet.address, {
      txHash: txId,
      fromToken: tradeInfo.fromTokenAddress,
      toToken: tradeInfo.toTokenAddress,
      fromAmount: tradeInfo.amount,
      status: "completed",
      chainId: "solana", // or use a specific solana ID
      automated: true,
    });

    return {
      success: true,
      txHash: txId,
      fromAmount: tradeInfo.amount,
    };
  } catch (error) {
    console.error("Solana trade execution error:", error);
    throw error;
  }
}

/**
 * Log a trade transaction to the database
 */
async function logTradeTransaction(walletAddress, txDetails) {
  try {
    const response = await fetch("/api/internal/trade-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        walletAddress,
        ...txDetails,
        timestamp: new Date().toISOString(),
        automated: true,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error logging trade transaction:", error);
    return false;
  }
}

/**
 * Log a failed trade attempt
 */
async function logTradeError(userId, walletAddress, tradeInfo, errorMessage) {
  try {
    await fetch("/api/internal/trade-errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        userId,
        walletAddress,
        tradeInfo,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Failed to log trade error:", error);
  }
}

/**
 * Create a stop loss or take profit order
 */
export async function createTradeOrder(userId, orderDetails) {
  try {
    // Validate permission
    const permission = await getAndValidateTradingPermission(
      userId,
      orderDetails.walletAddress
    );

    if (!permission || !permission.active) {
      throw new Error("No active trading permission for this wallet");
    }

    // Create the order in the database
    const response = await fetch("/api/internal/trade-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        userId,
        ...orderDetails,
        permissionId: permission._id, // Track which permission created this order
        status: "active",
        created: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create trade order");
    }

    const data = await response.json();
    return data.orderId;
  } catch (error) {
    console.error("Create trade order error:", error);
    throw error;
  }
}
