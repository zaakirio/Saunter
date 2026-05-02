import { ArrowRight, ArrowUp, MapPin } from "lucide-react";
import type { RouteStep, RouteResponse } from "@/lib/route/types";

type Props = {
  route: RouteResponse;
  pointAName: string;
  pointBName: string;
  gmapsKey: string;
};

const ICON_FOR_MANEUVER: Record<string, typeof ArrowRight> = {
  depart: ArrowUp,
  arrive: MapPin,
  right: ArrowRight,
  left: ArrowRight,
  continue: ArrowUp,
  slight_right: ArrowRight,
  slight_left: ArrowRight,
  sharp_right: ArrowRight,
  sharp_left: ArrowRight,
};

function streetViewThumb([lng, lat]: [number, number], key: string): string {
  const params = new URLSearchParams({
    size: "120x80",
    location: `${lat},${lng}`,
    fov: "80",
    key,
  });
  return `https://maps.googleapis.com/maps/api/streetview?${params}`;
}

export function StepsList({ route, pointAName, pointBName, gmapsKey }: Props) {
  let cumulative = 0;
  return (
    <ol className="space-y-3 p-4 overflow-y-auto">
      <li className="flex gap-3">
        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center font-bold shrink-0">A</span>
        <div className="flex-1">
          <div className="font-medium">Start</div>
          <div className="text-sm text-muted-foreground">{pointAName}</div>
          <div className="text-xs text-emerald-600 mt-1">Start your walk</div>
        </div>
      </li>
      {route.steps.slice(0, -1).map((s, i) => {
        cumulative += s.distance;
        const Icon = ICON_FOR_MANEUVER[s.maneuver] ?? ArrowUp;
        const km = cumulative >= 1000 ? `${(cumulative / 1000).toFixed(1)} km` : `${Math.round(cumulative)} m`;
        return (
          <li key={i} className="flex gap-3">
            <span className="w-8 h-8 rounded-full border grid place-items-center shrink-0"><Icon className="size-4" /></span>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">{km}</div>
              <div className="font-medium text-sm">{s.instruction}</div>
              <div className="text-xs text-muted-foreground">{Math.round(s.duration / 60)} min</div>
            </div>
            <img
              src={streetViewThumb(s.thumbnailHint, gmapsKey)}
              alt=""
              className="w-20 h-16 rounded-lg object-cover shadow-sm"
              loading="lazy"
            />
          </li>
        );
      })}
      <li className="flex gap-3">
        <span className="w-8 h-8 rounded-full bg-red-500 text-white grid place-items-center font-bold shrink-0">B</span>
        <div className="flex-1">
          <div className="font-medium">Destination</div>
          <div className="text-sm text-muted-foreground">{pointBName}</div>
          <div className="text-xs text-red-600 mt-1">You've arrived!</div>
        </div>
      </li>
    </ol>
  );
}
