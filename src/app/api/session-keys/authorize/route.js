export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import SessionKey from "@/models/SessionKey";
import User from "@/models/User";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { NextResponse } from "next/server";
import nacl from "tweetnacl";

/**
 * POST /api/session-keys/authorize
 * Authorize a session key with user's signature
 */
export async function POST(request) {
  try {
    const {
      walletAddress,
      publicKey,
      signature,
      message,
      encryptedData,
      iv,
      authTag,
      expiresAt,
      permissions,
      name,
      description,
    } = await request.json();

    // Validate input
    if (
      !walletAddress ||
      !publicKey ||
      !signature ||
      !message ||
      !encryptedData ||
      !iv ||
      !authTag
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Check if wallet belongs to this user
    const walletExists = user.wallets?.some(
      (w) => w.address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (!walletExists) {
      return NextResponse.json(
        { error: "This wallet is not connected to your account" },
        { status: 403 }
      );
    }

    // Verify the signature (Solana signature verification)
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Signature verification error:", error);
      return NextResponse.json(
        { error: "Failed to verify signature" },
        { status: 400 }
      );
    }

    // Check if there's already an active session key for this wallet
    const existingActiveKey = await SessionKey.findOne({
      userId: user._id,
      walletAddress: walletAddress.toLowerCase(),
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (existingActiveKey) {
      // Deactivate the old key
      existingActiveKey.active = false;
      existingActiveKey.auditLog.push({
        action: "revoked",
        timestamp: new Date(),
        details: { reason: "New session key authorized" },
      });
      await existingActiveKey.save();
    }

    // Create the session key in database
    const sessionKey = await SessionKey.create({
      userId: user._id,
      walletAddress: walletAddress.toLowerCase(),
      publicKey,
      encryptedPrivateKey: encryptedData,
      iv,
      // Store authTag if needed for future decryption
      authTag,
      name: name || "Trading Session",
      description: description || "",
      expiresAt: new Date(expiresAt),
      active: true,
      permissions: {
        canTrade: permissions?.canTrade ?? true,
        canSwap: permissions?.canSwap ?? true,
        canStake: permissions?.canStake ?? false,
        canTransfer: permissions?.canTransfer ?? false,
        maxTransactionAmount: permissions?.maxTransactionAmount || null,
        dailySpendingLimit: permissions?.dailySpendingLimit || null,
        allowedTokens: permissions?.allowedTokens || [],
      },
      auditLog: [
        {
          action: "created",
          timestamp: new Date(),
          details: { walletAddress, signature },
        },
      ],
    });

    // Return success (don't return sensitive data)
    return NextResponse.json({
      success: true,
      message: "Session key authorized successfully",
      sessionKey: {
        id: sessionKey._id,
        publicKey: sessionKey.publicKey,
        walletAddress: sessionKey.walletAddress,
        expiresAt: sessionKey.expiresAt,
        permissions: sessionKey.permissions,
        name: sessionKey.name,
        createdAt: sessionKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Error authorizing session key:", error);
    return NextResponse.json(
      { error: "Failed to authorize session key" },
      { status: 500 }
    );
  }
}
