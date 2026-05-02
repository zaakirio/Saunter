"use client";
import { useEffect, useState } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setError("not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => setPosition([pos.coords.longitude, pos.coords.latitude]),
      err => setError(err.message),
      { timeout: 5000 },
    );
  }, []);

  return { position, error };
}
