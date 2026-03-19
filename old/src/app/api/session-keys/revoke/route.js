export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import SessionKey from "@/models/SessionKey";
import { NextResponse } from "next/server";

/**
 * POST /api/session-keys/revoke
 * Revoke a session key
 */
export async function POST(request) {
  try {
    const { sessionKeyId } = await request.json();

    // Validate input
    if (!sessionKeyId) {
      return NextResponse.json(
        { error: "Session key ID is required" },
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

    // Find the session key
    const sessionKey = await SessionKey.findOne({
      _id: sessionKeyId,
      userId: tokenData.userId,
    });

    if (!sessionKey) {
      return NextResponse.json(
        { error: "Session key not found" },
        { status: 404 }
      );
    }

    // Revoke the session key
    sessionKey.active = false;
    sessionKey.auditLog.push({
      action: "revoked",
      timestamp: new Date(),
      details: { revokedBy: "user" },
    });

    await sessionKey.save();

    return NextResponse.json({
      success: true,
      message: "Session key revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking session key:", error);
    return NextResponse.json(
      { error: "Failed to revoke session key" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/session-keys/revoke
 * Delete a session key permanently
 */
export async function DELETE(request) {
  try {
    const { sessionKeyId } = await request.json();

    // Validate input
    if (!sessionKeyId) {
      return NextResponse.json(
        { error: "Session key ID is required" },
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

    // Find and delete the session key
    const sessionKey = await SessionKey.findOneAndDelete({
      _id: sessionKeyId,
      userId: tokenData.userId,
    });

    if (!sessionKey) {
      return NextResponse.json(
        { error: "Session key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session key:", error);
    return NextResponse.json(
      { error: "Failed to delete session key" },
      { status: 500 }
    );
  }
}
