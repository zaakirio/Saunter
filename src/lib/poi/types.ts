import type { LngLat } from "@/lib/geo/distance";

export type POISource = "google" | "overpass";

export type POIType =
  | "tourist_attraction" | "museum" | "art_gallery" | "landmark"
  | "cafe"
  | "toilets" | "drinking_water" | "viewpoint" | "artwork" | "bench" | "historic";

export type POI = {
  source: POISource;
  externalId: string;          // place_id (google) or osm <type>/<id> (overpass)
  type: POIType;
  name: string;
  location: { type: "Point"; coordinates: LngLat };
  photoUrl: string | null;
  rating: number | null;
  metadata: Record<string, unknown>;
};

export const HIGHLIGHT_TYPES: ReadonlySet<POIType> = new Set([
  "tourist_attraction", "museum", "art_gallery", "landmark", "viewpoint",
]);
