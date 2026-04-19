'use client';

export type TrendScope  = 'all' | 'signals' | 'radars';
export type TrendPeriod = '24h' | '7d' | '30d';

interface Props {
  scope: TrendScope;
  period: TrendPeriod;
  onScopeChange: (scope: TrendScope) => void;
  onPeriodChange: (period: TrendPeriod) => void;
}

export function TrendFilters({ scope, period, onScopeChange, onPeriodChange }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
    }}>
      <PillGroup
        options={[
          { value: 'all',     label: 'Todas'    },
          { value: 'signals', label: 'Señales'  },
          { value: 'radars',  label: 'Radares'  },
        ]}
        value={scope}
        onChange={(v) => onScopeChange(v as TrendScope)}
      />
      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
      <PillGroup
        options={[
          { value: '24h', label: '24h' },
          { value: '7d',  label: '7d'  },
          { value: '30d', label: '30d' },
        ]}
        value={period}
        onChange={(v) => onPeriodChange(v as TrendPeriod)}
      />
    </div>
  );
}

function PillGroup<V extends string>({
  options, value, onChange,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 12px', fontSize: 12, fontWeight: 500,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'var(--bg)',
              color: active ? 'var(--bg)' : 'var(--text-secondary)',
              borderRadius: 20, cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
