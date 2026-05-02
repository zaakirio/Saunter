import { z } from "zod";
import { routeViaGraphHopper } from "@/lib/route/graphhopper";
import { routeViaGoogleDirections } from "@/lib/route/google-directions";
import type { RouteRequest } from "@/lib/route/types";

export const runtime = "nodejs";

const reqSchema = z.object({
  from: z.tuple([z.number(), z.number()]),
  to: z.tuple([z.number(), z.number()]),
  mode: z.enum(["walk", "scenic", "accessible"]),
  preferFewerStairs: z.boolean(),
  scenicRoute: z.boolean(),
  avoidBusyRoads: z.boolean(),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const routeReq = parsed.data as RouteRequest;

  try {
    const route = await routeViaGraphHopper(routeReq);
    return Response.json(route);
  } catch (ghErr) {
    try {
      const route = await routeViaGoogleDirections(routeReq);
      return Response.json(route, { headers: { "x-route-fallback": "google" } });
    } catch (gErr) {
      return Response.json({
        error: "routing failed",
        graphhopper: (ghErr as Error).message,
        google: (gErr as Error).message,
      }, { status: 502 });
    }
  }
}
