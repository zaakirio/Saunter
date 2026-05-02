"use client";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { RouteResponse } from "@/lib/route/types";

type Props = { route: RouteResponse | null };

export function ElevationChart({ route }: Props) {
  if (!route || route.elevationProfile.length === 0) return null;
  const data = route.elevationProfile.map(p => ({
    x: (p.d / 1000).toFixed(1),
    e: Math.round(p.e),
  }));

  return (
    <div className="bg-white border rounded-md p-3 absolute bottom-4 left-4 w-72 shadow-lg z-10">
      <h4 className="text-xs font-medium mb-2">Elevation Profile</h4>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="elev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tick={{ fontSize: 10 }} unit=" km" interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} unit=" m" width={36} />
          <Area dataKey="e" stroke="#3b82f6" fill="url(#elev)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
