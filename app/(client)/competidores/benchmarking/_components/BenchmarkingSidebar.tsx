'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Benchmark } from '@/lib/types/benchmark';
import { BenchmarkSidebarItem } from './BenchmarkSidebarItem';

interface Props {
  benchmarks: Benchmark[];
  onToggleFavorite: (id: string) => void;
  onNewBenchmark: () => void;
}

export function BenchmarkingSidebar({
  benchmarks, onToggleFavorite, onNewBenchmark,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);

  const view = searchParams.get('view');

  const [searchDraft, setSearchDraft] = useState('');
  const [searchApplied, setSearchApplied] = useState('');

  // Debounce applied filter by 200ms
  useEffect(() => {
    const t = setTimeout(() => setSearchApplied(searchDraft), 200);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const activeId = useMemo(() => {
    const m = pathname.match(/^\/competidores\/benchmarking\/([^/?#]+)/);
    return m ? m[1] : null;
  }, [pathname]);

  const favoriteCount = benchmarks.filter((b) => b.is_favorite).length;

  const isListRoute = pathname === '/competidores/benchmarking' || pathname === '/competidores/benchmarking/';

  const searchLower = searchApplied.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!searchLower) return benchmarks;
    return benchmarks.filter((b) => b.name.toLowerCase().includes(searchLower));
  }, [benchmarks, searchLower]);

  const navigateView = (v: 'favoritos' | 'recientes') => {
    router.push(`/competidores/benchmarking?view=${v}`);
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
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Buscar benchmark…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-muted)', border: '1px solid transparent',
              borderRadius: 7, padding: '7px 26px 7px 28px',
              fontSize: 12, color: 'var(--text-primary)', outline: 'none',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
          />
          {searchDraft && (
            <button
              onClick={() => { setSearchDraft(''); setSearchApplied(''); }}
              title="Limpiar"
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', padding: 2,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 80 }}>
        {/* Auto views */}
        <div style={{ padding: '8px 0' }}>
          <AutoView
            icon={<StarIcon />}
            label="Favoritos"
            count={favoriteCount}
            active={isListRoute && view === 'favoritos'}
            dimmed={favoriteCount === 0}
            onClick={() => navigateView('favoritos')}
          />
          <AutoView
            icon={<ClockIcon />}
            label="Recientes"
            active={isListRoute && view === 'recientes'}
            onClick={() => navigateView('recientes')}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

        {/* Benchmarks header */}
        <div style={{ padding: '10px 14px 6px' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Benchmarks
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            padding: '12px 14px', fontSize: 12, color: 'var(--text-tertiary)',
            fontStyle: 'italic',
          }}>
            {searchLower ? 'Sin resultados' : 'No hay benchmarks'}
          </div>
        ) : (
          filtered.map((b) => (
            <BenchmarkSidebarItem
              key={b.id}
              benchmark={b}
              active={activeId === b.id}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>

      {/* Bottom button */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={onNewBenchmark}
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
          Nuevo benchmark
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AutoView({
  icon, label, count, active, dimmed, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
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
          color: 'var(--text-tertiary)',
          background: 'var(--bg-muted)',
          padding: '1px 6px', borderRadius: 10, fontWeight: 500,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

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
