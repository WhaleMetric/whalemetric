'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Crisis } from '@/lib/types/crisis';
import { SeverityBadge } from '../SeverityBadge';
import { CrisisStatusBadge } from '../CrisisStatusBadge';

interface Props {
  crisis: Crisis;
}

export function PanelHeader({ crisis }: Props) {
  const subjectHref = crisis.subject_type === 'radar'
    ? `/radares/${crisis.subject_id}`
    : `/senales/${crisis.subject_id}`;

  return (
    <div>
      <Breadcrumb title={crisis.title} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <SeverityBadge severity={crisis.severity} />
        <CrisisStatusBadge status={crisis.status} />
        {crisis.is_mock && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '2px 8px', borderRadius: 4,
            background: '#FEF3C7', color: '#92400E',
          }}>
            Datos de ejemplo
          </span>
        )}
      </div>

      <h1 style={{
        fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
        margin: '10px 0 6px', letterSpacing: '-0.3px', lineHeight: 1.25,
      }}>
        {crisis.title}
      </h1>

      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {crisis.subject_type === 'radar' ? 'Radar' : 'Señal'}
        </span>
        {' · '}
        <Link
          href={subjectHref}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
        >
          {crisis.subject_name}
        </Link>
        <span style={{ color: 'var(--text-tertiary)' }}> · iniciada {formatDistanceToNow(new Date(crisis.started_at), { addSuffix: true, locale: es })}</span>
        {crisis.escalated_at && (
          <span style={{ color: 'var(--text-tertiary)' }}> · escalada {formatDistanceToNow(new Date(crisis.escalated_at), { addSuffix: true, locale: es })}</span>
        )}
        {crisis.resolved_at && (
          <span style={{ color: 'var(--text-tertiary)' }}> · resuelta {formatDistanceToNow(new Date(crisis.resolved_at), { addSuffix: true, locale: es })}</span>
        )}
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
        href="/crisis"
        style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.12s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
      >
        Crisis
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
