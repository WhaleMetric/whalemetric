'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import type { BenchmarkActor, TimelineData } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  timeline: TimelineData;
  days: number;
}

export function TimelineComparison({ actors, timeline, days }: Props) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const sliced = timeline.points.slice(-days);
  const chartData = sliced.map((p) => {
    const row: Record<string, number | string> = { date: p.date.slice(5) };
    for (const a of actors) row[a.id] = p.values[a.id] ?? 0;
    return row;
  });

  const toggleId = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const a = actors.find((x) => x.id === String(name));
              return [`${value}%`, a?.display_name ?? String(name)];
            }}
          />
          {actors.map((a) => (
            <Line
              key={a.id}
              type="monotone"
              dataKey={a.id}
              stroke={a.color}
              strokeWidth={2}
              dot={false}
              hide={hiddenIds.has(a.id)}
              animationDuration={600}
            />
          ))}
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            content={() => (
              <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: 12, marginTop: 10, fontSize: 12,
              }}>
                {actors.map((a) => {
                  const hidden = hiddenIds.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleId(a.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '2px 6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        opacity: hidden ? 0.4 : 1,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: a.color,
                      }} />
                      {a.display_name}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
