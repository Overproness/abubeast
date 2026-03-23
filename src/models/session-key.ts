import mongoose, { Schema, type Document } from "mongoose";

export interface ISessionKey extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  publicKey: string;
  encryptedData: string;
  iv: string;
  authTag: string;
  name: string;
  description?: string;
  status: "pending" | "active" | "revoked";
  permissions: {
    canTrade: boolean;
    canSwap: boolean;
    canStake: boolean;
    canTransfer: boolean;
  };
  signature?: string;
  authorizationMessage?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionKeySchema = new Schema<ISessionKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    publicKey: { type: String, required: true },
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    name: { type: String, default: "Trading Session" },
    description: String,
    status: {
      type: String,
      enum: ["pending", "active", "revoked"],
      default: "pending",
      index: true,
    },
    permissions: {
      canTrade: { type: Boolean, default: true },
      canSwap: { type: Boolean, default: true },
      canStake: { type: Boolean, default: false },
      canTransfer: { type: Boolean, default: false },
    },
    signature: String,
    authorizationMessage: String,
    expiresAt: { type: Date, required: false, default: null },
  },
  { timestamps: true }
);

// Force re-register schema during dev hot-reload to pick up schema changes
if (mongoose.models.SessionKey) {
  delete mongoose.models.SessionKey;
}
export default mongoose.model<ISessionKey>("SessionKey", SessionKeySchema);
