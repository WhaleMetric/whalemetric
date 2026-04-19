'use client';

import Link from 'next/link';
import type { UserSignal } from '@/lib/types/radares';

const DOT_COLORS: Record<string, string> = {
  persona:             '#3B82F6',
  marca:               '#8B5CF6',
  partido_politico:    '#EF4444',
  organizacion:        '#0EA5E9',
  institucion_publica: '#0EA5E9',
  tema:                '#F59E0B',
  zona_geografica:     '#10B981',
  evento:              '#EC4899',
  normativa:           '#6B7280',
  producto_servicio:   '#8B5CF6',
  campana_iniciativa:  '#F59E0B',
};

interface Props {
  signal: UserSignal;
  nonLink?: boolean;
}

export function SignalChip({ signal, nonLink }: Props) {
  const dotColor = DOT_COLORS[signal.type] ?? 'var(--text-tertiary)';

  const content = (
    <>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      <span style={{ lineHeight: 1.2 }}>{signal.name}</span>
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px 3px 8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--text-primary)',
    textDecoration: 'none',
    transition: 'border-color 0.12s, background 0.12s, transform 0.12s',
    flexShrink: 0,
  };

  if (nonLink) {
    return <span style={baseStyle}>{content}</span>;
  }

  return (
    <Link
      href={`/senales/${signal.id}`}
      style={baseStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--text-tertiary)';
        el.style.background = 'var(--bg-muted)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--bg)';
        el.style.transform = 'none';
      }}
    >
      {content}
    </Link>
  );
}
