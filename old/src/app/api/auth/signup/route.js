import { createUser } from "@/lib/auth/auth";
import { cors } from "@/lib/middlewares/cors";
import { NextResponse } from "next/server";

// Specify Node.js runtime
export const runtime = "nodejs";

export async function POST(request) {
  // Apply CORS middleware
  const corsResponse = await cors(request);
  if (corsResponse) return corsResponse;

  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Create the user
    const user = await createUser({ email, password, name });

    // Return success but don't include sensitive information
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: error.message === "User already exists" ? 409 : 500 }
    );
  }
}
