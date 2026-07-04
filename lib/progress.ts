"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "vim-dojo-progress-v1";

export interface ChallengeProgress {
  stars: number;
  bestKeys: number;
}

export type Progress = Record<string, ChallengeProgress>;

export function starsFor(used: number, par: number): number {
  if (used <= par) return 3;
  if (used <= par * 2) return 2;
  return 1;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress(JSON.parse(raw) as Progress);
    } catch {
      // corrupted storage — start fresh
    }
    setLoaded(true);
  }, []);

  const record = useCallback((id: string, stars: number, keys: number) => {
    setProgress((p) => {
      const prev = p[id];
      const next: Progress = {
        ...p,
        [id]: {
          stars: Math.max(prev?.stars ?? 0, stars),
          bestKeys: prev ? Math.min(prev.bestKeys, keys) : keys,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full or unavailable — progress just won't persist
      }
      return next;
    });
  }, []);

  return { progress, record, loaded };
}
