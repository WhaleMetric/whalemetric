'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { MOCK_RADARS } from '@/lib/mock/radares';
import type {
  Radar,
  Clause,
  RawRadarRow,
  RawClauseRow,
} from '@/lib/types/radares';

// ── Transform raw Supabase rows → UI Radar ───────────────────────────────────

function clauseFromRaw(raw: RawClauseRow): Clause {
  const signals = [...(raw.radar_clause_signals ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((cs) => cs.signals);
  return {
    id: raw.id,
    position: raw.position,
    operator: raw.operator,
    min_matches: raw.min_matches,
    is_exclusion: raw.is_exclusion,
    signals,
  };
}

function radarFromRaw(raw: RawRadarRow): Radar {
  const clauses = [...(raw.radar_clauses ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(clauseFromRaw);
  return {
    id: raw.id,
    user_id: raw.user_id,
    name: raw.name,
    description: raw.description,
    top_level_operator: raw.top_level_operator ?? 'and',
    status: raw.status,
    is_favorite: raw.is_favorite,
    folder_id: raw.folder_id,
    last_viewed_at: raw.last_viewed_at,
    updated_at: raw.updated_at,
    created_at: raw.created_at,
    clauses,
    radar_alerts: raw.radar_alerts ?? [{ count: 0 }],
  };
}

// ── Mock filtering (mirrors Supabase filters locally) ────────────────────────

function filterMocks(
  view: string | null,
  folderId: string | null,
  search: string,
): Radar[] {
  let list = MOCK_RADARS.slice();

  if (folderId) list = list.filter((r) => r.folder_id === folderId);
  else if (view === 'favoritos') list = list.filter((r) => r.is_favorite);
  else if (view === 'recientes') list = list.filter((r) => r.last_viewed_at);
  else if (view === 'sin-carpeta') list = list.filter((r) => r.folder_id === null);
  else if (view === 'alertas')
    list = list.filter((r) => (r.radar_alerts[0]?.count ?? 0) > 0);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter((r) => r.name.toLowerCase().includes(q));
  }

  return list;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const SELECT = `
  id, user_id, name, description, top_level_operator, status, is_favorite,
  folder_id, last_viewed_at, updated_at, created_at,
  radar_clauses (
    id, position, operator, min_matches, is_exclusion,
    radar_clause_signals ( signal_id, position, signals ( id, name, type ) )
  ),
  radar_alerts (count)
`;

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

    let query = supabase.from('radars').select(SELECT).neq('status', 'archived');

    if (folderId && !folderId.startsWith('mock-')) {
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
    const real = ((data as unknown as RawRadarRow[]) ?? []).map(radarFromRaw);

    // If navigating into a mock folder, skip real results.
    const realFiltered = folderId && folderId.startsWith('mock-') ? [] : real;

    let combined = [...realFiltered, ...filterMocks(view, folderId, search)];
    if (view === 'alertas') {
      combined = combined.filter((r) => (r.radar_alerts[0]?.count ?? 0) > 0);
    }

    setRadars(combined);
    setLoading(false);
  }, [view, folderId, search]);

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

  // ── Mutations ──────────────────────────────────────────────────────────────

  const toggleFavorite = async (id: string, current: boolean) => {
    setRadars((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_favorite: !current } : r)),
    );
    if (id.startsWith('mock-')) return;
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
    if (id.startsWith('mock-')) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('radars')
      .update({ folder_id: newFolderId })
      .eq('id', id);
    if (error) fetchRadars();
  };

  const deleteRadar = async (id: string) => {
    setRadars((prev) => prev.filter((r) => r.id !== id));
    if (id.startsWith('mock-')) return;
    const supabase = createClient();
    await supabase.from('radars').delete().eq('id', id);
  };

  const archiveRadar = async (id: string) => {
    setRadars((prev) => prev.filter((r) => r.id !== id));
    if (id.startsWith('mock-')) return;
    const supabase = createClient();
    await supabase.from('radars').update({ status: 'archived' }).eq('id', id);
  };

  const duplicateRadar = async (radar: Radar): Promise<void> => {
    if (radar.is_mock) {
      // Mocks can't round-trip into the DB; the original remains visible.
      return;
    }
    const supabase = createClient();
    const { data: newRadar, error } = await supabase
      .from('radars')
      .insert({
        name: `${radar.name} (copia)`,
        description: radar.description,
        top_level_operator: radar.top_level_operator,
        folder_id: radar.folder_id,
        status: 'warming_up',
      })
      .select('id')
      .single();
    if (error || !newRadar) return;
    const newId = (newRadar as { id: string }).id;

    // Deep-clone clauses + clause_signals
    for (const c of radar.clauses) {
      const { data: newClause, error: cErr } = await supabase
        .from('radar_clauses')
        .insert({
          radar_id: newId,
          position: c.position,
          operator: c.operator,
          min_matches: c.min_matches,
          is_exclusion: c.is_exclusion,
        })
        .select('id')
        .single();
      if (cErr || !newClause) {
        await supabase.from('radars').delete().eq('id', newId);
        return;
      }
      const newClauseId = (newClause as { id: string }).id;
      if (c.signals.length > 0) {
        const { error: csErr } = await supabase
          .from('radar_clause_signals')
          .insert(
            c.signals.map((s, i) => ({
              clause_id: newClauseId,
              signal_id: s.id,
              position: i,
            })),
          );
        if (csErr) {
          await supabase.from('radars').delete().eq('id', newId);
          return;
        }
      }
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

// Exported for [id]/page.tsx single-radar fetch
export async function fetchRadarById(id: string): Promise<Radar | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('radars')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return radarFromRaw(data as unknown as RawRadarRow);
}
