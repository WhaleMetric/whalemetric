'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserSignal } from '@/lib/types/radares';

const TYPE_LABELS: Record<string, string> = {
  persona:             'persona',
  organizacion:        'organización',
  institucion_publica: 'institución',
  partido_politico:    'partido',
  marca:               'marca',
  producto_servicio:   'producto',
  campana_iniciativa:  'campaña',
  evento:              'evento',
  tema:                'tema',
  normativa:           'normativa',
  zona_geografica:     'zona geográfica',
};

interface SignalPickerProps {
  signals: UserSignal[];
  loading: boolean;
  selected: UserSignal[];
  onChange: (signals: UserSignal[]) => void;
}

export function SignalPicker({ signals, loading, selected, onChange }: SignalPickerProps) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);
  const router              = useRouter();

  const filtered = signals.filter(
    (s) =>
      !selected.some((sel) => sel.id === s.id) &&
      s.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (signal: UserSignal) => {
    const already = selected.some((s) => s.id === signal.id);
    onChange(already ? selected.filter((s) => s.id !== signal.id) : [...selected, signal]);
  };

  const remove = (id: string) => onChange(selected.filter((s) => s.id !== id));

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selected.map((s) => (
            <span
              key={s.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px 4px 10px', fontSize: 12, fontWeight: 500,
                background: 'var(--bg-muted)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 20,
              }}
            >
              {s.name}
              <button
                onClick={() => remove(s.id)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-tertiary)', lineHeight: 1, display: 'flex' }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Combobox trigger */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', fontSize: 13,
            border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 7, background: 'var(--bg-muted)',
            cursor: 'text',
          }}
          onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13 13" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={selected.length ? 'Añadir otra señal…' : 'Buscar señal…'}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)' }}
          />
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            marginTop: 4, maxHeight: 220, overflowY: 'auto',
          }}>
            {loading ? (
              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-tertiary)' }}>Cargando…</div>
            ) : filtered.length === 0 && signals.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-tertiary)' }}>
                No tienes señales.{' '}
                <button
                  onClick={() => router.push('/senales')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, padding: 0 }}
                >
                  Crear una señal →
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-tertiary)' }}>Sin resultados</div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => { toggle(s); setQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    {TYPE_LABELS[s.type] ?? s.type}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
