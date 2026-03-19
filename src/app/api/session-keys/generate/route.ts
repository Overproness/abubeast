import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import dbConnect from "@/lib/mongodb";
import SessionKey from "@/models/session-key";
import { getAuthUser } from "@/lib/auth";
import {
  encryptSecretKey,
  generateAuthorizationMessage,
} from "@/lib/session-keys";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletAddress, expirationHours, permissions, name, description } =
      await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (walletAddress !== user.walletAddress) {
      return NextResponse.json(
        { error: "Wallet address mismatch" },
        { status: 403 }
      );
    }

    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = keypair.secretKey;

    const encrypted = encryptSecretKey(secretKey);

    const expiresAt = new Date(
      Date.now() + (expirationHours || 24) * 60 * 60 * 1000
    );

    const message = generateAuthorizationMessage(
      publicKey,
      expiresAt,
      permissions || { canTrade: true, canSwap: true }
    );

    await dbConnect();

    const sessionKey = await SessionKey.create({
      userId: user.userId,
      walletAddress,
      publicKey,
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      name: name || "Trading Session",
      description,
      status: "pending",
      permissions: {
        canTrade: permissions?.canTrade ?? true,
        canSwap: permissions?.canSwap ?? true,
        canStake: permissions?.canStake ?? false,
        canTransfer: permissions?.canTransfer ?? false,
      },
      limits: {
        maxPerTransaction: permissions?.maxPerTransaction ?? 100,
        dailySpendingLimit: permissions?.dailySpendingLimit ?? 25.5,
        maxSlippage: permissions?.maxSlippage ?? 0.5,
      },
      authorizationMessage: message,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      sessionKey: {
        id: sessionKey._id,
        publicKey,
        expiresAt,
        permissions: sessionKey.permissions,
        message,
      },
    });
  } catch (error) {
    console.error("Session key generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
