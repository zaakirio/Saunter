"use client";
import { useEffect } from "react";
import type { Map as MLMap } from "maplibre-gl";

const SOURCE = "walkguide-route";
const LAYER = "walkguide-route-line";

type Props = { map: MLMap | null; polyline: [number, number][] | null };

export function RouteLayer({ map, polyline }: Props) {
  useEffect(() => {
    if (!map) return;
    if (!map.getSource(SOURCE)) {
      map.addSource(SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: LAYER,
        type: "line",
        source: SOURCE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 5,
          "line-dasharray": [0.5, 1.5],
        },
      });
    }

    const src = map.getSource(SOURCE) as maplibregl.GeoJSONSource;
    if (polyline && polyline.length > 1) {
      src.setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: polyline },
        properties: {},
      });
      const bounds = polyline.reduce((b, c) => b.extend(c as [number, number]),
        new (window as any).maplibregl.LngLatBounds(polyline[0], polyline[0]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 600 });
    } else {
      src.setData({ type: "FeatureCollection", features: [] });
    }
  }, [map, polyline]);

  return null;
}
