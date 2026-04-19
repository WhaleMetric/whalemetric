'use client';

import type { ActorRole } from '@/lib/types/benchmark';

interface Props {
  name: string;
  color: string;
  role?: ActorRole;
  size?: 'sm' | 'md';
  showRole?: boolean;
}

const ROLE_LABEL: Record<ActorRole, string> = {
  primary: 'principal',
  competitor: 'competidor',
  reference: 'referencia',
};

export function ActorChip({ name, color, role, size = 'sm', showRole = false }: Props) {
  const padH = size === 'sm' ? 7 : 10;
  const padV = size === 'sm' ? 3 : 5;
  const fs = size === 'sm' ? 11 : 12;
  const dot = size === 'sm' ? 7 : 9;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: `${padV}px ${padH}px`,
        fontSize: fs,
        fontWeight: 500,
        color: 'var(--text-primary)',
        background: 'var(--bg-muted)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span>{name}</span>
      {showRole && role && (
        <span
          style={{
            fontSize: fs - 2,
            color: 'var(--text-tertiary)',
            marginLeft: 2,
          }}
        >
          · {ROLE_LABEL[role]}
        </span>
      )}
    </span>
  );
}
