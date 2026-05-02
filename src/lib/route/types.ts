import type { LngLat } from "@/lib/geo/distance";

export type TravelMode = "walk" | "scenic" | "accessible";

export type RouteRequest = {
  from: LngLat;
  to: LngLat;
  mode: TravelMode;
  preferFewerStairs: boolean;
  scenicRoute: boolean;
  avoidBusyRoads: boolean;
};

export type RouteStep = {
  distance: number;        // meters from start of step
  duration: number;        // seconds
  instruction: string;
  maneuver: string;        // "depart" | "left" | "right" | "arrive" | etc
  coords: LngLat[];
  thumbnailHint: LngLat;
};

export type RouteResponse = {
  polyline: LngLat[];
  distance: number;
  duration: number;
  elevationGain: number;
  elevationProfile: Array<{ d: number; e: number }>;
  steps: RouteStep[];
};
