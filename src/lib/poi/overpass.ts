import type { Bbox } from "@/lib/geo/bbox";
import type { POI, POIType } from "@/lib/poi/types";

const OVERPASS = "https://overpass-api.de/api/interpreter";

const TYPE_TO_OVERPASS: Record<POIType, string | null> = {
  toilets: 'node["amenity"="toilets"]',
  drinking_water: 'node["amenity"="drinking_water"]',
  viewpoint: 'node["tourism"="viewpoint"]',
  artwork: 'node["tourism"="artwork"]',
  bench: 'node["amenity"="bench"]',
  historic: 'node["historic"]',
  // not handled by overpass:
  tourist_attraction: null, museum: null, art_gallery: null, landmark: null, cafe: null,
};

function nameFromTags(tags: Record<string, string>, fallback: string): string {
  return tags.name ?? tags["name:en"] ?? fallback;
}

function classify(tags: Record<string, string>): POIType | null {
  if (tags.amenity === "toilets") return "toilets";
  if (tags.amenity === "drinking_water") return "drinking_water";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.tourism === "artwork") return "artwork";
  if (tags.amenity === "bench") return "bench";
  if (tags.historic) return "historic";
  return null;
}

export async function fetchOverpassPois(bbox: Bbox, types: POIType[]): Promise<POI[]> {
  const queries = types.map(t => TYPE_TO_OVERPASS[t]).filter(Boolean) as string[];
  if (queries.length === 0) return [];

  const bboxStr = `${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}`;
  const ql = `[out:json][timeout:15];(${queries.map(q => `${q}(${bboxStr});`).join("")});out;`;

  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(ql)}`,
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  const data = await res.json() as {
    elements: Array<{ type: string; id: number; lat: number; lon: number; tags?: Record<string, string> }>;
  };

  const pois: POI[] = [];
  for (const el of data.elements) {
    if (el.type !== "node" || !el.tags) continue;
    const t = classify(el.tags);
    if (!t || !types.includes(t)) continue;
    pois.push({
      source: "overpass",
      externalId: `node/${el.id}`,
      type: t,
      name: nameFromTags(el.tags, t.replace("_", " ")),
      location: { type: "Point", coordinates: [el.lon, el.lat] },
      photoUrl: null,
      rating: null,
      metadata: el.tags,
    });
  }
  return pois;
}
