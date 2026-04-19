'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import { useSignals } from '@/lib/hooks/useSignals';
import { SignalPicker } from './SignalPicker';
import type { RadarFolder, RadarOperator, Radar, UserSignal } from '@/lib/types/radares';

interface Props {
  folders: RadarFolder[];
  radar?: Radar | null;          // present in edit mode
  onClose: () => void;
  onSaved?: () => void;
}

export function NewRadarModal({ folders, radar, onClose, onSaved }: Props) {
  const isEdit = !!radar;
  const router = useRouter();
  const { signals, loading: sigLoading } = useSignals();

  const [name, setName]           = useState(radar?.name ?? '');
  const [description, setDesc]    = useState(radar?.description ?? '');
  const [folderId, setFolderId]   = useState<string>(radar?.folder_id ?? '');
  const [operator, setOperator]   = useState<RadarOperator>(radar?.operator ?? 'all');
  const [minMatch, setMinMatch]   = useState(radar?.min_signals_matched ?? 2);
  const [selected, setSelected]   = useState<UserSignal[]>([]);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Pre-fill selected signals in edit mode
  useEffect(() => {
    if (radar && signals.length > 0) {
      const ids = radar.radar_signals.map((rs) => rs.signal_id);
      setSelected(signals.filter((s) => ids.includes(s.id)));
    }
  }, [radar, signals]);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es obligatorio';
    if (name.length > 60) errs.name = 'Máximo 60 caracteres';
    if (selected.length < 2) errs.signals = 'Selecciona al menos 2 señales';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    const supabase = createClient();

    try {
      if (isEdit && radar) {
        // Update radar
        const { error } = await supabase
          .from('radars')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            folder_id: folderId || null,
            operator,
            min_signals_matched: operator === 'weighted' ? minMatch : null,
          })
          .eq('id', radar.id);
        if (error) throw error;

        // Rebuild radar_signals
        await supabase.from('radar_signals').delete().eq('radar_id', radar.id);
        await supabase.from('radar_signals').insert(
          selected.map((s) => ({ radar_id: radar.id, signal_id: s.id, weight: 1, is_required: true })),
        );
        toast.success('Radar actualizado');
        onSaved?.();
        onClose();
      } else {
        // Create radar
        const { data: newRadar, error } = await supabase
          .from('radars')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            folder_id: folderId || null,
            operator,
            min_signals_matched: operator === 'weighted' ? minMatch : null,
            status: 'warming_up',
          })
          .select()
          .single();
        if (error) {
          if (error.code === '23505') {
            setErrors({ name: 'Ya tienes un radar con ese nombre' });
            setSaving(false);
            return;
          }
          throw error;
        }

        const { error: relError } = await supabase.from('radar_signals').insert(
          selected.map((s) => ({
            radar_id: (newRadar as { id: string }).id,
            signal_id: s.id,
            weight: 1,
            is_required: true,
          })),
        );
        if (relError) {
          await supabase.from('radars').delete().eq('id', (newRadar as { id: string }).id);
          throw relError;
        }

        toast.success('Radar creado. Calentando datos…');
        onClose();
        router.push(`/radares/${(newRadar as { id: string }).id}`);
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
          width: '100%', maxWidth: 620,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 72px rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar radar' : 'Nuevo radar'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Name */}
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

          {/* Description */}
          <Field label="Descripción (opcional)">
            <input
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Para qué sirve este radar"
              style={inputStyle(false)}
            />
          </Field>

          {/* Folder */}
          <Field label="Carpeta">
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              style={{ ...inputStyle(false), cursor: 'pointer' }}
            >
              <option value="">Sin carpeta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </Field>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 18px', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg)', padding: '0 10px', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Señales que componen el radar
            </span>
          </div>

          {/* Signal picker */}
          <Field label={`Selecciona al menos 2 señales`} error={errors.signals}>
            <SignalPicker
              signals={signals}
              loading={sigLoading}
              selected={selected}
              onChange={setSelected}
            />
          </Field>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 18px', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg)', padding: '0 10px', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cómo combinar las señales
            </span>
          </div>

          {/* Operator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {(
              [
                { value: 'all', label: 'Todas (AND estricto)', desc: 'La noticia debe mencionar todas las señales' },
                { value: 'any', label: 'Alguna (OR)',          desc: 'Basta con que aparezca 1 de las señales' },
                { value: 'weighted', label: 'Ponderado (mínimo N de M)', desc: null },
              ] as const
            ).map(({ value, label, desc }) => (
              <label key={value} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="operator"
                  value={value}
                  checked={operator === value}
                  onChange={() => setOperator(value)}
                  style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
                  {desc && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>{desc}</div>}
                  {value === 'weighted' && operator === 'weighted' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Al menos</span>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, selected.length - 1)}
                        value={minMatch}
                        onChange={(e) => setMinMatch(Number(e.target.value))}
                        style={{ width: 50, padding: '3px 6px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-muted)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>de {selected.length} señales deben aparecer</span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <button
              onClick={onClose}
              style={{ padding: '9px 18px', fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 7, background: 'none', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: 7, background: 'var(--accent)', color: 'var(--bg)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando…' : (isEdit ? 'Guardar' : 'Crear radar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</div>}
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
