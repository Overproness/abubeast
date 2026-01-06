export const runtime = "nodejs";

import { initializeApp } from "@/lib/startup";
import { NextResponse } from "next/server";

/**
 * This API route ensures services are initialized
 * Called automatically by middleware on first request
 */
export async function GET() {
  try {
    await initializeApp();
    return NextResponse.json({
      success: true,
      message: "Services initialized",
    });
  } catch (error) {
    console.error("[Startup API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
