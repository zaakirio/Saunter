import { auth } from "@/lib/auth";
import { z } from "zod";
import { MongoClient, ObjectId } from "mongodb";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const prefsSchema = z.object({
  defaultMode: z.enum(["walk", "scenic", "accessible"]),
  units: z.enum(["metric", "imperial"]),
  routePrefs: z.object({
    preferFewerStairs: z.boolean(),
    scenicRoute: z.boolean(),
    avoidBusyRoads: z.boolean(),
  }),
});

const client = new MongoClient(env().MONGODB_URI);
const dbInst = client.db();

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const userDoc = await dbInst.collection("user").findOne({ _id: new ObjectId(session.user.id) });
  const prefs = userDoc?.preferences ? JSON.parse(userDoc.preferences) : null;
  return Response.json({ preferences: prefs });
}

export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  await dbInst.collection("user").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { preferences: JSON.stringify(parsed.data) } },
  );
  return Response.json({ preferences: parsed.data });
}
