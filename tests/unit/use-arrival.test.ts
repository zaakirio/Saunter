import { describe, expect, it } from "vitest";
import { hasArrived } from "@/hooks/use-arrival";

describe("hasArrived", () => {
  it("true when current coord is within 20m of destination", () => {
    expect(hasArrived([0, 0], [0, 0.0001])).toBe(true); // ~11m
  });
  it("false when current coord is >20m from destination", () => {
    expect(hasArrived([0, 0], [0, 0.0005])).toBe(false); // ~55m
  });
  it("false when either coord is null", () => {
    expect(hasArrived(null, [0, 0])).toBe(false);
    expect(hasArrived([0, 0], null)).toBe(false);
  });
});
