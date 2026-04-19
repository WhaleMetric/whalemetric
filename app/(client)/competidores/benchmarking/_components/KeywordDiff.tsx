'use client';

import type { BenchmarkActor, KeywordDiffData } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  data: KeywordDiffData;
}

export function KeywordDiff({ actors, data }: Props) {
  return (
    <div className="bm-kw-grid">
      {data.actors.map((entry) => {
        const a = actors.find((x) => x.id === entry.actor_id);
        if (!a) return null;
        return (
          <div
            key={entry.actor_id}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: a.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {a.display_name}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: 10, padding: '2px 6px',
                background: 'var(--bg-muted)',
                color: 'var(--text-tertiary)',
                borderRadius: 999, fontWeight: 600,
              }}>
                {entry.unique.length} únicas
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {entry.unique.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Sin keywords diferenciadoras
                </span>
              ) : entry.unique.map((k) => (
                <span
                  key={k}
                  style={{
                    fontSize: 11, padding: '3px 8px',
                    border: `1px solid ${a.color}40`,
                    color: 'var(--text-primary)',
                    background: `${a.color}15`,
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {k}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 'auto' }}>
              Compartidas: {entry.shared_count} con otros
            </div>
          </div>
        );
      })}

      <style>{`
        .bm-kw-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
