import mongoose, { type InferSchemaType } from "mongoose";
import { db } from "@/lib/mongo";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, default: null },
  routeSnapshot: mongoose.Schema.Types.Mixed,
  walkedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  modeUsed: { type: String, enum: ["click", "auto", "gps", "plan-only"], default: "plan-only" },
}, { timestamps: true });

schema.index({ userId: 1, walkedAt: -1 });

export type HistoryDoc = InferSchemaType<typeof schema>;

export async function getHistoryModel() {
  await db();
  return mongoose.models.History as mongoose.Model<HistoryDoc> ??
    mongoose.model<HistoryDoc>("History", schema);
}
