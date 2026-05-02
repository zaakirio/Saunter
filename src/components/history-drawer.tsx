"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Circle } from "lucide-react";

type HistoryEntry = {
  _id: string;
  walkedAt: string;
  completed: boolean;
  modeUsed: string;
  routeSnapshot?: { pointA?: { name: string }; pointB?: { name: string } };
};

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export function HistoryDrawer({ open, onOpenChange }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/history").then(r => r.json()).then(j => setEntries(j.history ?? []));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>History</SheetTitle></SheetHeader>
        {entries.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">No walks yet.</div>
        ) : (
          <ul className="mt-4 space-y-2">
            {entries.map(e => (
              <li key={e._id} className="border rounded p-3">
                <div className="flex items-center gap-2">
                  {e.completed ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-4 text-muted-foreground" />}
                  <span className="font-medium">
                    {e.routeSnapshot?.pointA?.name ?? "?"} → {e.routeSnapshot?.pointB?.name ?? "?"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(e.walkedAt).toLocaleString()} · {e.modeUsed}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
