'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import type { SignalCategory } from '@/lib/types/signals';
import { useSourcesForSignal } from '@/lib/hooks/useSourcesForSignal';
import { SignalTypeSelector } from './SignalTypeSelector';
import { AliasesInput, type AliasChip } from './AliasesInput';
import { AdvancedSection } from './AdvancedSection';
import { SourcesSelector } from './SourcesSelector';

interface Props {
  onClose: () => void;
  onCreated?: (id: string) => void;
}

// Types whose matching benefits from fulltext fallback by default.
const FULLTEXT_DEFAULT_TRUE: SignalCategory[] = [
  'tema',
  'campana_iniciativa',
  'normativa',
  'evento',
];

function defaultFulltextFor(type: SignalCategory | null): boolean {
  if (!type) return false;
  return FULLTEXT_DEFAULT_TRUE.includes(type);
}

export function NewSignalModal({ onClose, onCreated }: Props) {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName]           = useState('');
  const [type, setType]           = useState<SignalCategory | null>(null);
  const [description, setDesc]    = useState('');
  const [aliases, setAliases]     = useState<AliasChip[]>([]);

  const { sources, loading: sourcesLoading, error: sourcesError } = useSourcesForSignal();
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  const [useFulltext, setUseFulltext] = useState<boolean>(false);
  const [fulltextTouched, setFulltextTouched] = useState(false);

  const [saving, setSaving]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync fulltext default when the type changes, unless the user manually toggled it.
  useEffect(() => {
    if (fulltextTouched) return;
    setUseFulltext(defaultFulltextFor(type));
  }, [type, fulltextTouched]);

  useEffect(() => { nameRef.current?.focus(); }, []);

  // ── Validation ─────────────────────────────────────────────────────────────

  const trimmedName = name.trim();
  const nameError =
    trimmedName.length === 0 ? 'El nombre es obligatorio' :
    trimmedName.length > 60  ? 'Máximo 60 caracteres'      :
    undefined;

  const typeError = !type ? 'Selecciona un tipo' : undefined;

  const aliasError = useMemo<string | undefined>(() => {
    const seen = new Set<string>();
    for (const a of aliases) {
      const v = a.value.trim();
      if (!v || v.length > 60) return 'Cada alias debe tener entre 1 y 60 caracteres';
      if (v.toLowerCase() === trimmedName.toLowerCase()) return 'Un alias no puede ser igual al nombre';
      const k = v.toLowerCase();
      if (seen.has(k)) return 'Hay aliases duplicados';
      seen.add(k);
    }
    return undefined;
  }, [aliases, trimmedName]);

  const noSelection = selectedSourceIds.length === 0;

  const hasAnyError = !!(nameError || typeError || aliasError || noSelection);
  const canSubmit = !hasAnyError && !saving;

  // ── Esc with unsaved-changes guard ─────────────────────────────────────────

  const hasUnsavedChanges =
    trimmedName.length >= 3 || aliases.length > 0 || description.trim().length > 0;

  const attemptClose = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Tienes cambios sin guardar. ¿Cerrar sin crear la señal?')) return;
    }
    onClose();
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') attemptClose();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSubmitted(true);
    if (hasAnyError) return;
    setSaving(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) throw new Error('No autenticado');

      // Persistence rule: save source_ids only if the selection differs from
      // the set of default top sources.
      const selectedSorted  = [...selectedSourceIds].sort();
      const defaultTopSorted = sources
        .filter((s) => s.is_top_source)
        .map((s) => s.id)
        .sort();

      const filters: Record<string, unknown> = {};
      const differsFromTop =
        selectedSorted.length !== defaultTopSorted.length
        || selectedSorted.some((id, i) => id !== defaultTopSorted[i]);
      if (differsFromTop) {
        filters.source_ids = selectedSourceIds;
      }

      const aliasValues = aliases
        .map((a) => a.value.trim())
        .filter(Boolean);

      const payload: Record<string, unknown> = {
        user_id: userId,
        name: trimmedName,
        type,
        aliases: aliasValues,
        description: description.trim() || null,
        filters,
        status: 'warming_up',
      };
      // Only send use_fulltext_fallback if the user explicitly toggled it;
      // otherwise let the DB trigger set the default based on type.
      if (fulltextTouched) payload.use_fulltext_fallback = useFulltext;

      const { data, error } = await supabase
        .from('signals')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          setServerError('Ya tienes una señal con ese nombre');
          setSaving(false);
          return;
        }
        throw error;
      }

      const newId = (data as { id: string }).id;
      toast.success('Señal creada. Calentando datos…');
      onCreated?.(newId);
      onClose();
      router.push(`/senales?id=${newId}`);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Error al guardar');
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      onClick={attemptClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-signal-title"
        style={{
          background: 'var(--bg)', borderRadius: 14,
          width: '100%', maxWidth: 720,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 72px rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 14px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <h2 id="new-signal-title" style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Nueva señal
          </h2>
          <button
            onClick={attemptClose}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Nombre + Tipo (row) */}
          <div className="new-signal-name-type">
            <Field label="Nombre" required error={submitted ? nameError : undefined} className="name-col">
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Ej: BBVA, Pedro Sánchez, Transición energética"
                style={inputStyle(!!(submitted && nameError))}
              />
            </Field>
            <Field label="Tipo" required error={submitted ? typeError : undefined} className="type-col">
              <SignalTypeSelector
                value={type}
                onChange={setType}
                hasError={!!(submitted && typeError)}
              />
            </Field>
          </div>

          {/* Descripción */}
          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value.slice(0, 200))}
              placeholder="Contexto interno. No afecta al matching."
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', fontSize: 13,
                border: '1px solid var(--border)', borderRadius: 7,
                background: 'var(--bg-muted)', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
            <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right' }}>
              {description.length}/200
            </div>
          </Field>

          {/* Aliases */}
          <Field label="Aliases y variantes" error={aliasError}>
            <AliasesInput
              chips={aliases}
              onChange={setAliases}
              name={name}
              type={type}
              error={aliasError}
            />
          </Field>

          {/* Advanced */}
          <AdvancedSection defaultOpen>
            <SourcesSelector
              sources={sources}
              loading={sourcesLoading}
              error={sourcesError}
              selectedIds={selectedSourceIds}
              onSelectedChange={setSelectedSourceIds}
              signalName={trimmedName}
              signalType={type}
              signalAliases={aliases.map((a) => a.value)}
              error_noSelection={submitted && noSelection}
            />

            {/* Matching */}
            <div>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                marginBottom: 8,
              }}>
                Matching
              </div>
              <FulltextToggle
                checked={useFulltext}
                touched={fulltextTouched}
                defaultValue={defaultFulltextFor(type)}
                onChange={(v) => { setFulltextTouched(true); setUseFulltext(v); }}
              />
            </div>
          </AdvancedSection>

          {serverError && (
            <div style={{
              marginTop: 14, padding: '8px 12px',
              background: 'rgba(239,68,68,0.08)', color: '#991B1B',
              borderRadius: 7, fontSize: 12,
            }}>
              {serverError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 24px',
          borderTop: '1px solid var(--border-light)',
        }}>
          <button
            type="button"
            onClick={attemptClose}
            style={{
              padding: '9px 18px', fontSize: 13, cursor: 'pointer',
              border: '1px solid var(--border)', borderRadius: 7,
              background: 'none', color: 'var(--text-secondary)',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit}
            style={{
              padding: '9px 20px', fontSize: 13, fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              border: 'none', borderRadius: 7,
              background: 'var(--accent)', color: 'var(--bg)',
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            {saving ? 'Guardando…' : 'Crear señal'}
          </button>
        </div>
      </div>

      {/* Scoped layout rules — Name/Type row collapses to one column on narrow viewports */}
      <style>{`
        .new-signal-name-type {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .new-signal-name-type .name-col { flex: 1; min-width: 0; }
        .new-signal-name-type .type-col { width: 240px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .new-signal-name-type { flex-direction: column; }
          .new-signal-name-type .type-col { width: 100%; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, required, error, children, className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ marginBottom: className ? 0 : 14 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        display: 'block', marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444' }}>{error}</p>
      )}
    </div>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', fontSize: 13,
    border: `1px solid ${hasError ? '#EF4444' : 'var(--border)'}`,
    borderRadius: 7, background: 'var(--bg-muted)',
    color: 'var(--text-primary)', outline: 'none',
  };
}

// ── Fulltext toggle (row with switch) ────────────────────────────────────────

function FulltextToggle({
  checked, touched, defaultValue, onChange,
}: {
  checked: boolean;
  touched: boolean;
  defaultValue: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); }
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        border: `1px solid ${checked ? 'rgba(10,10,10,0.15)' : 'var(--border)'}`,
        borderRadius: 10,
        background: checked ? 'var(--bg-subtle)' : 'var(--bg)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (!checked) el.style.background = 'var(--bg-subtle)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (!checked) el.style.background = 'var(--bg)';
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
          marginBottom: 2,
        }}>
          Fulltext fallback
          {!touched && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              padding: '2px 7px', borderRadius: 4,
              background: defaultValue ? 'rgba(16,185,129,0.12)' : 'var(--bg-muted)',
              color: defaultValue ? '#047857' : 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {defaultValue ? 'Por defecto' : 'Por defecto off'}
            </span>
          )}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-tertiary)',
          lineHeight: 1.55,
        }}>
          Activa la señal también cuando el matching exacto no encuentra menciones,
          usando búsqueda textual sobre el cuerpo de la noticia.
        </div>
      </div>

      <Switch checked={checked} />
    </div>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      style={{
        position: 'relative',
        width: 40, height: 22,
        flexShrink: 0,
        borderRadius: 11,
        background: checked ? 'var(--accent)' : 'var(--border)',
        transition: 'background 0.18s ease',
        display: 'inline-block',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          width: 18, height: 18,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 1px 1px rgba(0,0,0,0.08)',
          transition: 'left 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      />
    </span>
  );
}
