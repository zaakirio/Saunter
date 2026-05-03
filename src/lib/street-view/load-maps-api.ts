"use client";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let loaderPromise: Promise<void> | null = null;
let configured = false;

/**
 * Load the Google Maps JS API exactly once per page lifetime.
 * Subsequent calls return the cached promise.
 *
 * On resolve, the global `google.maps.*` namespace is fully available.
 * Callers should use `new google.maps.StreetViewService()` etc. after awaiting.
 *
 * Throws if `NEXT_PUBLIC_GMAPS_KEY` is missing.
 */
export function loadMapsApi(): Promise<void> {
  if (loaderPromise) return loaderPromise;
  const apiKey = process.env.NEXT_PUBLIC_GMAPS_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GMAPS_KEY missing"));
  }
  if (!configured) {
    setOptions({ key: apiKey, v: "weekly" });
    configured = true;
  }
  loaderPromise = (async () => {
    await importLibrary("streetView");
  })();
  return loaderPromise;
}
