"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, X } from "lucide-react";
import type { RouteResponse } from "@/lib/route/types";
import { StepsList } from "./steps-list";

type Props = {
  route: RouteResponse | null;
  pointAName: string;
  pointBName: string;
  gmapsKey: string;
  onClose: () => void;
  onStartGuided: () => void;
};

export function WalkPanel({ route, pointAName, pointBName, gmapsKey, onClose, onStartGuided }: Props) {
  if (!route) return null;
  const km = (route.distance / 1000).toFixed(1);
  const min = Math.round(route.duration / 60);
  const hours = Math.floor(min / 60);
  const remMin = min - hours * 60;

  return (
    <aside className="w-96 bg-white border-l flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-bold">Your Guided Walk</h2>
          <div className="text-sm text-muted-foreground">{km} km · {hours ? `${hours} hr ${remMin} min` : `${remMin} min`}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
      </div>
      <Tabs defaultValue="steps" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid grid-cols-2 w-auto">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="highlights">Tour Highlights</TabsTrigger>
        </TabsList>
        <TabsContent value="steps" className="flex-1 overflow-hidden mt-0">
          <StepsList route={route} pointAName={pointAName} pointBName={pointBName} gmapsKey={gmapsKey} />
        </TabsContent>
        <TabsContent value="highlights" className="flex-1 overflow-hidden mt-0">
          <div className="p-4 text-sm text-muted-foreground">Tour highlights will appear here once POIs load.</div>
        </TabsContent>
      </Tabs>
      <div className="p-4 border-t">
        <Button className="w-full" size="lg" onClick={onStartGuided}>
          <Play className="size-4 mr-2" /> Start Guided Walk
        </Button>
      </div>
    </aside>
  );
}
