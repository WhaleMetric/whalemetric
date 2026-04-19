'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CrisisNewsItem, NewsSentiment } from '@/lib/types/crisis';

interface Props {
  news: CrisisNewsItem[];
  /** If set, filter feed by this source (used by TopAmplifiers click). */
  sourceFilter?: string | null;
  onClearSourceFilter?: () => void;
}

const DOT: Record<NewsSentiment, string> = {
  positivo: '#10B981',
  neutro:   '#9CA3AF',
  negativo: '#EF4444',
};

export function CriticalNewsFeed({ news, sourceFilter, onClearSourceFilter }: Props) {
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const base = sourceFilter ? news.filter((n) => n.source === sourceFilter) : news;
    return [...base].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
  }, [news, sourceFilter]);

  const visible = showAll ? filtered : filtered.slice(0, 10);

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Noticias críticas en tiempo real
        </div>
        {sourceFilter && (
          <>
            <div style={{ flex: 1 }} />
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: 'var(--text-secondary)',
              padding: '3px 10px', background: 'var(--bg-muted)',
              borderRadius: 12,
            }}>
              Filtro: {sourceFilter}
              {onClearSourceFilter && (
                <button
                  type="button"
                  onClick={onClearSourceFilter}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                  aria-label="Quitar filtro"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          Sin noticias para este filtro.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {visible.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: DOT[n.sentiment],
                  marginTop: 6, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {n.headline}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {n.source} · {formatDistanceToNow(new Date(n.published_at), { addSuffix: true, locale: es })}
                  </div>
                </div>
              </a>
            ))}
          </div>
          {filtered.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              style={{
                marginTop: 12, fontSize: 12, fontWeight: 500,
                border: 'none', background: 'none',
                color: 'var(--accent)', cursor: 'pointer', padding: 0,
              }}
            >
              {showAll ? 'Mostrar solo 10' : `Ver ${filtered.length - 10} más`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
