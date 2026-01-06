import SessionKey from "@/models/SessionKey";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  decryptSecretKey,
  getMasterEncryptionKey,
  keypairFromSecretKey,
} from "../session-keys/sessionKeyUtils";

/**
 * Session Key Trading Service
 * Handles automated trading operations using session keys
 */

/**
 * Get a valid session key for trading
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<SessionKey>} - Valid session key
 */
export async function getValidSessionKey(userId, walletAddress) {
  const sessionKey = await SessionKey.findOne({
    userId,
    walletAddress: walletAddress.toLowerCase(),
    active: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!sessionKey) {
    throw new Error("No valid session key found for this wallet");
  }

  if (!sessionKey.isValid()) {
    throw new Error("Session key is no longer valid");
  }

  return sessionKey;
}

/**
 * Decrypt and get keypair from session key
 * @param {SessionKey} sessionKey - Session key document
 * @returns {Keypair} - Solana keypair
 */
export function getKeypairFromSessionKey(sessionKey) {
  try {
    const masterKey = getMasterEncryptionKey();

    // Decrypt the private key
    const secretKey = decryptSecretKey(
      sessionKey.encryptedPrivateKey,
      sessionKey.iv,
      sessionKey.authTag,
      masterKey
    );

    // Create keypair from secret key
    return keypairFromSecretKey(secretKey);
  } catch (error) {
    console.error("Error decrypting session key:", error);
    throw new Error("Failed to decrypt session key");
  }
}

/**
 * Execute a trade using session key
 * @param {object} params - Trading parameters
 * @returns {Promise<object>} - Transaction result
 */
export async function executeTradeWithSessionKey({
  userId,
  walletAddress,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
  slippage = 1,
}) {
  // Get valid session key
  const sessionKey = await getValidSessionKey(userId, walletAddress);

  // Check permissions
  if (!sessionKey.permissions.canTrade) {
    throw new Error("Session key does not have trading permission");
  }

  // Check spending limits
  if (!sessionKey.canSpend(amountIn)) {
    throw new Error("Transaction exceeds spending limits");
  }

  // Check token restrictions
  if (
    sessionKey.permissions.allowedTokens.length > 0 &&
    !sessionKey.permissions.allowedTokens.includes(tokenIn) &&
    !sessionKey.permissions.allowedTokens.includes(tokenOut)
  ) {
    throw new Error("Trading this token is not permitted");
  }

  // Get keypair from session key
  const keypair = getKeypairFromSessionKey(sessionKey);

  try {
    // Here you would implement your actual trading logic
    // For now, this is a placeholder for the trading execution

    const rpcUrl =
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    // Example: Build and send transaction
    // In production, you would integrate with Jupiter, Raydium, or other DEX aggregators
    console.log("Executing trade with session key:", {
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    });

    // Record usage
    await sessionKey.recordUsage(amountIn, {
      type: "trade",
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    });

    return {
      success: true,
      signature: "placeholder-signature",
      message: "Trade executed successfully",
    };
  } catch (error) {
    console.error("Error executing trade:", error);
    throw new Error(`Trade execution failed: ${error.message}`);
  }
}

/**
 * Execute a token swap using session key
 * @param {object} params - Swap parameters
 * @returns {Promise<object>} - Transaction result
 */
export async function executeSwapWithSessionKey({
  userId,
  walletAddress,
  inputMint,
  outputMint,
  amount,
  slippageBps = 100,
}) {
  // Get valid session key
  const sessionKey = await getValidSessionKey(userId, walletAddress);

  // Check permissions
  if (!sessionKey.permissions.canSwap) {
    throw new Error("Session key does not have swap permission");
  }

  // Check spending limits
  if (!sessionKey.canSpend(amount)) {
    throw new Error("Swap exceeds spending limits");
  }

  // Get keypair from session key
  const keypair = getKeypairFromSessionKey(sessionKey);

  try {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    // Integrate with Jupiter Aggregator or similar
    // This is a placeholder for actual swap logic

    console.log("Executing swap with session key:", {
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });

    // Record usage
    await sessionKey.recordUsage(amount, {
      type: "swap",
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });

    return {
      success: true,
      signature: "placeholder-signature",
      message: "Swap executed successfully",
    };
  } catch (error) {
    console.error("Error executing swap:", error);
    throw new Error(`Swap execution failed: ${error.message}`);
  }
}

/**
 * Transfer SOL or SPL tokens using session key
 * @param {object} params - Transfer parameters
 * @returns {Promise<object>} - Transaction result
 */
export async function executeTransferWithSessionKey({
  userId,
  walletAddress,
  destination,
  amount,
  tokenMint = null, // null for SOL, mint address for SPL tokens
}) {
  // Get valid session key
  const sessionKey = await getValidSessionKey(userId, walletAddress);

  // Check permissions
  if (!sessionKey.permissions.canTransfer) {
    throw new Error("Session key does not have transfer permission");
  }

  // Check spending limits
  if (!sessionKey.canSpend(amount)) {
    throw new Error("Transfer exceeds spending limits");
  }

  // Get keypair from session key
  const keypair = getKeypairFromSessionKey(sessionKey);

  try {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    let signature;

    if (!tokenMint) {
      // Transfer SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(destination),
          lamports: amount * 1e9, // Convert to lamports
        })
      );

      signature = await sendAndConfirmTransaction(connection, transaction, [
        keypair,
      ]);
    } else {
      // Transfer SPL Token
      // This would require @solana/spl-token integration
      throw new Error("SPL token transfers not yet implemented");
    }

    // Record usage
    await sessionKey.recordUsage(amount, {
      type: "transfer",
      destination,
      tokenMint,
      amount,
    });

    return {
      success: true,
      signature,
      message: "Transfer executed successfully",
    };
  } catch (error) {
    console.error("Error executing transfer:", error);
    throw new Error(`Transfer execution failed: ${error.message}`);
  }
}

/**
 * Check if user has a valid session key for automated trading
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<boolean>} - Whether user has valid session key
 */
export async function hasValidSessionKey(userId, walletAddress) {
  try {
    const sessionKey = await getValidSessionKey(userId, walletAddress);
    return sessionKey !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get session key status and limits
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<object>} - Session key status
 */
export async function getSessionKeyStatus(userId, walletAddress) {
  try {
    const sessionKey = await getValidSessionKey(userId, walletAddress);

    return {
      hasSessionKey: true,
      isValid: sessionKey.isValid(),
      expiresAt: sessionKey.expiresAt,
      permissions: sessionKey.permissions,
      usageStats: sessionKey.usageStats,
      remainingDailyLimit:
        sessionKey.permissions.dailySpendingLimit !== null
          ? sessionKey.permissions.dailySpendingLimit -
            sessionKey.usageStats.dailySpent
          : null,
    };
  } catch (error) {
    return {
      hasSessionKey: false,
      isValid: false,
      message: error.message,
    };
  }
}
