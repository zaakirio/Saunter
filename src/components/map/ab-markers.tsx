"use client";
import { useEffect, useRef } from "react";
import maplibregl, { type Map as MLMap, Marker } from "maplibre-gl";

type Props = {
  map: MLMap | null;
  pointA: [number, number] | null;
  pointB: [number, number] | null;
};

function makeBadge(letter: "A" | "B", color: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 32px; height: 32px; border-radius: 50%;
    background: ${color}; color: white; font-weight: 700;
    display: grid; place-items: center; box-shadow: 0 2px 8px rgba(0,0,0,.25);
    font-family: system-ui;`;
  el.textContent = letter;
  return el;
}

export function ABMarkers({ map, pointA, pointB }: Props) {
  const aRef = useRef<Marker | null>(null);
  const bRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!map) return;
    if (pointA) {
      if (!aRef.current) aRef.current = new maplibregl.Marker({ element: makeBadge("A", "#10b981") }).setLngLat(pointA).addTo(map);
      else aRef.current.setLngLat(pointA);
    } else { aRef.current?.remove(); aRef.current = null; }
    if (pointB) {
      if (!bRef.current) bRef.current = new maplibregl.Marker({ element: makeBadge("B", "#ef4444") }).setLngLat(pointB).addTo(map);
      else bRef.current.setLngLat(pointB);
    } else { bRef.current?.remove(); bRef.current = null; }
  }, [map, pointA, pointB]);

  useEffect(() => {
    return () => { aRef.current?.remove(); bRef.current?.remove(); };
  }, []);

  return null;
}
