import { describe, expect, it } from "vitest";
import { buildCustomModel } from "@/lib/route/graphhopper";

describe("buildCustomModel", () => {
  it("returns null when no preferences set", () => {
    const m = buildCustomModel({
      mode: "walk",
      preferFewerStairs: false,
      scenicRoute: false,
      avoidBusyRoads: false,
    });
    expect(m).toBeNull();
  });

  it("includes road_class downweighting for avoid busy roads", () => {
    const m = buildCustomModel({
      mode: "walk",
      preferFewerStairs: false,
      scenicRoute: false,
      avoidBusyRoads: true,
    });
    const json = JSON.stringify(m);
    expect(json).toContain("road_class");
    expect(json).toContain("PRIMARY");
  });

  it("scenic mode boosts paths", () => {
    const m = buildCustomModel({
      mode: "scenic",
      preferFewerStairs: false,
      scenicRoute: false,
      avoidBusyRoads: false,
    });
    const json = JSON.stringify(m);
    expect(json.toLowerCase()).toContain("path");
  });

  it("accessible mode adds avoid stairs", () => {
    const m = buildCustomModel({
      mode: "accessible",
      preferFewerStairs: false,
      scenicRoute: false,
      avoidBusyRoads: false,
    });
    const json = JSON.stringify(m);
    expect(json.toLowerCase()).toContain("steps");
  });
});
