'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import {
  User, Building2, Landmark, Flag, Sparkles, Package,
  Megaphone, Calendar, Hash, Scale, MapPin,
  type LucideIcon,
} from 'lucide-react';
import type { SignalCategory } from '@/lib/types/signals';
import {
  SIGNAL_TYPE_OPTIONS,
  type LucideIconName,
} from '@/lib/signal-constants';

const ICON_MAP: Record<LucideIconName, LucideIcon> = {
  User, Building2, Landmark, Flag, Sparkles, Package,
  Megaphone, Calendar, Hash, Scale, MapPin,
};

interface Props {
  value: SignalCategory | null;
  onChange: (value: SignalCategory) => void;
  hasError?: boolean;
}

export function SignalTypeSelector({ value, onChange, hasError }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = SIGNAL_TYPE_OPTIONS.find((o) => o.value === value) ?? null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px',
          fontSize: 13,
          border: `1px solid ${hasError ? '#EF4444' : open ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--bg-muted)',
          color: selected ? 'var(--text-primary)' : 'var(--text-tertiary)',
          borderRadius: 7, cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {selected ? (
          <>
            <IconFor name={selected.icon} />
            <span style={{ flex: 1 }}>{selected.label}</span>
          </>
        ) : (
          <span style={{ flex: 1 }}>Selecciona un tipo</span>
        )}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--text-tertiary)' }}>
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            marginTop: 4, zIndex: 10,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 320, overflowY: 'auto', padding: '4px 0',
          }}
        >
          {SIGNAL_TYPE_OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', fontSize: 13,
                  background: active ? 'var(--bg-muted)' : 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <IconFor name={opt.icon} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IconFor({ name }: { name: LucideIconName }) {
  return createElement(ICON_MAP[name], { size: 15, strokeWidth: 1.7 });
}
