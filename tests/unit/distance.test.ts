import { describe, expect, it } from "vitest";
import { haversineMeters } from "@/lib/geo/distance";

describe("haversineMeters", () => {
  it("returns 0 for the same point", () => {
    expect(haversineMeters([-122.4, 37.7], [-122.4, 37.7])).toBe(0);
  });

  it("computes ~111km between 1 degree of latitude", () => {
    const d = haversineMeters([0, 0], [0, 1]);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("SF to NYC ~ 4129 km", () => {
    const sf: [number, number] = [-122.4194, 37.7749];
    const nyc: [number, number] = [-74.006, 40.7128];
    const d = haversineMeters(sf, nyc) / 1000;
    expect(d).toBeGreaterThan(4100);
    expect(d).toBeLessThan(4150);
  });
});
