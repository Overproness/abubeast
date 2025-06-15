import { hashPassword } from "@/lib/auth/auth";
import mongoose from "mongoose";

// Define the schema
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    // Add wallet information
    wallets: [
      {
        type: {
          type: String,
          required: true,
          enum: ["metamask", "phantom", "coinbase", "other"],
        },
        address: {
          type: String,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// Create or retrieve the model - handle safely for serverless environments
const User = mongoose.models?.User || mongoose.model("User", UserSchema);

export default User;
export { UserSchema }; // Export schema for flexibility
