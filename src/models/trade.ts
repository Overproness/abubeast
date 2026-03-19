import mongoose, { Schema, type Document } from "mongoose";

export interface ITrade extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  sessionKeyId?: mongoose.Types.ObjectId;
  type: "buy" | "sell" | "swap";
  status: "pending" | "success" | "failed";
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  priceAtExecution: number;
  fees: number;
  txSignature?: string;
  dex: string;
  pnl?: number;
  pnlPercentage?: number;
  createdAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    sessionKeyId: { type: Schema.Types.ObjectId, ref: "SessionKey" },
    type: { type: String, enum: ["buy", "sell", "swap"], required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    fromToken: { type: String, required: true },
    toToken: { type: String, required: true },
    fromAmount: { type: Number, required: true },
    toAmount: { type: Number, required: true },
    priceAtExecution: { type: Number, required: true },
    fees: { type: Number, default: 0 },
    txSignature: String,
    dex: { type: String, default: "Jupiter" },
    pnl: Number,
    pnlPercentage: Number,
  },
  { timestamps: true }
);

TradeSchema.index({ createdAt: -1 });

export default mongoose.models.Trade || mongoose.model<ITrade>("Trade", TradeSchema);
