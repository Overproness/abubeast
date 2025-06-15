import { NextResponse } from "next/server";

// Configure allowed origins
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://yourdomain.com"] // Add your production domains
    : ["http://localhost:3000"];

export async function cors(request) {
  // Check if it's an OPTIONS preflight request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": getAllowedOrigin(request),
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  // For actual requests, return null so that the original request proceeds
  // with the appropriate CORS headers
  return null;
}

// Helper to determine appropriate Access-Control-Allow-Origin
function getAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return "*"; // No origin, allow any

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}
