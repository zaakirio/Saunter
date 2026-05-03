"use client";
import { Star, X } from "lucide-react";
import type { POI } from "@/lib/poi/types";

type Props = { poi: POI; onDismiss: () => void };

const TYPE_LABELS: Record<string, string> = {
  museum: "Museum",
  art_gallery: "Art Gallery",
  tourist_attraction: "Attraction",
  landmark: "Landmark",
  viewpoint: "Viewpoint",
  cafe: "Café",
};

export function HighlightCard({ poi, onDismiss }: Props) {
  return (
    <div className="absolute bottom-24 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 flex gap-3 max-w-sm animate-in slide-in-from-right pointer-events-auto">
      {poi.photoUrl ? (
        <img src={poi.photoUrl} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-slate-100 grid place-items-center text-2xl shrink-0">🏛️</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{poi.name}</div>
        <div className="text-xs text-slate-500">
          {TYPE_LABELS[poi.type] ?? poi.type.replace("_", " ")}
        </div>
        {poi.rating && (
          <div className="flex items-center gap-1 text-xs mt-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span>{poi.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-700 shrink-0" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  );
}
