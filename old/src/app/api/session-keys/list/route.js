export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import SessionKey from "@/models/SessionKey";
import { NextResponse } from "next/server";

/**
 * GET /api/session-keys/list
 * Get all session keys for the authenticated user
 */
export async function GET(request) {
  try {
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

    // Get query parameters
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get("walletAddress");
    const includeExpired = url.searchParams.get("includeExpired") === "true";
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    // Build query
    const query = { userId: tokenData.userId };

    if (walletAddress) {
      query.walletAddress = walletAddress.toLowerCase();
    }

    if (!includeExpired) {
      query.expiresAt = { $gt: new Date() };
    }

    if (!includeInactive) {
      query.active = true;
    }

    // Find session keys
    const sessionKeys = await SessionKey.find(query)
      .sort({ createdAt: -1 })
      .select(
        "-encryptedPrivateKey -iv -authTag -auditLog" // Don't return sensitive data
      )
      .lean();

    // Add computed fields
    const enrichedKeys = sessionKeys.map((key) => ({
      ...key,
      isValid: key.active && new Date(key.expiresAt) > new Date(),
      isExpired: new Date(key.expiresAt) <= new Date(),
    }));

    return NextResponse.json({
      success: true,
      sessionKeys: enrichedKeys,
      count: enrichedKeys.length,
    });
  } catch (error) {
    console.error("Error fetching session keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch session keys" },
      { status: 500 }
    );
  }
}
