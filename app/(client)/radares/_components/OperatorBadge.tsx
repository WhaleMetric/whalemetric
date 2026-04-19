export type OpKind = 'and' | 'or' | 'not' | 'min';

const STYLES: Record<OpKind, { bg: string; color: string }> = {
  and: { bg: 'rgba(16, 185, 129, 0.12)',  color: '#047857' },
  or:  { bg: 'rgba(59, 130, 246, 0.12)',  color: '#1D4ED8' },
  not: { bg: 'rgba(236, 72, 153, 0.12)',  color: '#9D174D' },
  min: { bg: 'rgba(245, 158, 11, 0.15)',  color: '#B45309' },
};

const DEFAULT_LABEL: Record<OpKind, string> = {
  and: 'AND',
  or:  'OR',
  not: 'NOT',
  min: '≥2 DE',
};

interface Props {
  kind: OpKind;
  label?: string;
}

export function OperatorBadge({ kind, label }: Props) {
  const { bg, color } = STYLES[kind];
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
        color,
        background: bg,
        textTransform: 'uppercase',
        flexShrink: 0,
        lineHeight: 1.4,
      }}
    >
      {label ?? DEFAULT_LABEL[kind]}
    </span>
  );
}
