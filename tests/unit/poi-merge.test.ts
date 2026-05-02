import { describe, expect, it } from "vitest";
import { mergePois } from "@/lib/poi/merge";
import type { POI } from "@/lib/poi/types";

const mk = (name: string, lng: number, lat: number, source: "google" | "overpass" = "google", type = "cafe"): POI => ({
  source, externalId: `${source}-${name}`, type: type as POI["type"],
  name, location: { type: "Point", coordinates: [lng, lat] },
  photoUrl: null, rating: null, metadata: {},
});

describe("mergePois", () => {
  it("dedupes near-identical names within 30m", () => {
    const a = mk("Cafe Repose", 0, 0, "google");
    const b = mk("Cafe Repose", 0.00005, 0.00005, "overpass"); // ~7m
    const result = mergePois([a, b]);
    expect(result).toHaveLength(1);
  });

  it("keeps far-apart same-name distinct", () => {
    const a = mk("Cafe Repose", 0, 0);
    const b = mk("Cafe Repose", 0.01, 0.01); // ~1.4km
    expect(mergePois([a, b])).toHaveLength(2);
  });

  it("keeps different names same location distinct", () => {
    const a = mk("Cafe A", 0, 0);
    const b = mk("Restroom", 0, 0, "overpass", "toilets");
    expect(mergePois([a, b])).toHaveLength(2);
  });

  it("prefers google source when deduping (richer data)", () => {
    const overpass = mk("Cafe", 0, 0, "overpass");
    const google = mk("Cafe", 0.00005, 0.00005, "google");
    google.photoUrl = "http://x";
    const merged = mergePois([overpass, google]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe("google");
    expect(merged[0].photoUrl).toBe("http://x");
  });
});
