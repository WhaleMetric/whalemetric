'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Trend } from '@/lib/types/trends';
import { TrendTypeBadge } from './TrendTypeBadge';

interface Props {
  trend: Trend;
}

export function TrendListItem({ trend }: Props) {
  const dirArrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—';
  const dirColor = trend.direction === 'up' ? '#10B981' : trend.direction === 'down' ? '#EF4444' : 'var(--text-tertiary)';
  const subjectLabel = `${trend.subject_type === 'radar' ? 'Radar' : 'Señal'} · ${trend.subject_name}`;

  return (
    <Link
      href={`/tendencias/${trend.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '92px 1fr 210px 80px',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-light)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <TrendTypeBadge type={trend.type} />
        <span style={{ fontSize: 12, fontWeight: 700, color: dirColor, lineHeight: 1 }}>
          {dirArrow}
        </span>
      </div>

      <div style={{
        fontSize: 13, color: 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {trend.title}
      </div>

      <div style={{
        fontSize: 11, color: 'var(--text-tertiary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {subjectLabel}
      </div>

      <div style={{
        fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}>
        {formatDistanceToNow(new Date(trend.detected_at), { locale: es })}
      </div>
    </Link>
  );
}
