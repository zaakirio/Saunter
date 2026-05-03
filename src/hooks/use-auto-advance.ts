"use client";
import { useEffect, useState } from "react";

type Options = { enabled: boolean; intervalMs?: number; onTick: () => void };

/**
 * Tick `onTick` every `intervalMs` while `enabled` is true.
 * Exposes pause/resume via the returned `running` flag.
 */
export function useAutoAdvance({ enabled, intervalMs = 1500, onTick }: Options) {
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!enabled || !running) return;
    const id = setInterval(onTick, intervalMs);
    return () => clearInterval(id);
  }, [enabled, running, intervalMs, onTick]);

  return { running, pause: () => setRunning(false), resume: () => setRunning(true), toggle: () => setRunning(r => !r) };
}
