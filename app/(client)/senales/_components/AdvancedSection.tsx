'use client';

import { useState } from 'react';

interface Props {
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsable "Opciones avanzadas" wrapper. The caller is responsible for what
 * goes inside (fuentes + matching, in the new signal modal).
 */
export function AdvancedSection({ defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}
      >
        <svg
          width="10" height="10" viewBox="0 0 16 16"
          fill="none" stroke="currentColor" strokeWidth="2.2"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        >
          <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Opciones avanzadas
      </button>

      {open && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {children}
        </div>
      )}
    </div>
  );
}
