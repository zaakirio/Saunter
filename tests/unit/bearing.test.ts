import { describe, expect, it } from "vitest";
import { initialBearingDeg } from "@/lib/geo/bearing";

describe("initialBearingDeg", () => {
  it("due north → 0", () => {
    expect(initialBearingDeg([0, 0], [0, 1])).toBeCloseTo(0, 0);
  });
  it("due east → 90", () => {
    expect(initialBearingDeg([0, 0], [1, 0])).toBeCloseTo(90, 0);
  });
  it("due south → 180", () => {
    expect(initialBearingDeg([0, 0], [0, -1])).toBeCloseTo(180, 0);
  });
  it("due west → 270", () => {
    expect(initialBearingDeg([0, 0], [-1, 0])).toBeCloseTo(270, 0);
  });
});
