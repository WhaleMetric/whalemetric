'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/browser';
import { toast } from 'sonner';
import { MoveToFolderMenu } from './MoveToFolderMenu';
import type { Radar, RadarFolder } from '@/lib/types/radares';

interface Props {
  radar: Radar;
  folders: RadarFolder[];
  onToggleFavorite: (id: string, current: boolean) => void;
  onMoveToFolder:   (id: string, folderId: string | null) => void;
  onEdit:           (radar: Radar) => void;
  onDelete:         (id: string) => void;
  onArchive:        (id: string) => void;
  onDuplicate:      (radar: Radar) => void;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  warming_up: { label: 'Calentando', bg: '#FEF3C7', color: '#92400E' },
  ready:      { label: 'Activo',     bg: '#D1FAE5', color: '#065F46' },
  error:      { label: 'Error',      bg: '#FEE2E2', color: '#991B1B' },
};

export function RadarCard({
  radar, folders,
  onToggleFavorite, onMoveToFolder, onEdit, onDelete, onArchive, onDuplicate,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const [delConfirm, setDelConfirm]     = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const alertCount = radar.radar_alerts[0]?.count ?? 0;
  const badge      = STATUS_BADGE[radar.status] ?? STATUS_BADGE.ready;

  const handleCardClick = async () => {
    // Update last_viewed_at
    const supabase = createClient();
    await supabase
      .from('radars')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', radar.id);
    router.push(`/radares/${radar.id}`);
  };

  const handleDuplicate = () => {
    setMenuOpen(false);
    onDuplicate(radar);
    toast.success('Duplicando radar…');
  };

  const handleDelete = async () => {
    if (!delConfirm) { setDelConfirm(true); return; }
    setMenuOpen(false);
    onDelete(radar.id);
    toast.success('Radar eliminado');
  };

  const handleArchive = () => {
    setMenuOpen(false);
    onArchive(radar.id);
    toast.success('Radar archivado');
  };

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        if (!delConfirm) setDelConfirm(false);
      }}
    >
      {/* Row 1: favorite + name + menu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(radar.id, radar.is_favorite); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginTop: 1 }}
          title={radar.is_favorite ? 'Quitar favorito' : 'Marcar favorito'}
        >
          <svg width="15" height="15" viewBox="0 0 16 16"
            fill={radar.is_favorite ? '#F59E0B' : 'none'}
            stroke={radar.is_favorite ? '#F59E0B' : 'var(--text-tertiary)'}
            strokeWidth="1.5">
            <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, lineHeight: 1.3 }}>
            {radar.name}
          </div>
          {radar.description && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {radar.description}
            </div>
          )}
        </div>

        {/* Menu button */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); setDelConfirm(false); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: '2px 4px',
              borderRadius: 4, fontSize: 18, lineHeight: 1,
            }}
          >
            ⋯
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 100,
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 160, padding: '4px 0',
              }}
            >
              <MenuItem onClick={() => { setMenuOpen(false); onEdit(radar); }}>Editar</MenuItem>
              <div style={{ position: 'relative' }}>
                <MenuItem onClick={() => setMoveMenuOpen((o) => !o)}>
                  Mover a…
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                    <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </MenuItem>
                {moveMenuOpen && (
                  <MoveToFolderMenu
                    folders={folders}
                    currentFolderId={radar.folder_id}
                    onMove={(fId) => { onMoveToFolder(radar.id, fId); toast.success('Radar movido'); }}
                    onClose={() => { setMoveMenuOpen(false); setMenuOpen(false); }}
                  />
                )}
              </div>
              <MenuItem onClick={handleDuplicate}>Duplicar</MenuItem>
              <MenuItem onClick={() => { onToggleFavorite(radar.id, radar.is_favorite); setMenuOpen(false); }}>
                {radar.is_favorite ? '☆ Quitar favorito' : '⭐ Marcar favorito'}
              </MenuItem>
              <MenuItem onClick={handleArchive}>Archivar</MenuItem>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <MenuItem
                onClick={handleDelete}
                danger
              >
                {delConfirm ? 'Confirmar eliminación' : 'Eliminar'}
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      {/* Signal chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', alignSelf: 'center', marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          {radar.operator === 'all' ? 'Combina' : radar.operator === 'any' ? 'Cualquiera' : 'Ponderado'}
        </span>
        {radar.radar_signals.slice(0, 4).map((rs) => (
          <span
            key={rs.signal_id}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 20,
              background: 'var(--bg-muted)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {rs.signals.name}
          </span>
        ))}
        {radar.radar_signals.length > 4 && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
            +{radar.radar_signals.length - 4}
          </span>
        )}
      </div>

      {/* Footer: status badge + alerts + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>

        {alertCount > 0 && (
          <span style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2l7 12H1L8 2z" strokeLinejoin="round" />
              <path d="M8 10V7M8 12v1" strokeLinecap="round" />
            </svg>
            {alertCount} alerta{alertCount > 1 ? 's' : ''}
          </span>
        )}

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
          {radar.last_viewed_at
            ? formatDistanceToNow(new Date(radar.last_viewed_at), { addSuffix: true, locale: es })
            : formatDistanceToNow(new Date(radar.created_at), { addSuffix: true, locale: es })}
        </span>
      </div>
    </div>
  );
}

function MenuItem({
  onClick, children, danger,
}: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', cursor: 'pointer', fontSize: 13,
        color: danger ? '#EF4444' : 'var(--text-primary)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = danger ? '#FEF2F2' : 'var(--bg-muted)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {children}
    </div>
  );
}
