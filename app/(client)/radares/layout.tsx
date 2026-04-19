'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { useRadarFolders } from '@/lib/hooks/useRadarFolders';
import { useRadares } from '@/lib/hooks/useRadares';
import { RadaresSidebar } from './_components/RadaresSidebar';
import { FolderModal } from './_components/FolderModal';
import { NewRadarModal } from './_components/NewRadarModal';
import { ConfirmDialog } from './_components/ConfirmDialog';
import type { RadarFolder } from '@/lib/types/radares';

// Inner layout needs access to search params — wrap in Suspense at the boundary
function RadaresLayoutInner({ children }: { children: React.ReactNode }) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const {
    folders, refresh: refreshFolders,
    createFolder, updateFolder, deleteFolder, reorderFolders,
  } = useRadarFolders();
  const { radars, unreadAlertCount } = useRadares(null, null, '');

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

  // Radar counts per folder (live, from loaded radars — not the cached folder.radars.count).
  const radarsPerFolder = (folderId: string) =>
    radars.filter((r) => r.folder_id === folderId).length;

  const handleRequestEditFolder = (folder: RadarFolder) => {
    if (folder.is_mock) {
      toast.info('Las carpetas de ejemplo no se pueden modificar');
      return;
    }
    setEditingFolder(folder);
  };

  const handleRequestDeleteFolder = (folder: RadarFolder) => {
    if (folder.is_mock) {
      toast.info('Las carpetas de ejemplo no se pueden modificar');
      return;
    }
    setDeletingFolder(folder);
  };

  const confirmDeleteFolder = async () => {
    const folder = deletingFolder;
    if (!folder) return;
    setDeletingFolder(null);
    try {
      await deleteFolder(folder.id);
      toast.success('Carpeta eliminada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Toaster position="top-right" richColors />

      <RadaresSidebar
        folders={folders}
        radars={radars}
        unreadAlertCount={unreadAlertCount}
        unreadCounts={{
          favorites: radars.filter((r) => r.is_favorite).length,
          recientes: radars.filter((r) => r.last_viewed_at).length,
        }}
        onNewRadar={() => setShowNewRadar(true)}
        onNewFolder={() => setShowNewFolder(true)}
        onEditFolder={handleRequestEditFolder}
        onDeleteFolder={handleRequestDeleteFolder}
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

      {/* Delete folder confirmation */}
      {deletingFolder && (() => {
        const count = radarsPerFolder(deletingFolder.id);
        const title = count > 0 ? 'Borrar carpeta con radares' : 'Borrar carpeta';
        const message = count > 0
          ? `Esta carpeta contiene ${count} radar${count > 1 ? 'es' : ''}. Al borrarla, pasarán a "Sin carpeta". ¿Continuar?`
          : `¿Borrar la carpeta "${deletingFolder.name}"?`;
        return (
          <ConfirmDialog
            title={title}
            message={message}
            confirmLabel="Borrar"
            onConfirm={confirmDeleteFolder}
            onCancel={() => setDeletingFolder(null)}
          />
        );
      })()}
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
