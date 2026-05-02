"use client";
import { useCallback, useState } from "react";
import type { RouteRequest, RouteResponse } from "@/lib/route/types";

export function useRoute() {
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  const search = useCallback(async (req: RouteRequest) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "route failed");
      setFallback(res.headers.get("x-route-fallback") === "google");
      const data = (await res.json()) as RouteResponse;
      setRoute(data);
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally { setLoading(false); }
  }, []);

  const clear = useCallback(() => { setRoute(null); setError(null); setFallback(false); }, []);

  return { route, loading, error, fallback, search, clear };
}
