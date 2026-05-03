"use client";
import { useEffect, useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play as PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RouteResponse } from "@/lib/route/types";
import type { LngLat } from "@/lib/geo/distance";
import type { GuidedMode } from "@/lib/street-view/types";
import { useStreetViewRoute } from "@/hooks/use-street-view-route";
import { useAutoAdvance } from "@/hooks/use-auto-advance";
import { haversineMeters } from "@/lib/geo/distance";
import { StreetViewPanorama } from "./street-view-panorama";
import { ModeToggle } from "./mode-toggle";
import { NextStepCard } from "./next-step-card";
import { Minimap } from "./minimap";

type Props = {
  route: RouteResponse;
  pointA: { name: string; location: { coordinates: LngLat } };
  pointB: { name: string; location: { coordinates: LngLat } };
  onExit: () => void;
};

export function GuidedWalkView({ route, pointA, pointB, onExit }: Props) {
  const [mode, setMode] = useState<GuidedMode>("click");
  const { ready, current, index, total, densified, advance, back, isAtEnd } =
    useStreetViewRoute(route.polyline);

  const auto = useAutoAdvance({
    enabled: mode === "auto" && !isAtEnd,
    onTick: advance,
  });

  // Find the next step (whose start is past the current densified point)
  const stepInfo = useMemo(() => {
    if (!current || !route.steps.length) return { step: null, distance: 0 };
    let cumDensifiedDist = 0;
    for (let i = 1; i <= index; i++) {
      cumDensifiedDist += haversineMeters(densified[i - 1], densified[i]);
    }
    let cumStepDist = 0;
    for (const s of route.steps) {
      const end = cumStepDist + s.distance;
      if (cumDensifiedDist <= end) {
        return { step: s, distance: end - cumDensifiedDist };
      }
      cumStepDist = end;
    }
    return { step: route.steps[route.steps.length - 1] ?? null, distance: 0 };
  }, [current, index, densified, route.steps]);

  // Click-mode: keyboard + tap controls
  useEffect(() => {
    if (mode !== "click") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); advance(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
      else if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, advance, back, onExit]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <StreetViewPanorama pano={current} />

      {/* Loading state until first pano resolves */}
      {!ready || !current ? (
        <div className="absolute inset-0 grid place-items-center text-white text-sm pointer-events-none">
          {ready ? "Resolving Street View…" : "Loading guided walk…"}
        </div>
      ) : null}

      {/* Top: exit + step counter */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <Button variant="secondary" size="sm" onClick={onExit} className="pointer-events-auto">
          <X className="size-4 mr-1" /> Exit
        </Button>
        <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs text-slate-700 pointer-events-auto">
          {index + 1} / {total}
        </div>
      </div>

      {/* Right: next step card */}
      <div className="absolute top-20 right-4 pointer-events-auto">
        <NextStepCard step={stepInfo.step} distanceMeters={stepInfo.distance} />
      </div>

      {/* Click-mode left/right tap zones */}
      {mode === "click" && (
        <>
          <button
            onClick={back}
            className="absolute left-0 top-20 bottom-32 w-1/4 grid place-items-start pl-4 pt-20 text-white/80 hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="size-10 drop-shadow-lg" />
          </button>
          <button
            onClick={advance}
            disabled={isAtEnd}
            className="absolute right-0 top-20 bottom-32 w-1/4 grid place-items-start pr-4 pt-20 ml-auto text-white/80 hover:text-white disabled:opacity-30"
            aria-label="Forward"
          >
            <ChevronRight className="size-10 drop-shadow-lg ml-auto" />
          </button>
        </>
      )}

      {/* Minimap inset */}
      <Minimap polyline={route.polyline} currentCoord={current?.routeCoord ?? null} />

      {/* Auto-mode play/pause button */}
      {mode === "auto" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={auto.toggle}
            className="bg-white rounded-full shadow-lg w-12 h-12 grid place-items-center hover:bg-slate-50"
            aria-label={auto.running ? "Pause" : "Resume"}
          >
            {auto.running ? <Pause className="size-5" /> : <PlayIcon className="size-5" />}
          </button>
        </div>
      )}

      {/* Bottom: mode toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <ModeToggle mode={mode} onChange={setMode} gpsAvailable={false /* enabled in Task 15 */} />
      </div>
    </div>
  );
}
