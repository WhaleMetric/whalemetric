'use client';

import type { ActorMetrics, BenchmarkActor } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  metrics: ActorMetrics[];
}

export function SentimentComparison({ actors, metrics }: Props) {
  const maxMentions = Math.max(...metrics.map((m) => m.mentions));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {metrics.map((m) => {
        const a = actors.find((x) => x.id === m.actor_id);
        if (!a) return null;
        const widthPct = (m.mentions / maxMentions) * 100;

        return (
          <div key={m.actor_id}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 4, fontSize: 12,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color }} />
                {a.display_name}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: 11 }}>
                {m.mentions.toLocaleString('es')}
              </span>
            </div>
            <div
              title={`Positivo ${m.sentiment_positive_pct}% · Neutral ${m.sentiment_neutral_pct}% · Negativo ${m.sentiment_negative_pct}%`}
              style={{
                display: 'flex', height: 18,
                width: `${widthPct}%`,
                borderRadius: 5, overflow: 'hidden',
                background: 'var(--bg-muted)',
                minWidth: 40,
              }}
            >
              <Segment pct={m.sentiment_positive_pct} color="#34D399" />
              <Segment pct={m.sentiment_neutral_pct}  color="#94A3B8" />
              <Segment pct={m.sentiment_negative_pct} color="#F87171" />
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 11, color: 'var(--text-tertiary)' }}>
        <LegendSwatch color="#34D399" label="Positivo" />
        <LegendSwatch color="#94A3B8" label="Neutral" />
        <LegendSwatch color="#F87171" label="Negativo" />
      </div>
    </div>
  );
}

function Segment({ pct, color }: { pct: number; color: string }) {
  if (pct <= 0) return null;
  return (
    <div
      style={{ width: `${pct}%`, background: color, minWidth: 2 }}
      title={`${pct}%`}
    >
      <span style={{
        display: 'block', padding: '0 6px',
        fontSize: 10, color: 'white', fontWeight: 600,
        lineHeight: '18px',
        whiteSpace: 'nowrap', overflow: 'hidden',
      }}>
        {pct >= 15 ? `${pct}%` : ''}
      </span>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: color }} />
      {label}
    </span>
  );
}
