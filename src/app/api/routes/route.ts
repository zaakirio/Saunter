import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSavedRouteModel } from "@/lib/models/saved-route";

export const runtime = "nodejs";

async function userId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user.id ?? null;
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  pointA: z.object({ name: z.string(), location: z.object({
    type: z.literal("Point"), coordinates: z.tuple([z.number(), z.number()]),
  })}),
  pointB: z.object({ name: z.string(), location: z.object({
    type: z.literal("Point"), coordinates: z.tuple([z.number(), z.number()]),
  })}),
  mode: z.enum(["walk", "scenic", "accessible"]),
  preferences: z.object({
    preferFewerStairs: z.boolean(),
    scenicRoute: z.boolean(),
    avoidBusyRoads: z.boolean(),
  }),
  polyline: z.array(z.tuple([z.number(), z.number()])),
  steps: z.array(z.any()),
  distance: z.number(),
  duration: z.number(),
  elevationGain: z.number(),
  elevationProfile: z.array(z.object({ d: z.number(), e: z.number() })),
});

export async function GET(req: Request) {
  const uid = await userId(req);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });
  const Model = await getSavedRouteModel();
  const routes = await Model.find({ userId: uid }).sort({ createdAt: -1 }).limit(100).lean();
  return Response.json({ routes });
}

export async function POST(req: Request) {
  const uid = await userId(req);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });

  const Model = await getSavedRouteModel();
  const doc = await Model.create({ userId: uid, ...parsed.data });
  return Response.json({ route: doc.toObject() }, { status: 201 });
}
