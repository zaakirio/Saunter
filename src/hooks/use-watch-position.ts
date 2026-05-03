"use client";
import { useEffect, useState } from "react";
import type { LngLat } from "@/lib/geo/distance";

type Result = {
  position: LngLat | null;
  error: string | null;
  available: boolean;
};

export function useWatchPosition(enabled: boolean): Result {
  const [position, setPosition] = useState<LngLat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) { setAvailable(false); return; }
    const id = navigator.geolocation.watchPosition(
      pos => { setError(null); setPosition([pos.coords.longitude, pos.coords.latitude]); },
      err => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { position, error, available };
}
