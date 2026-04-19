'use client';

import Link from 'next/link';
import type { UserSignal } from '@/lib/types/radares';

interface Props {
  signal: UserSignal;
  nonLink?: boolean;
}

export function SignalChip({ signal, nonLink }: Props) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--text-primary)',
    textDecoration: 'none',
    transition: 'border-color 0.12s, background 0.12s, transform 0.12s',
    flexShrink: 0,
    lineHeight: 1.2,
  };

  if (nonLink) {
    return <span style={baseStyle}>{signal.name}</span>;
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
      {signal.name}
    </Link>
  );
}
