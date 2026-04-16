'use client';

import { useState } from 'react';
import {
  Signal,
  SignalCategory,
  SIGNALS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '@/lib/mock/signals';

interface Props {
  selectedId: string | null;
  favorites: Set<string>;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
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
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="7" r="4" />
      <path d="M8 11v4M5 14h6" strokeLinecap="round" />
    </svg>
  );
}
function IconTema() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h10" strokeLinecap="round" />
    </svg>
  );
}
function IconCompetidor() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 13V6l5-4 5 4v7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="9" width="4" height="4" rx="0.5" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<SignalCategory, React.ReactNode> = {
  marca: <IconMarca />,
  persona: <IconPersona />,
  zona_geografica: <IconZona />,
  tema_sector: <IconTema />,
  competidor: <IconCompetidor />,
};

// ── Alert pulse dot ────────────────────────────────────────────────────

function AlertDot() {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 8,
        height: 8,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: '#EF4444',
          animation: 'signal-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
          opacity: 0.7,
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 1,
          borderRadius: '50%',
          background: '#EF4444',
        }}
      />
    </span>
  );
}

function InactiveDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'var(--border)',
        flexShrink: 0,
        marginTop: 1,
      }}
    />
  );
}

// ── Star icon ─────────────────────────────────────────────────────────

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
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Signal row ─────────────────────────────────────────────────────────

interface SignalRowProps {
  signal: Signal;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function SignalRow({ signal, isSelected, isFavorite, onSelect, onToggleFavorite }: SignalRowProps) {
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
      {/* status dot */}
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {signal.hasAlert ? <AlertDot /> : <InactiveDot />}
      </span>

      {/* name */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: isSelected ? 600 : 400,
          color: signal.isInactive ? 'var(--text-tertiary)' : 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {signal.name}
      </span>

      {/* mentions count */}
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 11,
          color: signal.isInactive ? 'var(--text-tertiary)' : 'var(--text-secondary)',
          flexShrink: 0,
        }}
      >
        {signal.mentionsToday.toString().padStart(4, '\u2007')}
      </span>

      {/* star */}
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
          opacity: isFavorite ? 1 : 0.4,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = isFavorite ? '1' : '0.4'; }}
        title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <StarIcon filled={isFavorite} />
      </button>
    </div>
  );
}

// ── Category accordion ─────────────────────────────────────────────────

interface AccordionProps {
  category: SignalCategory;
  signals: Signal[];
  isOpen: boolean;
  onToggle: () => void;
  selectedId: string | null;
  favorites: Set<string>;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function CategoryAccordion({
  category, signals, isOpen, onToggle,
  selectedId, favorites, onSelect, onToggleFavorite,
}: AccordionProps) {
  if (!signals.length) return null;

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
          {CATEGORY_LABELS[category]}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            background: 'var(--bg-muted)',
            padding: '1px 6px',
            borderRadius: 10,
            fontWeight: 500,
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
          {signals.map((sig) => (
            <SignalRow
              key={sig.id}
              signal={sig}
              isSelected={selectedId === sig.id}
              isFavorite={favorites.has(sig.id)}
              onSelect={() => onSelect(sig.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(sig.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────────

export default function SignalsSidebar({ selectedId, favorites, onSelect, onToggleFavorite }: Props) {
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<SignalCategory>>(
    new Set(CATEGORY_ORDER),
  );

  const toggleCategory = (cat: SignalCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const q = search.toLowerCase();
  const filtered = SIGNALS.filter(
    (s) => !q || s.name.toLowerCase().includes(q),
  );

  const favoriteSignals = SIGNALS.filter(
    (s) => favorites.has(s.id) && (!q || s.name.toLowerCase().includes(q)),
  );

  return (
    <div
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
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
        {/* search */}
        <div style={{ position: 'relative' }}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="1.8"
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

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Favorites section */}
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
                isFavorite
                onSelect={() => onSelect(sig.id)}
                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(sig.id); }}
              />
            ))}
            <div
              style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }}
            />
          </div>
        )}

        {/* Category accordions */}
        <div style={{ paddingTop: favoriteSignals.length ? 0 : 8, paddingBottom: 64 }}>
          {CATEGORY_ORDER.map((cat) => {
            const sigs = filtered.filter((s) => s.category === cat);
            return (
              <CategoryAccordion
                key={cat}
                category={cat}
                signals={sigs}
                isOpen={openCategories.has(cat)}
                onToggle={() => toggleCategory(cat)}
                selectedId={selectedId}
                favorites={favorites}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
              />
            );
          })}
        </div>
      </div>

      {/* ── Nueva señal CTA ── */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg)',
        }}
      >
        <button
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

      {/* pulse animation */}
      <style>{`
        @keyframes signal-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
