'use client';

import type { ActorMetrics, BenchmarkActor, RankingEntry } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  metrics: ActorMetrics[];
  ranking: RankingEntry[];
}

export function RankingTable({ actors, metrics, ranking }: Props) {
  const sorted = [...metrics].sort((a, b) => b.sov_pct - a.sov_pct);
  const maxSov = Math.max(...sorted.map((m) => m.sov_pct));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map((m, idx) => {
        const actor = actors.find((a) => a.id === m.actor_id);
        const rank = ranking.find((r) => r.actor_id === m.actor_id);
        if (!actor) return null;
        const diff = rank ? rank.previous_position - rank.position : 0;
        const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
        const arrowColor = diff > 0 ? '#34D399' : diff < 0 ? '#F87171' : 'var(--text-tertiary)';

        return (
          <div key={m.actor_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 18,
              textAlign: 'right',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              fontFamily: 'monospace',
            }}>
              {idx + 1}
            </span>
            <span style={{
              display: 'inline-block',
              width: 10, height: 10,
              borderRadius: '50%',
              background: actor.color,
              flexShrink: 0,
            }} />
            <span style={{
              flex: 1,
              fontSize: 13,
              color: 'var(--text-primary)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {actor.display_name}
            </span>
            <div style={{
              width: 110,
              height: 6,
              background: 'var(--bg-muted)',
              borderRadius: 3,
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                width: `${(m.sov_pct / maxSov) * 100}%`,
                height: '100%',
                background: actor.color,
              }} />
            </div>
            <span style={{
              width: 44,
              textAlign: 'right',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
            }}>
              {m.sov_pct}%
            </span>
            <span style={{ width: 16, textAlign: 'center', color: arrowColor, fontSize: 12, fontWeight: 600 }}>
              {arrow}
            </span>
          </div>
        );
      })}
    </div>
  );
}
