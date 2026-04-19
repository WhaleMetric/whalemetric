'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_BENCHMARKS, findMockBenchmark } from '@/lib/mock/benchmarks';
import type { BenchmarkPeriod } from '@/lib/types/benchmark';
import { PERIOD_DAYS, PERIOD_LABELS } from '@/lib/types/benchmark';
import { SoVLargeDonut } from './_components/SoVLargeDonut';
import { SoVRanking } from './_components/SoVRanking';
import { SoVEvolution } from './_components/SoVEvolution';

export default function ShareOfVoicePage() {
  return (
    <Suspense>
      <ShareOfVoiceInner />
    </Suspense>
  );
}

function ShareOfVoiceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const benchmarkParam = searchParams.get('benchmark');
  const activeId = benchmarkParam ?? MOCK_BENCHMARKS[0]?.id ?? '';
  const benchmark = useMemo(() => findMockBenchmark(activeId), [activeId]);

  const initialPeriod = (searchParams.get('period') as BenchmarkPeriod | null)
    ?? benchmark?.default_period
    ?? '30d';
  const [period, setPeriod] = useState<BenchmarkPeriod>(initialPeriod);

  const setQuery = (patch: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) sp.set(k, v);
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  const onPeriodChange = (p: BenchmarkPeriod) => {
    setPeriod(p);
    setQuery({ period: p });
  };

  const onBenchmarkChange = (id: string) => {
    setQuery({ benchmark: id });
  };

  if (!benchmark || !benchmark.snapshot) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Sin benchmarks disponibles
      </div>
    );
  }

  const snap = benchmark.snapshot;
  const days = PERIOD_DAYS[period];

  // Insights — biggest SoV gain / loss / most stable
  const metricsByDelta = [...snap.actors_metrics].sort((a, b) => b.delta_sov_pp - a.delta_sov_pp);
  const biggestGain = metricsByDelta[0];
  const biggestLoss = metricsByDelta[metricsByDelta.length - 1];
  const mostStable = [...snap.actors_metrics].sort(
    (a, b) => Math.abs(a.delta_sov_pp) - Math.abs(b.delta_sov_pp),
  )[0];

  const findActor = (id: string) => benchmark.actors.find((a) => a.id === id);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Share of Voice
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
              Cuota de voz mediática de tus competidores
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={activeId}
              onChange={(e) => onBenchmarkChange(e.target.value)}
              style={{
                padding: '7px 12px', fontSize: 13,
                background: 'var(--bg)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 7,
                cursor: 'pointer',
              }}
            >
              {MOCK_BENCHMARKS.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
              {(['7d', '14d', '30d', '90d'] as BenchmarkPeriod[]).map((p) => {
                const active = period === p;
                return (
                  <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      background: active ? 'var(--text-primary)' : 'var(--bg)',
                      color: active ? 'var(--bg)' : 'var(--text-secondary)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Donut + ranking */}
        <div className="sov-main-row">
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 20px 12px',
          }}>
            <SoVLargeDonut actors={benchmark.actors} metrics={snap.actors_metrics} />
          </div>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 0',
          }}>
            <div style={{
              padding: '0 16px 10px',
              fontSize: 12, fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Ranking · {PERIOD_LABELS[period]}
            </div>
            <SoVRanking actors={benchmark.actors} metrics={snap.actors_metrics} />
          </div>
        </div>

        {/* Evolution */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Evolución del Share of Voice · {PERIOD_LABELS[period]}
          </div>
          <SoVEvolution actors={benchmark.actors} timeline={snap.timeline_comparison} days={days} />
        </div>

        {/* Insights */}
        <div className="sov-insight-row">
          <InsightCard
            title="Mayor crecimiento"
            actor={biggestGain ? findActor(biggestGain.actor_id) : undefined}
            delta={biggestGain ? biggestGain.delta_sov_pp : 0}
            kind="gain"
          />
          <InsightCard
            title="Mayor caída"
            actor={biggestLoss ? findActor(biggestLoss.actor_id) : undefined}
            delta={biggestLoss ? biggestLoss.delta_sov_pp : 0}
            kind="loss"
          />
          <InsightCard
            title="Más estable"
            actor={mostStable ? findActor(mostStable.actor_id) : undefined}
            delta={mostStable ? mostStable.delta_sov_pp : 0}
            kind="stable"
          />
        </div>
      </div>

      <style>{`
        .sov-main-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 18px;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .sov-main-row { grid-template-columns: 1fr; }
        }
        .sov-insight-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 760px) {
          .sov-insight-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function InsightCard({
  title, actor, delta, kind,
}: {
  title: string;
  actor?: { id: string; display_name: string; color: string };
  delta: number;
  kind: 'gain' | 'loss' | 'stable';
}) {
  if (!actor) return null;
  const copy =
    kind === 'gain'  ? `ganó ${Math.abs(delta)} puntos porcentuales este periodo` :
    kind === 'loss'  ? `perdió ${Math.abs(delta)} puntos porcentuales` :
                       'mantiene su cuota prácticamente sin cambios';
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: actor.color }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {actor.display_name}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {copy}
      </div>
    </div>
  );
}
