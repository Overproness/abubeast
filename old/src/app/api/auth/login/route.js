import {
  comparePassword,
  getUserByEmail,
} from "@/lib/auth/auth";
import { cors } from "@/lib/middlewares/cors";
import { NextResponse } from "next/server";

// Specify Node.js runtime
export const runtime = "nodejs";

export async function POST(request) {
  // Apply CORS middleware
  const corsResponse = await cors(request);
  if (corsResponse) return corsResponse;

  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Use a generic error message for security
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log(
      "[API] Login - Password verified for user:",
      user._id.toString(),
      "- awaiting OTP verification"
    );

    // Return success but don't set auth token yet - wait for OTP verification
    return NextResponse.json({
      success: true,
      message: "Credentials verified. Please verify OTP to complete login.",
      user: { id: user._id.toString(), email: user.email, name: user.name },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}