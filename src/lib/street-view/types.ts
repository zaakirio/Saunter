import type { LngLat } from "@/lib/geo/distance";

export type GuidedMode = "click" | "auto" | "gps";

/**
 * A Street View pano resolved for a point on the route.
 * If `panoId` is null, no pano was available within the fallback radius
 * — caller should render satellite fallback for that segment.
 */
export type ResolvedPano = {
  routeIndex: number;            // index in the densified polyline
  routeCoord: LngLat;            // the point we asked about ([lng, lat])
  panoId: string | null;
  panoCoord: LngLat | null;      // actual pano location (may be offset from routeCoord)
  heading: number;               // degrees, computed from bearing to next route point
};
