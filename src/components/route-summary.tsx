import { Heart, Footprints, Clock, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RouteResponse } from "@/lib/route/types";

type Props = {
  route: RouteResponse | null;
  onSave: () => void;
  saved: boolean;
};

export function RouteSummary({ route, onSave, saved }: Props) {
  if (!route) return null;
  const km = (route.distance / 1000).toFixed(1);
  const min = Math.round(route.duration / 60);
  const hours = Math.floor(min / 60);
  const remMin = min - hours * 60;
  const cal = Math.round(route.distance * 0.05); // rough: 50 cal/km walking

  const Row = ({ Icon, label, value }: { Icon: typeof Footprints; label: string; value: string }) => (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <div className="bg-white border rounded-md p-4 space-y-3">
      <h3 className="font-semibold">Route Summary</h3>
      <Row Icon={Footprints} label="Distance" value={`${km} km`} />
      <Row Icon={Clock} label="Estimated Time" value={hours ? `${hours} hr ${remMin} min` : `${remMin} min`} />
      <Row Icon={TrendingUp} label="Elevation Gain" value={`${Math.round(route.elevationGain)} m`} />
      <Row Icon={Flame} label="Calories (est.)" value={`${cal} Cal`} />
      <Button variant="outline" className="w-full" onClick={onSave}>
        <Heart className={`size-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
        {saved ? "Saved" : "Save Route"}
      </Button>
    </div>
  );
}
