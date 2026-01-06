export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import {
  calculateExpirationDate,
  encryptSecretKey,
  generateAuthorizationMessage,
  generateSessionKeypair,
  getMasterEncryptionKey,
} from "@/lib/session-keys/sessionKeyUtils";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * POST /api/session-keys/generate
 * Generate a new session key for a user's wallet
 */
export async function POST(request) {
  try {
    const {
      walletAddress,
      expirationHours = 24,
      permissions = {},
      name = "Trading Session",
      description = "",
    } = await request.json();

    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if wallet belongs to this user, if not add it
    const walletExists = user.wallets?.some(
      (w) => w.address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (!walletExists) {
      // Add the wallet to user's account
      user.wallets = user.wallets || [];
      user.wallets.push({
        type: "phantom", // Default to phantom for Solana
        address: walletAddress,
        addedAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
      console.log(
        `[SessionKey] Auto-added wallet ${walletAddress} to user account`
      );
    }

    // Generate a new keypair
    const { publicKey, secretKey } = generateSessionKeypair();

    // Encrypt the secret key
    const masterKey = getMasterEncryptionKey();
    const { encryptedData, iv, authTag } = encryptSecretKey(
      secretKey,
      masterKey
    );

    // Calculate expiration
    const expiresAt = calculateExpirationDate(expirationHours);

    // Create default permissions if not provided
    const defaultPermissions = {
      canTrade: true,
      canSwap: true,
      canStake: false,
      canTransfer: false,
      maxTransactionAmount: permissions.maxTransactionAmount || null,
      dailySpendingLimit: permissions.dailySpendingLimit || null,
      allowedTokens: permissions.allowedTokens || [],
    };

    // Generate the authorization message for user to sign
    const authMessage = generateAuthorizationMessage(
      publicKey,
      expiresAt,
      defaultPermissions
    );

    // Return session key info and message (DO NOT return encrypted key to client)
    return NextResponse.json({
      success: true,
      sessionKey: {
        publicKey,
        expiresAt,
        permissions: defaultPermissions,
        message: authMessage,
        name,
        description,
      },
      // Temporarily store these in a secure way - in production use a different approach
      // like storing in Redis with a short TTL
      pendingAuthorization: {
        encryptedData,
        iv,
        authTag,
      },
    });
  } catch (error) {
    console.error("Error generating session key:", error);
    return NextResponse.json(
      { error: "Failed to generate session key" },
      { status: 500 }
    );
  }
}
