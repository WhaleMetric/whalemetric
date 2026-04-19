import type { TrendType } from '@/lib/types/trends';

export interface TrendTypeStyle {
  label: string;
  bg: string;
  color: string;
}

export const TREND_TYPE_STYLES: Record<TrendType, TrendTypeStyle> = {
  volume_spike:     { label: 'PICO',            bg: 'rgba(245,158,11,0.12)', color: '#B45309' },
  sustained_growth: { label: 'CRECIMIENTO',     bg: 'rgba(16,185,129,0.12)', color: '#047857' },
  sustained_decline:{ label: 'DECLIVE',         bg: 'rgba(107,114,128,0.12)',color: '#374151' },
  sentiment_shift:  { label: 'CAMBIO TONO',     bg: 'rgba(139,92,246,0.12)', color: '#6D28D9' },
  new_framing:      { label: 'NUEVO ENCUADRE',  bg: 'rgba(236,72,153,0.12)', color: '#9D174D' },
  source_expansion: { label: 'EXPANSIÓN',       bg: 'rgba(59,130,246,0.12)', color: '#1D4ED8' },
  emerging_topic:   { label: 'EMERGENTE',       bg: 'rgba(20,184,166,0.12)', color: '#0F766E' },
  viral_pattern:    { label: 'VIRAL',           bg: 'rgba(217,119,6,0.16)',  color: '#92400E' },
  recurring_pattern:{ label: 'RECURRENTE',      bg: 'rgba(107,114,128,0.12)',color: '#374151' },
};

interface Props {
  type: TrendType;
}

export function TrendTypeBadge({ type }: Props) {
  const s = TREND_TYPE_STYLES[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: s.color,
        background: s.bg,
        textTransform: 'uppercase',
        flexShrink: 0,
        lineHeight: 1.4,
      }}
    >
      {s.label}
    </span>
  );
}
