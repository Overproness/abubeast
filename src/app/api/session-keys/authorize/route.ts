import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import dbConnect from "@/lib/mongodb";
import SessionKey from "@/models/session-key";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionKeyId, signature, walletAddress } = await request.json();

    if (!sessionKeyId || !signature || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (walletAddress !== user.walletAddress) {
      return NextResponse.json(
        { error: "Wallet address mismatch" },
        { status: 403 }
      );
    }

    await dbConnect();

    const sessionKey = await SessionKey.findOne({
      _id: sessionKeyId,
      userId: user.userId,
      status: "pending",
    });

    if (!sessionKey) {
      return NextResponse.json(
        { error: "Session key not found or already authorized" },
        { status: 404 }
      );
    }

    // Verify the signature
    const message = new TextEncoder().encode(sessionKey.authorizationMessage);
    const signatureBytes = Buffer.from(signature, "base64");
    const publicKeyBytes = new PublicKey(walletAddress).toBytes();

    const isValid = nacl.sign.detached.verify(
      message,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    sessionKey.status = "active";
    sessionKey.signature = signature;
    await sessionKey.save();

    return NextResponse.json({
      success: true,
      sessionKey: {
        id: sessionKey._id,
        publicKey: sessionKey.publicKey,
        status: "active",
        expiresAt: sessionKey.expiresAt,
        permissions: sessionKey.permissions,
      },
    });
  } catch (error) {
    console.error("Session key authorization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
