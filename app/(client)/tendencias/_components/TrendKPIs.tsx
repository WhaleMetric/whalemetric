import type { Trend } from '@/lib/types/trends';

interface Props {
  trends: Trend[];
}

export function TrendKPIs({ trends }: Props) {
  const active     = trends.length;
  const spikes     = trends.filter((t) => t.type === 'volume_spike').length;
  const framings   = trends.filter((t) => t.type === 'new_framing').length;
  const emerging   = trends.filter((t) => t.type === 'emerging_topic').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      <Kpi label="Tendencias activas" value={active} />
      <Kpi label="Picos de volumen"   value={spikes} />
      <Kpi label="Nuevos encuadres"   value={framings} />
      <Kpi label="Temas emergentes"   value={emerging} />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
