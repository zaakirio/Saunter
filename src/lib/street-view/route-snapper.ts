import type { LngLat } from "@/lib/geo/distance";
import { haversineMeters } from "@/lib/geo/distance";

/** Index of the polyline vertex closest to `coord`. */
export function nearestPolylineIndex(coord: LngLat, polyline: LngLat[]): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < polyline.length; i++) {
    const d = haversineMeters(coord, polyline[i]);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Distance in meters from `coord` to the nearest polyline vertex. */
export function distanceFromPolyline(coord: LngLat, polyline: LngLat[]): number {
  let bestD = Infinity;
  for (let i = 0; i < polyline.length; i++) {
    const d = haversineMeters(coord, polyline[i]);
    if (d < bestD) bestD = d;
  }
  return bestD;
}
