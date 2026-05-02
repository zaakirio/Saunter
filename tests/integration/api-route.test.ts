import { describe, expect, it } from "vitest";
import { server, http, HttpResponse } from "../setup";
import ghFixture from "../fixtures/graphhopper-response.json";
import { POST } from "@/app/api/route/route";

const validBody = {
  from: [-122.46, 37.77],
  to: [-122.39, 37.79],
  mode: "walk",
  preferFewerStairs: false,
  scenicRoute: false,
  avoidBusyRoads: false,
};

describe("/api/route", () => {
  it("returns route for valid request", async () => {
    server.use(
      http.post("https://graphhopper.com/api/1/route", () =>
        HttpResponse.json(ghFixture)),
    );
    const req = new Request("http://x/api/route", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.distance).toBe(4200);
    expect(body.steps.length).toBeGreaterThan(0);
    expect(body.polyline.length).toBeGreaterThan(0);
  });

  it("falls back to google when graphhopper fails", async () => {
    server.use(
      http.post("https://graphhopper.com/api/1/route", () =>
        HttpResponse.error()),
      http.get("https://maps.googleapis.com/maps/api/directions/json", () =>
        HttpResponse.json({
          status: "OK",
          routes: [{
            overview_polyline: { points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
            legs: [{
              distance: { value: 1000 },
              duration: { value: 600 },
              steps: [{
                distance: { value: 1000 },
                duration: { value: 600 },
                html_instructions: "Walk forward",
                maneuver: "depart",
                polyline: { points: "_p~iF~ps|U" },
              }],
            }],
          }],
        })),
    );
    const req = new Request("http://x/api/route", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    expect(res.headers.get("x-route-fallback")).toBe("google");
    const body = await res.json();
    expect(body.distance).toBe(1000);
  });

  it("returns 400 for missing body", async () => {
    const req = new Request("http://x/api/route", {
      method: "POST",
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
