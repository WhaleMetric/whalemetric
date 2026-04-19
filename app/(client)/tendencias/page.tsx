'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MOCK_TRENDS, MOCK_EMERGING_TOPICS } from '@/lib/mock/trends';
import { TrendKPIs } from './_components/TrendKPIs';
import { TrendFilters, type TrendScope, type TrendPeriod } from './_components/TrendFilters';
import { TrendCard } from './_components/TrendCard';
import { TrendListItem } from './_components/TrendListItem';
import { EmergingTopics } from './_components/EmergingTopics';

const PERIOD_HOURS: Record<TrendPeriod, number> = {
  '24h': 24,
  '7d':  24 * 7,
  '30d': 24 * 30,
};

function TendenciasInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const scope = (searchParams.get('scope') as TrendScope | null) ?? 'all';
  const period = (searchParams.get('period') as TrendPeriod | null) ?? '7d';

  // Pin a "now" reference at mount so filtering is deterministic per page lifetime.
  const [referenceNow] = useState<number>(() => Date.now());

  const updateParam = (key: 'scope' | 'period', value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    router.push(`/tendencias?${p.toString()}`);
  };

  // Filter trends by scope + period
  const filtered = useMemo(() => {
    const cutoff = referenceNow - PERIOD_HOURS[period] * 3600_000;
    return MOCK_TRENDS
      .filter((t) => {
        if (scope === 'signals' && t.subject_type !== 'signal') return false;
        if (scope === 'radars'  && t.subject_type !== 'radar')  return false;
        if (new Date(t.detected_at).getTime() < cutoff) return false;
        return true;
      })
      .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
  }, [scope, period, referenceNow]);

  // Featured = highlighted OR first 4 most recent
  const featured = filtered.filter((t) => t.is_highlighted).slice(0, 4);
  const featuredIds = new Set(featured.map((t) => t.id));
  const recentFallback = filtered.filter((t) => !featuredIds.has(t.id)).slice(0, 4 - featured.length);
  const featuredFinal = [...featured, ...recentFallback];
  const rest = filtered.filter((t) => !new Set(featuredFinal.map((x) => x.id)).has(t.id));

  // "Updated X ago" — use the most recent detected trend
  const lastDetected = filtered[0]?.detected_at;

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
          Tendencias
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 14px' }}>
          Patrones detectados sobre tus señales y radares
          {lastDetected && ` · actualizado ${formatDistanceToNow(new Date(lastDetected), { addSuffix: true, locale: es })}`}
        </p>
        <TrendFilters
          scope={scope}
          period={period}
          onScopeChange={(v) => updateParam('scope', v)}
          onPeriodChange={(v) => updateParam('period', v)}
        />
      </div>

      {/* Body */}
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TrendKPIs trends={filtered} />

        {filtered.length === 0 ? (
          <EmptyState scope={scope} period={period} />
        ) : (
          <>
            {/* Featured */}
            {featuredFinal.length > 0 && (
              <Section title="Destacadas">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 14,
                }}>
                  {featuredFinal.map((t) => <TrendCard key={t.id} trend={t} />)}
                </div>
              </Section>
            )}

            {/* Emerging topics */}
            <Section title="Temas emergentes">
              <EmergingTopics topics={MOCK_EMERGING_TOPICS} />
            </Section>

            {/* All */}
            {rest.length > 0 && (
              <Section title="Todas las tendencias">
                <div style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  {rest.map((t, i) => (
                    <div
                      key={t.id}
                      style={{ borderBottom: i === rest.length - 1 ? 'none' : undefined }}
                    >
                      <TrendListItem trend={t} />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TendenciasPage() {
  return (
    <Suspense>
      <TendenciasInner />
    </Suspense>
  );
}

// ── UI bits ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ scope, period }: { scope: TrendScope; period: TrendPeriod }) {
  const router = useRouter();
  const scopeLabel = scope === 'signals' ? 'señales' : scope === 'radars' ? 'radares' : 'señales ni radares';

  return (
    <div style={{
      padding: '32px 24px', textAlign: 'center',
      background: 'var(--bg)', border: '1px dashed var(--border)',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        Sin tendencias en este filtro
      </div>
      <p style={{
        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
        margin: '0 auto 18px', maxWidth: 440,
      }}>
        No hay tendencias sobre tus {scopeLabel} en las últimas {period === '24h' ? '24 horas' : period === '7d' ? '7 días' : '30 días'}.
        Cuando el sistema detecte patrones automáticamente aparecerán aquí.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button
          onClick={() => router.push('/senales')}
          style={pillBtn}
        >
          Ir a señales
        </button>
        <button
          onClick={() => router.push('/radares')}
          style={pillBtn}
        >
          Ir a radares
        </button>
      </div>
    </div>
  );
}

const pillBtn: React.CSSProperties = {
  padding: '8px 16px', fontSize: 13, fontWeight: 500,
  border: '1px solid var(--border)', borderRadius: 7,
  background: 'var(--bg)', color: 'var(--text-secondary)',
  cursor: 'pointer',
};
