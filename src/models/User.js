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
    // OTP fields
    current_otp: {
      type: String,
      default: null,
    },
    otp_created_at: {
      type: Date,
      default: null,
    },
    // Profile information
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    location: {
      type: String,
      default: "",
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      default: "",
      maxlength: [200, "Website URL cannot exceed 200 characters"],
    },
    twitter: {
      type: String,
      default: "",
      maxlength: [100, "Twitter handle cannot exceed 100 characters"],
    },
    telegram: {
      type: String,
      default: "",
      maxlength: [100, "Telegram handle cannot exceed 100 characters"],
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      trades: {
        type: Boolean,
        default: true,
      },
      security: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
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
    // Profile information
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    location: {
      type: String,
      default: "",
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      default: "",
      maxlength: [200, "Website URL cannot exceed 200 characters"],
    },
    twitter: {
      type: String,
      default: "",
      maxlength: [100, "Twitter handle cannot exceed 100 characters"],
    },
    telegram: {
      type: String,
      default: "",
      maxlength: [100, "Telegram handle cannot exceed 100 characters"],
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      trades: {
        type: Boolean,
        default: true,
      },
      security: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
    },
    // Trading statistics
    tradingStats: {
      totalTrades: {
        type: Number,
        default: 0,
      },
      winRate: {
        type: Number,
        default: 0,
      },
      totalVolume: {
        type: Number,
        default: 0,
      },
      daysActive: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    // Trading statistics
    tradingStats: {
      totalTrades: {
        type: Number,
        default: 0,
      },
      winRate: {
        type: Number,
        default: 0,
      },
      totalVolume: {
        type: Number,
        default: 0,
      },
      daysActive: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
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
