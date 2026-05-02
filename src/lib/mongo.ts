import mongoose from "mongoose";
import { env } from "@/lib/env";

let promise: Promise<typeof mongoose> | null = null;

export function db(): Promise<typeof mongoose> {
  if (!promise) {
    promise = mongoose.connect(env().MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }
  return promise;
}
