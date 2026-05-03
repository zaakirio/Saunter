"use client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  destinationName: string;
  durationMin: number;
  distanceKm: number;
  onClose: () => void;
};

export function ArrivalScreen({ destinationName, durationMin, distanceKm, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-4">
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold mb-1">You've arrived!</h2>
        <p className="text-slate-600 mb-6">{destinationName}</p>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Distance</div>
            <div className="font-semibold">{distanceKm.toFixed(1)} km</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Time</div>
            <div className="font-semibold">{durationMin} min</div>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
