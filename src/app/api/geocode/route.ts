import { NextRequest } from "next/server";
import { geocode } from "@/lib/geocode/mapbox";

export const runtime = "nodejs";

export async function GET(req: NextRequest | Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q) return Response.json({ error: "missing q" }, { status: 400 });

  const proxParam = url.searchParams.get("proximity");
  const proximity = proxParam
    ? (proxParam.split(",").map(Number) as [number, number])
    : undefined;

  try {
    const results = await geocode(q, { proximity });
    return Response.json({ results });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
