"use client";
import { useEffect, useRef } from "react";
import maplibregl, { type Map as MLMap, Marker } from "maplibre-gl";
import type { POI, POIType } from "@/lib/poi/types";

const COLORS: Record<POIType, string> = {
  tourist_attraction: "#a855f7", museum: "#a855f7", art_gallery: "#a855f7", landmark: "#a855f7",
  cafe: "#f97316",
  toilets: "#0ea5e9",
  drinking_water: "#0ea5e9",
  viewpoint: "#a855f7", artwork: "#a855f7", historic: "#a855f7", bench: "#64748b",
};

const ICONS: Record<POIType, string> = {
  tourist_attraction: "📷", museum: "🏛️", art_gallery: "🎨", landmark: "📷",
  cafe: "☕",
  toilets: "🚻",
  drinking_water: "💧",
  viewpoint: "🏞️", artwork: "🗿", historic: "🏛️", bench: "🪑",
};

function makeMarkerEl(poi: POI): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    width: 32px; height: 32px; border-radius: 50%;
    background: ${COLORS[poi.type]};
    display: grid; place-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,.25); cursor: pointer;
    border: 2px solid white;`;
  const inner = document.createElement("div");
  inner.style.cssText = `
    width: 22px; height: 22px; border-radius: 50%;
    background: white; color: ${COLORS[poi.type]};
    display: grid; place-items: center; font-size: 13px;`;
  inner.textContent = ICONS[poi.type] ?? "•";
  wrap.appendChild(inner);
  wrap.title = poi.name;
  return wrap;
}

type Props = { map: MLMap | null; pois: POI[]; onClick?: (p: POI) => void };

export function PoiMarkers({ map, pois, onClick }: Props) {
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = pois.map(p => {
      const el = makeMarkerEl(p);
      el.addEventListener("click", () => onClick?.(p));
      return new maplibregl.Marker({ element: el }).setLngLat(p.location.coordinates).addTo(map);
    });
    return () => { markersRef.current.forEach(m => m.remove()); markersRef.current = []; };
  }, [map, pois, onClick]);

  return null;
}
