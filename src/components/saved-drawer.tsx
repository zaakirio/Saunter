"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export type SavedRouteSummary = {
  _id: string;
  name?: string;
  pointA: { name: string };
  pointB: { name: string };
  distance: number;
  duration: number;
  createdAt: string;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (id: string) => void;
};

export function SavedDrawer({ open, onOpenChange, onSelect }: Props) {
  const [routes, setRoutes] = useState<SavedRouteSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/routes").then(r => r.json()).then(j => setRoutes(j.routes ?? [])).finally(() => setLoading(false));
  }, [open]);

  const remove = async (id: string) => {
    await fetch(`/api/routes/${id}`, { method: "DELETE" });
    setRoutes(prev => prev.filter(r => r._id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>Saved Routes</SheetTitle></SheetHeader>
        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">Loading...</div>
        ) : routes.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">No saved routes yet.</div>
        ) : (
          <ul className="mt-4 space-y-2">
            {routes.map(r => (
              <li key={r._id} className="border rounded p-3 hover:bg-muted/50">
                <button className="text-left w-full" onClick={() => onSelect(r._id)}>
                  <div className="font-medium">{r.name ?? `${r.pointA.name} → ${r.pointB.name}`}</div>
                  <div className="text-xs text-muted-foreground">
                    {(r.distance / 1000).toFixed(1)} km · {Math.round(r.duration / 60)} min
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={() => remove(r._id)} className="mt-2 text-destructive">
                  <Trash2 className="size-3 mr-1" /> Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
