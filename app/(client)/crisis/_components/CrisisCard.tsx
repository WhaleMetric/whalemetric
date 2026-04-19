'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Crisis } from '@/lib/types/crisis';
import { SeverityBadge } from './SeverityBadge';
import { CrisisStatusBadge } from './CrisisStatusBadge';
import { Sparkline } from '../../tendencias/_components/Sparkline';

interface Props {
  crisis: Crisis;
}

export function CrisisCard({ crisis }: Props) {
  const isCritical = crisis.severity === 'CRITICAL';
  const subjectHref = crisis.subject_type === 'radar'
    ? `/radares/${crisis.subject_id}`
    : `/senales/${crisis.subject_id}`;

  const sparklineColor = isCritical ? '#DC2626'
    : crisis.severity === 'HIGH' ? '#D97706'
    : '#6B7280';

  return (
    <Link
      href={`/crisis/${crisis.id}`}
      style={{
        display: 'block',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderLeft: isCritical ? '3px solid #DC2626' : '1px solid var(--border)',
        borderRadius: isCritical ? '0 12px 12px 0' : 12,
        padding: '16px 20px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = isCritical ? 'var(--border)' : 'var(--text-tertiary)';
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
      {/* Top row: badges + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <SeverityBadge severity={crisis.severity} />
        <CrisisStatusBadge status={crisis.status} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {crisis.status === 'resolved'
            ? `cerrada ${formatDistanceToNow(new Date(crisis.resolved_at ?? crisis.last_updated_at), { addSuffix: true, locale: es })}`
            : `iniciada ${formatDistanceToNow(new Date(crisis.started_at), { addSuffix: true, locale: es })}`}
        </span>
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, margin: '4px 0 4px' }}>
        {crisis.title}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14 }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {crisis.subject_type === 'radar' ? 'Radar' : 'Señal'}
        </span>
        {' · '}
        <Link
          href={subjectHref}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
        >
          {crisis.subject_name}
        </Link>
      </div>

      {/* Vital signs strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr) auto',
        gap: 14,
        alignItems: 'end',
        marginBottom: 12,
      }}>
        <Vital label="Menciones/h" value={crisis.vital_signs.mentions_per_hour.toLocaleString()} delta={crisis.vital_signs.mentions_delta_pct} />
        <Vital label="Alcance"     value={formatReach(crisis.vital_signs.reach_estimated)} />
        <Vital label="Negativo"    value={`${crisis.vital_signs.sentiment_negative_pct}%`} accent="#EF4444" />
        <Vital label="Duración"    value={formatDuration(crisis.vital_signs.duration_hours)} />
        <Sparkline data={crisis.sparkline_data} color={sparklineColor} width={120} height={36} />
      </div>

      <div style={{
        fontSize: 12, color: 'var(--text-secondary)',
        lineHeight: 1.55, fontStyle: 'italic',
        borderTop: '1px solid var(--border-light)', paddingTop: 10,
      }}>
        “{crisis.narrative_summary}”
      </div>
    </Link>
  );
}

function Vital({
  label, value, delta, accent,
}: { label: string; value: string; delta?: number; accent?: string }) {
  return (
    <div>
      <div style={{
        fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: accent ?? 'var(--text-primary)', lineHeight: 1,
      }}>
        {value}
        {delta != null && delta !== 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            marginLeft: 6,
            color: delta > 0 ? '#EF4444' : '#10B981',
          }}>
            {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h ? `${d}d ${h}h` : `${d}d`;
}
