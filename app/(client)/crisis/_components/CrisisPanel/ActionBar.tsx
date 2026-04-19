'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type { CrisisStatus } from '@/lib/types/crisis';
import { ConfirmDialog } from '../../../radares/_components/ConfirmDialog';

interface Props {
  initialStatus: CrisisStatus;
  lastUpdatedAt: string;
  resolvedAt?: string;
  archivedAt?: string;
}

export function ActionBar({ initialStatus, lastUpdatedAt, resolvedAt, archivedAt }: Props) {
  const [status, setStatus] = useState<CrisisStatus>(initialStatus);
  const [resolved, setResolved] = useState<string | undefined>(resolvedAt);
  const [archived, setArchived] = useState<string | undefined>(archivedAt);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);

  const markManaged = () => {
    setStatus('monitoring');
    toast.success('Crisis marcada como gestionada');
  };

  const moveMonitoring = () => {
    setStatus('monitoring');
    toast.success('Crisis movida a monitorización');
  };

  const resolve = () => {
    setStatus('resolved');
    setResolved(new Date().toISOString());
    setShowResolveConfirm(false);
    toast.success('Crisis resuelta');
  };

  const archive = () => {
    setStatus('archived');
    setArchived(new Date().toISOString());
    toast.success('Crisis archivada');
  };

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 18px', height: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
      }}>
        Acciones
      </div>

      {status === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <ActionButton onClick={markManaged}>Marcar como gestionada</ActionButton>
          <ActionButton onClick={moveMonitoring}>Mover a monitorización</ActionButton>
          <ActionButton onClick={() => setShowResolveConfirm(true)} primary>
            Resolver crisis
          </ActionButton>
          <ActionButton onClick={archive} subtle>Archivar</ActionButton>
        </div>
      )}

      {status === 'monitoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <ActionButton onClick={() => setShowResolveConfirm(true)} primary>
            Resolver crisis
          </ActionButton>
          <ActionButton onClick={archive} subtle>Archivar</ActionButton>
        </div>
      )}

      {status === 'resolved' && (
        <HistoryInfo
          label="Resuelta"
          at={resolved ?? new Date().toISOString()}
          onArchive={archive}
        />
      )}

      {status === 'archived' && (
        <HistoryInfo
          label="Archivada"
          at={archived ?? new Date().toISOString()}
        />
      )}

      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: '1px solid var(--border-light)',
        fontSize: 11, color: 'var(--text-tertiary)',
      }}>
        Última actualización · {formatDistanceToNow(new Date(lastUpdatedAt), { addSuffix: true, locale: es })}
      </div>

      {showResolveConfirm && (
        <ConfirmDialog
          title="Resolver crisis"
          message="Al resolver, la crisis pasará al histórico y dejará de aparecer en la lista de activas. Puedes reactivarla más tarde si el sistema detecta nuevo volumen."
          confirmLabel="Resolver"
          cancelLabel="Cancelar"
          danger={false}
          onConfirm={resolve}
          onCancel={() => setShowResolveConfirm(false)}
        />
      )}
    </div>
  );
}

function HistoryInfo({
  label, at, onArchive,
}: { label: string; at: string; onArchive?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <div style={{
        padding: '10px 12px',
        background: 'var(--bg-muted)',
        borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        {' '}
        {formatDistanceToNow(new Date(at), { addSuffix: true, locale: es })}.
      </div>
      {onArchive && (
        <ActionButton onClick={onArchive} subtle>Archivar</ActionButton>
      )}
    </div>
  );
}

function ActionButton({
  children, onClick, primary, subtle,
}: { children: React.ReactNode; onClick: () => void; primary?: boolean; subtle?: boolean }) {
  const base: React.CSSProperties = {
    padding: '8px 12px', fontSize: 12, fontWeight: 500,
    border: `1px solid var(--border)`,
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    borderRadius: 7, cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s, border-color 0.12s',
  };

  if (primary) {
    base.background = 'var(--accent)';
    base.borderColor = 'var(--accent)';
    base.color = 'var(--bg)';
    base.fontWeight = 600;
  } else if (subtle) {
    base.color = 'var(--text-tertiary)';
    base.fontSize = 11;
  }

  return (
    <button type="button" onClick={onClick} style={base}>
      {children}
    </button>
  );
}
