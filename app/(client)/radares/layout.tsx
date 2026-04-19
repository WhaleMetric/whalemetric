'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { useRadarFolders } from '@/lib/hooks/useRadarFolders';
import { RadaresSidebar } from './_components/RadaresSidebar';
import { FolderModal } from './_components/FolderModal';
import { NewRadarModal } from './_components/NewRadarModal';
import type { RadarFolder } from '@/lib/types/radares';

// Inner layout needs access to search params — wrap in Suspense at the boundary
function RadaresLayoutInner({ children }: { children: React.ReactNode }) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const {
    folders, refresh: refreshFolders,
    createFolder, updateFolder, deleteFolder, reorderFolders,
  } = useRadarFolders();

  const [showNewRadar,    setShowNewRadar]    = useState(false);
  const [showNewFolder,   setShowNewFolder]   = useState(false);
  const [editingFolder,   setEditingFolder]   = useState<RadarFolder | null>(null);
  const [deletingFolder,  setDeletingFolder]  = useState<RadarFolder | null>(null);

  const [search, setSearch_] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchChange = useCallback((q: string) => {
    setSearch_(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set('q', q);
      else params.delete('q');
      router.push(`/radares?${params.toString()}`);
    }, 200);
  }, [router, searchParams]);

  // Keyboard shortcut N → new radar
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'n' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShowNewRadar(true);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  // Delete folder with confirmation
  const handleDeleteFolder = async (folder: RadarFolder) => {
    const count = folder.radars?.[0]?.count ?? 0;
    const msg = count > 0
      ? `Esta carpeta contiene ${count} radar${count > 1 ? 'es' : ''}. Al borrarla, los radares pasarán a "Sin carpeta". ¿Continuar?`
      : `¿Eliminar la carpeta "${folder.name}"?`;
    if (!window.confirm(msg)) return;
    await deleteFolder(folder.id);
    toast.success('Carpeta eliminada');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Toaster position="top-right" richColors />

      <RadaresSidebar
        folders={folders}
        unreadAlertCount={0}
        unreadCounts={{ favorites: 0, recientes: 0 }}
        onNewRadar={() => setShowNewRadar(true)}
        onNewFolder={() => setShowNewFolder(true)}
        onEditFolder={(f) => setEditingFolder(f)}
        onDeleteFolder={handleDeleteFolder}
        onReorderFolders={reorderFolders}
        search={search}
        onSearchChange={onSearchChange}
      />

      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-subtle)' }}>
        {children}
      </main>

      {/* New radar modal */}
      {showNewRadar && (
        <NewRadarModal
          folders={folders}
          onClose={() => setShowNewRadar(false)}
          onSaved={refreshFolders}
        />
      )}

      {/* Create folder modal */}
      {showNewFolder && (
        <FolderModal
          onClose={() => setShowNewFolder(false)}
          onSave={async (name, icon, color) => {
            await createFolder(name, icon, color);
            toast.success('Carpeta creada');
          }}
        />
      )}

      {/* Edit folder modal */}
      {editingFolder && (
        <FolderModal
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onSave={async (name, icon, color) => {
            await updateFolder(editingFolder.id, { name, icon, color });
            toast.success('Carpeta actualizada');
          }}
        />
      )}
    </div>
  );
}

export default function RadaresLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <RadaresLayoutInner>{children}</RadaresLayoutInner>
    </Suspense>
  );
}
