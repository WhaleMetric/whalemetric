'use client';

import { useRef, useState } from 'react';

export interface AliasChip {
  value: string;
  source: 'manual' | 'auto';
}

interface Props {
  chips: AliasChip[];
  onChange: (chips: AliasChip[]) => void;
  generating?: boolean;
  /** When true, shows a small inline confirm bar about regenerating aliases. */
  regenerateHint?: {
    onConfirm: () => void;
    onDismiss: () => void;
  } | null;
  disabled?: boolean;
  error?: string;
}

export function AliasesInput({
  chips, onChange, generating, regenerateHint, disabled, error,
}: Props) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = (raw: string, source: AliasChip['source']) => {
    const value = raw.trim();
    if (!value || value.length > 60) return;
    if (chips.some((c) => c.value.toLowerCase() === value.toLowerCase())) return;
    onChange([...chips, { value, source }]);
  };

  const removeChip = (idx: number) => {
    onChange(chips.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (draft.trim()) {
        addChip(draft, 'manual');
        setDraft('');
      }
    } else if (e.key === 'Backspace' && !draft && chips.length > 0) {
      e.preventDefault();
      removeChip(chips.length - 1);
    }
  };

  const handleBlur = () => {
    if (draft.trim()) {
      addChip(draft, 'manual');
      setDraft('');
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: '7px 10px',
          border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
          borderRadius: 7,
          background: disabled ? 'var(--bg-muted)' : 'var(--bg-muted)',
          minHeight: 40, alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {chips.map((chip, i) => (
          <span
            key={`${chip.value}-${i}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 4px 3px 9px', fontSize: 12,
              background: chip.source === 'auto' ? 'rgba(59,130,246,0.08)' : 'var(--bg)',
              color: 'var(--text-primary)',
              border: `1px solid ${chip.source === 'auto' ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
              borderRadius: 5,
              lineHeight: 1.25,
            }}
            title={chip.source === 'auto' ? 'Sugerido automáticamente' : undefined}
          >
            {chip.value}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(i); }}
              disabled={disabled}
              style={{
                background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                color: 'var(--text-tertiary)', padding: '0 2px',
                display: 'flex', alignItems: 'center', lineHeight: 1,
              }}
              aria-label={`Quitar ${chip.value}`}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={chips.length === 0 ? 'Ej: BBVA, Banco Bilbao, el Bilbao' : ''}
          style={{
            flex: 1, minWidth: 140,
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: 'var(--text-primary)', padding: '3px 2px',
          }}
        />
      </div>

      {generating && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)',
        }}>
          <Spinner />
          Generando aliases automáticamente…
        </div>
      )}

      {regenerateHint && !generating && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 6, padding: '6px 10px',
          background: 'var(--bg-subtle)', borderRadius: 6,
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          <span style={{ flex: 1 }}>¿Regenerar aliases para el nuevo nombre?</span>
          <button
            type="button"
            onClick={regenerateHint.onDismiss}
            style={linkBtn}
          >
            No
          </button>
          <button
            type="button"
            onClick={regenerateHint.onConfirm}
            style={{ ...linkBtn, color: 'var(--accent)', fontWeight: 600 }}
          >
            Sí, regenerar
          </button>
        </div>
      )}

      {!generating && !regenerateHint && (
        <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
          Pulsa Enter o coma para añadir. Los sugeridos aparecen en azul cuando terminas el nombre.
        </p>
      )}

      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444' }}>{error}</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 12, height: 12,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--text-tertiary)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'aliases-spin 0.8s linear infinite',
      }}
    >
      <style>{`@keyframes aliases-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-secondary)', fontSize: 12, padding: '2px 4px',
};
