"use client";
import { MousePointerClick, Play, Navigation } from "lucide-react";
import type { GuidedMode } from "@/lib/street-view/types";

type Props = {
  mode: GuidedMode;
  onChange: (m: GuidedMode) => void;
  gpsAvailable: boolean;
};

const ITEMS: Array<{ key: GuidedMode; label: string; Icon: typeof Play }> = [
  { key: "click", label: "Click", Icon: MousePointerClick },
  { key: "auto", label: "Auto", Icon: Play },
  { key: "gps", label: "GPS", Icon: Navigation },
];

export function ModeToggle({ mode, onChange, gpsAvailable }: Props) {
  return (
    <div className="flex items-center bg-white/95 backdrop-blur rounded-full shadow-lg p-1 border border-slate-100">
      {ITEMS.map(({ key, label, Icon }) => {
        const isActive = mode === key;
        const disabled = key === "gps" && !gpsAvailable;
        return (
          <button
            key={key}
            onClick={() => !disabled && onChange(key)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition
              ${isActive ? "bg-blue-500 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}
              ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            title={disabled ? "Geolocation unavailable" : ""}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
