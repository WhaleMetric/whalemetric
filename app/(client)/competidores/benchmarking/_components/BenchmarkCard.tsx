'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, Pie, Cell } from 'recharts';
import type { Benchmark } from '@/lib/types/benchmark';
import { CATEGORY_LABELS } from '@/lib/types/benchmark';
import { ActorChip } from './ActorChip';

interface Props {
  benchmark: Benchmark;
}

export function BenchmarkCard({ benchmark }: Props) {
  const router = useRouter();
  const snap = benchmark.snapshot;
  const totalMentions = snap?.actors_metrics.reduce((a, m) => a + m.mentions, 0) ?? 0;

  const leader = snap?.actors_metrics.reduce((best, m) =>
    (best && best.mentions > m.mentions) ? best : m,
    snap.actors_metrics[0],
  );
  const leaderActor = leader ? benchmark.actors.find((a) => a.id === leader.actor_id) : null;
  const summary = leader && leaderActor
    ? `${leaderActor.display_name} lidera con ${leader.sov_pct}% SoV, ${leader.delta_mentions_pct >= 0 ? '+' : ''}${leader.delta_mentions_pct}% vs mes ant.`
    : 'Sin datos suficientes';

  const pieData = snap?.actors_metrics.map((m) => ({
    name: benchmark.actors.find((a) => a.id === m.actor_id)?.display_name ?? '',
    value: m.sov_pct,
    color: benchmark.actors.find((a) => a.id === m.actor_id)?.color ?? '#999',
  })) ?? [];

  const periodLabel = `${benchmark.default_period.replace('d', '')}d`;

  return (
    <div
      onClick={() => router.push(`/competidores/benchmarking/${benchmark.id}`)}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Row 1: favorite + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <svg width="15" height="15" viewBox="0 0 16 16"
          fill={benchmark.is_favorite ? '#F59E0B' : 'none'}
          stroke={benchmark.is_favorite ? '#F59E0B' : 'var(--text-tertiary)'}
          strokeWidth="1.5"
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {benchmark.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {benchmark.actors.length} actores · {CATEGORY_LABELS[benchmark.category]} · hace{' '}
            {benchmark.last_viewed_at
              ? formatDistanceToNow(new Date(benchmark.last_viewed_at), { locale: es })
              : formatDistanceToNow(new Date(benchmark.updated_at), { locale: es })}
          </div>
        </div>
      </div>

      {/* Actor chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 10 }}>
        {benchmark.actors.map((a) => (
          <ActorChip key={a.id} name={a.display_name} color={a.color} />
        ))}
      </div>

      {/* Summary */}
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
        {summary}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        borderTop: '1px solid var(--border-light)', paddingTop: 10,
      }}>
        {pieData.length > 0 && (
          <PieChart width={44} height={44}>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={10}
              outerRadius={20}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Total {totalMentions.toLocaleString('es')} menciones · {periodLabel}
        </div>
      </div>
    </div>
  );
}
