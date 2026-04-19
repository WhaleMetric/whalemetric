'use client';

import { RadarCard } from './RadarCard';
import type { Radar, RadarFolder } from '@/lib/types/radares';

interface Props {
  radars: Radar[];
  loading: boolean;
  folders: RadarFolder[];
  onToggleFavorite: (id: string, current: boolean) => void;
  onMoveToFolder:   (id: string, folderId: string | null) => void;
  onEdit:           (radar: Radar) => void;
  onDelete:         (id: string) => void;
  onArchive:        (id: string) => void;
  onDuplicate:      (radar: Radar) => void;
}

export function RadarGrid({
  radars, loading, folders,
  onToggleFavorite, onMoveToFolder, onEdit, onDelete, onArchive, onDuplicate,
}: Props) {
  if (loading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {radars.map((radar) => (
        <RadarCard
          key={radar.id}
          radar={radar}
          folders={folders}
          onToggleFavorite={onToggleFavorite}
          onMoveToFolder={onMoveToFolder}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 16,
};

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={skel(16, 16, '50%')} />
        <div style={{ flex: 1 }}>
          <div style={{ ...skel(14, '70%'), marginBottom: 6 }} />
          <div style={skel(10, '40%')} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={skel(18, 48, 20)} />
        <div style={skel(18, 64, 20)} />
        <div style={skel(18, 56, 20)} />
      </div>
      <div style={{ ...skel(12, '90%'), marginBottom: 6 }} />
      <div style={skel(12, '60%')} />
    </div>
  );
}

function skel(height: number, width: number | string, borderRadius: number | string = 4): React.CSSProperties {
  return {
    height,
    width,
    borderRadius,
    background: 'var(--bg-muted)',
    animation: 'radar-pulse 1.4s ease-in-out infinite',
  };
}
