import type { POI } from "@/lib/poi/types";
import { haversineMeters } from "@/lib/geo/distance";

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i - 1] === b[j - 1]
      ? dp[i - 1][j - 1]
      : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
  return dp[m][n];
}

function nameSimilar(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const d = levenshtein(x, y);
  return d <= Math.max(2, Math.floor(Math.min(x.length, y.length) * 0.2));
}

export function mergePois(pois: POI[]): POI[] {
  const out: POI[] = [];
  for (const p of pois) {
    const dupIdx = out.findIndex(q =>
      haversineMeters(p.location.coordinates, q.location.coordinates) <= 30 &&
      nameSimilar(p.name, q.name),
    );
    if (dupIdx === -1) { out.push(p); continue; }
    // prefer google (richer photos/ratings)
    const existing = out[dupIdx];
    if (p.source === "google" && existing.source !== "google") out[dupIdx] = p;
    else if (existing.source === "google" && !existing.photoUrl && p.photoUrl) out[dupIdx] = { ...existing, photoUrl: p.photoUrl };
  }
  return out;
}
