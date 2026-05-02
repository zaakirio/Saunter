import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("returns parsed env when valid", () => {
    const env = parseEnv({
      MONGODB_URI: "mongodb://localhost",
      BETTERAUTH_SECRET: "x".repeat(32),
      BETTERAUTH_URL: "http://localhost:3000",
      GOOGLE_OAUTH_CLIENT_ID: "id",
      GOOGLE_OAUTH_CLIENT_SECRET: "secret",
      NEXT_PUBLIC_GMAPS_KEY: "key",
      GOOGLE_PLACES_KEY: "key",
      GRAPHHOPPER_KEY: "key",
      MAPBOX_KEY: "key",
      REDIS_URL: "redis://localhost:6379",
      NODE_ENV: "test",
    });
    expect(env.MONGODB_URI).toBe("mongodb://localhost");
  });

  it("throws when MONGODB_URI missing", () => {
    expect(() => parseEnv({} as never)).toThrow();
  });
});
