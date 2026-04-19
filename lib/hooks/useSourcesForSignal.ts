'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { SourceType } from '@/lib/signal-constants';

export type SourceScope = 'international' | 'national' | 'regional' | 'local';

export interface SourceRecord {
  id: string;
  name: string;
  type: SourceType | string;
  scope: SourceScope | string | null;
  country_code: string | null;
  language_code: string | null;
  icon_url: string | null;
  news_count: number;
  is_top_source: boolean;
}

interface RawSourceRow {
  id: string;
  name: string;
  type: string;
  scope: string | null;
  country_code: string | null;
  language_code: string | null;
  icon_url: string | null;
  is_top_source: boolean | null;
  news_count: { count: number }[] | number | null;
}

function toCount(raw: RawSourceRow['news_count']): number {
  if (raw == null) return 0;
  if (typeof raw === 'number') return raw;
  if (Array.isArray(raw)) return raw[0]?.count ?? 0;
  return 0;
}

export function useSourcesForSignal() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('sources')
      .select(`
        id, name, type, scope, country_code, language_code, icon_url,
        is_top_source,
        news_count:news(count)
      `);
    if (err) {
      setError(err.message);
      setSources([]);
      setLoading(false);
      return;
    }
    const rows = (data as unknown as RawSourceRow[]) ?? [];
    const mapped: SourceRecord[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      scope: r.scope,
      country_code: r.country_code,
      language_code: r.language_code,
      icon_url: r.icon_url,
      news_count: toCount(r.news_count),
      is_top_source: !!r.is_top_source,
    }));
    mapped.sort((a, b) => a.name.localeCompare(b.name));
    setError(null);
    setSources(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSources();
  }, [fetchSources]);

  return { sources, loading, error, refresh: fetchSources };
}
