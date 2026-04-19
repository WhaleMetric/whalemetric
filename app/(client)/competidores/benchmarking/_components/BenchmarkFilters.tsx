'use client';

import type { BenchmarkPeriod } from '@/lib/types/benchmark';
import { PERIOD_LABELS } from '@/lib/types/benchmark';

interface Props {
  value: BenchmarkPeriod;
  onChange: (p: BenchmarkPeriod) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: 'inline-flex', gap: 0, border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
      {(['7d', '14d', '30d', '90d'] as BenchmarkPeriod[]).map((p) => {
        const active = value === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: '6px 12px',
              fontSize: 12, fontWeight: 600,
              background: active ? 'var(--text-primary)' : 'var(--bg)',
              color: active ? 'var(--bg)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
