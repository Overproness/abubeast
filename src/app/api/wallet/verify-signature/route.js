import { NextResponse } from "next/server";
import { ethers } from "ethers";
import * as nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

export async function POST(request) {
  try {
    const { address, message, signature, walletType } = await request.json();

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Address, message, and signature are required" },
        { status: 400 }
      );
    }

    let verified = false;

    // Default to Ethereum if wallet type not specified
    const type = walletType || "ethereum";

    if (type === "ethereum" || type === "evm") {
      try {
        // Verify Ethereum signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        verified = recoveredAddress.toLowerCase() === address.toLowerCase();
      } catch (error) {
        console.error("Error verifying Ethereum signature:", error);
      }
    } else if (type === "solana") {
      try {
        // Verify Solana signature
        const encoder = new TextEncoder();
        const encodedMessage = encoder.encode(message);
        const publicKey = new PublicKey(address);
        const signatureUint8 = new Uint8Array(Buffer.from(signature, "base64"));

        verified = nacl.sign.detached.verify(
          encodedMessage,
          signatureUint8,
          publicKey.toBytes()
        );
      } catch (error) {
        console.error("Error verifying Solana signature:", error);
      }
    }

    return NextResponse.json({
      verified,
      address,
    });
  } catch (error) {
    console.error("Error in signature verification:", error);
    return NextResponse.json(
      { error: "Failed to verify signature" },
      { status: 500 }
    );
  }
}
