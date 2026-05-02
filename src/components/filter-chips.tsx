"use client";
import { Camera, GlassWater, Coffee, Droplet, MoreHorizontal } from "lucide-react";
import type { POIType } from "@/lib/poi/types";

type Props = {
  enabled: Set<POIType>;
  onToggle: (t: POIType) => void;
};

const CHIPS: Array<{ key: POIType[]; label: string; Icon: typeof Camera }> = [
  { key: ["tourist_attraction", "museum", "art_gallery", "landmark"], label: "Attractions", Icon: Camera },
  { key: ["toilets"], label: "Restrooms", Icon: GlassWater },
  { key: ["cafe"], label: "Cafes", Icon: Coffee },
  { key: ["drinking_water"], label: "Water Fountains", Icon: Droplet },
  { key: ["viewpoint", "artwork", "historic", "bench"], label: "More", Icon: MoreHorizontal },
];

export function FilterChips({ enabled, onToggle }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-lg p-1 border border-slate-100 z-10 max-w-full overflow-x-auto">
      {CHIPS.map(({ key, label, Icon }) => {
        const isOn = key.some(k => enabled.has(k));
        return (
          <button
            key={label}
            onClick={() => key.forEach(k => onToggle(k))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${isOn ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-700"}`}
          >
            <Icon className="size-4" /> {label}
          </button>
        );
      })}
    </div>
  );
}
