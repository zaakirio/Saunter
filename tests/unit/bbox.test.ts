import { describe, expect, it } from "vitest";
import { polylineBbox, expandBboxMeters } from "@/lib/geo/bbox";

describe("polylineBbox", () => {
  it("computes min/max from polyline", () => {
    const poly: [number, number][] = [
      [-122.4, 37.7],
      [-122.5, 37.8],
      [-122.3, 37.6],
    ];
    expect(polylineBbox(poly)).toEqual({
      minLng: -122.5,
      minLat: 37.6,
      maxLng: -122.3,
      maxLat: 37.8,
    });
  });
});

describe("expandBboxMeters", () => {
  it("expands by 100m in all directions", () => {
    const b = { minLng: 0, minLat: 0, maxLng: 0, maxLat: 0 };
    const expanded = expandBboxMeters(b, 100);
    expect(expanded.minLng).toBeLessThan(0);
    expect(expanded.maxLng).toBeGreaterThan(0);
    expect(expanded.minLat).toBeLessThan(0);
    expect(expanded.maxLat).toBeGreaterThan(0);
  });
});
