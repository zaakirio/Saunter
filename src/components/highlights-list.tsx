"use client";
import type { POI } from "@/lib/poi/types";
import { HIGHLIGHT_TYPES } from "@/lib/poi/types";
import { Star } from "lucide-react";

type Props = {
  pois: POI[];
  routeStart: [number, number] | null;
  onSelect?: (p: POI) => void;
};

import { haversineMeters } from "@/lib/geo/distance";

const TYPE_LABELS: Record<string, string> = {
  museum: "Museum",
  art_gallery: "Art Gallery",
  tourist_attraction: "Attraction",
  landmark: "Landmark",
  viewpoint: "Viewpoint",
  cafe: "Café",
};

export function HighlightsList({ pois, routeStart, onSelect }: Props) {
  const highlights = pois
    .filter(p => HIGHLIGHT_TYPES.has(p.type) || p.type === "cafe")
    .map(p => ({
      ...p,
      distFromStart: routeStart ? haversineMeters(routeStart, p.location.coordinates) : 0,
    }))
    .sort((a, b) => a.distFromStart - b.distFromStart);

  if (highlights.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No highlights along this route yet.</div>;
  }

  return (
    <ul className="p-4 space-y-3 overflow-y-auto">
      {highlights.map(h => {
        const km = h.distFromStart >= 1000
          ? `${(h.distFromStart / 1000).toFixed(1)} km in`
          : `${Math.round(h.distFromStart)} m in`;
        return (
          <li key={`${h.source}-${h.externalId}`}
              onClick={() => onSelect?.(h)}
              className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
            {h.photoUrl ? (
              <img src={h.photoUrl} alt="" className="w-20 h-20 object-cover rounded" loading="lazy" />
            ) : (
              <div className="w-20 h-20 rounded bg-muted grid place-items-center text-2xl">🏛️</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{h.name}</div>
              <div className="text-xs text-muted-foreground">
                {TYPE_LABELS[h.type] ?? h.type.replace("_", " ")} · {km}
              </div>
              {h.rating && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  <span>{h.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
