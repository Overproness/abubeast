import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-fallback-secret-never-use-in-production";

// Hash a password
export async function hashPassword(password) {
  return await hash(password, 12);
}

// Compare a password with a hash
export async function comparePassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

// Generate a JWT token for a user
export function generateToken(user) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    // Don't include sensitive information in the token
  };

  return sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Enhanced token verification
export async function verifyToken(token) {
  try {
    console.log("[Auth] Verifying token");
    const decoded = verify(token, JWT_SECRET);
    console.log("[Auth] Token valid for user:", decoded.email);

    // Add a small delay to ensure everything is synchronized
    await new Promise((resolve) => setTimeout(resolve, 100));

    return decoded;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);
    return null;
  }
}

// Get a user by email - only called from server-side API routes
export async function getUserByEmail(email) {
  // Ensure database connection
  await dbConnect();

  try {
    console.log(`Looking up user with email: ${email}`);
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error; // Rethrow to handle in the calling function
  }
}

// Create a new user - only called from server-side API routes
export async function createUser(userData) {
  const { email, password, name } = userData;

  try {
    // Ensure database connection
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user using Mongoose model
    const newUser = new User({
      email,
      password, // Will be hashed by the pre-save hook
      name,
    });

    await newUser.save();

    return {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
