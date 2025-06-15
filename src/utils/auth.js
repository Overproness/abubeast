import jwt from "jsonwebtoken";

// Verify JWT token
export function verifyToken(token) {
  try {
    // Replace with your actual JWT_SECRET from your environment variables
    const secret = process.env.JWT_SECRET || "your-default-secret";
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

// Additional auth utility functions can be added here
