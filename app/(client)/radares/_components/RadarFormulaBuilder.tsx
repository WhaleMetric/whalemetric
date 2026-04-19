'use client';

import { useMemo } from 'react';
import type {
  Clause,
  ClauseOperator,
  TopLevelOperator,
  UserSignal,
} from '@/lib/types/radares';
import { SignalPicker } from './SignalPicker';
import { RadarFormula } from './RadarFormula';

export interface DraftClause {
  id: string;
  operator: ClauseOperator;
  min_matches: number | null;
  is_exclusion: boolean;
  signals: UserSignal[];
}

export interface FormulaDraft {
  top_level_operator: TopLevelOperator;
  inclusions: DraftClause[];
  exclusions: DraftClause[];
}

export const MAX_INCLUSIONS = 5;

// ── Draft helpers ────────────────────────────────────────────────────────────

let uid = 0;
const newId = () => `d-${Date.now()}-${++uid}`;

export function emptyDraft(): FormulaDraft {
  return {
    top_level_operator: 'and',
    inclusions: [{
      id: newId(),
      operator: 'signal',
      min_matches: null,
      is_exclusion: false,
      signals: [],
    }],
    exclusions: [],
  };
}

export function draftFromClauses(
  topOp: TopLevelOperator,
  clauses: Clause[],
): FormulaDraft {
  const inclusions = clauses
    .filter((c) => !c.is_exclusion)
    .map<DraftClause>((c) => ({
      id: c.id || newId(),
      operator: c.operator,
      min_matches: c.min_matches,
      is_exclusion: false,
      signals: [...c.signals],
    }));
  const exclusions = clauses
    .filter((c) => c.is_exclusion)
    .map<DraftClause>((c) => ({
      id: c.id || newId(),
      operator: 'signal',
      min_matches: null,
      is_exclusion: true,
      signals: [...c.signals],
    }));
  return {
    top_level_operator: topOp,
    inclusions: inclusions.length ? inclusions : emptyDraft().inclusions,
    exclusions,
  };
}

export function draftToClauses(draft: FormulaDraft): Clause[] {
  let pos = 0;
  const out: Clause[] = [];
  for (const c of draft.inclusions) {
    out.push({
      id: c.id,
      position: pos++,
      operator: c.operator,
      min_matches: c.operator === 'weighted' ? c.min_matches : null,
      is_exclusion: false,
      signals: c.signals,
    });
  }
  for (const c of draft.exclusions) {
    out.push({
      id: c.id,
      position: pos++,
      operator: 'signal',
      min_matches: null,
      is_exclusion: true,
      signals: c.signals,
    });
  }
  return out;
}

export function validateDraft(draft: FormulaDraft): string | null {
  if (draft.inclusions.length < 1) return 'Añade al menos una cláusula de inclusión';
  for (const c of draft.inclusions) {
    if (c.signals.length === 0) return 'Cada cláusula debe tener al menos una señal';
    if (c.operator === 'signal' && c.signals.length !== 1)
      return 'Las cláusulas de tipo "1 señal" deben tener exactamente una señal';
    if ((c.operator === 'and' || c.operator === 'or') && c.signals.length < 2)
      return 'Las cláusulas AND/OR necesitan al menos 2 señales';
    if (c.operator === 'weighted') {
      if (c.signals.length < 2) return 'Las cláusulas "Al menos N" necesitan al menos 2 señales';
      if (c.min_matches == null || c.min_matches < 1 || c.min_matches >= c.signals.length)
        return 'El mínimo de "Al menos N" debe estar entre 1 y N−1';
    }
  }
  for (const e of draft.exclusions) {
    if (e.signals.length !== 1) return 'Cada exclusión debe tener exactamente una señal';
  }
  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  value: FormulaDraft;
  onChange: (next: FormulaDraft) => void;
  availableSignals: UserSignal[];
  signalsLoading: boolean;
}

