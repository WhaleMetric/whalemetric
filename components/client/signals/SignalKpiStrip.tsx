'use client';

import { SignalKpi } from '@/lib/mock/signals';

interface Props {
  kpis: SignalKpi;
}

function Delta({ value }: { value: number }) {
  if (value === 0) return null;
  const up = value > 0;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: up ? '#10B981' : '#EF4444',
        marginLeft: 4,
      }}
    >
      {up ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
}

interface KpiItemProps {
  label: string;
  value: string;
  delta: number;
  separator?: boolean;
}

function KpiItem({ label, value, delta, separator }: KpiItemProps) {
  return (
    <>
      <div style={{ padding: '16px 24px', minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          <Delta value={delta} />
        </div>
      </div>
      {separator && (
        <div
          style={{
            width: 1,
            alignSelf: 'stretch',
            background: 'var(--border-light)',
            margin: '12px 0',
          }}
        />
      )}
    </>
  );
}

export default function SignalKpiStrip({ kpis }: Props) {
  const reach =
    kpis.reach >= 1000
      ? `${(kpis.reach / 1000).toFixed(1)}M`
      : `${kpis.reach}K`;

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: 16,
      }}
    >
      <KpiItem
        label="Menciones hoy"
        value={kpis.mentionsToday.toLocaleString('es-ES')}
        delta={kpis.mentionsDelta}
        separator
      />
      <KpiItem
        label="Alcance estimado"
        value={reach}
        delta={kpis.reachDelta}
        separator
      />
      <KpiItem
        label="Sentimiento positivo"
        value={`${kpis.sentimentScore}%`}
        delta={kpis.sentimentDelta}
        separator
      />
      <KpiItem
        label="Fuentes activas"
        value={kpis.activeSources.toString()}
        delta={kpis.activeSourcesDelta}
      />
    </div>
  );
}
