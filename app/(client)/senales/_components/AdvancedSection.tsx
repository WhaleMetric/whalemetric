'use client';

import { useState } from 'react';
import {
  SIGNAL_COUNTRIES,
  SIGNAL_LANGUAGES,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS,
  type SourceType,
} from '@/lib/signal-constants';

interface Props {
  countries: string[];
  languages: string[];
  sourceTypes: SourceType[];
  onCountriesChange: (codes: string[]) => void;
  onLanguagesChange: (codes: string[]) => void;
  onSourceTypesChange: (types: SourceType[]) => void;
}

export function AdvancedSection({
  countries, languages, sourceTypes,
  onCountriesChange, onLanguagesChange, onSourceTypesChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
          <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Opciones avanzadas
      </button>

      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FilterMultiSelect
            label="País"
            hint="Sin selección = todos los países"
            placeholder="Buscar país…"
            options={SIGNAL_COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            selected={countries}
            onChange={onCountriesChange}
            tooltipForValue={(value) => (value === 'INT'
              ? 'Medios que cubren geografías múltiples como Bloomberg, Reuters, BBC World.'
              : undefined)}
          />

          <FilterMultiSelect
            label="Idioma"
            hint="Sin selección = todos los idiomas"
            placeholder="Buscar idioma…"
            options={SIGNAL_LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
            selected={languages}
            onChange={onLanguagesChange}
          />

          <div>
            <div style={labelStyle}>Tipo de medio</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {SOURCE_TYPES.map((t) => {
                const checked = sourceTypes.includes(t);
                const isLastChecked = checked && sourceTypes.length === 1;
                return (
                  <label
                    key={t}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      cursor: isLastChecked ? 'not-allowed' : 'pointer',
                      padding: '5px 10px', borderRadius: 6,
                      background: 'var(--bg-muted)', fontSize: 12,
                      color: 'var(--text-primary)',
                      opacity: isLastChecked ? 0.75 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isLastChecked}
                      onChange={() => {
                        if (checked) {
                          if (sourceTypes.length === 1) return;
                          onSourceTypesChange(sourceTypes.filter((x) => x !== t));
                        } else {
                          onSourceTypesChange([...sourceTypes, t]);
                        }
                      }}
                      style={{ accentColor: 'var(--accent)', cursor: 'inherit' }}
                    />
                    {SOURCE_TYPE_LABELS[t]}
                  </label>
                );
              })}
            </div>
            {sourceTypes.length === 1 && (
              <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
                Debe quedar al menos un tipo de medio activo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Generic multi-select with search ─────────────────────────────────────────

interface Option { value: string; label: string }

function FilterMultiSelect({
  label, hint, placeholder, options, selected, onChange, tooltipForValue,
}: {
  label: string;
  hint: string;
  placeholder: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  tooltipForValue?: (v: string) => string | undefined;
}) {
  const [query, setQuery] = useState('');

  const toggle = (value: string) => {
    onChange(selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]);
  };

  const filtered = options.filter(
    (o) => !query || o.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            if (!opt) return null;
            return (
              <span
                key={v}
                title={tooltipForValue?.(v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 4px 3px 9px', fontSize: 12,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 5,
                }}
              >
                {opt.label}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  aria-label={`Quitar ${opt.label}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', padding: '0 2px',
                    display: 'flex', alignItems: 'center', lineHeight: 1,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 10px', fontSize: 12,
          border: '1px solid var(--border)', borderRadius: 6,
          background: 'var(--bg-muted)', color: 'var(--text-primary)',
          outline: 'none',
        }}
      />

      <div style={{
        marginTop: 6, maxHeight: 180, overflowY: 'auto',
        border: '1px solid var(--border-light)', borderRadius: 6,
        background: 'var(--bg)',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-tertiary)' }}>
            Sin resultados
          </div>
        ) : (
          filtered.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                title={tooltipForValue?.(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', fontSize: 12,
                  cursor: 'pointer',
                  background: checked ? 'var(--bg-muted)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; }}
                onMouseLeave={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {opt.label}
              </label>
            );
          })
        )}
      </div>

      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
        {hint}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: 6,
};
