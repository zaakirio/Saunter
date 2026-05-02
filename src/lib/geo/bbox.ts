import type { LngLat } from "@/lib/geo/distance";

export type Bbox = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

export function polylineBbox(poly: LngLat[]): Bbox {
  let minLng = Infinity, minLat = Infinity;
  let maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of poly) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLng, minLat, maxLng, maxLat };
}

export function expandBboxMeters(b: Bbox, meters: number): Bbox {
  // 1 degree latitude ≈ 111,320 meters; longitude varies by latitude
  const dLat = meters / 111_320;
  const midLat = (b.minLat + b.maxLat) / 2;
  const dLng = meters / (111_320 * Math.cos((midLat * Math.PI) / 180));
  return {
    minLng: b.minLng - dLng,
    maxLng: b.maxLng + dLng,
    minLat: b.minLat - dLat,
    maxLat: b.maxLat + dLat,
  };
}
