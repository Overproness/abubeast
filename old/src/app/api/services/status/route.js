export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import { getServiceManager } from "@/lib/services/serviceManager";
import { NextResponse } from "next/server";

/**
 * GET /api/services/status
 * Get status of all background services
 */
export async function GET(request) {
  try {
    // Verify authentication (optional - could be admin-only)
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData || !tokenData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const manager = getServiceManager();
    const status = manager.getStatus();

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("[Services Status] Error:", error);
    return NextResponse.json(
      { error: "Failed to get service status", details: error.message },
      { status: 500 }
    );
  }
}
