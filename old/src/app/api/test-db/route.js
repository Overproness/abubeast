export const runtime = "nodejs";

import dbConnect from "@/lib/db/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    await dbConnect();

    // Check environment variables
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      SESSION_KEY_ENCRYPTION_SECRET:
        !!process.env.SESSION_KEY_ENCRYPTION_SECRET,
    };

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        environment: {
          MONGODB_URI: !!process.env.MONGODB_URI,
          JWT_SECRET: !!process.env.JWT_SECRET,
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASS: !!process.env.EMAIL_PASS,
          SESSION_KEY_ENCRYPTION_SECRET:
            !!process.env.SESSION_KEY_ENCRYPTION_SECRET,
        },
      },
      { status: 500 }
    );
  }
}
