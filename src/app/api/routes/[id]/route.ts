import { auth } from "@/lib/auth";
import { getSavedRouteModel } from "@/lib/models/saved-route";

export const runtime = "nodejs";

async function userId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user.id ?? null;
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const uid = await userId(req);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const Model = await getSavedRouteModel();
  const route = await Model.findOne({ _id: id, userId: uid }).lean();
  if (!route) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ route });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const uid = await userId(req);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const Model = await getSavedRouteModel();
  const result = await Model.deleteOne({ _id: id, userId: uid });
  if (result.deletedCount === 0) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
}
