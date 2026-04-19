'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { findMockTrend } from '@/lib/mock/trends';
import { TrendDetailView } from '../_components/TrendDetailView';
import type { Trend } from '@/lib/types/trends';

export default function TrendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [trendId, setTrendId] = useState<string | null>(null);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setTrendId(p.id));
  }, [params]);

  useEffect(() => {
    if (!trendId) return;
    void (async () => {
      // For now we only support mock trends. Real trends will be fetched from Supabase later.
      const found = findMockTrend(trendId);
      setTrend(found ?? null);
      setLoading(false);
    })();
  }, [trendId]);

  if (loading) return <DetailSkeleton />;
  if (!trend) {
    return (
      <div style={{ padding: 28 }}>
        <Breadcrumb title="Tendencia no encontrada" />
        <div style={{
          marginTop: 24, padding: '28px 24px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 12, textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Esta tendencia ya no está disponible.
          </div>
          <button
            onClick={() => router.push('/tendencias')}
            style={{
              fontSize: 13, color: 'var(--accent)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Volver a tendencias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      <div style={{
        padding: '14px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <Breadcrumb title={trend.title} />
      </div>
      <div style={{ padding: 28 }}>
        <TrendDetailView trend={trend} />
      </div>
    </div>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, color: 'var(--text-tertiary)',
      }}
    >
      <Link
        href="/tendencias"
        style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.12s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
      >
        Tendencias
      </Link>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        color: 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: 480,
      }}>
        {title}
      </span>
    </nav>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={sk(120, '100%')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[1,2,3,4,5].map((i) => <div key={i} style={sk(80, '100%')} />)}
      </div>
      <div style={sk(260, '100%')} />
      <div style={sk(160, '100%')} />
      <style>{`
        @keyframes trend-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}

function sk(h: number, w: number | string): React.CSSProperties {
  return {
    height: h, width: w, background: 'var(--bg-muted)',
    borderRadius: 10, animation: 'trend-pulse 1.4s ease-in-out infinite',
  };
}
