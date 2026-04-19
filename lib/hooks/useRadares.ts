'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { Radar } from '@/lib/types/radares';

export function useRadares(
  view: string | null,
  folderId: string | null,
  search: string,
) {
  const [radars, setRadars] = useState<Radar[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  const fetchRadars = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('radars')
      .select(
        `id, name, description, operator, status, is_favorite,
         folder_id, last_viewed_at, updated_at, created_at,
         radar_signals(signal_id, signals(id, name, type)),
         radar_alerts(count)`,
      )
      .neq('status', 'archived');

    if (folderId) {
      query = query.eq('folder_id', folderId) as typeof query;
    } else if (view === 'favoritos') {
      query = query.eq('is_favorite', true) as typeof query;
    } else if (view === 'recientes') {
      query = query
        .not('last_viewed_at', 'is', null)
        .order('last_viewed_at', { ascending: false })
        .limit(20) as typeof query;
    } else if (view === 'sin-carpeta') {
      query = query.is('folder_id', null) as typeof query;
    }

    if (search) {
      query = query.ilike('name', `%${search}%`) as typeof query;
    }

    if (view !== 'recientes') {
      query = query.order('updated_at', { ascending: false }) as typeof query;
    }

    const { data } = await query;
    const rows = (data as unknown as Radar[]) ?? [];

    if (view === 'alertas') {
      setRadars(rows.filter((r) => (r.radar_alerts[0]?.count ?? 0) > 0));
    } else {
      setRadars(rows);
    }
    setLoading(false);
  }, [view, folderId, search]);

  // fetch unread alert count for sidebar badge
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('radar_alerts')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null)
      .is('resolved_at', null)
      .then(({ count }) => setUnreadAlertCount(count ?? 0));
  }, []);

  useEffect(() => {
    fetchRadars();
  }, [fetchRadars]);

  const toggleFavorite = async (id: string, current: boolean) => {
    setRadars((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_favorite: !current } : r)),
    );
    const supabase = createClient();
    const { error } = await supabase
      .from('radars')
      .update({ is_favorite: !current })
      .eq('id', id);
    if (error) {
      setRadars((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_favorite: current } : r)),
      );
    }
  };

  const moveToFolder = async (id: string, newFolderId: string | null) => {
    setRadars((prev) =>
      prev.map((r) => (r.id === id ? { ...r, folder_id: newFolderId } : r)),
    );
    const supabase = createClient();
    const { error } = await supabase
      .from('radars')
      .update({ folder_id: newFolderId })
      .eq('id', id);
    if (error) fetchRadars();
  };

  const deleteRadar = async (id: string) => {
    setRadars((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    await supabase.from('radars').delete().eq('id', id);
  };

  const archiveRadar = async (id: string) => {
    setRadars((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    await supabase
      .from('radars')
      .update({ status: 'archived' })
      .eq('id', id);
  };

  const duplicateRadar = async (radar: Radar): Promise<void> => {
    const supabase = createClient();
    const { data: newRadar, error } = await supabase
      .from('radars')
      .insert({
        name: `${radar.name} (copia)`,
        description: radar.description,
        operator: radar.operator,
        min_signals_matched: radar.min_signals_matched,
        folder_id: radar.folder_id,
        status: 'warming_up',
      })
      .select()
      .single();
    if (error || !newRadar) return;
    if (radar.radar_signals.length > 0) {
      await supabase.from('radar_signals').insert(
        radar.radar_signals.map((rs) => ({
          radar_id: (newRadar as { id: string }).id,
          signal_id: rs.signal_id,
          weight: 1,
          is_required: true,
        })),
      );
    }
    fetchRadars();
  };

  return {
    radars,
    loading,
    unreadAlertCount,
    refresh: fetchRadars,
    toggleFavorite,
    moveToFolder,
    deleteRadar,
    archiveRadar,
    duplicateRadar,
  };
}
