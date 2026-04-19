'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { SignalRecord, SignalStatus } from '@/lib/types/signals';

type StatusFilter = SignalStatus | 'all';

interface Options {
  status?: StatusFilter;
}

export function useSignals(opts: Options = {}) {
  const status = opts.status ?? 'all';
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from('signals')
      .select('id, name, type, aliases, description, status, is_favorite')
      .order('name', { ascending: true });
    if (status !== 'all') {
      query = query.eq('status', status) as typeof query;
    }
    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      setSignals([]);
    } else {
      setError(null);
      setSignals((data as unknown as SignalRecord[]) ?? []);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    // Initial fetch. setState runs after the await, so not a cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSignals();
  }, [fetchSignals]);

  const toggleFavorite = async (id: string, current: boolean) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_favorite: !current } : s)),
    );
    const supabase = createClient();
    const { error: err } = await supabase
      .from('signals')
      .update({ is_favorite: !current })
      .eq('id', id);
    if (err) {
      setSignals((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_favorite: current } : s)),
      );
    }
  };

  return {
    signals,
    loading,
    error,
    refresh: fetchSignals,
    toggleFavorite,
  };
}
