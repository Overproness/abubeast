import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  walletAddress?: string;
  walletType?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  settings: {
    notifications: boolean;
    autoTrade: boolean;
    maxSlippage: number;
    dailyLimit: number;
  };
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      sparse: true,
      index: true,
    },
    walletType: {
      type: String,
      default: "phantom",
    },
    lastLoginAt: { type: Date, default: Date.now },
    settings: {
      notifications: { type: Boolean, default: true },
      autoTrade: { type: Boolean, default: false },
      maxSlippage: { type: Number, default: 0.5 },
      dailyLimit: { type: Number, default: 25.5 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
