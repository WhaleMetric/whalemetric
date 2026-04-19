'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { MOCK_FOLDERS } from '@/lib/mock/radares';
import type { RadarFolder } from '@/lib/types/radares';

export function useRadarFolders() {
  const [folders, setFolders] = useState<RadarFolder[]>(MOCK_FOLDERS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('radar_folders')
      .select('id, name, icon, color, position, radars(count)')
      .order('position');
    const real = (data as unknown as RadarFolder[]) ?? [];
    setFolders([...real, ...MOCK_FOLDERS]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial fetch. setState happens after an await, so not a cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const createFolder = async (
    name: string,
    icon: string | null,
    color: string | null,
  ): Promise<RadarFolder> => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('No autenticado');
    const real = folders.filter((f) => !f.is_mock);
    const maxPos = real.reduce((m, f) => Math.max(m, f.position), 0);
    const { data, error } = await supabase
      .from('radar_folders')
      .insert({ user_id: userId, name, icon, color, position: maxPos + 1 })
      .select()
      .single();
    if (error) throw error;
    const folder: RadarFolder = { ...(data as RadarFolder), radars: [{ count: 0 }] };
    setFolders((prev) => [...prev.filter((f) => !f.is_mock), folder, ...MOCK_FOLDERS]);
    return folder;
  };

  const updateFolder = async (id: string, updates: Partial<RadarFolder>) => {
    if (id.startsWith('mock-')) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('radar_folders')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const deleteFolder = async (id: string) => {
    if (id.startsWith('mock-')) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('radar_folders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const reorderFolders = async (reordered: RadarFolder[]) => {
    setFolders(reordered);
    const supabase = createClient();
    const real = reordered.filter((f) => !f.is_mock);
    await Promise.all(
      real.map((f, i) =>
        supabase
          .from('radar_folders')
          .update({ position: i + 1 })
          .eq('id', f.id),
      ),
    );
  };

  const folderCount = (id: string) =>
    (folders.find((f) => f.id === id)?.radars?.[0]?.count ?? 0);

  return {
    folders,
    loading,
    refresh,
    createFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
    folderCount,
  };
}
