'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import { useSignals } from '@/lib/hooks/useSignals';
import {
  RadarFormulaBuilder,
  emptyDraft,
  draftFromClauses,
  draftToClauses,
  validateDraft,
  type FormulaDraft,
} from './RadarFormulaBuilder';
import type { RadarFolder, Radar } from '@/lib/types/radares';

interface Props {
  folders: RadarFolder[];
  radar?: Radar | null;          // present in edit mode
  onClose: () => void;
  onSaved?: () => void;
}

export function NewRadarModal({ folders, radar, onClose, onSaved }: Props) {
  const isEdit = !!radar;
  const isMock = radar?.is_mock ?? false;
  const router = useRouter();
  const { signals, loading: sigLoading } = useSignals();

  const [name, setName]         = useState(radar?.name ?? '');
  const [description, setDesc]  = useState(radar?.description ?? '');
  const [folderId, setFolderId] = useState<string>(radar?.folder_id ?? '');
  const [draft, setDraft]       = useState<FormulaDraft>(
    radar ? draftFromClauses(radar.top_level_operator, radar.clauses) : emptyDraft(),
  );
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose]);

  const folderOptions = folders.filter((f) => !f.is_mock);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es obligatorio';
    if (name.length > 60) errs.name = 'Máximo 60 caracteres';
    const formulaErr = validateDraft(draft);
    if (formulaErr) errs.formula = formulaErr;
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    if (isMock) {
      toast.info('Este radar es de ejemplo. Crea uno nuevo desde cero para guardarlo.');
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const clauses = draftToClauses(draft);

    try {
      if (isEdit && radar) {
        const { error } = await supabase
          .from('radars')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            folder_id: folderId && !folderId.startsWith('mock-') ? folderId : null,
            top_level_operator: draft.top_level_operator,
          })
          .eq('id', radar.id);
        if (error) throw error;

        // Replace all clauses (ON DELETE CASCADE clears radar_clause_signals)
        await supabase.from('radar_clauses').delete().eq('radar_id', radar.id);
        for (const c of clauses) {
          const { data: newClause, error: cErr } = await supabase
            .from('radar_clauses')
            .insert({
              radar_id: radar.id,
              position: c.position,
              operator: c.operator,
              min_matches: c.min_matches,
              is_exclusion: c.is_exclusion,
            })
            .select('id')
            .single();
          if (cErr || !newClause) throw cErr ?? new Error('clause insert failed');
          const clauseId = (newClause as { id: string }).id;
          if (c.signals.length > 0) {
            const { error: csErr } = await supabase
              .from('radar_clause_signals')
              .insert(c.signals.map((s, i) => ({
                clause_id: clauseId,
                signal_id: s.id,
                position: i,
              })));
            if (csErr) throw csErr;
          }
        }

        toast.success('Radar actualizado');
        onSaved?.();
        onClose();
      } else {
        // Create
        const { data: newRadar, error } = await supabase
          .from('radars')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            folder_id: folderId && !folderId.startsWith('mock-') ? folderId : null,
            top_level_operator: draft.top_level_operator,
            status: 'warming_up',
          })
          .select('id')
          .single();
        if (error) {
          if (error.code === '23505') {
            setErrors({ name: 'Ya tienes un radar con ese nombre' });
            setSaving(false);
            return;
          }
          throw error;
        }
        const newId = (newRadar as { id: string }).id;

        try {
          for (const c of clauses) {
            const { data: newClause, error: cErr } = await supabase
              .from('radar_clauses')
              .insert({
                radar_id: newId,
                position: c.position,
                operator: c.operator,
                min_matches: c.min_matches,
                is_exclusion: c.is_exclusion,
              })
              .select('id')
              .single();
            if (cErr || !newClause) throw cErr ?? new Error('clause insert failed');
            const clauseId = (newClause as { id: string }).id;
            if (c.signals.length > 0) {
              const { error: csErr } = await supabase
                .from('radar_clause_signals')
                .insert(c.signals.map((s, i) => ({
                  clause_id: clauseId,
                  signal_id: s.id,
                  position: i,
                })));
              if (csErr) throw csErr;
            }
          }
        } catch (innerErr) {
          await supabase.from('radars').delete().eq('id', newId);
          throw innerErr;
        }

        toast.success('Radar creado. Calentando datos…');
        onSaved?.();
        onClose();
        router.push(`/radares/${newId}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
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
          padding: '18px 24px 14px', borderBottom: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {isEdit ? 'Editar radar' : 'Nuevo radar'}
            </h2>
            {isMock && <MockBadge />}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: 4,
            }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>
          {isMock && (
            <div style={{
              marginBottom: 14, padding: '10px 12px',
              background: '#FEF3C7', color: '#92400E',
              borderRadius: 8, fontSize: 12, lineHeight: 1.5,
            }}>
              Este es un radar de ejemplo. Los cambios no se guardan: para experimentar, duplícalo o crea uno nuevo.
            </div>
          )}

          <Field label="Nombre" error={errors.name}>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Ej. Crisis BBVA-Sabadell"
              style={inputStyle(!!errors.name)}
            />
          </Field>

          <Field label="Descripción (opcional)">
            <input
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Para qué sirve este radar"
              style={inputStyle(false)}
            />
          </Field>

          <Field label="Carpeta">
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              style={{ ...inputStyle(false), cursor: 'pointer' }}
            >
              <option value="">Sin carpeta</option>
              {folderOptions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </Field>

          <div style={{ borderTop: '1px solid var(--border-light)', margin: '14px 0 16px' }} />

          <RadarFormulaBuilder
            value={draft}
            onChange={(next) => { setDraft(next); if (errors.formula) setErrors((p) => ({ ...p, formula: '' })); }}
            availableSignals={signals}
            signalsLoading={sigLoading}
          />

          {errors.formula && (
            <div style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>
              {errors.formula}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 24px', borderTop: '1px solid var(--border-light)',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px', fontSize: 13, cursor: 'pointer',
              border: '1px solid var(--border)', borderRadius: 7,
              background: 'none', color: 'var(--text-secondary)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isMock}
            style={{
              padding: '9px 20px', fontSize: 13, fontWeight: 600,
              cursor: saving || isMock ? 'not-allowed' : 'pointer',
              border: 'none', borderRadius: 7,
              background: 'var(--accent)', color: 'var(--bg)',
              opacity: saving || isMock ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear radar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        display: 'block', marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</div>
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

function MockBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      padding: '2px 8px', borderRadius: 4,
      background: '#FEF3C7', color: '#92400E',
    }}>
      Datos de ejemplo
    </span>
  );
}
