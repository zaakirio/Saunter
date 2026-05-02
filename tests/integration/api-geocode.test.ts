import { describe, expect, it } from "vitest";
import { server, http, HttpResponse } from "../setup";
import fixture from "../fixtures/mapbox-geocode.json";
import { GET } from "@/app/api/geocode/route";

describe("/api/geocode", () => {
  it("returns parsed places for a query", async () => {
    server.use(
      http.get("https://api.mapbox.com/geocoding/v5/mapbox.places/:q.json",
        () => HttpResponse.json(fixture)),
    );
    const req = new Request("http://x/api/geocode?q=Ferry+Building");
    const res = await GET(req);
    const body = await res.json();
    expect(body.results).toHaveLength(1);
    expect(body.results[0].name).toContain("Ferry Building");
    expect(body.results[0].location.coordinates).toEqual([-122.3933, 37.7956]);
  });

  it("returns empty list when no features", async () => {
    server.use(
      http.get("https://api.mapbox.com/geocoding/v5/mapbox.places/:q.json",
        () => HttpResponse.json({ type: "FeatureCollection", features: [] })),
    );
    const req = new Request("http://x/api/geocode?q=zzznotaplace");
    const res = await GET(req);
    const body = await res.json();
    expect(body.results).toEqual([]);
  });
});