export function RadarFormulaBuilder({
  value,
  onChange,
  availableSignals,
  signalsLoading,
}: Props) {
  const previewClauses = useMemo(() => draftToClauses(value), [value]);

  const updateInclusion = (idx: number, patch: Partial<DraftClause>) => {
    onChange({
      ...value,
      inclusions: value.inclusions.map((c, i) => (i === idx ? adjustAfterPatch({ ...c, ...patch }) : c)),
    });
  };

  const removeInclusion = (idx: number) => {
    if (value.inclusions.length <= 1) return;
    onChange({ ...value, inclusions: value.inclusions.filter((_, i) => i !== idx) });
  };

  const addInclusion = () => {
    if (value.inclusions.length >= MAX_INCLUSIONS) return;
    onChange({
      ...value,
      inclusions: [
        ...value.inclusions,
        {
          id: newId(),
          operator: 'signal',
          min_matches: null,
          is_exclusion: false,
          signals: [],
        },
      ],
    });
  };

  const addExclusion = () => {
    onChange({
      ...value,
      exclusions: [
        ...value.exclusions,
        {
          id: newId(),
          operator: 'signal',
          min_matches: null,
          is_exclusion: true,
          signals: [],
        },
      ],
    });
  };

  const removeExclusion = (idx: number) => {
    onChange({ ...value, exclusions: value.exclusions.filter((_, i) => i !== idx) });
  };

  const updateExclusion = (idx: number, signals: UserSignal[]) => {
    onChange({
      ...value,
      exclusions: value.exclusions.map((c, i) =>
        i === idx ? { ...c, signals: signals.slice(0, 1) } : c,
      ),
    });
  };

  const hasMultipleInclusions = value.inclusions.length > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Inclusions section */}
      <SectionLabel>Señales que deben aparecer</SectionLabel>

      {value.inclusions.map((clause, idx) => (
        <div key={clause.id}>
          {idx > 0 && <ClauseSeparator op={value.top_level_operator} />}
          <ClauseCard
            clause={clause}
            availableSignals={availableSignals}
            signalsLoading={signalsLoading}
            canRemove={value.inclusions.length > 1}
            onPatch={(p) => updateInclusion(idx, p)}
            onRemove={() => removeInclusion(idx)}
            index={idx}
          />
        </div>
      ))}

      {value.inclusions.length < MAX_INCLUSIONS && (
        <button
          type="button"
          onClick={addInclusion}
          style={ghostBtn}
        >
          + Añadir otra cláusula de inclusión
        </button>
      )}

      {/* Top-level operator */}
      {hasMultipleInclusions && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
          background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13,
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Entre cláusulas:</span>
          <RadioOption
            checked={value.top_level_operator === 'and'}
            onChange={() => onChange({ ...value, top_level_operator: 'and' })}
            label="Y también (AND)"
          />
          <RadioOption
            checked={value.top_level_operator === 'or'}
            onChange={() => onChange({ ...value, top_level_operator: 'or' })}
            label="O bien (OR)"
          />
        </div>
      )}

      {/* Exclusions section */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14, marginTop: 4 }}>
        <SectionLabel>Señales a excluir (opcional)</SectionLabel>
        {value.exclusions.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 10px' }}>
            Noticias que contengan alguna de estas señales quedarán fuera del radar.
          </p>
        )}

        {value.exclusions.map((clause, idx) => (
          <div
            key={clause.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              marginBottom: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <SignalPicker
                signals={availableSignals.filter(
                  (s) => !clause.signals.some((x) => x.id === s.id) ? true : true,
                )}
                loading={signalsLoading}
                selected={clause.signals}
                onChange={(next) => updateExclusion(idx, next)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeExclusion(idx)}
              title="Quitar exclusión"
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text-tertiary)',
                cursor: 'pointer', padding: '6px 10px', fontSize: 12,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}

        <button type="button" onClick={addExclusion} style={ghostBtn}>
          + Añadir exclusión
        </button>
      </div>

      {/* Live preview */}
      <div
        style={{
          marginTop: 6, padding: '14px 16px',
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          borderRadius: 10,
        }}
      >
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
        }}>
          Vista previa de la fórmula
        </div>
        {previewClauses.every((c) => c.signals.length === 0) ? (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Añade señales para ver la fórmula
          </div>
        ) : (
          <RadarFormula
            clauses={previewClauses}
            top_level_operator={value.top_level_operator}
            nonLink
          />
        )}
      </div>
    </div>
  );
}

// ── Keep min_matches consistent with signals length / operator changes ──────

