import { describe, expect, it, vi } from "vitest";
import { server, http, HttpResponse } from "../setup";
import overpassFixture from "../fixtures/overpass-response.json";
import placesFixture from "../fixtures/google-places.json";

vi.mock("@/lib/poi/cache", () => ({
  readCachedPois: vi.fn(async () => []),
  writeCachedPois: vi.fn(async () => {}),
}));

import { GET } from "@/app/api/pois/route";

describe("/api/pois", () => {
  it("merges Overpass + Google Places", async () => {
    server.use(
      http.post("https://overpass-api.de/api/interpreter", () => HttpResponse.json(overpassFixture)),
      http.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", () => HttpResponse.json(placesFixture)),
    );
    const url = "http://x/api/pois?minLng=-122.5&minLat=37.7&maxLng=-122.3&maxLat=37.8&types=toilets,cafe,museum";
    const res = await GET(new Request(url));
    const json = await res.json();
    expect(json.pois.length).toBeGreaterThan(0);
    const sources = new Set(json.pois.map((p: any) => p.source));
    expect(sources.has("overpass")).toBe(true);
    expect(sources.has("google")).toBe(true);
  });

  it("returns 400 when bbox missing", async () => {
    const res = await GET(new Request("http://x/api/pois"));
    expect(res.status).toBe(400);
  });
});
