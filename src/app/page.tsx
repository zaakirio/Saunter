"use client";
import { useEffect, useState } from "react";
import type { Map as MLMap } from "maplibre-gl";
import { Header } from "@/components/header";
import { PlanPanel } from "@/components/plan-panel";
import { RouteSummary } from "@/components/route-summary";
import { ElevationChart } from "@/components/elevation-chart";
import { WalkPanel } from "@/components/walk-panel";
import { Map } from "@/components/map/map";
import { RouteLayer } from "@/components/map/route-layer";
import { ABMarkers } from "@/components/map/ab-markers";
import { useRoute } from "@/hooks/use-route";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { Place } from "@/components/place-input";
import type { TravelMode } from "@/lib/route/types";

export default function HomePage() {
  const [map, setMap] = useState<MLMap | null>(null);
  const [pointA, setPointA] = useState<Place | null>(null);
  const [pointB, setPointB] = useState<Place | null>(null);
  const [mode, setMode] = useState<TravelMode>("walk");
  const [prefs, setPrefs] = useState({
    preferFewerStairs: false,
    scenicRoute: false,
    avoidBusyRoads: false,
  });
  const { route, loading, search, clear } = useRoute();
  const { position } = useGeolocation();
  const [topQuery, setTopQuery] = useState("");

  useEffect(() => {
    if (!pointA && position) {
      setPointA({
        id: "current",
        name: "Current location",
        location: { type: "Point", coordinates: position },
      });
    }
  }, [position, pointA]);

  const handleSearch = async () => {
    if (!pointA || !pointB) return;
    await search({
      from: pointA.location.coordinates,
      to: pointB.location.coordinates,
      mode,
      ...prefs,
    });
  };

  const handleSwap = () => {
    setPointA(pointB);
    setPointB(pointA);
  };

  const handleTopSearch = async () => {
    if (!topQuery) return;
    const url = new URL("/api/geocode", window.location.origin);
    url.searchParams.set("q", topQuery);
    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json();
    if (json.results[0]) setPointB(json.results[0]);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        searchQuery={topQuery}
        onSearchChange={setTopQuery}
        onSearchSubmit={handleTopSearch}
        onSavedClick={() => { /* wired in Task 39 */ }}
        onHistoryClick={() => { /* wired in Task 40 */ }}
      />
      <div className="flex-1 flex overflow-hidden">
        <PlanPanel
          pointA={pointA}
          pointB={pointB}
          onPointA={setPointA}
          onPointB={setPointB}
          onSwap={handleSwap}
          mode={mode}
          onMode={setMode}
          prefs={prefs}
          onPrefs={setPrefs}
          onSearch={handleSearch}
          loading={loading}
        />
        <div className="flex-1 relative">
          <Map onMapReady={setMap} />
          <RouteLayer map={map} polyline={route?.polyline ?? null} />
          <ABMarkers
            map={map}
            pointA={pointA?.location.coordinates ?? null}
            pointB={pointB?.location.coordinates ?? null}
          />
          <ElevationChart route={route} />
          {route && (
            <div className="absolute top-20 left-4 w-72 z-10">
              <RouteSummary route={route} onSave={() => { /* Task 41 */ }} saved={false} />
            </div>
          )}
        </div>
        {route && (
          <WalkPanel
            route={route}
            pointAName={pointA?.name ?? ""}
            pointBName={pointB?.name ?? ""}
            gmapsKey={process.env.NEXT_PUBLIC_GMAPS_KEY ?? ""}
            onClose={clear}
            onStartGuided={() => { /* Plan 2 */ }}
          />
        )}
      </div>
    </div>
  );
}
