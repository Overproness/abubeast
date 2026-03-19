import { verifyToken } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No token found" },
        { status: 200 }
      );
    }

    const tokenData = await verifyToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid token" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: tokenData.id || tokenData,
        email: tokenData.email,
      },
    });
  } catch (error) {
    console.error("[Auth Check API] Error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
