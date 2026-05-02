import { z } from "zod";
import { fetchOverpassPois } from "@/lib/poi/overpass";
import { fetchGooglePlacesPois } from "@/lib/poi/google-places";
import { mergePois } from "@/lib/poi/merge";
import { readCachedPois, writeCachedPois } from "@/lib/poi/cache";
import type { POIType } from "@/lib/poi/types";

export const runtime = "nodejs";

const querySchema = z.object({
  minLng: z.coerce.number(),
  minLat: z.coerce.number(),
  maxLng: z.coerce.number(),
  maxLat: z.coerce.number(),
  types: z.string(),
});

const VALID_TYPES: ReadonlySet<POIType> = new Set([
  "tourist_attraction", "museum", "art_gallery", "landmark", "cafe",
  "toilets", "drinking_water", "viewpoint", "artwork", "bench", "historic",
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return Response.json({ error: "missing bbox" }, { status: 400 });

  const types = parsed.data.types.split(",")
    .map(t => t.trim()).filter((t): t is POIType => VALID_TYPES.has(t as POIType));
  if (types.length === 0) return Response.json({ pois: [] });

  const bbox = {
    minLng: parsed.data.minLng,
    minLat: parsed.data.minLat,
    maxLng: parsed.data.maxLng,
    maxLat: parsed.data.maxLat,
  };

  // 1) try cache
  const cached = await readCachedPois(bbox, types);
  if (cached.length > 0) {
    return Response.json({ pois: cached, cache: "hit" });
  }

  // 2) fetch live in parallel
  const [overpass, places] = await Promise.allSettled([
    fetchOverpassPois(bbox, types),
    fetchGooglePlacesPois(bbox, types),
  ]);

  const all = [
    ...(overpass.status === "fulfilled" ? overpass.value : []),
    ...(places.status === "fulfilled" ? places.value : []),
  ];
  const merged = mergePois(all);

  // 3) write to cache (fire and forget)
  writeCachedPois(merged).catch(() => { /* swallow */ });

  return Response.json({
    pois: merged,
    cache: "miss",
    overpassFailed: overpass.status === "rejected",
    placesFailed: places.status === "rejected",
  });
}
