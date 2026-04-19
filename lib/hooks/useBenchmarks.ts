'use client';

import { useCallback, useEffect, useState } from 'react';
import { MOCK_BENCHMARKS } from '@/lib/mock/benchmarks';
import type { Benchmark } from '@/lib/types/benchmark';

// Module-level snapshot so favorite toggles persist across pages during a
// single session without a backend. Resets on full page reload.
let _benchmarksMem: Benchmark[] = MOCK_BENCHMARKS.map((b) => ({ ...b }));
const _listeners = new Set<() => void>();

function notify() {
  for (const l of _listeners) l();
}

export function useBenchmarks() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    _benchmarksMem = _benchmarksMem.map((b) =>
      b.id === id ? { ...b, is_favorite: !b.is_favorite } : b,
    );
    notify();
  }, []);

  return {
    benchmarks: _benchmarksMem,
    toggleFavorite,
  };
}

export function resolveDefaultBenchmarkId(benchmarks: Benchmark[]): string | null {
  if (benchmarks.length === 0) return null;
  const favorites = benchmarks
    .filter((b) => b.is_favorite)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  if (favorites[0]) return favorites[0].id;

  const recents = benchmarks
    .filter((b) => b.last_viewed_at)
    .sort((a, b) => {
      const ta = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0;
      const tb = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0;
      return tb - ta;
    });
  if (recents[0]) return recents[0].id;

  const alpha = [...benchmarks].sort((a, b) => a.name.localeCompare(b.name));
  return alpha[0]?.id ?? null;
}
