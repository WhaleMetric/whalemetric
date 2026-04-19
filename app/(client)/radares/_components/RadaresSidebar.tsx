'use client';

import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Inbox } from 'lucide-react';
import type { Radar, RadarFolder } from '@/lib/types/radares';
import { formulaToText } from '@/lib/radar-formula';
import { MOCK_FOLDERS } from '@/lib/mock/radares';
import { getFolderIcon } from './FolderModal';

function FolderIconFor({ id, size }: { id: string | null | undefined; size: number }) {
  return createElement(getFolderIcon(id), { size });
}

const LS_KEY = 'radares:expanded-folders';
const SIN_CARPETA_ID = '__sin_carpeta__';

function readExpanded(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : null;
  } catch { return null; }
}

function writeExpanded(ids: string[]) {
  if (typeof window !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

interface Props {
  folders: RadarFolder[];
  radars: Radar[];
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
  folders, radars, unreadAlertCount, unreadCounts,
  onNewRadar, onNewFolder, onEditFolder, onDeleteFolder, onReorderFolders,
  search, onSearchChange,
}: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const view         = searchParams.get('view');

  // Parse active radar from pathname /radares/{id}
  const activeRadarId = (() => {
    const m = pathname.match(/^\/radares\/([^/?#]+)/);
    return m ? m[1] : null;
  })();
  const activeRadar = activeRadarId
    ? radars.find((r) => r.id === activeRadarId)
    : null;
  const activeFolderId = activeRadar?.folder_id ?? null;

  // Expanded folders (UUIDs + SIN_CARPETA_ID)
  const [expanded, setExpandedState] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Hydrate expanded set from localStorage + route
  useEffect(() => {
    const persisted = readExpanded();
    const initial = new Set<string>(
      persisted ?? MOCK_FOLDERS.map((f) => f.id),
    );
    if (activeFolderId) initial.add(activeFolderId);
    if (activeRadar && activeRadar.folder_id === null) initial.add(SIN_CARPETA_ID);
    setExpandedState(initial);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure the active folder expands when the route changes.
  useEffect(() => {
    if (!hydrated) return;
    if (!activeFolderId && !activeRadar) return;
    setExpandedState((prev) => {
      const id = activeFolderId ?? (activeRadar && activeRadar.folder_id === null ? SIN_CARPETA_ID : null);
      if (!id || prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      writeExpanded(Array.from(next));
      return next;
    });
  }, [activeFolderId, activeRadar, hydrated]);

  const toggleFolder = (id: string) => {
    setExpandedState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      writeExpanded(Array.from(next));
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

  // DnD (folders only)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = folders.findIndex((f) => f.id === active.id);
    const newIdx = folders.findIndex((f) => f.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onReorderFolders(arrayMove(folders, oldIdx, newIdx));
  };

  // Group radars by folder (applies search filter locally too)
  const searchLower = search.trim().toLowerCase();
  const radarMatchesSearch = (r: Radar) =>
    !searchLower || r.name.toLowerCase().includes(searchLower);

  const radarsByFolder = new Map<string, Radar[]>();
  const radarsNoFolder: Radar[] = [];
  for (const r of radars) {
    if (!radarMatchesSearch(r)) continue;
    if (r.folder_id) {
      const list = radarsByFolder.get(r.folder_id) ?? [];
      list.push(r);
      radarsByFolder.set(r.folder_id, list);
    } else {
      radarsNoFolder.push(r);
    }
  }

  // When searching: force-expand folders with matches, collapse the rest
  const isSearching = !!searchLower;
  const effectiveExpanded = (id: string): boolean => {
    if (isSearching) {
      if (id === SIN_CARPETA_ID) return radarsNoFolder.length > 0;
      return (radarsByFolder.get(id)?.length ?? 0) > 0;
    }
    return expanded.has(id);
  };

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
            active={view === 'favoritos'}
            dimmed={unreadCounts.favorites === 0}
            onClick={() => navigate({ view: 'favoritos' })}
          />
          <AutoView
            icon={<ClockIcon />}
            label="Recientes"
            active={view === 'recientes'}
            onClick={() => navigate({ view: 'recientes' })}
          />
          {unreadAlertCount > 0 && (
            <AutoView
              icon={<AlertIcon />}
              label="Con alertas"
              count={unreadAlertCount}
              countRed
              active={view === 'alertas'}
              onClick={() => navigate({ view: 'alertas' })}
            />
          )}
        </div>

        <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

        {/* Folders header */}
        <div style={{ padding: '10px 14px 6px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Carpetas
          </span>
        </div>

        {/* Sortable folders with accordion */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={folders.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {folders.map((folder) => {
              const folderRadars = radarsByFolder.get(folder.id) ?? [];
              const isOpen = effectiveExpanded(folder.id);
              const matchesInFolder = isSearching ? folderRadars.length : -1;
              // Hide folders with no matches when searching
              if (isSearching && folderRadars.length === 0) return null;
              return (
                <SortableFolderAccordion
                  key={folder.id}
                  folder={folder}
                  radars={folderRadars}
                  expanded={isOpen}
                  onToggle={() => toggleFolder(folder.id)}
                  hovered={hoveredFolder === folder.id}
                  onHover={setHoveredFolder}
                  onEdit={() => onEditFolder(folder)}
                  onDelete={() => onDeleteFolder(folder)}
                  activeRadarId={activeRadarId}
                  searchMatches={matchesInFolder}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Sin carpeta */}
        {(!isSearching || radarsNoFolder.length > 0) && (
          <FolderAccordionRow
            id={SIN_CARPETA_ID}
            name="Sin carpeta"
            icon={<Inbox size={14} />}
            iconColor="var(--text-tertiary)"
            radars={radarsNoFolder}
            expanded={effectiveExpanded(SIN_CARPETA_ID)}
            onToggle={() => toggleFolder(SIN_CARPETA_ID)}
            activeRadarId={activeRadarId}
          />
        )}
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

// ── Sortable folder accordion (real folders) ─────────────────────────────────

interface SortableProps {
  folder: RadarFolder;
  radars: Radar[];
  expanded: boolean;
  onToggle: () => void;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  activeRadarId: string | null;
  searchMatches: number;
}

function SortableFolderAccordion({
  folder, radars, expanded, onToggle, hovered, onHover,
  onEdit, onDelete, activeRadarId, searchMatches,
}: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: folder.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  return (
    <div
      ref={setNodeRef}
      style={{ ...style, margin: '1px 8px', position: 'relative' }}
      onMouseEnter={() => onHover(folder.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute', left: -2, top: 0, width: 16, height: 30,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 0.35 : 0, transition: 'opacity 0.15s',
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

      <AccordionHeader
        expanded={expanded}
        onToggle={onToggle}
        hovered={hovered}
        name={folder.name}
        icon={<FolderIconFor id={folder.icon} size={14} />}
        iconColor={folder.color ?? 'var(--text-tertiary)'}
        count={searchMatches >= 0 ? searchMatches : radars.length}
        actions={
          hovered ? (
            <>
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
            </>
          ) : null
        }
      />

      {expanded && (
        <RadarChildList radars={radars} activeRadarId={activeRadarId} />
      )}
    </div>
  );
}

// ── Non-sortable folder row (Sin carpeta) ────────────────────────────────────

function FolderAccordionRow({
  id, name, icon, iconColor, radars, expanded, onToggle, activeRadarId,
}: {
  id: string;
  name: string;
  icon: React.ReactNode;
  iconColor: string;
  radars: Radar[];
  expanded: boolean;
  onToggle: () => void;
  activeRadarId: string | null;
}) {
  return (
    <div style={{ margin: '1px 8px' }} data-folder-id={id}>
      <AccordionHeader
        expanded={expanded}
        onToggle={onToggle}
        hovered={false}
        name={name}
        icon={icon}
        iconColor={iconColor}
        count={radars.length}
      />
      {expanded && <RadarChildList radars={radars} activeRadarId={activeRadarId} />}
    </div>
  );
}

// ── Shared: accordion header row ────────────────────────────────────────────

function AccordionHeader({
  expanded, onToggle, hovered, name, icon, iconColor, count, actions,
}: {
  expanded: boolean;
  onToggle: () => void;
  hovered: boolean;
  name: string;
  icon: React.ReactNode;
  iconColor: string;
  count: number;
  actions?: React.ReactNode;
}) {
  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px 7px 18px', cursor: 'pointer', fontSize: 13,
        color: 'var(--text-secondary)',
        background: hovered ? 'var(--bg-subtle)' : 'transparent',
        borderRadius: 6,
        transition: 'background 0.1s',
        userSelect: 'none',
      }}
    >
      <Chevron open={expanded} />
      <span style={{ color: iconColor, display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {actions ? (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>{actions}</div>
      ) : (
        count > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', flexShrink: 0 }}>
            {count}
          </span>
        )
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="2"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease',
        color: 'var(--text-tertiary)',
        flexShrink: 0,
      }}
    >
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Radar children list inside an expanded folder ────────────────────────────

function RadarChildList({
  radars, activeRadarId,
}: { radars: Radar[]; activeRadarId: string | null }) {
  if (radars.length === 0) {
    return (
      <div style={{
        padding: '6px 12px 8px 32px',
        fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic',
      }}>
        Sin radares.
      </div>
    );
  }
  return (
    <div style={{ padding: '2px 0 4px' }}>
      {radars.map((r) => (
        <RadarChildItem key={r.id} radar={r} active={r.id === activeRadarId} />
      ))}
    </div>
  );
}

function RadarChildItem({ radar, active }: { radar: Radar; active: boolean }) {
  const formula = formulaToText(radar.clauses, radar.top_level_operator);
  return (
    <Link
      href={`/radares/${radar.id}`}
      style={{
        display: 'block',
        padding: '6px 10px 6px 32px',
        textDecoration: 'none',
        background: active ? 'rgba(0,0,0,0.04)' : 'transparent',
        borderRadius: 6,
        margin: '0 4px',
        transition: 'background 0.12s, transform 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.025)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.25,
        }}
      >
        {radar.name}
      </div>
      <div
        title={formula}
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 10.5,
          color: 'var(--text-tertiary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginTop: 1,
        }}
      >
        {formula}
      </div>
    </Link>
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

