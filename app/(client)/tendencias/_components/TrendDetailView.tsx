'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { toast } from 'sonner';
import type { Trend } from '@/lib/types/trends';
import { TrendTypeBadge, TREND_TYPE_STYLES } from './TrendTypeBadge';

interface Props {
  trend: Trend;
}

export function TrendDetailView({ trend }: Props) {
  const style = TREND_TYPE_STYLES[trend.type];
  const [dismissed, setDismissed] = useState(false);
  const [highlighted, setHighlighted] = useState(trend.is_highlighted);

  const subjectHref = trend.subject_type === 'radar'
    ? `/radares/${trend.subject_id}`
    : `/senales/${trend.subject_id}`;

  const dirArrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—';
  const dirColor = trend.direction === 'up' ? '#10B981' : trend.direction === 'down' ? '#EF4444' : 'var(--text-tertiary)';

  const detectedIso = new Date(trend.detected_at).toISOString().slice(0, 10);

  const handleDismiss = () => {
    setDismissed(true);
    toast.success('Tendencia descartada');
  };

  const handleHighlight = () => {
    setHighlighted((v) => !v);
    toast.success(highlighted ? 'Destacada quitada' : 'Marcada como destacada');
  };

  const handleCreateAlert = () => {
    toast.info('La creación de alertas llega en la próxima iteración');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '18px 22px',
        opacity: dismissed ? 0.55 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <TrendTypeBadge type={trend.type} />
          <span style={{ fontSize: 14, fontWeight: 700, color: dirColor, lineHeight: 1 }}>
            {dirArrow}
          </span>
          {trend.is_mock && <MockBadge />}
          {highlighted && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              padding: '2px 8px', borderRadius: 4,
              background: 'rgba(245,158,11,0.15)', color: '#B45309',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Destacada
            </span>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Detectada {formatDistanceToNow(new Date(trend.detected_at), { addSuffix: true, locale: es })}
          </span>
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
          margin: '0 0 8px', letterSpacing: '-0.3px', lineHeight: 1.25,
        }}>
          {trend.title}
        </h1>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            {trend.subject_type === 'radar' ? 'Radar' : 'Señal'}
          </span>
          {' · '}
          <Link
            href={subjectHref}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
          >
            {trend.subject_name}
          </Link>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <ActionButton disabled={dismissed} onClick={handleDismiss} danger>
            Descartar tendencia
          </ActionButton>
          <ActionButton onClick={handleHighlight}>
            {highlighted ? 'Quitar destacada' : 'Marcar destacada'}
          </ActionButton>
          <ActionButton onClick={handleCreateAlert}>
            Crear alerta similar
          </ActionButton>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <Metric label="Valor actual" value={trend.metadata.current_value.toLocaleString()} />
        <Metric label="Baseline"     value={trend.metadata.baseline.toLocaleString()} />
        <Metric label="Pico"         value={trend.metadata.peak.toLocaleString()} />
        <Metric label="Velocidad"    value={trend.velocity.toFixed(1)} suffix="/h" />
        <Metric label="Confianza"    value={`${trend.confidence}%`} />
      </div>

      {/* Timeline chart */}
      <Card title="Evolución · últimos 30 días">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend.timeline_30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(d) => d.slice(5)}
              minTickGap={30}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))}
              labelFormatter={(label) => format(new Date(label as string), "d 'de' MMMM", { locale: es })}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={style.color}
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine
              x={detectedIso}
              stroke={style.color}
              strokeDasharray="3 3"
              label={{
                value: 'Detectada',
                fontSize: 10,
                fill: style.color,
                position: 'top',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Narrative */}
      <Card title="Qué está pasando">
        <p style={{
          fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0,
        }}>
          {trend.narrative_text}
        </p>
        {trend.metadata.new_keywords.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
            }}>
              Keywords nuevas detectadas
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {trend.metadata.new_keywords.map((kw) => (
                <span key={kw} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 6,
                  background: 'var(--bg-muted)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* News feed */}
      {trend.related_news.length > 0 && (
        <Card title="Noticias que impulsan la tendencia">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {trend.related_news.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <SentimentDot s={n.sentiment} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {n.headline}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {n.source} · {formatDistanceToNow(new Date(n.published_at), { addSuffix: true, locale: es })}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Top sources */}
      {trend.top_sources_breakdown.length > 0 && (
        <Card title="Fuentes que más amplifican">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trend.top_sources_breakdown.map((s) => (
              <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 140, fontSize: 12, color: 'var(--text-primary)', flexShrink: 0 }}>
                  {s.source}
                </div>
                <div style={{
                  flex: 1, height: 6, background: 'var(--bg-muted)',
                  borderRadius: 4, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${s.pct}%`,
                    background: style.color, opacity: 0.85,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{
                  width: 80, fontSize: 11, color: 'var(--text-tertiary)',
                  textAlign: 'right', flexShrink: 0,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}>
                  {s.pct}% · {s.mentions}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 22px',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: 14,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}{suffix && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 3 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ActionButton({
  children, onClick, disabled, danger,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 14px', fontSize: 12, fontWeight: 500,
        border: `1px solid ${danger ? '#FCA5A5' : 'var(--border)'}`,
        background: 'var(--bg)',
        color: disabled ? 'var(--text-tertiary)' : danger ? '#991B1B' : 'var(--text-secondary)',
        borderRadius: 7,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.12s',
      }}
    >
      {children}
    </button>
  );
}

function SentimentDot({ s }: { s: 'positivo' | 'neutro' | 'negativo' }) {
  const color = s === 'positivo' ? '#10B981' : s === 'negativo' ? '#EF4444' : '#9CA3AF';
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: color, marginTop: 6, flexShrink: 0,
    }} />
  );
}

function MockBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      padding: '2px 8px', borderRadius: 4,
      background: '#FEF3C7', color: '#92400E',
    }}>
      Datos de ejemplo
    </span>
  );
}
