'use client';

import { useEffect, useRef, useState } from 'react';

export interface MultiOption {
  value: string;
  label: string;
  /** Optional leading label like an emoji flag. */
  prefix?: string;
}

interface Props {
  label: string;
  options: MultiOption[];
  /** Selected values. Empty array = "Todos". */
  value: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelectDropdown({
  label, options, value, onChange,
}: Props) {
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

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const summary = (() => {
    if (value.length === 0) return 'Todos';
    if (value.length === 1) {
      const opt = options.find((o) => o.value === value[0]);
      return opt?.label ?? value[0];
    }
    return `${value.length} seleccionados`;
  })();

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5,
      }}>
        {label}
      </div>
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '100%', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', fontSize: 12,
            border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
            background: 'var(--bg-muted)',
            color: value.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
            borderRadius: 7, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {summary}
          </span>
          <svg
            width="10" height="10" viewBox="0 0 16 16"
            fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--text-tertiary)', flexShrink: 0 }}
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              marginTop: 4, zIndex: 20,
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: 280, overflowY: 'auto', padding: '4px 0',
            }}
          >
            {/* "Todos" pseudo-option */}
            <button
              type="button"
              onClick={() => { onChange([]); }}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 12px', fontSize: 12,
                background: value.length === 0 ? 'var(--bg-muted)' : 'transparent',
                color: 'var(--text-primary)',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontWeight: value.length === 0 ? 600 : 500,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (value.length !== 0) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
              }}
              onMouseLeave={(e) => {
                if (value.length !== 0) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{
                width: 12, height: 12, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {value.length === 0 && (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="2.4">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Todos
            </button>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggle(opt.value)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', fontSize: 12,
                    background: selected ? 'var(--bg-muted)' : 'transparent',
                    color: 'var(--text-primary)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{
                    width: 12, height: 12, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="2.4">
                        <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {opt.prefix && <span style={{ flexShrink: 0 }}>{opt.prefix}</span>}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
