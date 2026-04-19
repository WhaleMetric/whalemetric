'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { createClient } from '@/lib/supabase/browser';
import { fetchRadarById } from '@/lib/hooks/useRadares';
import { findMockRadar, findMockSnapshot } from '@/lib/mock/radares';
import { RadarFormula } from '../_components/RadarFormula';
import type { Radar, RadarSnapshot } from '@/lib/types/radares';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RadarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [radar,    setRadar]    = useState<Radar | null>(null);
  const [snapshot, setSnapshot] = useState<RadarSnapshot | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [radarId,  setRadarId]  = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    params.then((p) => setRadarId(p.id));
  }, [params]);

  useEffect(() => {
    if (!radarId) return;
    void (async () => {
      const mockRadar = findMockRadar(radarId);
      if (mockRadar) {
        setRadar(mockRadar);
        setSnapshot(findMockSnapshot(radarId) ?? null);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      supabase
        .from('radars')
        .update({ last_viewed_at: new Date().toISOString() })
        .eq('id', radarId);
      const [radarData, snapRes] = await Promise.all([
        fetchRadarById(radarId),
        supabase
          .from('radar_snapshot')
          .select('*')
          .eq('radar_id', radarId)
          .maybeSingle(),
      ]);
      setRadar(radarData);
      setSnapshot((snapRes.data as unknown as RadarSnapshot) ?? null);
      setLoading(false);
    })();
  }, [radarId]);

  if (loading) return <RadarSkeleton />;
  if (!radar)  return <NotFound onBack={() => router.push('/radares')} />;

  const isReady = radar.status === 'ready' && snapshot;

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'flex-start', gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Breadcrumb radarName={radar.name} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {radar.name}
            </h1>
            <StatusBadge status={radar.status} />
            {radar.is_mock && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: '2px 8px', borderRadius: 4,
                background: '#FEF3C7', color: '#92400E',
              }}>
                Datos de ejemplo
              </span>
            )}
            {(radar.radar_alerts[0]?.count ?? 0) > 0 && (
              <span style={{ fontSize: 12, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                ⚠ {radar.radar_alerts[0].count} alerta{radar.radar_alerts[0].count > 1 ? 's' : ''} activa{radar.radar_alerts[0].count > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <RadarFormula
              clauses={radar.clauses}
              top_level_operator={radar.top_level_operator}
            />
          </div>
          {snapshot && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '8px 0 0' }}>
              Actualizado {formatDistanceToNow(new Date(snapshot.updated_at), { addSuffix: true, locale: es })}
            </p>
          )}
        </div>

        <FavoriteButton isFavorite={radar.is_favorite} radarId={radar.id} isMock={radar.is_mock} />
      </div>

      {/* Body */}
      <div style={{ padding: 28 }}>
        {isReady ? (
          <ReadyDashboard snapshot={snapshot!} />
        ) : (
          <WarmingUp radar={radar} />
        )}
      </div>
    </div>
  );
}

// ── Warming up state ──────────────────────────────────────────────────────────

