'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Trend } from '@/lib/types/trends';
import { TrendTypeBadge, TREND_TYPE_STYLES } from './TrendTypeBadge';
import { Sparkline } from './Sparkline';

interface Props {
  trend: Trend;
}

export function TrendCard({ trend }: Props) {
  const style = TREND_TYPE_STYLES[trend.type];
  const subjectHref = trend.subject_type === 'radar'
    ? `/radares/${trend.subject_id}`
    : `/senales/${trend.subject_id}`;

  const dirArrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—';
  const dirColor = trend.direction === 'up' ? '#10B981' : trend.direction === 'down' ? '#EF4444' : 'var(--text-tertiary)';
  const deltaSign = trend.direction === 'up' ? '+' : trend.direction === 'down' ? '−' : '';

  return (
    <Link
      href={`/tendencias/${trend.id}`}
      style={{
        display: 'block',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--text-tertiary)';
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border)';
        el.style.transform = 'none';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <TrendTypeBadge type={trend.type} />
        <span style={{ fontSize: 14, fontWeight: 700, color: dirColor, lineHeight: 1 }}>
          {dirArrow}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {formatDistanceToNow(new Date(trend.detected_at), { addSuffix: true, locale: es })}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>
        {trend.title}
      </div>

      {/* Subject */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14 }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {trend.subject_type === 'radar' ? 'Radar' : 'Señal'}
        </span>
        {' · '}
        <Link
          href={subjectHref}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
        >
          {trend.subject_name}
        </Link>
      </div>

      {/* Metric + sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {trend.metadata.current_value.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: dirColor, marginTop: 4, fontWeight: 600 }}>
            {deltaSign}{trend.magnitude}% vs baseline
          </div>
        </div>
        <Sparkline data={trend.sparkline_data} color={style.color} />
      </div>

      {/* Footer */}
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
        {trend.description}
      </div>
    </Link>
  );
}
