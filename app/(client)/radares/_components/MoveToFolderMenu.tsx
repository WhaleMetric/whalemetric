'use client';

import type { RadarFolder } from '@/lib/types/radares';

interface Props {
  folders: RadarFolder[];
  currentFolderId: string | null;
  onMove: (folderId: string | null) => void;
  onClose: () => void;
}

export function MoveToFolderMenu({ folders, currentFolderId, onMove, onClose }: Props) {
  const items: { id: string | null; label: string }[] = [
    { id: null, label: 'Sin carpeta' },
    ...folders.map((f) => ({ id: f.id, label: f.name })),
  ];

  return (
    <div
      style={{
        position: 'absolute', zIndex: 200,
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: 180, padding: '4px 0',
        top: 0, right: '100%', marginRight: 4,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id ?? '__none__'}
          onClick={() => { onMove(item.id); onClose(); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 12px', cursor: 'pointer', fontSize: 13,
            color: item.id === currentFolderId ? 'var(--accent)' : 'var(--text-primary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {item.label}
          {item.id === currentFolderId && (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 8l4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
