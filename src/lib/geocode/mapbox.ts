import { env } from "@/lib/env";

export type GeocodeResult = {
  id: string;
  name: string;
  location: { type: "Point"; coordinates: [number, number] };
};

export async function geocode(query: string, opts: { limit?: number; proximity?: [number, number] } = {}): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    access_token: env().MAPBOX_KEY,
    limit: String(opts.limit ?? 5),
    autocomplete: "true",
  });
  if (opts.proximity) {
    params.set("proximity", `${opts.proximity[0]},${opts.proximity[1]}`);
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`mapbox geocoding failed: ${res.status}`);
  const json = await res.json() as { features: Array<{ id: string; place_name: string; center: [number, number] }> };
  return json.features.map(f => ({
    id: f.id,
    name: f.place_name,
    location: { type: "Point", coordinates: f.center },
  }));
}
