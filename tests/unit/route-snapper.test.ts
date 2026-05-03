import { describe, expect, it } from "vitest";
import { nearestPolylineIndex, distanceFromPolyline } from "@/lib/street-view/route-snapper";

const POLY: [number, number][] = [
  [0, 0],
  [0, 0.001],
  [0, 0.002],
  [0, 0.003],
];

describe("nearestPolylineIndex", () => {
  it("returns 0 when coord is at start", () => {
    expect(nearestPolylineIndex([0, 0], POLY)).toBe(0);
  });
  it("returns last index when coord is at end", () => {
    expect(nearestPolylineIndex([0, 0.003], POLY)).toBe(3);
  });
  it("snaps to nearest mid-point", () => {
    // [0, 0.0015] is between index 1 (0.001) and 2 (0.002); index 1 is equidistant but stable
    const idx = nearestPolylineIndex([0, 0.0015], POLY);
    expect([1, 2]).toContain(idx);
  });
});

describe("distanceFromPolyline", () => {
  it("0m when on a vertex", () => {
    expect(distanceFromPolyline([0, 0], POLY)).toBeLessThan(1);
  });
  it("returns ~111m when 0.001 deg lat off the line", () => {
    const d = distanceFromPolyline([0.001, 0], POLY);
    expect(d).toBeGreaterThan(80);
    expect(d).toBeLessThan(140);
  });
});
