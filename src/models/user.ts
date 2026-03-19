import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  walletType: string;
  displayName?: string;
  email?: string;
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
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    walletType: {
      type: String,
      required: true,
      default: "phantom",
    },
    displayName: String,
    email: String,
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
