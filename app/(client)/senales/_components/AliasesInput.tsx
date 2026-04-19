'use client';

import { useRef, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SignalCategory } from '@/lib/types/signals';

export interface AliasChip {
  value: string;
  source: 'manual' | 'auto';
}

interface Props {
  chips: AliasChip[];
  onChange: (chips: AliasChip[]) => void;
  name: string;
  type: SignalCategory | null;
  error?: string;
}

const MAX_CHIPS = 10;
const REGEN_THRESHOLD = 5;

export function AliasesInput({ chips, onChange, name, type, error }: Props) {
  const [draft, setDraft] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = (raw: string, source: AliasChip['source']) => {
    const value = raw.trim();
    if (!value || value.length > 60) return;
    if (chips.length >= MAX_CHIPS) return;
    if (chips.some((c) => c.value.toLowerCase() === value.toLowerCase())) return;
    if (value.toLowerCase() === name.trim().toLowerCase()) return;
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

  const handleAIClick = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      toast.info('Escribe primero el nombre de la señal');
      return;
    }
    if (chips.length >= REGEN_THRESHOLD) {
      toast.info('Borra algunos aliases antes de regenerar');
      return;
    }
    setLoadingAI(true);
    try {
      const res = await fetch('/api/signals/suggest-aliases', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: trimmed, type }),
      });
      const data = await res.json() as { aliases?: string[] };
      const suggestions = Array.isArray(data.aliases) ? data.aliases : [];

      const existing = new Set(
        [trimmed, ...chips.map((c) => c.value)].map((v) => v.toLowerCase()),
      );
      const next: AliasChip[] = [...chips];
      let added = 0;
      for (const s of suggestions) {
        const v = s.trim();
        if (!v || v.length > 60) continue;
        const key = v.toLowerCase();
        if (existing.has(key)) continue;
        if (next.length >= MAX_CHIPS) break;
        existing.add(key);
        next.push({ value: v, source: 'auto' });
        added++;
      }

      onChange(next);
      if (added > 0) {
        toast.success(`${added} ${added === 1 ? 'alias generado' : 'aliases generados'}`);
      } else {
        toast.info('No se encontraron aliases nuevos para esta señal');
      }
    } catch {
      toast.error('No se pudieron generar los aliases');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex', alignItems: 'stretch',
          border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
          borderRadius: 7,
          background: 'var(--bg-muted)',
          minHeight: 40,
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            flex: 1,
            display: 'flex', flexWrap: 'wrap', gap: 6,
            padding: '7px 10px',
            alignItems: 'center',
            cursor: 'text',
            minHeight: 38,
          }}
        >
          {chips.map((chip, i) => (
            <span
              key={`${chip.value}-${i}`}
              title={chip.source === 'auto' ? 'Sugerido por IA' : undefined}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 4px 3px 9px', fontSize: 12,
                background: chip.source === 'auto' ? 'rgba(59,130,246,0.08)' : 'var(--bg)',
                color: 'var(--text-primary)',
                border: `1px solid ${chip.source === 'auto' ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                borderRadius: 5, lineHeight: 1.25,
              }}
            >
              {chip.value}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeChip(i); }}
                aria-label={`Quitar ${chip.value}`}
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
          ))}

          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={chips.length === 0 ? 'Ej: BBVA, Banco Bilbao, el Bilbao' : ''}
            style={{
              flex: 1, minWidth: 140,
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)', padding: '3px 2px',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleAIClick}
          disabled={loadingAI}
          title="Generar aliases automáticamente"
          style={{
            alignSelf: 'stretch',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '0 12px', fontSize: 12, fontWeight: 500,
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            borderLeft: '1px solid var(--border)',
            cursor: loadingAI ? 'wait' : 'pointer',
            transition: 'background 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!loadingAI) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {loadingAI
            ? <Loader2 size={14} className="aliases-spin" style={{ animation: 'aliases-spin 0.8s linear infinite' }} />
            : <Sparkles size={14} />}
          <span>IA</span>
        </button>
      </div>

      <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
        Pulsa Enter o coma para añadir. Máximo {MAX_CHIPS} aliases.
      </p>

      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444' }}>{error}</p>
      )}

      <style>{`@keyframes aliases-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
