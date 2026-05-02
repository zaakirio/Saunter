import { describe, expect, it } from "vitest";
import { densifyPolyline } from "@/lib/geo/densify";
import { haversineMeters } from "@/lib/geo/distance";

describe("densifyPolyline", () => {
  it("keeps original points when already dense", () => {
    const poly: [number, number][] = [
      [0, 0], [0, 0.00005], [0, 0.0001],
    ];
    const out = densifyPolyline(poly, 50);
    expect(out.length).toBeGreaterThanOrEqual(poly.length);
  });

  it("inserts intermediate points to keep spacing <= maxMeters", () => {
    const poly: [number, number][] = [
      [0, 0],
      [0, 0.01], // ~1.1km apart
    ];
    const out = densifyPolyline(poly, 100);
    for (let i = 1; i < out.length; i++) {
      expect(haversineMeters(out[i - 1], out[i])).toBeLessThanOrEqual(110);
    }
    expect(out.length).toBeGreaterThan(10);
  });

  it("keeps endpoints", () => {
    const poly: [number, number][] = [[0, 0], [0, 0.01]];
    const out = densifyPolyline(poly, 100);
    expect(out[0]).toEqual([0, 0]);
    expect(out.at(-1)).toEqual([0, 0.01]);
  });
});
