'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Benchmark } from '@/lib/types/benchmark';

interface Props {
  benchmark: Benchmark;
  active: boolean;
  onToggleFavorite: (id: string) => void;
}

export function BenchmarkSidebarItem({ benchmark, active, onToggleFavorite }: Props) {
  const router = useRouter();

  const primary = benchmark.actors.find((a) => a.role === 'primary')
    ?? benchmark.actors[0];
  const dotColor = primary?.color ?? 'var(--text-tertiary)';
  const dotSize = active ? 8 : 6;

  const when = benchmark.last_viewed_at ?? benchmark.updated_at;
  const relative = formatDistanceToNow(new Date(when), { locale: es, addSuffix: false });

  return (
    <div
      onClick={() => router.push(`/competidores/benchmarking/${benchmark.id}`)}
      className="bm-sidebar-item"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '8px 10px',
        margin: '1px 8px',
        cursor: 'pointer',
        borderRadius: 6,
        background: active ? 'rgba(0,0,0,0.04)' : 'transparent',
        borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
        position: 'relative',
      }}
    >
      <span
        aria-hidden
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: dotColor,
          marginTop: 5,
          flexShrink: 0,
          transition: 'width 0.15s, height 0.15s',
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: active ? 600 : 500,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {benchmark.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {benchmark.actors.length} actores · hace {relative}
        </div>
      </div>

      <div className="bm-sidebar-item-actions" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(benchmark.id); }}
          title={benchmark.is_favorite ? 'Quitar favorito' : 'Marcar favorito'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 3,
            display: 'flex',
            borderRadius: 4,
            color: benchmark.is_favorite ? '#F59E0B' : 'var(--text-tertiary)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16"
            fill={benchmark.is_favorite ? '#F59E0B' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5">
            <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          title="Más acciones"
          className="bm-sidebar-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            color: 'var(--text-tertiary)',
            borderRadius: 4,
            fontSize: 15,
            lineHeight: 1,
          }}
        >
          ⋯
        </button>
      </div>

      <style>{`
        .bm-sidebar-item .bm-sidebar-item-actions {
          opacity: 0;
          transition: opacity 0.15s;
        }
        .bm-sidebar-item:hover .bm-sidebar-item-actions,
        .bm-sidebar-item:focus-within .bm-sidebar-item-actions {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
