'use client';

import { createElement, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import type { SignalRecord, SignalCategory } from '@/lib/types/signals';
import {
  SIGNAL_CATEGORY_LABELS,
  SIGNAL_CATEGORY_ORDER,
} from '@/lib/types/signals';

interface Props {
  signals: SignalRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onCreate?: () => void;
}

// ── Icons ──────────────────────────────────────────────────────────────

function IconMarca() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPersona() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
    </svg>
  );
}
function IconZona() {
  return createElement(MapPin, { size: 14, strokeWidth: 1.6 });
}
function IconTema() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h10" strokeLinecap="round" />
    </svg>
  );
}
function IconOrganizacion() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="12" height="9" rx="1" />
      <path d="M5 14V9h6v5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 2h4l1 3H5L6 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconInstitucion() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1l7 4H1l7-4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5v8M6 5v8M10 5v8M13 5v8" strokeLinecap="round" />
      <path d="M1 13h14" strokeLinecap="round" />
    </svg>
  );
}
function IconPartido() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2v12" strokeLinecap="round" />
      <path d="M3 2l10 4-10 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconProducto() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 5l1.5-3h9L14 5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="5" width="12" height="9" rx="1" />
      <path d="M6 5v3a2 2 0 0 0 4 0V5" strokeLinecap="round" />
    </svg>
  );
}
function IconCampana() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 3L14 8l-3 5H5L2 8l3-5h6z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconEvento() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="10" rx="1" />
      <path d="M5 2v3M11 2v3M2 8h12" strokeLinecap="round" />
    </svg>
  );
}
function IconNormativa() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v2" strokeLinecap="round" />
      <path d="M3 4l2 4H1l2-4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 4l2 4H9l2-4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v5M13 8v5M3 13h10" strokeLinecap="round" />
      <path d="M6 4h4" strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<SignalCategory, React.ReactNode> = {
  persona:             <IconPersona />,
  organizacion:        <IconOrganizacion />,
  institucion_publica: <IconInstitucion />,
  partido_politico:    <IconPartido />,
  marca:               <IconMarca />,
  producto_servicio:   <IconProducto />,
  campana_iniciativa:  <IconCampana />,
  evento:              <IconEvento />,
  tema:                <IconTema />,
  normativa:           <IconNormativa />,
  zona_geografica:     <IconZona />,
};

// ── Status dots ────────────────────────────────────────────────────────

function ReadyDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6, height: 6,
        borderRadius: '50%',
        background: '#3B82F6',
        flexShrink: 0,
        marginTop: 1,
      }}
    />
  );
}

function WarmingDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6, height: 6,
        borderRadius: '50%',
        background: 'var(--border)',
        flexShrink: 0,
        marginTop: 1,
      }}
      title="Calentando datos"
    />
  );
}

// ── Star ───────────────────────────────────────────────────────────────

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill={filled ? '#F59E0B' : 'none'} stroke={filled ? '#F59E0B' : 'currentColor'} strokeWidth="1.5">
      <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Chevron ────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Signal row ─────────────────────────────────────────────────────────

