'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export type SourceIconMap = Record<string, string | null>;

/**
 * Look up `icon_url` for a set of source names against public.sources.
 * Returns a map keyed by lowercased name. Missing names simply won't appear.
 */
export function useSourceIconsByName(names: string[]): {
  icons: SourceIconMap;
  loading: boolean;
} {
  const [icons, setIcons] = useState<SourceIconMap>({});
  const [loading, setLoading] = useState(true);

  // Stable key so effect doesn't retrigger on new array identity
  const key = names
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('|');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const unique = Array.from(new Set(key.split('|').filter(Boolean)));
      if (unique.length === 0) {
        if (!cancelled) {
          setIcons({});
          setLoading(false);
        }
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sources')
        .select('name, icon_url')
        .in('name', unique);
      if (cancelled) return;
      if (error || !data) {
        setIcons({});
        setLoading(false);
        return;
      }
      const map: SourceIconMap = {};
      for (const row of data as { name: string; icon_url: string | null }[]) {
        map[row.name.trim().toLowerCase()] = row.icon_url;
      }
      setIcons(map);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [key]);

  return { icons, loading };
}
