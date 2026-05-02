import type { LngLat } from "@/lib/geo/distance";
import { haversineMeters } from "@/lib/geo/distance";

export function densifyPolyline(poly: LngLat[], maxMeters: number): LngLat[] {
  if (poly.length < 2) return poly.slice();
  const out: LngLat[] = [poly[0]];
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1];
    const b = poly[i];
    const d = haversineMeters(a, b);
    if (d <= maxMeters) {
      out.push(b);
      continue;
    }
    const steps = Math.ceil(d / maxMeters);
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
