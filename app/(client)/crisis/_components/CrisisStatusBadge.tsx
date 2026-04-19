import type { CrisisStatus } from '@/lib/types/crisis';

const STYLES: Record<CrisisStatus, { bg: string; color: string; label: string }> = {
  active:     { bg: 'rgba(220,38,38,0.08)',  color: '#991B1B', label: 'Activa'          },
  monitoring: { bg: 'rgba(59,130,246,0.10)', color: '#1E40AF', label: 'Monitorización'  },
  resolved:   { bg: 'rgba(16,185,129,0.10)', color: '#047857', label: 'Resuelta'        },
  archived:   { bg: 'rgba(107,114,128,0.10)', color: '#374151', label: 'Archivada'       },
};

interface Props {
  status: CrisisStatus;
}

export function CrisisStatusBadge({ status }: Props) {
  const s = STYLES[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
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
