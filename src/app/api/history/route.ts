import { auth } from "@/lib/auth";
import { getHistoryModel } from "@/lib/models/history";
import { z } from "zod";

export const runtime = "nodejs";

const createSchema = z.object({
  routeId: z.string().nullable(),
  routeSnapshot: z.unknown().optional(),
  modeUsed: z.enum(["click", "auto", "gps", "plan-only"]),
  completed: z.boolean(),
});

async function userId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user.id ?? null;
}

export async function GET(req: Request) {
  const uid = await userId(req);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });
  const Model = await getHistoryModel();
  const history = await Model.find({ userId: uid }).sort({ walkedAt: -1 }).limit(50).lean();
  return Response.json({ history });
}

export async function POST(req: Request) {
  const uid = await userId(req);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const Model = await getHistoryModel();
  const doc = await Model.create({ userId: uid, ...parsed.data });
  return Response.json({ entry: doc.toObject() }, { status: 201 });
}
