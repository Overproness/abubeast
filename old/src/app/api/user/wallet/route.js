import { verifyJWT } from "@/lib/auth/jwt";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { walletAddress, walletType } = await request.json();

    // Check for authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = verifyJWT(token); // Using verifyJWT here
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();

    // Find the user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if wallet already exists
    const walletExists = user.wallets?.some(
      (w) => w.address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (!walletExists) {
      // Add new wallet
      user.wallets = user.wallets || [];
      user.wallets.push({
        type: walletType || "phantom",
        address: walletAddress,
        addedAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Wallet address added successfully",
      wallets: user.wallets,
    });
  } catch (error) {
    console.error("Error in wallet route:", error);
    return NextResponse.json(
      { error: "Failed to add wallet address" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { walletAddress } = await request.json();

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

    const tokenData = verifyJWT(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Find user and remove wallet
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.wallets || user.wallets.length === 0) {
      return NextResponse.json({ error: "No wallets found" }, { status: 404 });
    }

    // Filter out the wallet to remove
    user.wallets = user.wallets.filter(
      (w) => w.address.toLowerCase() !== walletAddress.toLowerCase()
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Wallet disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    return NextResponse.json(
      { error: "Failed to disconnect wallet" },
      { status: 500 }
    );
  }
}