interface SignalRowProps {
  signal: SignalRecord;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function SignalRow({ signal, isSelected, onSelect, onToggleFavorite }: SignalRowProps) {
  const isReady = signal.status === 'ready';
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 12px 7px 24px',
        cursor: 'pointer',
        background: isSelected ? 'var(--bg-muted)' : 'transparent',
        borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {isReady ? <ReadyDot /> : <WarmingDot />}
      </span>

      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: isSelected ? 600 : 400,
          color: isReady ? 'var(--text-primary)' : 'var(--text-tertiary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {signal.name}
      </span>

      <button
        onClick={onToggleFavorite}
        style={{
          background: 'none',
          border: 'none',
          padding: '0 2px',
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          opacity: signal.is_favorite ? 1 : 0.4,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = signal.is_favorite ? '1' : '0.4'; }}
        title={signal.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <StarIcon filled={signal.is_favorite} />
      </button>
    </div>
  );
}

// ── Category accordion ─────────────────────────────────────────────────

interface AccordionProps {
  category: SignalCategory;
  signals: SignalRecord[];
  isOpen: boolean;
  onToggle: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

function CategoryAccordion({
  category, signals, isOpen, onToggle,
  selectedId, onSelect, onToggleFavorite,
}: AccordionProps) {
  const isEmpty = signals.length === 0;

  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '8px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          textAlign: 'left',
        }}
      >
        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
          {CATEGORY_ICONS[category]}
        </span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>
          {SIGNAL_CATEGORY_LABELS[category]}
        </span>
        <span
          style={{
            fontSize: 11,
            color: isEmpty ? 'var(--text-tertiary)' : 'var(--text-tertiary)',
            background: isEmpty ? 'transparent' : 'var(--bg-muted)',
            padding: '1px 6px',
            borderRadius: 10,
            fontWeight: 500,
            opacity: isEmpty ? 0.6 : 1,
          }}
        >
          {signals.length}
        </span>
        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
          <Chevron open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div>
          {isEmpty ? (
            <div
              style={{
                padding: '6px 14px 10px 24px',
                fontSize: 12,
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              Sin señales de este tipo
            </div>
          ) : (
            signals.map((sig) => (
              <SignalRow
                key={sig.id}
                signal={sig}
                isSelected={selectedId === sig.id}
                onSelect={() => onSelect(sig.id)}
                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(sig.id, sig.is_favorite); }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────────

export default function SignalsSidebar({
  signals, selectedId, onSelect, onToggleFavorite, onCreate,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = useMemo(
    () => signals.filter((s) => !q || s.name.toLowerCase().includes(q)
      || (s.aliases ?? []).some((a) => a.toLowerCase().includes(q))),
    [signals, q],
  );

  // Default-open: only categories with 1+ signal in the filtered set.
  const [openCategories, setOpenCategories] = useState<Set<SignalCategory>>(
    () => new Set(
      SIGNAL_CATEGORY_ORDER.filter((cat) => signals.some((s) => s.type === cat)),
    ),
  );

  // Expand any category that has search matches while a query is active.
  const effectiveOpen = (cat: SignalCategory): boolean => {
    if (q) return filtered.some((s) => s.type === cat);
    return openCategories.has(cat);
  };

  const toggleCategory = (cat: SignalCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const favoriteSignals = filtered.filter((s) => s.is_favorite);

  const handleCreate = () => {
    if (onCreate) onCreate();
    else router.push('/senales/nueva');
  };

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 14px 12px',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.2px',
            marginBottom: 10,
          }}
        >
          Señales
        </div>
        <div style={{ position: 'relative' }}>
          <svg
            width="13" height="13" viewBox="0 0 16 16"
            fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8"
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L13 13" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar señal…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--bg-muted)',
              border: '1px solid transparent',
              borderRadius: 6,
              padding: '6px 8px 6px 26px',
              fontSize: 12,
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Favorites */}
        {favoriteSignals.length > 0 && (
          <div style={{ paddingTop: 8 }}>
            <div
              style={{
                padding: '4px 14px 6px',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Favoritos
            </div>
            {favoriteSignals.map((sig) => (
              <SignalRow
                key={sig.id}
                signal={sig}
                isSelected={selectedId === sig.id}
                onSelect={() => onSelect(sig.id)}
                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(sig.id, sig.is_favorite); }}
              />
            ))}
            <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
          </div>
        )}

        {/* Categories — always render all 11, empty ones start collapsed */}
        <div style={{ paddingTop: favoriteSignals.length ? 0 : 8, paddingBottom: 64 }}>
          {SIGNAL_CATEGORY_ORDER.map((cat) => {
            const sigs = filtered.filter((s) => s.type === cat);
            return (
              <CategoryAccordion
                key={cat}
                category={cat}
                signals={sigs}
                isOpen={effectiveOpen(cat)}
                onToggle={() => toggleCategory(cat)}
                selectedId={selectedId}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
              />
            );
          })}
        </div>
      </div>

      {/* Nueva señal CTA */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg)',
        }}
      >
        <button
          onClick={handleCreate}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '9px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M8 2v12M2 8h12" strokeLinecap="round" />
          </svg>
          Nueva señal
        </button>
      </div>
    </div>
  );
}
