// Stub the google.maps namespace just enough for findPano's request construction
(globalThis as any).google = {
  maps: { StreetViewSource: { OUTDOOR: "outdoor" } },
};

import { describe, expect, it, vi, beforeEach } from "vitest";
import { findPano } from "@/lib/street-view/pano-finder";

describe("findPano", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pano data when service resolves a result", async () => {
    const fakeService = {
      getPanorama: vi.fn((req: any, cb: any) =>
        cb(
          { location: { pano: "PANO_ABC", latLng: { lng: () => -122.4, lat: () => 37.77 } } },
          "OK",
        ),
      ),
    };
    const result = await findPano(fakeService as never, [-122.4, 37.77], 50);
    expect(result.panoId).toBe("PANO_ABC");
    expect(result.panoCoord).toEqual([-122.4, 37.77]);
  });

  it("returns null panoId when service signals ZERO_RESULTS", async () => {
    const fakeService = {
      getPanorama: vi.fn((req: any, cb: any) => cb(null, "ZERO_RESULTS")),
    };
    const result = await findPano(fakeService as never, [-122.4, 37.77], 50);
    expect(result.panoId).toBeNull();
    expect(result.panoCoord).toBeNull();
  });

  it("passes radius into the service request", async () => {
    const fakeService = {
      getPanorama: vi.fn((req: any, cb: any) => cb(null, "ZERO_RESULTS")),
    };
    await findPano(fakeService as never, [-122.4, 37.77], 75);
    expect(fakeService.getPanorama).toHaveBeenCalledWith(
      expect.objectContaining({ radius: 75 }),
      expect.any(Function),
    );
  });
});
