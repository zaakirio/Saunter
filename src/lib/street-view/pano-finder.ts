import type { LngLat } from "@/lib/geo/distance";

export type PanoFinding = {
  panoId: string | null;
  panoCoord: LngLat | null;
};

/**
 * Resolve the nearest Street View pano for a coord within `radius` meters.
 * Returns `{panoId: null, panoCoord: null}` if no pano is found
 * (caller falls back to satellite for that segment).
 */
export function findPano(
  service: google.maps.StreetViewService,
  [lng, lat]: LngLat,
  radius: number,
): Promise<PanoFinding> {
  return new Promise(resolve => {
    service.getPanorama(
      { location: { lat, lng }, radius, source: google.maps.StreetViewSource.OUTDOOR },
      (data, status) => {
        if (status !== "OK" || !data?.location) {
          resolve({ panoId: null, panoCoord: null });
          return;
        }
        const pano = data.location.pano ?? null;
        const ll = data.location.latLng;
        const panoCoord: LngLat | null = ll ? [ll.lng(), ll.lat()] : null;
        resolve({ panoId: pano, panoCoord });
      },
    );
  });
}
