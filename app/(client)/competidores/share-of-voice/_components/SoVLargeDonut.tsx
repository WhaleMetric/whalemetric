'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ActorMetrics, BenchmarkActor } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  metrics: ActorMetrics[];
}

export function SoVLargeDonut({ actors, metrics }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = metrics.map((m) => {
    const a = actors.find((x) => x.id === m.actor_id);
    return {
      id: m.actor_id,
      name: a?.display_name ?? '',
      value: m.sov_pct,
      mentions: m.mentions,
      color: a?.color ?? '#999',
    };
  });

  const leader = [...data].sort((a, b) => b.value - a.value)[0];
  const focused = hoverIdx != null ? data[hoverIdx] : leader;

  return (
    <div style={{ position: 'relative', width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={100}
            outerRadius={150}
            strokeWidth={3}
            stroke="var(--bg)"
            onMouseEnter={(_, i) => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            animationDuration={700}
          >
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, _name, props) => {
              const payload = (props as { payload?: { mentions?: number } })?.payload;
              const mentions = payload?.mentions ?? 0;
              return [`${value}% · ${mentions.toLocaleString('es')} menc.`, ''];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {focused && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            {hoverIdx != null ? 'Actor' : 'Líder'}
          </div>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: focused.color, marginBottom: 2,
          }}>
            {focused.name}
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {focused.value}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {focused.mentions.toLocaleString('es')} menciones
          </div>
        </div>
      )}
    </div>
  );
}
