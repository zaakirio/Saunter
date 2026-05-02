"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Prefs = {
  defaultMode: "walk" | "scenic" | "accessible";
  units: "metric" | "imperial";
  routePrefs: {
    preferFewerStairs: boolean;
    scenicRoute: boolean;
    avoidBusyRoads: boolean;
  };
};

const DEFAULT: Prefs = {
  defaultMode: "walk",
  units: "metric",
  routePrefs: { preferFewerStairs: false, scenicRoute: false, avoidBusyRoads: false },
};

export default function PreferencesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetch("/api/preferences").then(r => r.json()).then(j => {
      if (j.preferences) setPrefs(j.preferences);
    });
  }, []);

  const save = async () => {
    setSaved(false);
    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(prefs),
    });
    if (res.ok) setSaved(true);
  };

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Preferences</h1>

      <section className="space-y-2">
        <Label>Default travel mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["walk", "scenic", "accessible"] as const).map(m => (
            <button key={m} onClick={() => setPrefs({ ...prefs, defaultMode: m })}
              className={`px-3 py-2 rounded border ${prefs.defaultMode === m ? "bg-blue-50 border-blue-500" : ""}`}>
              {m}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Label>Units</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["metric", "imperial"] as const).map(u => (
            <button key={u} onClick={() => setPrefs({ ...prefs, units: u })}
              className={`px-3 py-2 rounded border ${prefs.units === u ? "bg-blue-50 border-blue-500" : ""}`}>
              {u}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Label>Default route preferences</Label>
        {([
          ["preferFewerStairs", "Prefer fewer stairs"],
          ["scenicRoute", "Scenic route"],
          ["avoidBusyRoads", "Avoid busy roads"],
        ] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.routePrefs[k]}
              onChange={e => setPrefs({ ...prefs, routePrefs: { ...prefs.routePrefs, [k]: e.target.checked } })}
            />
            {label}
          </label>
        ))}
      </section>

      <Button onClick={save}>Save preferences</Button>
      {saved && <span className="text-emerald-600 text-sm ml-3">Saved ✓</span>}
    </main>
  );
}
