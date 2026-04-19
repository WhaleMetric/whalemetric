'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { RadarFolder } from '@/lib/types/radares';

export function useRadarFolders() {
  const [folders, setFolders] = useState<RadarFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('radar_folders')
      .select('id, name, icon, color, position, radars(count)')
      .order('position');
    setFolders((data as unknown as RadarFolder[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createFolder = async (
    name: string,
    icon: string | null,
    color: string | null,
  ): Promise<RadarFolder> => {
    const supabase = createClient();
    const maxPos = folders.reduce((m, f) => Math.max(m, f.position), 0);
    const { data, error } = await supabase
      .from('radar_folders')
      .insert({ name, icon, color, position: maxPos + 1 })
      .select()
      .single();
    if (error) throw error;
    const folder: RadarFolder = { ...(data as RadarFolder), radars: [{ count: 0 }] };
    setFolders((prev) => [...prev, folder]);
    return folder;
  };

  const updateFolder = async (id: string, updates: Partial<RadarFolder>) => {
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
    const supabase = createClient();
    const { error } = await supabase
      .from('radar_folders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const reorderFolders = async (reordered: RadarFolder[]) => {
    // Optimistic update
    setFolders(reordered);
    const supabase = createClient();
    await Promise.all(
      reordered.map((f, i) =>
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
