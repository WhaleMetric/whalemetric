'use client';

import { useEffect } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title, message,
  confirmLabel = 'Borrar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onCancel, onConfirm]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          background: 'var(--bg)', borderRadius: 12,
          padding: '22px 24px', width: '100%', maxWidth: 420,
          boxShadow: '0 24px 72px rgba(0,0,0,0.25)',
          border: '1px solid var(--border)',
        }}
      >
        <h2
          id="confirm-title"
          style={{
            fontSize: 15, fontWeight: 700, margin: '0 0 8px',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h2>
        <p style={{
          fontSize: 13, lineHeight: 1.55,
          color: 'var(--text-secondary)', margin: '0 0 18px',
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              border: '1px solid var(--border)', borderRadius: 7,
              background: 'none', color: 'var(--text-secondary)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: 'none', borderRadius: 7,
              background: danger ? '#DC2626' : 'var(--accent)',
              color: '#fff',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
