'use client';

import {
  Signal,
  NarrativeFrame,
  SourceDistribution,
  MediaVariation,
  AlertHistoryItem,
  TrendIndicator,
} from '@/lib/mock/signals';
import SignalKpiStrip from './SignalKpiStrip';
import { VolumeChart, SentimentChart } from './SignalCharts';
import SignalKeywords from './SignalKeywords';
import SignalNewsTable from './SignalNewsTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';

// ── Helpers ────────────────────────────────────────────────────────────

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Hace menos de 1h';
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d}d`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Section 1: AI Narrative ────────────────────────────────────────────

function AINarrativeSection({ signal }: { signal: Signal }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5">
          <path d="M8 1l1 3h3l-2.4 1.8.9 3L8 7.2 5.5 8.8l.9-3L4 4h3z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="4" cy="12" r="1.5" />
        </svg>
        <SectionTitle>Narrativa IA</SectionTitle>
      </div>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          margin: '0 0 12px',
        }}
      >
        {signal.narrative.summary}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {signal.narrative.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11,
              fontWeight: 500,
              background: 'var(--bg-muted)',
              color: 'var(--text-secondary)',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid var(--border-light)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Section 3: Trend indicators ───────────────────────────────────────

function TrendIndicatorCard({ indicator }: { indicator: TrendIndicator }) {
  const up = indicator.delta > 0;
  const neutral = indicator.delta === 0;
  return (
    <div
      style={{
        flex: '1 1 140px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-light)',
        borderRadius: 8,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {indicator.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}
        >
          {indicator.value}
        </span>
        {indicator.unit && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {indicator.unit}
          </span>
        )}
      </div>
      {!neutral && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 500,
            color: up ? '#10B981' : '#EF4444',
          }}
        >
          {up ? '↑' : '↓'} {Math.abs(indicator.delta)}%
        </div>
      )}
    </div>
  );
}

// ── Section 4: Narrative frames + source distribution ─────────────────

function HorizontalBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--bg-muted)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

function NarrativeFramesSection({ frames }: { frames: NarrativeFrame[] }) {
  const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];
  return (
    <Card style={{ flex: 1 }}>
      <SectionTitle>Encuadres narrativos</SectionTitle>
      {frames.map((f, i) => (
        <HorizontalBar key={f.label} label={f.label} pct={f.pct} color={COLORS[i % COLORS.length]} />
      ))}
    </Card>
  );
}

function SourceDistributionSection({ distribution }: { distribution: SourceDistribution[] }) {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  return (
    <Card style={{ flex: 1 }}>
      <SectionTitle>Distribución por medio</SectionTitle>
      {distribution.map((d, i) => (
        <HorizontalBar key={d.label} label={d.label} pct={d.pct} color={COLORS[i % COLORS.length]} />
      ))}
    </Card>
  );
}

// ── Section 5: Media variation ────────────────────────────────────────

function MediaVariationCard({ item }: { item: MediaVariation }) {
  const isPositive = item.variationPct > 0;
  return (
    <div
      style={{
        flex: '1 1 120px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-light)',
        borderRadius: 8,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        {item.label}
      </div>
      <div
        style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}
      >
        {item.value}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 11,
          fontWeight: 500,
          color: isPositive ? '#10B981' : '#EF4444',
        }}
      >
        {isPositive ? '↑' : '↓'} {Math.abs(item.variationPct)}% vs ant.
      </div>
    </div>
  );
}

function MediaVariationChart({ data }: { data: MediaVariation[] }) {
  const chartData = data.map((d) => ({ name: d.label, value: d.variationPct }));
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
        barSize={12}
      >
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          formatter={(v) => [`${v ?? 0}%`, 'Variación']}
          contentStyle={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.value > 0 ? '#10B981' : '#EF4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Section 7: Alert history ──────────────────────────────────────────

const ALERT_SEVERITY: Record<AlertHistoryItem['severity'], { bg: string; color: string }> = {
  high:   { bg: '#FEF2F2', color: '#DC2626' },
  medium: { bg: '#FFFBEB', color: '#D97706' },
  low:    { bg: 'var(--bg-muted)', color: 'var(--text-secondary)' },
};

const ALERT_TYPE_LABEL: Record<AlertHistoryItem['type'], string> = {
  spike:           'Pico',
  new_frame:       'Nuevo encuadre',
  sentiment_shift: 'Cambio tono',
  viral:           'Viral',
};

function AlertHistorySection({ alerts }: { alerts: AlertHistoryItem[] }) {
  if (!alerts.length) {
    return (
      <Card>
        <SectionTitle>Historial de alertas</SectionTitle>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
          Sin alertas recientes
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle>Historial de alertas</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map((a) => {
          const sev = ALERT_SEVERITY[a.severity];
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                background: sev.bg,
                borderRadius: 6,
              }}
            >
              <div style={{ flexShrink: 0, paddingTop: 1 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: sev.color,
                    background: 'rgba(255,255,255,0.6)',
                    padding: '2px 6px',
                    borderRadius: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ALERT_TYPE_LABEL[a.type]}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {a.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {timeAgo(a.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────

interface Props {
  signal: Signal;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function SignalDetail({ signal, isFavorite, onToggleFavorite }: Props) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px 40px',
        background: 'var(--bg-subtle)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.4px',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {signal.name}
            </h1>
            {signal.hasAlert && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: '#FEF2F2',
                  color: '#DC2626',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                ⚠ Alerta activa
              </span>
            )}
            {signal.isInactive && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  background: 'var(--bg-muted)',
                  color: 'var(--text-tertiary)',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                Sin actividad
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Actualizado {timeAgo(signal.lastUpdated)}
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          style={{
            background: isFavorite ? '#FFFBEB' : 'var(--bg)',
            border: `1px solid ${isFavorite ? '#F59E0B' : 'var(--border)'}`,
            borderRadius: 7,
            padding: '7px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 500,
            color: isFavorite ? '#D97706' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill={isFavorite ? '#F59E0B' : 'none'}
            stroke={isFavorite ? '#F59E0B' : 'currentColor'}
            strokeWidth="1.5"
          >
            <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isFavorite ? 'En favoritos' : 'Añadir a favoritos'}
        </button>
      </div>

      {/* ── Section 1: KPI strip ── */}
      <SignalKpiStrip kpis={signal.kpis} />

      {/* ── Section 2: AI Narrative ── */}
      <AINarrativeSection signal={signal} />

      {/* ── Section 3: Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
        <VolumeChart data={signal.volumeData} />
        <SentimentChart data={signal.sentimentData} />
      </div>

      {/* ── Section 4: Trend indicators ── */}
      <Card>
        <SectionTitle>Indicadores de tendencia</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {signal.trendIndicators.map((ti) => (
            <TrendIndicatorCard key={ti.label} indicator={ti} />
          ))}
        </div>
      </Card>

      {/* ── Section 5: Narrative frames + Source distribution ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <NarrativeFramesSection frames={signal.narrativeFrames} />
        <SourceDistributionSection distribution={signal.sourceDistribution} />
      </div>

      {/* ── Section 6: Media variation ── */}
      <Card>
        <SectionTitle>Variación por tipo de medio</SectionTitle>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {signal.mediaVariation.map((item) => (
            <MediaVariationCard key={item.label} item={item} />
          ))}
        </div>
        <MediaVariationChart data={signal.mediaVariation} />
      </Card>

      {/* ── Section 7: Keyword cloud ── */}
      <SignalKeywords keywords={signal.keywords} />

      {/* ── Section 8: Alert history ── */}
      <AlertHistorySection alerts={signal.alertHistory} />

      {/* ── Section 9: News table ── */}
      <SignalNewsTable news={signal.recentNews} />
    </div>
  );
}
