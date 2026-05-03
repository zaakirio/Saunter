"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { densifyPolyline } from "@/lib/geo/densify";
import { initialBearingDeg } from "@/lib/geo/bearing";
import type { LngLat } from "@/lib/geo/distance";
import type { ResolvedPano } from "@/lib/street-view/types";
import { findPano } from "@/lib/street-view/pano-finder";
import { loadMapsApi } from "@/lib/street-view/load-maps-api";

const STEP_METERS = 8;
const PRIMARY_RADIUS = 50;

/**
 * Densifies the polyline, lazily resolves panos for each densified point,
 * and exposes navigation (next/back/jumpTo) over the resolved sequence.
 */
export function useStreetViewRoute(polyline: LngLat[] | null) {
  const [index, setIndex] = useState(0);
  const [resolved, setResolved] = useState<Map<number, ResolvedPano>>(new Map());
  const [ready, setReady] = useState(false);
  const serviceRef = useRef<google.maps.StreetViewService | null>(null);

  const densified: LngLat[] = useMemo(
    () => (polyline && polyline.length > 1 ? densifyPolyline(polyline, STEP_METERS) : []),
    [polyline],
  );

  // Bootstrap: load Maps API + create service
  useEffect(() => {
    if (!densified.length) { setReady(false); return; }
    let cancelled = false;
    loadMapsApi().then(() => {
      if (cancelled) return;
      serviceRef.current = new google.maps.StreetViewService();
      setReady(true);
    }).catch(() => setReady(false));
    return () => { cancelled = true; };
  }, [densified]);

  // Resolve current + adjacent indices on demand
  useEffect(() => {
    const svc = serviceRef.current;
    if (!ready || !svc || densified.length === 0) return;
    const want = [index, index + 1, index + 2, index - 1].filter(
      i => i >= 0 && i < densified.length && !resolved.has(i),
    );
    if (want.length === 0) return;

    let cancelled = false;
    Promise.all(want.map(async i => {
      const coord = densified[i];
      const next = densified[Math.min(i + 1, densified.length - 1)];
      const heading = initialBearingDeg(coord, next);
      const finding = await findPano(svc, coord, PRIMARY_RADIUS);
      return [i, { routeIndex: i, routeCoord: coord, heading, ...finding } as ResolvedPano] as const;
    })).then(entries => {
      if (cancelled) return;
      setResolved(prev => {
        const next = new Map(prev);
        for (const [i, p] of entries) next.set(i, p);
        return next;
      });
    });

    return () => { cancelled = true; };
  }, [ready, index, densified, resolved]);

  const advance = () => setIndex(i => Math.min(i + 1, densified.length - 1));
  const back = () => setIndex(i => Math.max(i - 1, 0));
  const jumpTo = (i: number) =>
    setIndex(Math.max(0, Math.min(i, densified.length - 1)));

  const current = resolved.get(index) ?? null;
  const isAtEnd = index >= densified.length - 1;

  return { ready, current, index, total: densified.length, densified, advance, back, jumpTo, isAtEnd };
}
