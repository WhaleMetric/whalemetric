'use client';

import { Suspense, use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { findMockBenchmark } from '@/lib/mock/benchmarks';
import type { BenchmarkPeriod } from '@/lib/types/benchmark';
import { PERIOD_DAYS } from '@/lib/types/benchmark';
import { useSourceIconsByName, type SourceIconMap } from '@/lib/hooks/useSourceIconsByName';
import { ActorChip } from '../_components/ActorChip';
import { ActorMiniCard } from '../_components/ActorMiniCard';
import { SoVDonut } from '../_components/SoVDonut';
import { RankingTable } from '../_components/RankingTable';
import { TimelineComparison } from '../_components/TimelineComparison';
import { SentimentComparison } from '../_components/SentimentComparison';
import { MediaTypeHeatmap } from '../_components/MediaTypeHeatmap';
import { KeywordDiff } from '../_components/KeywordDiff';
import { PeriodSelector } from '../_components/BenchmarkFilters';
import { SourceLogo } from '../_components/SourceLogo';

export default function BenchmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense>
      <BenchmarkDetailInner id={id} />
    </Suspense>
  );
}

function BenchmarkDetailInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const benchmark = useMemo(() => findMockBenchmark(id), [id]);

  const initialPeriod = (searchParams.get('period') as BenchmarkPeriod | null)
    ?? benchmark?.default_period
    ?? '30d';
  const [period, setPeriod] = useState<BenchmarkPeriod>(initialPeriod);

  // Collect all source names referenced by this benchmark so we can look up
  // icon_urls in a single query.
  const sourceNames = useMemo(() => {
    if (!benchmark?.snapshot) return [] as string[];
    const names = new Set<string>();
    for (const list of Object.values(benchmark.snapshot.top_sources_per_actor.by_actor)) {
      for (const s of list) names.add(s.source);
    }
    for (const n of benchmark.snapshot.recent_news.items) names.add(n.source);
    return Array.from(names);
  }, [benchmark]);
  const { icons } = useSourceIconsByName(sourceNames);

  const handlePeriodChange = (p: BenchmarkPeriod) => {
    setPeriod(p);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('period', p);
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  if (!benchmark) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Benchmark no encontrado
        </div>
        <Link href="/competidores/benchmarking" style={{ fontSize: 13, color: 'var(--accent)' }}>
          ← Volver a benchmarking
        </Link>
      </div>
    );
  }

  const snap = benchmark.snapshot;
  if (!snap) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Calentando datos…
      </div>
    );
  }

  const totalMentions = snap.actors_metrics.reduce((a, m) => a + m.mentions, 0);
  const days = PERIOD_DAYS[period];

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 28px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <Breadcrumb name={benchmark.name} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14, marginTop: 6,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                {benchmark.name}
              </h1>
              {benchmark.is_mock && (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 4,
                  background: '#FEF3C7', color: '#92400E',
                }}>
                  Datos de ejemplo
                </span>
              )}
            </div>
            {benchmark.description && (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0', maxWidth: 700 }}>
                {benchmark.description}
              </p>
            )}
          </div>
          <PeriodSelector value={period} onChange={handlePeriodChange} />
        </div>

        {/* Actor chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {benchmark.actors.map((a) => (
            <ActorChip key={a.id} name={a.display_name} color={a.color} role={a.role} showRole size="md" />
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Section 1: Actor mini cards */}
        <SectionTitle>Resumen por actor</SectionTitle>
        <div className="bm-mini-grid">
          {benchmark.actors.map((a) => {
            const m = snap.actors_metrics.find((x) => x.actor_id === a.id);
            if (!m) return null;
            return <ActorMiniCard key={a.id} actor={a} metrics={m} />;
          })}
        </div>

        {/* Section 2: Share of Voice + Narrativa IA */}
        <div className="bm-sov-narrative-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectionTitle>Share of Voice</SectionTitle>
            <Section>
              <div className="bm-sov-row">
                <div>
                  <SoVDonut
                    actors={benchmark.actors}
                    metrics={snap.actors_metrics}
                    totalMentions={totalMentions}
                  />
                </div>
                <div>
                  <RankingTable
                    actors={benchmark.actors}
                    metrics={snap.actors_metrics}
                    ranking={snap.ranking.entries}
                  />
                </div>
              </div>
            </Section>
          </div>

          {snap.narrative_text && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionTitle>Narrativa</SectionTitle>
              <Section>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {snap.narrative_text}
                </div>
                {snap.narrative_tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                    {snap.narrative_tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          padding: '3px 9px',
                          background: 'var(--bg-muted)',
                          color: 'var(--text-secondary)',
                          borderRadius: 999,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* Section 3: Timeline */}
        <SectionTitle>Evolución del Share of Voice</SectionTitle>
        <Section>
          <TimelineComparison
            actors={benchmark.actors}
            timeline={snap.timeline_comparison}
            days={days}
          />
        </Section>

        {/* Section 4: Sentiment */}
        <SectionTitle>Tono de la cobertura</SectionTitle>
        <Section>
          <SentimentComparison
            actors={benchmark.actors}
            metrics={snap.actors_metrics}
          />
        </Section>

        {/* Section 5: Media type */}
        <SectionTitle>Presencia por tipo de medio</SectionTitle>
        <MediaTypeHeatmap actors={benchmark.actors} breakdown={snap.media_type_breakdown} />

        {/* Section 6: Keywords */}
        <SectionTitle>Keywords diferenciadoras por actor</SectionTitle>
        <KeywordDiff actors={benchmark.actors} data={snap.keyword_analysis} />

        {/* Section 7: Top sources */}
        <SectionTitle>Medios que más cubren a cada actor</SectionTitle>
        <div className="bm-sources-grid">
          {benchmark.actors.map((a) => {
            const sources = snap.top_sources_per_actor.by_actor[a.id] ?? [];
            return (
              <div key={a.id} style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: a.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {a.display_name}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sources.map((s) => (
                    <div key={s.source} style={{ fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', minWidth: 0 }}>
                          <SourceLogo url={lookupIcon(icons, s.source)} name={s.source} size={14} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.source}
                          </span>
                        </span>
                        <span style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', flexShrink: 0 }}>{s.pct}%</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${s.pct * 3}%`, maxWidth: '100%', height: '100%', background: a.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 8: Recent news */}
        <SectionTitle>Noticias destacadas</SectionTitle>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {snap.recent_news.items.map((n) => {
              const actor = benchmark.actors.find((a) => a.id === n.actor_id);
              const sentColors: Record<string, string> = {
                positivo: '#34D399', neutro: '#94A3B8', negativo: '#F87171',
              };
              const sentLabels: Record<string, string> = {
                positivo: 'positivo', neutro: 'neutro', negativo: 'negativo',
              };
              return (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {n.headline}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--text-tertiary)',
                      marginTop: 4,
                      display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <SourceLogo url={lookupIcon(icons, n.source)} name={n.source} size={16} />
                        <span>{n.source}</span>
                      </span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(n.published_at), { addSuffix: true, locale: es })}</span>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 600,
                          padding: '2px 7px', borderRadius: 999,
                          background: `${sentColors[n.sentiment]}22`,
                          color: sentColors[n.sentiment] ?? 'var(--text-tertiary)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {sentLabels[n.sentiment] ?? n.sentiment}
                      </span>
                      {actor && (
                        <ActorChip name={actor.display_name} color={actor.color} size="sm" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <style>{`
        .bm-mini-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 1100px) {
          .bm-mini-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .bm-mini-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .bm-sov-narrative-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 1024px) {
          .bm-sov-narrative-grid { grid-template-columns: 1fr; }
        }
        .bm-sov-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: center;
        }
        @media (max-width: 1280px) {
          .bm-sov-row { grid-template-columns: 1fr; }
        }
        .bm-sources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

function lookupIcon(map: SourceIconMap, name: string): string | null {
  return map[name.trim().toLowerCase()] ?? null;
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      margin: '4px 0 -8px',
    }}>
      {children}
    </h2>
  );
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
      <Link href="/competidores/benchmarking" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
        Benchmarking
      </Link>
      <span style={{ margin: '0 6px' }}>›</span>
      <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
    </div>
  );
}