function WarmingUp({ radar }: { radar: Radar }) {
  return (
    <div style={{
      maxWidth: 540, margin: '48px auto', textAlign: 'center',
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '48px 40px',
    }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
        Calentando datos del radar...
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 8px' }}>
        Estamos procesando las noticias según las señales que has seleccionado.
        Este proceso tarda entre 12 y 48 horas la primera vez.
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: '0 0 28px' }}>
        Te avisaremos cuando el radar esté listo.
      </p>

      {/* Formula preview */}
      <div style={{ textAlign: 'left', marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Fórmula del radar
        </div>
        <RadarFormula
          clauses={radar.clauses}
          top_level_operator={radar.top_level_operator}
        />
      </div>
    </div>
  );
}

// ── Ready dashboard ───────────────────────────────────────────────────────────

function ReadyDashboard({ snapshot }: { snapshot: RadarSnapshot }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KpiCard label="Menciones hoy"      value={snapshot.kpis.mentions_today.toLocaleString()}       delta={snapshot.kpis.mentions_delta} />
        <KpiCard label="Alcance estimado"   value={formatReach(snapshot.kpis.reach_estimated)}           delta={snapshot.kpis.reach_delta} />
        <KpiCard label="Sentimiento positivo" value={`${snapshot.kpis.sentiment_positive_pct}%`}         delta={snapshot.kpis.sentiment_delta} />
        <KpiCard label="Fuentes activas"    value={snapshot.kpis.active_sources.toString()}              delta={snapshot.kpis.active_sources_delta} />
      </div>

      {/* Narrative */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
          📝 Narrativa IA
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, margin: '0 0 14px' }}>
          {snapshot.narrative_text}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {snapshot.narrative_tags.map((tag) => (
            <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <ChartCard title="Volumen de menciones — 14 días">
          {snapshot.volume_trend_14d.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={snapshot.volume_trend_14d} barSize={6}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="positive" stackId="a" fill="#10B981" />
                <Bar dataKey="neutral"  stackId="a" fill="#9CA3AF" />
                <Bar dataKey="negative" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Placeholder />}
        </ChartCard>

        <ChartCard title="Evolución del sentimiento — 30 días">
          {snapshot.sentiment_trend_30d.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={snapshot.sentiment_trend_30d}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="positive" stroke="#10B981" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="negative" stroke="#EF4444" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Placeholder />}
        </ChartCard>
      </div>

      {/* Signal breakdown */}
      {snapshot.signal_breakdown.length > 0 && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Contribución por señal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {snapshot.signal_breakdown.map((s) => (
              <div key={s.signal_id} style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.signal_name}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
                  {s.contribution_pct}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.mentions} menciones</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent news */}
      {snapshot.recent_news.length > 0 && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Noticias recientes
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Titular', 'Fuente', 'Hora', 'Tono', 'Encuadre'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.recent_news.map((n) => (
                <tr key={n.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '9px 10px', color: 'var(--text-primary)', maxWidth: 300 }}>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = 'underline'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = 'none'; }}>
                      {n.headline}
                    </a>
                  </td>
                  <td style={{ padding: '9px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{n.source}</td>
                  <td style={{ padding: '9px 10px', color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {formatDistanceToNow(new Date(n.published_at), { addSuffix: true, locale: es })}
                  </td>
                  <td style={{ padding: '9px 10px' }}>
                    <SentimentChip s={n.sentiment} />
                  </td>
                  <td style={{ padding: '9px 10px', color: 'var(--text-tertiary)', fontSize: 12 }}>{n.frame}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, delta }: { label: string; value: string; delta: number }) {
  const up = delta >= 0;
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: up ? '#10B981' : '#EF4444' }}>
        {up ? '↑' : '↓'} {Math.abs(delta)}%
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function Placeholder() {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 12, fontStyle: 'italic' }}>
      Datos insuficientes
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    warming_up: { label: 'Calentando', bg: '#FEF3C7', color: '#92400E' },
    ready:      { label: 'Activo',     bg: '#D1FAE5', color: '#065F46' },
    error:      { label: 'Error',      bg: '#FEE2E2', color: '#991B1B' },
  };
  const c = cfg[status] ?? cfg.ready;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>;
}

function SentimentChip({ s }: { s: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    positivo: { bg: '#D1FAE5', color: '#065F46' },
    neutro:   { bg: '#F3F4F6', color: '#6B7280' },
    negativo: { bg: '#FEE2E2', color: '#991B1B' },
  };
  const c = colors[s] ?? colors.neutro;
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color }}>{s}</span>;
}

function FavoriteButton({ isFavorite, radarId, isMock }: { isFavorite: boolean; radarId: string; isMock?: boolean }) {
  const [fav, setFav] = useState(isFavorite);
  const toggle = async () => {
    setFav(!fav);
    if (isMock) return;
    const supabase = createClient();
    await supabase.from('radars').update({ is_favorite: !fav }).eq('id', radarId);
  };
  return (
    <button
      onClick={toggle}
      title={fav ? 'Quitar favorito' : 'Marcar favorito'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill={fav ? '#F59E0B' : 'none'} stroke={fav ? '#F59E0B' : 'var(--text-tertiary)'} strokeWidth="1.5">
        <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function RadarSkeleton() {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={sk(32, 280)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[1,2,3,4].map((i) => <div key={i} style={{ ...sk(80, '100%'), borderRadius: 10 }} />)}
      </div>
      <div style={sk(120, '100%')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={sk(240, '100%')} /><div style={sk(240, '100%')} />
      </div>
    </div>
  );
}
function sk(h: number, w: number | string): React.CSSProperties {
  return { height: h, width: w, background: 'var(--bg-muted)', borderRadius: 8, animation: 'radar-pulse 1.4s ease-in-out infinite' };
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: 14 }}>Radar no encontrado</div>
      <button onClick={onBack} style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Volver a radares
      </button>
    </div>
  );
}

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function Breadcrumb({ radarName }: { radarName: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, color: 'var(--text-tertiary)',
      }}
    >
      <Link
        href="/radares"
        style={{
          color: 'var(--text-tertiary)', textDecoration: 'none',
          transition: 'color 0.12s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
      >
        Radares
      </Link>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        color: 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: 360,
      }}>
        {radarName}
      </span>
    </nav>
  );
}
