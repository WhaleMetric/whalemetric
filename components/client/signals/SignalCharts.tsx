'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { VolumeDataPoint, SentimentDataPoint } from '@/lib/mock/signals';

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function VolumeChart({ data }: VolumeChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }));

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}
      >
        Volumen de menciones — 14 días
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-tertiary)',
          marginBottom: 16,
        }}
      >
        Desglose por tono
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={formatted} barSize={14} barCategoryGap="30%">
          <CartesianGrid
            vertical={false}
            stroke="var(--border-light)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 12,
            }}
            cursor={{ fill: 'var(--bg-muted)' }}
          />
          <Bar dataKey="positive" name="Positivo" stackId="a" fill="#A7F3D0" radius={[0, 0, 0, 0]} />
          <Bar dataKey="neutral"  name="Neutro"   stackId="a" fill="#E5E7EB" radius={[0, 0, 0, 0]} />
          <Bar dataKey="negative" name="Negativo"  stackId="a" fill="#FCA5A5" radius={[2, 2, 0, 0]} />
          <Legend
            iconType="square"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SentimentChartProps {
  data: SentimentDataPoint[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }));

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}
      >
        Evolución del sentimiento — 30 días
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-tertiary)',
          marginBottom: 16,
        }}
      >
        % cobertura positiva vs negativa
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border-light)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            formatter={(value, name) => [
              `${value ?? 0}%`,
              name === 'positive' ? 'Positivo' : 'Negativo',
            ]}
            contentStyle={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="positive"
            name="Positivo"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="negative"
            name="Negativo"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Legend
            iconType="plainline"
            iconSize={16}
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
