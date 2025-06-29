import {
  comparePassword,
  generateToken,
  getUserByEmail,
} from "@/lib/auth/auth";
import { cors } from "@/lib/middlewares/cors";
import { serialize } from "cookie";
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

    // Generate JWT token
    const token = await generateToken(user);

    // Set HTTP-only cookie with more permissive settings for debugging
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    console.log(
      "[API] Login - Setting auth cookie for user:",
      user._id.toString()
    );

    // Return token and user info
    return NextResponse.json(
      {
        success: true,
        user: { id: user._id.toString(), email: user.email, name: user.name },
      },
      {
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
