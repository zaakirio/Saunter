const WMO_TO_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "🌨️",
  77: "🌨️",
  80: "🌧️", 81: "🌧️", 82: "🌧️",
  85: "🌨️", 86: "🌨️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

export type Weather = { tempC: number; emoji: string };

export async function fetchWeather([lng, lat]: [number, number], signal?: AbortSignal): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const data = await res.json() as { current: { temperature_2m: number; weather_code: number } };
  return {
    tempC: Math.round(data.current.temperature_2m),
    emoji: WMO_TO_EMOJI[data.current.weather_code] ?? "🌡️",
  };
}
