export const runtime = "nodejs";

import { verifyToken } from "@/lib/auth/auth";
import { getServiceManager } from "@/lib/services/serviceManager";
import { NextResponse } from "next/server";

/**
 * POST /api/services/restart
 * Restart a specific service
 */
export async function POST(request) {
  try {
    const { serviceId } = await request.json();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData || !tokenData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // For now, any authenticated user can restart services
    // In production, add admin check here

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
      );
    }

    const manager = getServiceManager();
    await manager.restartService(serviceId);

    return NextResponse.json({
      success: true,
      message: `Service ${serviceId} restarted successfully`,
    });
  } catch (error) {
    console.error("[Services Restart] Error:", error);
    return NextResponse.json(
      { error: "Failed to restart service", details: error.message },
      { status: 500 }
    );
  }
}