function adjustAfterPatch(c: DraftClause): DraftClause {
  if (c.operator !== 'weighted') return { ...c, min_matches: null };
  const n = c.signals.length;
  if (n < 2) return { ...c, min_matches: null };
  let m = c.min_matches ?? Math.min(2, n - 1);
  if (m < 1) m = 1;
  if (m >= n) m = n - 1;
  return { ...c, min_matches: m };
}

// ── Clause card ──────────────────────────────────────────────────────────────

function ClauseCard({
  clause,
  availableSignals,
  signalsLoading,
  canRemove,
  onPatch,
  onRemove,
  index,
}: {
  clause: DraftClause;
  availableSignals: UserSignal[];
  signalsLoading: boolean;
  canRemove: boolean;
  onPatch: (p: Partial<DraftClause>) => void;
  onRemove: () => void;
  index: number;
}) {
  const n = clause.signals.length;
  const isWeighted = clause.operator === 'weighted';

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 16px',
        background: 'var(--bg)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Cláusula {index + 1}
        </span>
        <div style={{ flex: 1 }} />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Quitar cláusula"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 16, lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Operator selector */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12,
        fontSize: 12,
      }}>
        <OpPill
          active={clause.operator === 'signal'}
          onClick={() => onPatch({ operator: 'signal', signals: clause.signals.slice(0, 1) })}
          label="1 señal"
        />
        <OpPill
          active={clause.operator === 'and'}
          onClick={() => onPatch({ operator: 'and' })}
          label="Todas (AND)"
        />
        <OpPill
          active={clause.operator === 'or'}
          onClick={() => onPatch({ operator: 'or' })}
          label="Cualquiera (OR)"
        />
        <OpPill
          active={clause.operator === 'weighted'}
          onClick={() => onPatch({ operator: 'weighted' })}
          label="Al menos N"
        />
      </div>

      {/* Min matches input (weighted only) */}
      {isWeighted && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          fontSize: 13, color: 'var(--text-secondary)',
        }}>
          <span>Al menos</span>
          <input
            type="number"
            min={1}
            max={Math.max(1, n - 1)}
            value={clause.min_matches ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? null : Number(e.target.value);
              onPatch({ min_matches: v });
            }}
            style={{
              width: 60, padding: '4px 8px', fontSize: 13,
              border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--bg)', color: 'var(--text-primary)',
            }}
          />
          <span>
            de {n} señal{n === 1 ? '' : 'es'}
            {n < 2 && (
              <span style={{ color: '#EF4444', marginLeft: 6 }}>
                (añade al menos 2 señales)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Signal picker */}
      <SignalPicker
        signals={availableSignals}
        loading={signalsLoading}
        selected={clause.signals}
        onChange={(next) => {
          let sigs = next;
          if (clause.operator === 'signal' && sigs.length > 1) {
            sigs = sigs.slice(-1);
          }
          onPatch({ signals: sigs });
        }}
      />

      {clause.operator === 'signal' && n > 1 && (
        <p style={{ fontSize: 11, color: '#B45309', margin: '6px 0 0' }}>
          El operador &quot;1 señal&quot; requiere exactamente una señal.
        </p>
      )}
      {(clause.operator === 'and' || clause.operator === 'or') && n < 2 && n > 0 && (
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '6px 0 0' }}>
          Añade al menos otra señal para este operador.
        </p>
      )}
    </div>
  );
}

// ── Small UI bits ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

function ClauseSeparator({ op }: { op: TopLevelOperator }) {
  const color = op === 'and' ? 'var(--op-and, #10B981)' : 'var(--op-or, #3B82F6)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: '#fff', background: color,
        padding: '3px 9px', borderRadius: 5, textTransform: 'uppercase',
      }}>
        {op === 'and' ? 'Y también' : 'O bien'}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

function OpPill({
  active, onClick, label,
}: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 11px', fontSize: 12, fontWeight: 500,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent)' : 'var(--bg)',
        color: active ? 'var(--bg)' : 'var(--text-secondary)',
        borderRadius: 20, cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

function RadioOption({
  checked, onChange, label,
}: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
    }}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: 'var(--accent)' }}
      />
      {label}
    </label>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: '9px 14px', fontSize: 12, fontWeight: 500,
  background: 'var(--bg-muted)', border: '1px dashed var(--border)',
  color: 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer',
  textAlign: 'center',
};
