'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { findMockCrisis } from '@/lib/mock/crises';
import { PanelHeader }         from '../_components/CrisisPanel/PanelHeader';
import { VitalSigns }          from '../_components/CrisisPanel/VitalSigns';
import { AIRecommendations }   from '../_components/CrisisPanel/AIRecommendations';
import { ActionBar }           from '../_components/CrisisPanel/ActionBar';
import { LiveTimeline }        from '../_components/CrisisPanel/LiveTimeline';
import { StakeholderMap }      from '../_components/CrisisPanel/StakeholderMap';
import { FramingAnalysis }     from '../_components/CrisisPanel/FramingAnalysis';
import { CriticalNewsFeed }    from '../_components/CrisisPanel/CriticalNewsFeed';
import { TopAmplifiers }       from '../_components/CrisisPanel/TopAmplifiers';
import type { Crisis } from '@/lib/types/crisis';

export default function CrisisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [crisisId, setCrisisId] = useState<string | null>(null);
  const [crisis, setCrisis]     = useState<Crisis | null>(null);
  const [loading, setLoading]   = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCrisisId(p.id));
  }, [params]);

  useEffect(() => {
    if (!crisisId) return;
    void (async () => {
      const found = findMockCrisis(crisisId);
      setCrisis(found ?? null);
      setLoading(false);
    })();
  }, [crisisId]);

  if (loading) return <PanelSkeleton />;
  if (!crisis) {
    return (
      <div style={{ padding: 28 }}>
        <MinimalBreadcrumb title="Crisis no encontrada" />
        <div style={{
          marginTop: 24, padding: '28px 24px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 12, textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Esta crisis ya no está disponible.
          </div>
          <button
            onClick={() => router.push('/crisis')}
            style={{
              fontSize: 13, color: 'var(--accent)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Volver a crisis
          </button>
        </div>
      </div>
    );
  }

  const handleSourceClick = (source: string) => {
    setSourceFilter((prev) => (prev === source ? null : source));
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 28px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <PanelHeader crisis={crisis} />
      </div>

      <div style={{
        padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Row 1: 3 columns (stack on narrow viewports via minmax) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
          alignItems: 'stretch',
        }}>
          <VitalSigns vitals={crisis.vital_signs} />
          <AIRecommendations recommendations={crisis.ai_recommendations} />
          <ActionBar
            initialStatus={crisis.status}
            lastUpdatedAt={crisis.last_updated_at}
            resolvedAt={crisis.resolved_at}
            archivedAt={crisis.archived_at}
          />
        </div>

        {/* Narrative */}
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 22px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            Narrativa en vivo
          </div>
          <p style={{
            fontSize: 14, color: 'var(--text-primary)',
            lineHeight: 1.7, margin: 0,
          }}>
            {crisis.narrative_text}
          </p>
        </div>

        {/* Row 2: Timeline | [Framings + Stakeholders] */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 14,
        }}>
          <LiveTimeline events={crisis.timeline} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FramingAnalysis framings={crisis.dominant_framings} />
            <StakeholderMap stakeholders={crisis.stakeholders} />
          </div>
        </div>

        {/* News feed (full width) */}
        <CriticalNewsFeed
          news={crisis.critical_news}
          sourceFilter={sourceFilter}
          onClearSourceFilter={() => setSourceFilter(null)}
        />

        {/* Amplifiers (full width) */}
        <TopAmplifiers
          amplifiers={crisis.top_amplifiers}
          activeSource={sourceFilter}
          onSourceClick={handleSourceClick}
        />
      </div>

      <style>{`
        @keyframes crisis-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}

// ── Minimal helpers ──────────────────────────────────────────────────────────

function MinimalBreadcrumb({ title }: { title: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}
    >
      <Link
        href="/crisis"
        style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
      >
        Crisis
      </Link>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
    </nav>
  );
}

function PanelSkeleton() {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={sk(64, '100%')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {[1,2,3].map((i) => <div key={i} style={sk(200, '100%')} />)}
      </div>
      <div style={sk(160, '100%')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        <div style={sk(320, '100%')} />
        <div style={sk(320, '100%')} />
      </div>
      <style>{`
        @keyframes crisis-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}

function sk(h: number, w: number | string): React.CSSProperties {
  return {
    height: h, width: w, background: 'var(--bg-muted)',
    borderRadius: 10, animation: 'crisis-pulse 1.4s ease-in-out infinite',
  };
}
