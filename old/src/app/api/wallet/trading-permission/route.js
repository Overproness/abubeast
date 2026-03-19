export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import TradingPermission from "@/models/TradingPermission";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { walletAddress, walletType, signature, message } =
      await request.json();

    // Validate input
    if (!walletAddress || !walletType || !signature) {
      return NextResponse.json(
        { error: "Wallet address, type and signature are required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token); // Added await
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

    // Save or update trading permission
    const existingPermission = await TradingPermission.findOne({
      userId: user._id, // This uses user._id which is correct from User model
      walletAddress: walletAddress.toLowerCase(),
    });

    if (existingPermission) {
      // Update existing permission
      existingPermission.signature = signature;
      existingPermission.message = message;
      existingPermission.updatedAt = new Date();
      await existingPermission.save();
    } else {
      // Create new permission
      await TradingPermission.create({
        userId: user._id, // This uses user._id which is correct
        walletAddress: walletAddress.toLowerCase(),
        walletType,
        signature,
        message,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Trading permission saved successfully",
    });
  } catch (error) {
    console.error("Error saving trading permission:", error);
    return NextResponse.json(
      { error: "Failed to save trading permission" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token); // Added await
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get all trading permissions for this user
    const permissions = await TradingPermission.find({
      userId: tokenData.userId,
    }).lean();

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching trading permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch trading permissions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { walletAddress } = await request.json();

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

    const tokenData = await verifyToken(token); // Added await
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Delete the permission
    await TradingPermission.deleteOne({
      userId: tokenData.userId,
      walletAddress: walletAddress.toLowerCase(),
    });

    return NextResponse.json({
      success: true,
      message: "Trading permission revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking trading permission:", error);
    return NextResponse.json(
      { error: "Failed to revoke trading permission" },
      { status: 500 }
    );
  }
}
