import mongoose, { type InferSchemaType } from "mongoose";
import { db } from "@/lib/mongo";

const schema = new mongoose.Schema({
  source: { type: String, required: true, enum: ["google", "overpass"] },
  externalId: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  photoUrl: String,
  rating: Number,
  metadata: mongoose.Schema.Types.Mixed,
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

schema.index({ location: "2dsphere" });
schema.index({ source: 1, externalId: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type POICacheDoc = InferSchemaType<typeof schema>;

export async function getPoiCacheModel() {
  await db();
  return mongoose.models.PoiCache as mongoose.Model<POICacheDoc> ??
    mongoose.model<POICacheDoc>("PoiCache", schema);
}
