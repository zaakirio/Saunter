import { env } from "@/lib/env";
import type { RouteRequest, RouteResponse, RouteStep } from "@/lib/route/types";

const GOOGLE_BASE = "https://maps.googleapis.com/maps/api/directions/json";

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push([lng / 1e5, lat / 1e5]);
  }
  return points;
}

const MANEUVER_MAP: Record<string, string> = {
  "turn-right": "right",
  "turn-left": "left",
  "turn-slight-right": "slight_right",
  "turn-slight-left": "slight_left",
  "turn-sharp-right": "sharp_right",
  "turn-sharp-left": "sharp_left",
  "uturn-right": "uturn",
  "uturn-left": "uturn",
  "fork-right": "slight_right",
  "fork-left": "slight_left",
  "ramp-right": "slight_right",
  "ramp-left": "slight_left",
  "roundabout-right": "roundabout",
  "roundabout-left": "roundabout",
  "merge": "continue",
  "straight": "continue",
  "depart": "depart",
  "arrive": "arrive",
};

export async function routeViaGoogleDirections(req: RouteRequest): Promise<RouteResponse> {
  const params = new URLSearchParams({
    origin: `${req.from[1]},${req.from[0]}`,
    destination: `${req.to[1]},${req.to[0]}`,
    mode: "walking",
    key: env().GOOGLE_PLACES_KEY, // shared GCP key
  });
  const res = await fetch(`${GOOGLE_BASE}?${params}`);
  if (!res.ok) throw new Error(`google directions failed: ${res.status}`);
  const data = await res.json() as {
    status: string;
    routes: Array<{
      overview_polyline: { points: string };
      legs: Array<{
        distance: { value: number };
        duration: { value: number };
        steps: Array<{
          distance: { value: number };
          duration: { value: number };
          html_instructions: string;
          maneuver?: string;
          polyline: { points: string };
        }>;
      }>;
    }>;
  };
  if (data.status !== "OK" || !data.routes.length) throw new Error(`no route: ${data.status}`);

  const route = data.routes[0];
  const polyline = decodePolyline(route.overview_polyline.points);
  const leg = route.legs[0];

  const steps: RouteStep[] = leg.steps.map(s => {
    const coords = decodePolyline(s.polyline.points);
    const mid = coords[Math.floor(coords.length / 2)] ?? coords[0];
    return {
      distance: s.distance.value,
      duration: s.duration.value,
      instruction: s.html_instructions.replace(/<[^>]+>/g, ""),
      maneuver: s.maneuver ? (MANEUVER_MAP[s.maneuver] ?? "continue") : "continue",
      coords,
      thumbnailHint: mid,
    };
  });

  return {
    polyline,
    distance: leg.distance.value,
    duration: leg.duration.value,
    elevationGain: 0, // not provided by Google Directions
    elevationProfile: [],
    steps,
  };
}
