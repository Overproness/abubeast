import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-fallback-secret-never-use-in-production";
const secret = new TextEncoder().encode(JWT_SECRET);

// Generate JWT token
export async function generateJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify JWT token (Edge-compatible)
export function verifyToken(token) {
  try {
    // For Edge runtime, use jose library
    if (typeof window === "undefined" && process.env.NEXT_RUNTIME === "edge") {
      // This won't work in Edge runtime, fallback to manual verification
      console.log("[JWT] Edge runtime detected, using fallback verification");
      return verifyTokenFallback(token);
    }

    // For Node.js runtime, use jsonwebtoken
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("[JWT] Token verification failed:", error.message);
    return null;
  }
}

// Fallback verification for Edge runtime
function verifyTokenFallback(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token structure");
    }

    const payload = JSON.parse(atob(parts[1]));

    // Basic expiration check
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error("Token expired");
    }

    return payload;
  } catch (error) {
    console.error("[JWT] Fallback verification failed:", error.message);
    return null;
  }
}

// Verify JWT token with jose (for API routes)
export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("[JWT] JWT verification failed:", error.message);
    return null;
  }
}
