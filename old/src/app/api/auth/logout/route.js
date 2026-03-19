import { cors } from "@/lib/middlewares/cors";
import { serialize } from "cookie";
import { NextResponse } from "next/server";

// Specify Node.js runtime
export const runtime = "nodejs";

export async function POST(request) {
  // Apply CORS middleware
  const corsResponse = await cors(request);
  if (corsResponse) return corsResponse;

  // Clear the token cookie
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // Set expiration to the past
    path: "/",
  });

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
}
