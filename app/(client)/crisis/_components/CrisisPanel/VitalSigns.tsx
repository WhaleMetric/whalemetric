import type { CrisisVitalSigns } from '@/lib/types/crisis';

interface Props {
  vitals: CrisisVitalSigns;
}

const VELOCITY_LABEL: Record<CrisisVitalSigns['velocity'], string> = {
  viral:     'Viral',
  sostenido: 'Sostenido',
  contained: 'Contenido',
};

const VELOCITY_COLOR: Record<CrisisVitalSigns['velocity'], string> = {
  viral:     '#DC2626',
  sostenido: '#D97706',
  contained: '#047857',
};

export function VitalSigns({ vitals }: Props) {
  return (
    <Section title="Vital signs">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <Cell
          label="Menciones/hora"
          value={vitals.mentions_per_hour.toLocaleString()}
          delta={vitals.mentions_delta_pct}
        />
        <Cell
          label="Alcance"
          value={formatReach(vitals.reach_estimated)}
        />
        <Cell
          label="Negativo"
          value={`${vitals.sentiment_negative_pct}%`}
          accent="#EF4444"
        />
        <Cell
          label="Duración"
          value={formatDuration(vitals.duration_hours)}
        />
        <Cell
          label="Velocidad"
          value={VELOCITY_LABEL[vitals.velocity]}
          accent={VELOCITY_COLOR[vitals.velocity]}
        />
        <Cell
          label="Pico registrado"
          value={vitals.peak_mentions.toLocaleString()}
        />
      </div>
      {vitals.threshold_critical && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: 'rgba(220,38,38,0.08)',
          color: '#991B1B',
          fontSize: 11, fontWeight: 600, borderRadius: 6,
          textAlign: 'center', letterSpacing: '0.04em',
        }}>
          UMBRAL CRÍTICO CRUZADO
        </div>
      )}
    </Section>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 18px', height: '100%',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Cell({ label, value, delta, accent }: {
  label: string; value: string; delta?: number; accent?: string;
}) {
  return (
    <div>
      <div style={{
        fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: accent ?? 'var(--text-primary)', lineHeight: 1.2,
      }}>
        {value}
        {delta != null && delta !== 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500, marginLeft: 6,
            color: delta > 0 ? '#EF4444' : '#10B981',
          }}>
            {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h ? `${d}d ${h}h` : `${d}d`;
}
