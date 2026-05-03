"use client";
import { useEffect, useRef } from "react";
import { loadMapsApi } from "@/lib/street-view/load-maps-api";
import type { ResolvedPano } from "@/lib/street-view/types";

type Props = {
  pano: ResolvedPano | null;
};

export function StreetViewPanorama({ pano }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMapsApi().then(() => {
      if (cancelled || !containerRef.current || panoRef.current) return;
      panoRef.current = new google.maps.StreetViewPanorama(containerRef.current, {
        visible: false,
        addressControl: false,
        fullscreenControl: false,
        motionTrackingControl: false,
        showRoadLabels: false,
        zoomControl: true,
        linksControl: false,
        panControl: false,
        clickToGo: false,
      });
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const p = panoRef.current;
    if (!p) return;
    if (!pano || !pano.panoId) {
      p.setVisible(false);
      return;
    }
    p.setPano(pano.panoId);
    p.setPov({ heading: pano.heading, pitch: 0 });
    p.setVisible(true);
  }, [pano]);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" />
      {pano && !pano.panoId && (
        <div className="absolute inset-0 grid place-items-center bg-slate-900 text-white">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-3">🗺️</div>
            <div className="font-medium">No Street View here</div>
            <div className="text-sm text-slate-300 mt-1">
              We'll continue along the route. Use forward to skip past this section.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
