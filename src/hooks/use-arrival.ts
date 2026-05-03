"use client";
import { useEffect, useRef } from "react";
import { haversineMeters } from "@/lib/geo/distance";
import type { LngLat } from "@/lib/geo/distance";

const ARRIVAL_RADIUS_M = 20;

export function hasArrived(current: LngLat | null, dest: LngLat | null): boolean {
  if (!current || !dest) return false;
  return haversineMeters(current, dest) <= ARRIVAL_RADIUS_M;
}

/**
 * Fires `onArrive` exactly once when `current` first comes within 20m of `dest`.
 */
export function useArrival(current: LngLat | null, dest: LngLat | null, onArrive: () => void) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    if (hasArrived(current, dest)) {
      fired.current = true;
      onArrive();
    }
  }, [current, dest, onArrive]);
}
