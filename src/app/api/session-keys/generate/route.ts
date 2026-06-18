import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { encryptSecretKey, generateAuthorizationMessage } from "@/lib/session-keys";
import SessionKey from "@/models/session-key";
import User from "@/models/user";
import { Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletAddress, permissions, name, description, expirationHours } =
      await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const dbUser = await User.findById(authUser.userId).select("walletAddress");
    if (!dbUser || walletAddress !== dbUser.walletAddress) {
      return NextResponse.json(
        { error: "Wallet address mismatch" },
        { status: 403 }
      );
    }

    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = keypair.secretKey;

    const encrypted = encryptSecretKey(secretKey);

    const expiresAt =
      expirationHours && typeof expirationHours === "number"
        ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
        : undefined;

    const message = generateAuthorizationMessage(
      publicKey,
      permissions || { canTrade: true, canSwap: true },
      expiresAt
    );

    await dbConnect();

    const sessionKey = await SessionKey.create({
      userId: authUser.userId,
      walletAddress,
      publicKey,
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      name: name || "Trading Session",
      description,
      status: "pending",
      expiresAt,
      permissions: {
        canTrade: permissions?.canTrade ?? true,
        canSwap: permissions?.canSwap ?? true,
        canStake: permissions?.canStake ?? false,
        canTransfer: permissions?.canTransfer ?? false,
      },
      authorizationMessage: message,
    });

    return NextResponse.json({
      success: true,
      sessionKey: {
        id: sessionKey._id,
        publicKey,
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
