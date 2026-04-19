'use client';

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

export function SoVEvolution({ actors, timeline, days }: Props) {
  const sliced = timeline.points.slice(-days);
  const chartData = sliced.map((p) => {
    const row: Record<string, number | string> = { date: p.date.slice(5) };
    for (const a of actors) row[a.id] = p.values[a.id] ?? 0;
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
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
            borderRadius: 8, fontSize: 12,
          }}
          formatter={(value, name) => {
            const a = actors.find((x) => x.id === String(name));
            return [`${value}%`, a?.display_name ?? String(name)];
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => actors.find((a) => a.id === value)?.display_name ?? value}
        />
        {actors.map((a) => (
          <Line
            key={a.id}
            type="monotone"
            dataKey={a.id}
            stroke={a.color}
            strokeWidth={2.2}
            dot={false}
            animationDuration={600}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
