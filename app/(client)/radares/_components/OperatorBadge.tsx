export type OpKind = 'and' | 'or' | 'not' | 'min';

const BG: Record<OpKind, string> = {
  and: 'var(--op-and, #10B981)',
  or:  'var(--op-or, #3B82F6)',
  not: 'var(--op-not, #EC4899)',
  min: 'var(--op-min, #F59E0B)',
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
        color: '#fff',
        background: BG[kind],
        textTransform: 'uppercase',
        flexShrink: 0,
        lineHeight: 1.4,
      }}
    >
      {label ?? DEFAULT_LABEL[kind]}
    </span>
  );
}
