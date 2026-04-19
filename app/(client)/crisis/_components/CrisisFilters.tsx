'use client';

import type { CrisisStatus } from '@/lib/types/crisis';

interface Props {
  value: CrisisStatus;
  onChange: (status: CrisisStatus) => void;
  counts: Record<CrisisStatus, number>;
}

const ORDER: { value: CrisisStatus; label: string }[] = [
  { value: 'active',     label: 'Activas'        },
  { value: 'monitoring', label: 'Monitorización' },
  { value: 'resolved',   label: 'Resueltas'      },
  { value: 'archived',   label: 'Archivadas'     },
];

export function CrisisFilters({ value, onChange, counts }: Props) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
      {ORDER.map((opt) => {
        const active = opt.value === value;
        const count = counts[opt.value] ?? 0;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', fontSize: 12, fontWeight: 500,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'var(--bg)',
              color: active ? 'var(--bg)' : 'var(--text-secondary)',
              borderRadius: 20, cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {opt.label}
            {count > 0 && (
              <span style={{
                fontSize: 10, fontFamily: 'monospace',
                padding: '1px 6px', borderRadius: 10,
                background: active ? 'rgba(255,255,255,0.18)' : 'var(--bg-muted)',
                color: active ? 'var(--bg)' : 'var(--text-tertiary)',
                fontWeight: 600,
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
