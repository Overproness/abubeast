import { verifyToken } from "@/lib/auth/jwt";
import { cors } from "@/lib/middlewares/cors";
import { NextResponse } from "next/server";

// Specify Node.js runtime to ensure crypto is available
export const runtime = "nodejs";

export async function GET(request) {
  console.time("[API] /auth/me - Response Time");

  // Apply CORS middleware if needed
  const corsResponse = await cors(request);
  if (corsResponse) return corsResponse;

  try {
    // Get the token from cookies
    const cookies = request.cookies;
    const tokenCookie = cookies.get("token");

    if (!tokenCookie || !tokenCookie.value) {
      console.log("[API] /auth/me - No token found");
      console.timeEnd("[API] /auth/me - Response Time");
      return NextResponse.json(
        { error: "Not authenticated", authenticated: false },
        { status: 401 }
      );
    }

    // Verify the token - ensure we're using the Node.js version for the API
    const token = tokenCookie.value;
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      console.log("[API] /auth/me - Invalid token");
      console.timeEnd("[API] /auth/me - Response Time");
      return NextResponse.json(
        { error: "Invalid token", authenticated: false },
        { status: 401 }
      );
    }

    console.log("[API] /auth/me - Token valid for user:", decodedToken.email);
    console.timeEnd("[API] /auth/me - Response Time");

    // Return the user info with both id fields for compatibility
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: decodedToken.userId || decodedToken.id,
        userId: decodedToken.userId || decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name,
      },
    });
  } catch (error) {
    console.error("[API] /auth/me error:", error);
    console.timeEnd("[API] /auth/me - Response Time");
    return NextResponse.json(
      { error: "Authentication check failed", authenticated: false },
      { status: 500 }
    );
  }
}
