import { env } from "@/lib/env";
import type { Bbox } from "@/lib/geo/bbox";
import type { POI, POIType } from "@/lib/poi/types";

const PLACES_NEARBY = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

const TYPE_TO_PLACES: Record<POIType, string | null> = {
  tourist_attraction: "tourist_attraction",
  museum: "museum",
  art_gallery: "art_gallery",
  landmark: "tourist_attraction", // Places API doesn't distinguish
  cafe: "cafe",
  toilets: null, drinking_water: null, viewpoint: null,
  artwork: null, bench: null, historic: null,
};

function photoUrl(photoRef: string): string {
  const params = new URLSearchParams({
    maxwidth: "400",
    photoreference: photoRef,
    key: env().GOOGLE_PLACES_KEY,
  });
  return `https://maps.googleapis.com/maps/api/place/photo?${params}`;
}

export async function fetchGooglePlacesPois(bbox: Bbox, types: POIType[]): Promise<POI[]> {
  const lat = (bbox.minLat + bbox.maxLat) / 2;
  const lng = (bbox.minLng + bbox.maxLng) / 2;
  // approx radius from diagonal/2
  const dLat = (bbox.maxLat - bbox.minLat) * 111_320;
  const dLng = (bbox.maxLng - bbox.minLng) * 111_320 * Math.cos(lat * Math.PI / 180);
  const radius = Math.min(5000, Math.max(500, Math.round(Math.hypot(dLat, dLng) / 2)));

  const placeTypes = [...new Set(types.map(t => TYPE_TO_PLACES[t]).filter(Boolean) as string[])];
  if (placeTypes.length === 0) return [];

  const all: POI[] = [];
  for (const placeType of placeTypes) {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: String(radius),
      type: placeType,
      key: env().GOOGLE_PLACES_KEY,
    });
    const res = await fetch(`${PLACES_NEARBY}?${params}`);
    if (!res.ok) continue;
    const data = await res.json() as {
      results: Array<{
        place_id: string;
        name: string;
        geometry: { location: { lat: number; lng: number } };
        types: string[];
        rating?: number;
        photos?: Array<{ photo_reference: string }>;
      }>;
    };
    for (const p of data.results) {
      const matched = (types.find(t => TYPE_TO_PLACES[t] === placeType) ?? "tourist_attraction") as POIType;
      all.push({
        source: "google",
        externalId: p.place_id,
        type: matched,
        name: p.name,
        location: { type: "Point", coordinates: [p.geometry.location.lng, p.geometry.location.lat] },
        photoUrl: p.photos?.[0]?.photo_reference ? photoUrl(p.photos[0].photo_reference) : null,
        rating: p.rating ?? null,
        metadata: { placeTypes: p.types },
      });
    }
  }
  return all;
}
