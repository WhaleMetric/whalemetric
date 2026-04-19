'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import type { SignalCategory } from '@/lib/types/signals';
import { suggestAliases } from '@/lib/signal-aliases-mock';
import { SOURCE_TYPES, type SourceType } from '@/lib/signal-constants';
import { useSourcesForSignal } from '@/lib/hooks/useSourcesForSignal';
import { SignalTypeSelector } from './SignalTypeSelector';
import { AliasesInput, type AliasChip } from './AliasesInput';
import { AdvancedSection } from './AdvancedSection';
import { SourcesSelector } from './SourcesSelector';

interface Props {
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export function NewSignalModal({ onClose, onCreated }: Props) {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName]           = useState('');
  const [type, setType]           = useState<SignalCategory | null>(null);
  const [description, setDesc]    = useState('');
  const [aliases, setAliases]     = useState<AliasChip[]>([]);
  const [generating, setGenerating] = useState(false);
  const [regenerateHint, setRegenerateHint] = useState<{ onConfirm: () => void; onDismiss: () => void } | null>(null);
  const [lastGeneratedForName, setLastGeneratedForName] = useState<string>('');

  const [countries, setCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([...SOURCE_TYPES]);

  const { sources, loading: sourcesLoading, error: sourcesError } = useSourcesForSignal();
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ── Focus + Esc ────────────────────────────────────────────────────────────
  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') attemptClose();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, aliases.length, description]);

  const hasUnsavedChanges = name.trim().length >= 3 || aliases.length > 0 || description.trim().length > 0;

  const attemptClose = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Tienes cambios sin guardar. ¿Cerrar sin crear la señal?')) return;
    }
    onClose();
  };

  // ── Auto-generate aliases on name blur ─────────────────────────────────────

  const runAutoGeneration = async () => {
    if (!type) return; // type is required for rules
    setGenerating(true);
    const trimmed = name.trim();
    // Simulated latency
    const ms = 800 + Math.floor(Math.random() * 700);
    await new Promise((r) => setTimeout(r, ms));
    const generated = suggestAliases(trimmed, type);
    const existingManual = aliases.filter((a) => a.source === 'manual');
    const next: AliasChip[] = [
      ...existingManual,
      ...generated.map<AliasChip>((v) => ({ value: v, source: 'auto' })),
    ];
    // Dedup
    const seen = new Set<string>();
    const deduped = next.filter((c) => {
      const k = c.value.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    setAliases(deduped);
    setLastGeneratedForName(trimmed);
    setGenerating(false);
  };

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return;
    if (!type) return;
    if (trimmed === lastGeneratedForName) return;
    const hasManual = aliases.some((a) => a.source === 'manual');
    const hasAutoFromPrevious = aliases.some((a) => a.source === 'auto');

    if (hasManual && !hasAutoFromPrevious) {
      // Respect manual work — do not run auto-generation silently.
      return;
    }

    if (hasAutoFromPrevious) {
      // Ask before regenerating.
      setRegenerateHint({
        onConfirm: () => {
          setRegenerateHint(null);
          // Drop previous auto aliases then generate.
          setAliases((prev) => prev.filter((a) => a.source !== 'auto'));
          void runAutoGeneration();
        },
        onDismiss: () => setRegenerateHint(null),
      });
      return;
    }

    void runAutoGeneration();
  };

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

  const sourceTypeError = sourceTypes.length === 0 ? 'Marca al menos un tipo de medio' : undefined;
  const sourcesError_empty = selectedSourceIds.length === 0 ? true : false;

  const hasAnyError = !!(nameError || typeError || aliasError || sourceTypeError || sourcesError_empty);
  const canSubmit = !hasAnyError && !saving;

  // ── Filtered sources (same logic as selector, for save-time math) ──────────

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (countries.length > 0) {
        const code = s.country_code ?? '';
        const isIntMatch = countries.includes('INT')
          && (s.scope === 'international' || code === 'INT' || code === '');
        const isCountryMatch = countries.some((c) => c !== 'INT' && c === code);
        if (!isIntMatch && !isCountryMatch) return false;
      }
      if (languages.length > 0) {
        if (!s.language_code || !languages.includes(s.language_code)) return false;
      }
      if (sourceTypes.length > 0) {
        if (!sourceTypes.includes(s.type as SourceType)) return false;
      }
      return true;
    });
  }, [sources, countries, languages, sourceTypes]);

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

      const filters: Record<string, unknown> = {};
      if (countries.length > 0) filters.countries = countries;
      if (languages.length > 0) filters.languages = languages;
      if (sourceTypes.length < SOURCE_TYPES.length) filters.source_types = sourceTypes;

      const allFilteredIds = new Set(filteredSources.map((s) => s.id));
      const selectedInFiltered = selectedSourceIds.filter((id) => allFilteredIds.has(id));
      const hasSelectedSubset =
        selectedInFiltered.length > 0 &&
        selectedInFiltered.length < allFilteredIds.size;
      if (hasSelectedSubset) {
        filters.include_source_ids = selectedInFiltered;
      }

      const aliasValues = aliases
        .map((a) => a.value.trim())
        .filter(Boolean);

      const { data, error } = await supabase
        .from('signals')
        .insert({
          user_id: userId,
          name: trimmedName,
          type,
          aliases: aliasValues,
          description: description.trim() || null,
          filters,
          status: 'warming_up',
        })
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
          {/* Nombre */}
          <Field label="Nombre" required error={submitted ? nameError : undefined}>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              maxLength={60}
              placeholder="Ej: BBVA, Pedro Sánchez, Transición energética"
              style={inputStyle(!!(submitted && nameError))}
            />
          </Field>

          {/* Tipo */}
          <Field label="Tipo" required error={submitted ? typeError : undefined}>
            <SignalTypeSelector
              value={type}
              onChange={setType}
              hasError={!!(submitted && typeError)}
            />
          </Field>

          {/* Aliases */}
          <Field
            label="Aliases y variantes"
            error={aliasError}
          >
            <AliasesInput
              chips={aliases}
              onChange={(next) => setAliases(next)}
              generating={generating}
              regenerateHint={regenerateHint}
              error={aliasError}
            />
          </Field>

          {/* Descripción */}
          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value.slice(0, 200))}
              placeholder="Contexto interno. No afecta al matching."
              rows={3}
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

          {/* Sources section */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14, marginTop: 4 }}>
            <SourcesSelector
              sources={sources}
              loading={sourcesLoading}
              error={sourcesError}
              countries={countries}
              languages={languages}
              sourceTypes={sourceTypes}
              selectedIds={selectedSourceIds}
              onSelectedChange={setSelectedSourceIds}
              error_noSelection={submitted && sourcesError_empty}
            />
          </div>

          {/* Advanced */}
          <div style={{ marginTop: 18 }}>
            <AdvancedSection
              countries={countries}
              languages={languages}
              sourceTypes={sourceTypes}
              onCountriesChange={setCountries}
              onLanguagesChange={setLanguages}
              onSourceTypesChange={setSourceTypes}
            />
          </div>

          {submitted && sourceTypeError && (
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#EF4444' }}>{sourceTypeError}</p>
          )}

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
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
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
