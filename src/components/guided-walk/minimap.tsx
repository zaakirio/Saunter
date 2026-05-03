"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MLMap } from "maplibre-gl";
import type { LngLat } from "@/lib/geo/distance";

type Props = {
  polyline: LngLat[] | null;
  currentCoord: LngLat | null;
};

export function Minimap({ polyline, currentCoord }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: polyline?.[0] ?? [-122.4, 37.77],
      zoom: 14,
      interactive: false,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on("load", () => {
      if (!polyline || polyline.length < 2) return;
      map.addSource("mini-route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: polyline }, properties: {} },
      });
      map.addLayer({
        id: "mini-route-line", type: "line", source: "mini-route",
        paint: { "line-color": "#3b82f6", "line-width": 3 },
      });
      const bounds = polyline.reduce(
        (b, c) => b.extend(c as [number, number]),
        new maplibregl.LngLatBounds(polyline[0], polyline[0]),
      );
      map.fitBounds(bounds, { padding: 16, duration: 0 });
    });
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentCoord) return;
    if (!markerRef.current) {
      const el = document.createElement("div");
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px rgba(59,130,246,.3)`;
      markerRef.current = new maplibregl.Marker({ element: el }).setLngLat(currentCoord).addTo(map);
    } else {
      markerRef.current.setLngLat(currentCoord);
    }
  }, [currentCoord]);

  return (
    <button
      onClick={() => setExpanded(e => !e)}
      className={`absolute bottom-20 left-4 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 transition-all
        ${expanded ? "w-80 h-64" : "w-44 h-32"}`}
      title={expanded ? "Shrink minimap" : "Expand minimap"}
    >
      <div ref={containerRef} className="w-full h-full pointer-events-none" />
    </button>
  );
}
