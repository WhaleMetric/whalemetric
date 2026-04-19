'use client';

import type { ActorMetrics, BenchmarkActor } from '@/lib/types/benchmark';

interface Props {
  actor: BenchmarkActor;
  metrics: ActorMetrics;
}

export function ActorMiniCard({ actor, metrics }: Props) {
  const up = metrics.delta_mentions_pct >= 0;
  const sentArrow =
    metrics.sentiment_positive_pct > 55 ? '↑' :
    metrics.sentiment_positive_pct < 45 ? '↓' : '→';
  const sentColor =
    metrics.sentiment_positive_pct > 55 ? '#10B981' :
    metrics.sentiment_positive_pct < 45 ? '#EF4444' : '#9CA3AF';

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 3, background: actor.color }} />
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {actor.display_name}
        </div>

        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {metrics.mentions.toLocaleString('es')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>
            menciones
          </div>
        </div>

        {/* SoV bar */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4,
          }}>
            <span>SoV</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{metrics.sov_pct}%</span>
          </div>
          <div style={{
            height: 5, borderRadius: 3,
            background: 'var(--bg-muted)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min(100, metrics.sov_pct)}%`,
              height: '100%',
              background: actor.color,
              transition: 'width 0.4s',
            }} />
          </div>
        </div>

        {/* Sentiment + delta row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: sentColor }}>
            {sentArrow} {metrics.sentiment_positive_pct}%
          </span>
          <span style={{ color: up ? '#10B981' : '#EF4444' }}>
            {up ? '+' : ''}{metrics.delta_mentions_pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
