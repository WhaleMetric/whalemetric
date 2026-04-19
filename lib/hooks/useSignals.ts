'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { UserSignal } from '@/lib/types/radares';

export function useSignals() {
  const [signals, setSignals] = useState<UserSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('signals')
      .select('id, name, type, status')
      .order('name')
      .then(({ data }) => {
        setSignals((data as unknown as UserSignal[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { signals, loading };
}
