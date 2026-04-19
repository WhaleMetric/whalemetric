'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Briefcase, AlertTriangle, Target, Users, Rocket, Flag,
  Megaphone, TrendingUp, Shield, Bookmark, Star, Zap,
} from 'lucide-react';
import type { RadarFolder } from '@/lib/types/radares';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, AlertTriangle, Target, Users, Rocket, Flag,
  Megaphone, TrendingUp, Shield, Bookmark, Star, Zap,
};

const LS_KEY = 'radares:collapsed-folders';

function getCollapsed(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
}
function setCollapsed(ids: string[]) {
  if (typeof window !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

interface Props {
  folders: RadarFolder[];
  unreadAlertCount: number;
  unreadCounts: { favorites: number; recientes: number };
  onNewRadar: () => void;
  onNewFolder: () => void;
  onEditFolder: (folder: RadarFolder) => void;
  onDeleteFolder: (folder: RadarFolder) => void;
  onReorderFolders: (folders: RadarFolder[]) => void;
  search: string;
  onSearchChange: (q: string) => void;
}

export function RadaresSidebar({
  folders, unreadAlertCount, unreadCounts,
  onNewRadar, onNewFolder, onEditFolder, onDeleteFolder, onReorderFolders,
  search, onSearchChange,
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const view         = searchParams.get('view');
  const folderId     = searchParams.get('folder');

  const [collapsed, setCollapsed_] = useState<string[]>([]);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCollapsed_(getCollapsed()); }, []);

  const toggleCollapse = (id: string) => {
    setCollapsed_((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setCollapsed(next);
      return next;
    });
  };

  const navigate = useCallback((params: Record<string, string | null>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) p.set(k, v); });
    router.push(`/radares?${p.toString()}`);
  }, [router]);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = folders.findIndex((f) => f.id === active.id);
    const newIdx = folders.findIndex((f) => f.id === over.id);
    onReorderFolders(arrayMove(folders, oldIdx, newIdx));
  };

  const isActive = (v: string | null, f: string | null) => v === view && f === folderId;

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px', cursor: 'pointer', fontSize: 13,
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: active ? 'var(--bg-muted)' : 'transparent',
    borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    borderRadius: '0 6px 6px 0',
    fontWeight: active ? 600 : 400,
    transition: 'background 0.1s',
  });

  const sinCarpetaCount = folders.reduce((acc, f) => acc, 0); // placeholder

  return (
    <div style={{
      width: 280, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Search */}
      <div style={{ padding: '16px 12px 12px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ position: 'relative' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8"
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13 13" strokeLinecap="round" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar radar…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-muted)', border: '1px solid transparent',
              borderRadius: 7, padding: '7px 8px 7px 28px',
              fontSize: 12, color: 'var(--text-primary)', outline: 'none',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 80 }}>
        {/* Auto views */}
        <div style={{ padding: '8px 0' }}>
          <AutoView
            icon={<StarIcon />}
            label="Favoritos"
            count={unreadCounts.favorites}
            active={view === 'favoritos' && !folderId}
            dimmed={unreadCounts.favorites === 0}
            onClick={() => navigate({ view: 'favoritos' })}
          />
          <AutoView
            icon={<ClockIcon />}
            label="Recientes"
            active={view === 'recientes' && !folderId}
            onClick={() => navigate({ view: 'recientes' })}
          />
          {unreadAlertCount > 0 && (
            <AutoView
              icon={<AlertIcon />}
              label="Con alertas"
              count={unreadAlertCount}
              countRed
              active={view === 'alertas' && !folderId}
              onClick={() => navigate({ view: 'alertas' })}
            />
          )}
        </div>

        <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

        {/* Folders header */}
        <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Carpetas
          </span>
        </div>

        {/* Sortable folders */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={folders.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {folders.map((folder) => (
              <SortableFolderRow
                key={folder.id}
                folder={folder}
                active={folderId === folder.id}
                hovered={hoveredFolder === folder.id}
                onHover={setHoveredFolder}
                onNavigate={() => navigate({ folder: folder.id })}
                onEdit={() => onEditFolder(folder)}
                onDelete={() => onDeleteFolder(folder)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Sin carpeta */}
        <div
          onClick={() => navigate({ view: 'sin-carpeta' })}
          style={{
            ...navItemStyle(view === 'sin-carpeta' && !folderId),
            margin: '0 8px', paddingLeft: 10,
          }}
          onMouseEnter={(e) => { if (view !== 'sin-carpeta') (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; }}
          onMouseLeave={(e) => { if (view !== 'sin-carpeta') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 5h12v9H2z" strokeLinejoin="round" />
            <path d="M2 5l2-3h4l2 3" strokeLinejoin="round" />
          </svg>
          <span style={{ flex: 1, fontSize: 13 }}>Sin carpeta</span>
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={onNewFolder}
          style={{
            width: '100%', padding: '8px 12px', fontSize: 12, cursor: 'pointer',
            border: '1px solid var(--border)', borderRadius: 7,
            background: 'none', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M8 2v12M2 8h12" strokeLinecap="round" />
          </svg>
          Nueva carpeta
        </button>
        <button
          onClick={onNewRadar}
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: 'none', borderRadius: 7,
            background: 'var(--accent)', color: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M8 2v12M2 8h12" strokeLinecap="round" />
          </svg>
          Nuevo radar
        </button>
      </div>
    </div>
  );
}

// ── Sortable folder row ───────────────────────────────────────────────────────

interface FolderRowProps {
  folder: RadarFolder;
  active: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableFolderRow({ folder, active, hovered, onHover, onNavigate, onEdit, onDelete }: FolderRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: folder.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const count = folder.radars?.[0]?.count ?? 0;
  const FolderIcon = folder.icon ? (ICON_MAP[folder.icon] ?? null) : null;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, margin: '1px 8px', borderRadius: 6, position: 'relative' }}
      onMouseEnter={() => onHover(folder.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 16,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 0.4 : 0, transition: 'opacity 0.15s',
          color: 'var(--text-tertiary)',
          zIndex: 1,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="2" cy="2" r="1.2" /><circle cx="8" cy="2" r="1.2" />
          <circle cx="2" cy="5" r="1.2" /><circle cx="8" cy="5" r="1.2" />
          <circle cx="2" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" />
        </svg>
      </div>

      {/* Main row */}
      <div
        onClick={onNavigate}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 8px 7px 20px', cursor: 'pointer', fontSize: 13,
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: active ? 'var(--bg-muted)' : hovered ? 'var(--bg-subtle)' : 'transparent',
          borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
          borderRadius: '0 6px 6px 0',
          fontWeight: active ? 600 : 400,
          transition: 'background 0.1s',
        }}
      >
        <span style={{ color: folder.color ?? 'var(--text-tertiary)', display: 'flex', flexShrink: 0 }}>
          {FolderIcon ? <FolderIcon size={13} /> : (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5h12v9H2z" strokeLinejoin="round" />
              <path d="M2 5l2-3h4l2 3" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.name}
        </span>

        {/* Hover actions */}
        {hovered && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <IconBtn onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Editar">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11 2l3 3-9 9H2v-3l9-9z" strokeLinejoin="round" />
              </svg>
            </IconBtn>
            <IconBtn onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Eliminar" danger>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 5h10M6 5V3h4v2M5 5l1 9h4l1-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconBtn>
          </div>
        )}

        {/* Count badge (when not hovering) */}
        {!hovered && count > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', flexShrink: 0 }}>
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Auto view row ─────────────────────────────────────────────────────────────

function AutoView({
  icon, label, count, countRed, active, dimmed, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  countRed?: boolean;
  active: boolean;
  dimmed?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', cursor: 'pointer', fontSize: 13, margin: '1px 8px',
        color: dimmed ? 'var(--text-tertiary)' : active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--bg-muted)' : 'transparent',
        borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
        borderRadius: '0 6px 6px 0',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && count > 0 && (
        <span style={{
          fontSize: 11, fontFamily: 'monospace',
          color: countRed ? '#EF4444' : 'var(--text-tertiary)',
          background: countRed ? '#FEE2E2' : 'var(--bg-muted)',
          padding: '1px 6px', borderRadius: 10, fontWeight: 500,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── Tiny icon button ──────────────────────────────────────────────────────────

function IconBtn({ onClick, title, children, danger }: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px',
        color: danger ? '#EF4444' : 'var(--text-tertiary)',
        borderRadius: 4, display: 'flex', alignItems: 'center',
      }}
    >
      {children}
    </button>
  );
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" strokeLinecap="round" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1l7 13H1L8 1z" strokeLinejoin="round" />
      <path d="M8 9V6M8 11v1" strokeLinecap="round" />
    </svg>
  );
}
