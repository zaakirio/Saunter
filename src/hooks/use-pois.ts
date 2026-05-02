"use client";
import { useEffect, useState } from "react";
import { polylineBbox, expandBboxMeters } from "@/lib/geo/bbox";
import type { POI, POIType } from "@/lib/poi/types";
import type { LngLat } from "@/lib/geo/distance";

export function usePois(polyline: LngLat[] | null, types: POIType[]) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!polyline || polyline.length === 0 || types.length === 0) {
      setPois([]); return;
    }
    setLoading(true);
    const bb = expandBboxMeters(polylineBbox(polyline), 100);
    const url = new URL("/api/pois", window.location.origin);
    url.searchParams.set("minLng", String(bb.minLng));
    url.searchParams.set("minLat", String(bb.minLat));
    url.searchParams.set("maxLng", String(bb.maxLng));
    url.searchParams.set("maxLat", String(bb.maxLat));
    url.searchParams.set("types", types.join(","));
    fetch(url).then(r => r.json()).then(j => setPois(j.pois ?? [])).finally(() => setLoading(false));
  }, [polyline, types.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { pois, loading };
}
