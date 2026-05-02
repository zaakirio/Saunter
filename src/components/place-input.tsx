"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export type Place = {
  id: string;
  name: string;
  location: { type: "Point"; coordinates: [number, number] };
};

type Props = {
  value: Place | null;
  onChange: (p: Place | null) => void;
  placeholder?: string;
  proximity?: [number, number];
  badge?: React.ReactNode;
};

export function PlaceInput({ value, onChange, placeholder, proximity, badge }: Props) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value?.name ?? ""); }, [value]);

  useEffect(() => {
    if (!query || query === value?.name) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const ctrl = new AbortController();
    debounceRef.current = setTimeout(async () => {
      try {
        const url = new URL("/api/geocode", window.location.origin);
        url.searchParams.set("q", query);
        if (proximity) url.searchParams.set("proximity", proximity.join(","));
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return;
        const json = await res.json();
        setResults(json.results);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // swallow other errors silently for v1
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      ctrl.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
        {badge}
        <input
          className="flex-1 outline-none bg-transparent"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setQuery(""); }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="clear"
          >×</button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-auto">
          {results.map(r => (
            <button
              key={r.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
              onClick={() => { onChange(r); setQuery(r.name); setOpen(false); }}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
