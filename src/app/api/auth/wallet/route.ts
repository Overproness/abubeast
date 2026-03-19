import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthUser();
    if (!authPayload) {
      return NextResponse.json(
        { error: "Must be logged in to connect wallet" },
        { status: 401 }
      );
    }

    const { walletAddress, walletType } = await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(authPayload.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    user.walletAddress = walletAddress;
    user.walletType = walletType || "phantom";
    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        walletType: user.walletType,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Wallet connect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
