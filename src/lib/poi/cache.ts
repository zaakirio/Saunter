import { getPoiCacheModel } from "@/lib/models/poi-cache";
import type { Bbox } from "@/lib/geo/bbox";
import type { POI, POIType } from "@/lib/poi/types";

const TTL_DAYS = 7;

function roundedKey(bbox: Bbox): string {
  // round to 0.001° (~110m) — neighbouring searches share keys
  const r = (x: number) => Math.round(x * 1000) / 1000;
  return `${r(bbox.minLng)},${r(bbox.minLat)},${r(bbox.maxLng)},${r(bbox.maxLat)}`;
}

/**
 * Look up cached POIs intersecting the bbox for the given types.
 * Returns subset that's still fresh.
 */
export async function readCachedPois(bbox: Bbox, types: POIType[]): Promise<POI[]> {
  const Model = await getPoiCacheModel();
  const docs = await Model.find({
    type: { $in: types },
    location: {
      $geoWithin: {
        $box: [[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.maxLat]],
      },
    },
  }).lean();
  return docs
    .filter((d): d is typeof d & { location: { coordinates: number[] } } => !!d.location?.coordinates)
    .map(d => ({
      source: d.source as POI["source"],
      externalId: d.externalId,
      type: d.type as POIType,
      name: d.name,
      location: { type: "Point", coordinates: d.location.coordinates as [number, number] },
      photoUrl: d.photoUrl ?? null,
      rating: d.rating ?? null,
      metadata: (d.metadata ?? {}) as Record<string, unknown>,
    }));
}

export async function writeCachedPois(pois: POI[]): Promise<void> {
  if (pois.length === 0) return;
  const Model = await getPoiCacheModel();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 3600 * 1000);
  await Model.bulkWrite(pois.map(p => ({
    updateOne: {
      filter: { source: p.source, externalId: p.externalId },
      update: {
        $set: {
          ...p,
          expiresAt,
        },
      },
      upsert: true,
    },
  })));
}
