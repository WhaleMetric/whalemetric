import type { CrisisSeverity } from '@/lib/types/crisis';

const STYLES: Record<CrisisSeverity, { bg: string; color: string; border?: string }> = {
  CRITICAL: { bg: 'rgba(220,38,38,0.10)', color: '#991B1B', border: '#DC2626' },
  HIGH:     { bg: 'rgba(245,158,11,0.12)', color: '#92400E', border: '#D97706' },
  MEDIUM:   { bg: 'rgba(59,130,246,0.10)', color: '#1E40AF' },
  LOW:      { bg: 'rgba(107,114,128,0.10)', color: '#374151' },
};

const LABELS: Record<CrisisSeverity, string> = {
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
};

interface Props {
  severity: CrisisSeverity;
}

export function SeverityBadge({ severity }: Props) {
  const s = STYLES[severity];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: s.color,
        background: s.bg,
        border: s.border ? `1px solid ${s.border}` : '1px solid transparent',
        textTransform: 'uppercase',
        flexShrink: 0,
        lineHeight: 1.4,
      }}
    >
      {LABELS[severity]}
    </span>
  );
}
