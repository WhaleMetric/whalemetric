'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ActorMetrics, BenchmarkActor } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  metrics: ActorMetrics[];
  totalMentions: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function SoVDonut({
  actors,
  metrics,
  totalMentions,
  height = 260,
  innerRadius = 65,
  outerRadius = 100,
}: Props) {
  const data = metrics.map((m) => {
    const a = actors.find((x) => x.id === m.actor_id);
    return {
      name: a?.display_name ?? '',
      value: m.sov_pct,
      mentions: m.mentions,
      color: a?.color ?? '#999',
    };
  });

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            strokeWidth={2}
            stroke="var(--bg)"
            isAnimationActive
            animationDuration={500}
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
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          {totalMentions.toLocaleString('es')}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          menciones
        </div>
      </div>
    </div>
  );
}
