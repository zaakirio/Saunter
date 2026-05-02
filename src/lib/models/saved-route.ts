import mongoose, { type InferSchemaType } from "mongoose";
import { db } from "@/lib/mongo";

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], required: true },
}, { _id: false });

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: pointSchema, required: true },
}, { _id: false });

const stepSchema = new mongoose.Schema({
  distance: Number,
  duration: Number,
  instruction: String,
  maneuver: String,
  coords: [[Number]],
  thumbnailHint: [Number],
}, { _id: false });

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: String,
  pointA: { type: placeSchema, required: true },
  pointB: { type: placeSchema, required: true },
  mode: { type: String, enum: ["walk", "scenic", "accessible"], required: true },
  preferences: {
    preferFewerStairs: Boolean,
    scenicRoute: Boolean,
    avoidBusyRoads: Boolean,
  },
  polyline: { type: [[Number]], required: true },
  steps: [stepSchema],
  pois: [{ poiCacheId: mongoose.Schema.Types.ObjectId, distanceFromStart: Number }],
  distance: Number,
  duration: Number,
  elevationGain: Number,
  elevationProfile: [{ d: Number, e: Number, _id: false }],
}, { timestamps: true });

schema.index({ userId: 1, createdAt: -1 });

export type SavedRouteDoc = InferSchemaType<typeof schema>;

export async function getSavedRouteModel() {
  await db();
  return mongoose.models.SavedRoute as mongoose.Model<SavedRouteDoc> ??
    mongoose.model<SavedRouteDoc>("SavedRoute", schema);
}
