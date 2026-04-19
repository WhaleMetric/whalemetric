'use client';

import { useMemo, useState } from 'react';
import { MOCK_BENCHMARKS } from '@/lib/mock/benchmarks';
import { BenchmarkCard } from './_components/BenchmarkCard';
import { NewBenchmarkModal } from './_components/NewBenchmarkModal';

type Filter = 'todos' | 'favoritos' | 'recientes';

export default function BenchmarkingListPage() {
  const [filter, setFilter] = useState<Filter>('todos');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const list = [...MOCK_BENCHMARKS];
    if (filter === 'favoritos') return list.filter((b) => b.is_favorite);
    if (filter === 'recientes') {
      return list.sort((a, b) => {
        const ta = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0;
        const tb = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0;
        return tb - ta;
      });
    }
    return list;
  }, [filter]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Benchmarking
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
              Compara la cobertura mediática de múltiples actores a la vez
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--bg)',
              border: 'none', borderRadius: 8, cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M8 2v12M2 8h12" strokeLinecap="round" />
            </svg>
            Nuevo benchmark
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
          {(['todos', 'favoritos', 'recientes'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                fontSize: 12, fontWeight: 500,
                background: filter === f ? 'var(--bg-muted)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: '1px solid',
                borderColor: filter === f ? 'var(--border)' : 'transparent',
                borderRadius: 7,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'var(--text-tertiary)', fontSize: 13,
          }}>
            No hay benchmarks en esta vista.
          </div>
        ) : (
          <div className="bm-grid">
            {filtered.map((b) => (
              <BenchmarkCard key={b.id} benchmark={b} />
            ))}
          </div>
        )}
      </div>

      {showModal && <NewBenchmarkModal onClose={() => setShowModal(false)} />}

      <style>{`
        .bm-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 760px) {
          .bm-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
