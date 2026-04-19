'use client';

import type { ActorMetrics, BenchmarkActor } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  metrics: ActorMetrics[];
}

export function SoVRanking({ actors, metrics }: Props) {
  const sorted = [...metrics].sort((a, b) => b.sov_pct - a.sov_pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {sorted.map((m, idx) => {
        const a = actors.find((x) => x.id === m.actor_id);
        if (!a) return null;
        const delta = m.delta_sov_pp;
        const deltaText = delta === 0 ? 'estable' : `${delta > 0 ? '+' : ''}${delta}pp`;
        const deltaColor = delta > 0 ? '#10B981' : delta < 0 ? '#EF4444' : 'var(--text-tertiary)';
        const deltaArrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
        return (
          <div key={m.actor_id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-light)',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)',
              fontFamily: 'monospace', width: 26,
            }}>
              #{idx + 1}
            </span>
            <span style={{
              width: 11, height: 11, borderRadius: '50%',
              background: a.color, flexShrink: 0,
            }} />
            <span style={{
              flex: 1, fontSize: 14, fontWeight: 500,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {a.display_name}
            </span>
            <span style={{
              fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              width: 56, textAlign: 'right',
            }}>
              {m.sov_pct}%
            </span>
            <span style={{ fontSize: 12, color: deltaColor, width: 76, textAlign: 'right' }}>
              {deltaArrow} {deltaText}
            </span>
          </div>
        );
      })}
    </div>
  );
}
