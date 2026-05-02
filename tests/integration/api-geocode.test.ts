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

  it("forwards proximity hint to Mapbox", async () => {
    let captured: string | undefined;
    server.use(
      http.get("https://api.mapbox.com/geocoding/v5/mapbox.places/:q.json",
        ({ request }) => {
          captured = request.url;
          return HttpResponse.json(fixture);
        }),
    );
    const req = new Request("http://x/api/geocode?q=Foo&proximity=-122.4,37.8");
    await GET(req);
    expect(captured).toContain("proximity=-122.4%2C37.8");
  });
});
