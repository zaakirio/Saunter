"use client";
import { useEffect, useState } from "react";
import { fetchWeather, type Weather } from "@/lib/weather";

type Props = { position: [number, number] | null };

export function WeatherWidget({ position }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    if (!position) return;
    const ctrl = new AbortController();
    fetchWeather(position, ctrl.signal)
      .then(setWeather)
      .catch(err => {
        if ((err as Error).name !== "AbortError") setWeather(null);
      });
    return () => ctrl.abort();
  }, [position?.[0], position?.[1]]);

  if (!weather) return null;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium z-10">
      <span className="text-base leading-none">{weather.emoji}</span>
      <span>{weather.tempC}°C</span>
    </div>
  );
}
