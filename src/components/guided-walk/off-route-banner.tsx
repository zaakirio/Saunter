"use client";
import { AlertTriangle } from "lucide-react";

type Props = { onRecenter: () => void };

export function OffRouteBanner({ onRecenter }: Props) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-300 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-md">
      <AlertTriangle className="size-5 text-amber-600 shrink-0" />
      <div className="text-sm">
        <div className="font-medium text-amber-900">You've drifted off route</div>
        <div className="text-amber-700">Get within 50m of the route to continue, or recenter.</div>
      </div>
      <button
        onClick={onRecenter}
        className="ml-auto bg-amber-600 text-white text-sm rounded-md px-3 py-1.5 hover:bg-amber-700 shrink-0"
      >
        Recenter
      </button>
    </div>
  );
}
