"use client";
import { ArrowRight, ArrowUp, MapPin } from "lucide-react";
import type { RouteStep } from "@/lib/route/types";

type Props = {
  step: RouteStep | null;
  distanceMeters: number;
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
  uturn: ArrowRight,
  roundabout: ArrowRight,
};

export function NextStepCard({ step, distanceMeters }: Props) {
  if (!step) return null;
  const Icon = ICON_FOR_MANEUVER[step.maneuver] ?? ArrowUp;
  const distLabel =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)} km`
      : `${Math.round(distanceMeters)} m`;
  return (
    <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 flex items-center gap-3 max-w-sm">
      <div className="w-10 h-10 rounded-full bg-blue-500 grid place-items-center text-white shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{distLabel}</div>
        <div className="font-medium text-sm truncate">{step.instruction}</div>
      </div>
    </div>
  );
}
