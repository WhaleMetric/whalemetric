'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ActorRole, BenchmarkCategory, BenchmarkPeriod } from '@/lib/types/benchmark';
import {
  ACTOR_COLOR_PALETTE,
  CATEGORY_LABELS,
  PERIOD_LABELS,
  ROLE_LABELS,
} from '@/lib/types/benchmark';

interface Props {
  onClose: () => void;
}

interface ActorDraft {
  id: string;
  name: string;
  role: ActorRole;
  color: string;
}

function uid(): string {
  return `draft-${Math.random().toString(36).slice(2, 10)}`;
}

export function NewBenchmarkModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BenchmarkCategory>('marca');
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState<BenchmarkPeriod>('30d');
  const [actors, setActors] = useState<ActorDraft[]>([
    { id: uid(), name: '', role: 'primary',    color: ACTOR_COLOR_PALETTE[0] },
    { id: uid(), name: '', role: 'competitor', color: ACTOR_COLOR_PALETTE[1] },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose]);

  const addActor = () => {
    if (actors.length >= 8) return;
    const colorIdx = actors.length % ACTOR_COLOR_PALETTE.length;
    setActors((prev) => [
      ...prev,
      { id: uid(), name: '', role: 'competitor', color: ACTOR_COLOR_PALETTE[colorIdx] },
    ]);
  };

  const removeActor = (id: string) => {
    if (actors.length <= 2) return;
    setActors((prev) => prev.filter((a) => a.id !== id));
  };

  const updateActor = (id: string, patch: Partial<ActorDraft>) => {
    setActors((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const handleCreate = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    setSaving(false);
    toast.info('Funcionalidad en preview. Por ahora puedes explorar los benchmarks de ejemplo');
    onClose();
  };

  const hasPrimary = actors.some((a) => a.role === 'primary');
  const canSubmit = name.trim().length >= 3 && actors.filter((a) => a.name.trim()).length >= 2 && hasPrimary;

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
        role="dialog"
        aria-modal="true"
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
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Nuevo benchmark
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
              Compara la cobertura de varios actores en paralelo
            </p>
          </div>
          <button
            onClick={onClose}
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
          {/* Name + Category */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <Field label="Nombre" required style={{ flex: 1, minWidth: 240 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Supermercados en Badalona"
                style={inputStyle()}
              />
            </Field>
            <Field label="Categoría" style={{ width: 220 }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BenchmarkCategory)}
                style={inputStyle()}
              >
                {(Object.keys(CATEGORY_LABELS) as BenchmarkCategory[]).map((k) => (
                  <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="Contexto interno sobre el objetivo de este benchmark."
              style={{
                ...inputStyle(),
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </Field>

          {/* Actors */}
          <div style={{ marginTop: 18, marginBottom: 8 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Actores a comparar
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {actors.length}/8 · mínimo 2
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actors.map((a, idx) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', width: 16 }}>
                    {idx + 1}
                  </span>
                  <input
                    value={a.name}
                    onChange={(e) => updateActor(a.id, { name: e.target.value })}
                    placeholder="Nombre del actor"
                    style={{ ...inputStyle(), flex: 1, minWidth: 0 }}
                  />
                  <select
                    value={a.role}
                    onChange={(e) => updateActor(a.id, { role: e.target.value as ActorRole })}
                    style={{ ...inputStyle(), width: 130 }}
                  >
                    {(Object.keys(ROLE_LABELS) as ActorRole[]).map((k) => (
                      <option key={k} value={k}>{ROLE_LABELS[k]}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {ACTOR_COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateActor(a.id, { color: c })}
                        aria-label={`Color ${c}`}
                        style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: c,
                          border: a.color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeActor(a.id)}
                    disabled={actors.length <= 2}
                    aria-label="Quitar actor"
                    style={{
                      background: 'none', border: 'none',
                      cursor: actors.length <= 2 ? 'not-allowed' : 'pointer',
                      color: 'var(--text-tertiary)',
                      opacity: actors.length <= 2 ? 0.3 : 1,
                      padding: 2,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addActor}
              disabled={actors.length >= 8}
              style={{
                marginTop: 8,
                padding: '7px 12px',
                fontSize: 12, fontWeight: 500,
                background: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px dashed var(--border)',
                borderRadius: 7,
                cursor: actors.length >= 8 ? 'not-allowed' : 'pointer',
                opacity: actors.length >= 8 ? 0.5 : 1,
              }}
            >
              + Añadir actor
            </button>
            {!hasPrimary && (
              <div style={{ fontSize: 11, color: '#F87171', marginTop: 6 }}>
                Al menos un actor debe tener rol &quot;principal&quot;
              </div>
            )}
          </div>

          {/* Sources section placeholder */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Fuentes
            </div>
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-tertiary)',
            }}>
              Se aplicarán las fuentes por defecto del proyecto. Podrás afinar la selección
              una vez esté disponible la creación real de benchmarks.
            </div>
          </div>

          {/* Period */}
          <div style={{ marginTop: 16 }}>
            <Field label="Periodo por defecto">
              <div style={{ display: 'flex', gap: 6 }}>
                {(['7d', '14d', '30d', '90d'] as BenchmarkPeriod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12, fontWeight: 500,
                      background: period === p ? 'var(--text-primary)' : 'var(--bg-muted)',
                      color: period === p ? 'var(--bg)' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 7,
                      cursor: 'pointer',
                    }}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 24px', borderTop: '1px solid var(--border-light)',
        }}>
          <button
            type="button"
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
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit || saving}
            style={{
              padding: '9px 20px', fontSize: 13, fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              border: 'none', borderRadius: 7,
              background: 'var(--accent)', color: 'var(--bg)',
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            {saving ? 'Guardando…' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, required, children, style,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        display: 'block', marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: '#F87171', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px', fontSize: 13,
    border: '1px solid var(--border)', borderRadius: 7,
    background: 'var(--bg-muted)', color: 'var(--text-primary)',
    outline: 'none',
  };
}
