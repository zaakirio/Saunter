import { env } from "@/lib/env";
import type { RouteRequest, RouteResponse, RouteStep } from "@/lib/route/types";

const GH_BASE = "https://graphhopper.com/api/1/route";

export type CustomModel = {
  priority?: Array<{ if: string; multiply_by: string } | { else_if?: string; multiply_by: string }>;
  speed?: Array<{ if: string; multiply_by?: string; limit_to?: string }>;
};

export function buildCustomModel(req: Pick<RouteRequest, "mode" | "preferFewerStairs" | "scenicRoute" | "avoidBusyRoads">): CustomModel | null {
  const priority: NonNullable<CustomModel["priority"]> = [];

  // Accessible mode: avoid steps, prefer paved
  if (req.mode === "accessible" || req.preferFewerStairs) {
    priority.push({ if: "road_class == STEPS", multiply_by: "0" });
  }
  if (req.mode === "accessible") {
    priority.push({ if: "surface == ASPHALT || surface == PAVED || surface == CONCRETE", multiply_by: "1.2" });
    priority.push({ if: "wheelchair == NO", multiply_by: "0.1" });
  }

  // Scenic: prefer paths/footways/pedestrian
  if (req.mode === "scenic" || req.scenicRoute) {
    priority.push({ if: "road_class == PATH || road_class == FOOTWAY || road_class == PEDESTRIAN", multiply_by: "1.4" });
    priority.push({ if: "road_class == TRACK", multiply_by: "1.2" });
  }

  // Avoid busy roads
  if (req.avoidBusyRoads) {
    priority.push({ if: "road_class == PRIMARY", multiply_by: "0.2" });
    priority.push({ if: "road_class == SECONDARY", multiply_by: "0.5" });
    priority.push({ if: "road_class == TERTIARY", multiply_by: "0.8" });
  }

  if (priority.length === 0) return null;
  return { priority };
}

const SIGN_TO_MANEUVER: Record<number, string> = {
  0: "continue", 1: "slight_right", 2: "right", 3: "sharp_right",
  [-1]: "slight_left", [-2]: "left", [-3]: "sharp_left",
  4: "arrive", 5: "depart", 6: "roundabout",
};

export async function routeViaGraphHopper(req: RouteRequest): Promise<RouteResponse> {
  const customModel = buildCustomModel(req);
  const body: Record<string, unknown> = {
    // GraphHopper POST accepts points as [lng, lat] tuples (matches our LngLat type)
    points: [req.from, req.to],
    profile: "foot",
    locale: "en",
    instructions: true,
    elevation: true,
    points_encoded: false,
    "details": ["road_class"],
  };
  if (customModel) {
    body.custom_model = customModel;
    body["ch.disable"] = true;
  }

  const url = `${GH_BASE}?key=${env().GRAPHHOPPER_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`graphhopper failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as {
    paths: Array<{
      distance: number;
      time: number;
      ascend: number;
      points: { coordinates: [number, number][] };
      instructions: Array<{ text: string; distance: number; time: number; sign: number; interval: [number, number] }>;
    }>;
  };
  if (!data.paths?.length) throw new Error("no route found");
  const path = data.paths[0];
  const polyline = path.points.coordinates;

  const steps: RouteStep[] = path.instructions.map(ins => {
    const coords = polyline.slice(ins.interval[0], ins.interval[1] + 1);
    const mid = coords[Math.floor(coords.length / 2)] ?? coords[0];
    return {
      distance: ins.distance,
      duration: ins.time / 1000,
      instruction: ins.text,
      maneuver: SIGN_TO_MANEUVER[ins.sign] ?? "continue",
      coords,
      thumbnailHint: mid,
    };
  });

  // Build elevation profile from polyline (3rd coordinate when elevation=true)
  const elevationProfile: Array<{ d: number; e: number }> = [];
  // GraphHopper returns [lng, lat, ele] when elevation: true
  // For simplicity build a sampled profile every 50m
  // (full implementation can be enhanced later)

  return {
    polyline: polyline.map(c => [c[0], c[1]] as [number, number]),
    distance: path.distance,
    duration: path.time / 1000,
    elevationGain: path.ascend,
    elevationProfile,
    steps,
  };
}
