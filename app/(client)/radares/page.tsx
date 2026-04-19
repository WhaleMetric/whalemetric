'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useRadares } from '@/lib/hooks/useRadares';
import { useRadarFolders } from '@/lib/hooks/useRadarFolders';
import { RadarGrid } from './_components/RadarGrid';
import { EmptyState } from './_components/EmptyState';
import { NewRadarModal } from './_components/NewRadarModal';
import type { Radar } from '@/lib/types/radares';

const VIEW_LABELS: Record<string, string> = {
  todos:       'Todos',
  favoritos:   'Favoritos',
  recientes:   'Recientes',
  alertas:     'Con alertas',
  'sin-carpeta': 'Sin carpeta',
};

function RadaresPageInner() {
  const searchParams = useSearchParams();
  const view         = searchParams.get('view');
  const folderId     = searchParams.get('folder');
  const search       = searchParams.get('q') ?? '';

  const { folders, refresh: refreshFolders } = useRadarFolders();
  const {
    radars, loading,
    toggleFavorite, moveToFolder, deleteRadar, archiveRadar, duplicateRadar,
    refresh,
  } = useRadares(view, folderId, search);

  const [editingRadar, setEditingRadar] = useState<Radar | null>(null);
  const [showNewRadar, setShowNewRadar] = useState(false);

  // Determine view label
  const activeFolder = folderId ? folders.find((f) => f.id === folderId) : null;
  const viewLabel = activeFolder?.name ?? VIEW_LABELS[view ?? 'todos'] ?? 'Todos';
  const radarCount = radars.length;
  const alertCount = radars.reduce((acc, r) => acc + (r.radar_alerts[0]?.count ?? 0), 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Radares{viewLabel !== 'Todos' ? ` · ${viewLabel}` : ''}
            </h1>
            {!loading && (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                {radarCount} radar{radarCount !== 1 ? 'es' : ''}
                {alertCount > 0 && ` · ${alertCount} alerta${alertCount > 1 ? 's' : ''} activa${alertCount > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowNewRadar(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                background: 'var(--accent)', color: 'var(--bg)',
                border: 'none', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M8 2v12M2 8h12" strokeLinecap="round" />
              </svg>
              Nuevo radar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {!loading && radars.length === 0 ? (
          <EmptyState
            view={view}
            folderId={folderId}
            onNewRadar={() => setShowNewRadar(true)}
          />
        ) : (
          <RadarGrid
            radars={radars}
            loading={loading}
            folders={folders}
            onToggleFavorite={toggleFavorite}
            onMoveToFolder={moveToFolder}
            onEdit={setEditingRadar}
            onDelete={(id) => { deleteRadar(id); toast.success('Radar eliminado'); }}
            onArchive={(id) => { archiveRadar(id); toast.success('Radar archivado'); }}
            onDuplicate={duplicateRadar}
          />
        )}
      </div>

      {/* skeleton pulse animation */}
      <style>{`
        @keyframes radar-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Modals */}
      {showNewRadar && (
        <NewRadarModal
          folders={folders}
          onClose={() => setShowNewRadar(false)}
          onSaved={refresh}
        />
      )}
      {editingRadar && (
        <NewRadarModal
          folders={folders}
          radar={editingRadar}
          onClose={() => setEditingRadar(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

export default function RadaresPage() {
  return (
    <Suspense>
      <RadaresPageInner />
    </Suspense>
  );
}
