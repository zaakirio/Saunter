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
import { usePois } from "@/hooks/use-pois";
import { FilterChips } from "@/components/filter-chips";
import { PoiMarkers } from "@/components/map/poi-markers";
import type { POIType } from "@/lib/poi/types";
import type { POI } from "@/lib/poi/types";
import { SavedDrawer } from "@/components/saved-drawer";
import { HistoryDrawer } from "@/components/history-drawer";
import { WeatherWidget } from "@/components/weather-widget";
import { GuidedWalkView } from "@/components/guided-walk/guided-walk-view";

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

  const [savedOpen, setSavedOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedThisRoute, setSavedThisRoute] = useState(false);
  const [walkActive, setWalkActive] = useState(false);

  const handleSave = async () => {
    if (!route || !pointA || !pointB) return;
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: `${pointA.name} → ${pointB.name}`,
        pointA: { name: pointA.name, location: pointA.location },
        pointB: { name: pointB.name, location: pointB.location },
        mode,
        preferences: prefs,
        polyline: route.polyline,
        steps: route.steps,
        distance: route.distance,
        duration: route.duration,
        elevationGain: route.elevationGain,
        elevationProfile: route.elevationProfile,
      }),
    });
    if (res.ok) setSavedThisRoute(true);
    else if (res.status === 401) {
      if (confirm("Sign in with Google to save routes?")) {
        const { signIn } = await import("@/lib/auth-client");
        signIn.social({ provider: "google" });
      }
    }
  };

  const handleLoadSaved = async (id: string) => {
    const res = await fetch(`/api/routes/${id}`);
    if (!res.ok) return;
    const { route: saved } = await res.json();
    setPointA({ id: "saved-a", name: saved.pointA.name, location: saved.pointA.location });
    setPointB({ id: "saved-b", name: saved.pointB.name, location: saved.pointB.location });
    setMode(saved.mode);
    setPrefs(saved.preferences);
    setSavedOpen(false);
    // re-search to populate the route hook (simpler than hydrating directly)
    search({
      from: saved.pointA.location.coordinates,
      to: saved.pointB.location.coordinates,
      mode: saved.mode,
      ...saved.preferences,
    });
  };

  const [poiTypes, setPoiTypes] = useState<Set<POIType>>(new Set(["tourist_attraction", "museum", "cafe"]));
  const togglePoiType = (t: POIType) =>
    setPoiTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const { pois } = usePois(route?.polyline ?? null, [...poiTypes]);

  const weatherCenter = pointA?.location.coordinates ?? position ?? null;

  const handleSelectPoi = (p: POI) => {
    if (map) map.flyTo({ center: p.location.coordinates, zoom: 16, duration: 600 });
  };

  useEffect(() => {
    if (!pointA && position) {
      setPointA({
        id: "current",
        name: "Current location",
        location: { type: "Point", coordinates: position },
      });
    }
  }, [position, pointA]);

  useEffect(() => { setSavedThisRoute(false); }, [route]);

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
        onSavedClick={() => setSavedOpen(true)}
        onHistoryClick={() => setHistoryOpen(true)}
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
              <RouteSummary route={route} onSave={handleSave} saved={savedThisRoute} />
            </div>
          )}
          <FilterChips enabled={poiTypes} onToggle={togglePoiType} />
          <WeatherWidget position={weatherCenter} />
          <PoiMarkers map={map} pois={pois} onClick={handleSelectPoi} />
        </div>
        {route && (
          <WalkPanel
            route={route}
            pointAName={pointA?.name ?? ""}
            pointBName={pointB?.name ?? ""}
            gmapsKey={process.env.NEXT_PUBLIC_GMAPS_KEY ?? ""}
            onClose={clear}
            onStartGuided={() => setWalkActive(true)}
            pois={pois}
            onSelectHighlight={handleSelectPoi}
          />
        )}
      </div>
      <SavedDrawer open={savedOpen} onOpenChange={setSavedOpen} onSelect={handleLoadSaved} />
      <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} />
      {walkActive && route && pointA && pointB && (
        <GuidedWalkView
          route={route}
          pois={pois}
          pointA={pointA}
          pointB={pointB}
          onExit={() => setWalkActive(false)}
        />
      )}
    </div>
  );
}
