"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PersonStanding, Mountain, Accessibility, ArrowDownUp } from "lucide-react";
import { PlaceInput, type Place } from "@/components/place-input";
import type { TravelMode, RouteRequest } from "@/lib/route/types";

type Prefs = {
  preferFewerStairs: boolean;
  scenicRoute: boolean;
  avoidBusyRoads: boolean;
};

type Props = {
  pointA: Place | null;
  pointB: Place | null;
  onPointA: (p: Place | null) => void;
  onPointB: (p: Place | null) => void;
  onSwap: () => void;
  mode: TravelMode;
  onMode: (m: TravelMode) => void;
  prefs: Prefs;
  onPrefs: (p: Prefs) => void;
  onSearch: () => void;
  loading: boolean;
};

const ABadge = () => <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs grid place-items-center font-bold">A</span>;
const BBadge = () => <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs grid place-items-center font-bold">B</span>;

export function PlanPanel({ pointA, pointB, onPointA, onPointB, onSwap, mode, onMode, prefs, onPrefs, onSearch, loading }: Props) {
  return (
    <aside className="w-80 bg-white border-r p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-bold">Plan Your Walk</h2>

      <div className="space-y-2">
        <Label>From (Point A)</Label>
        <PlaceInput value={pointA} onChange={onPointA} placeholder="Origin" badge={<ABadge />} />
        <div className="flex justify-center"><Button variant="ghost" size="icon" onClick={onSwap}><ArrowDownUp className="size-4" /></Button></div>
        <Label>To (Point B)</Label>
        <PlaceInput value={pointB} onChange={onPointB} placeholder="Destination" badge={<BBadge />} />
      </div>

      <div className="space-y-2">
        <Label>Travel Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["walk", "Walk", PersonStanding],
            ["scenic", "Scenic", Mountain],
            ["accessible", "Accessible", Accessibility],
          ] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => onMode(m)}
              className={`px-2 py-2 rounded-md border text-xs flex flex-col items-center gap-1 ${mode === m ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white"}`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Route Preferences</Label>
        {([
          ["preferFewerStairs", "Prefer fewer stairs"],
          ["scenicRoute", "Scenic route"],
          ["avoidBusyRoads", "Avoid busy roads"],
        ] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs[k]}
              onChange={e => onPrefs({ ...prefs, [k]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <Button className="w-full" onClick={onSearch} disabled={loading || !pointA || !pointB}>
        {loading ? "Searching..." : "Search Route"}
      </Button>
    </aside>
  );
}
