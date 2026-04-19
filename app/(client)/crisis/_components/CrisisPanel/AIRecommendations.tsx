'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { AIRecommendation } from '@/lib/types/crisis';

interface Props {
  recommendations: AIRecommendation[];
}

export function AIRecommendations({ recommendations }: Props) {
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});

  const copyDraft = (rec: AIRecommendation) => {
    const draft = `${rec.action}\n\nMarco sugerido: ${rec.marco_sugerido}\nImpacto esperado: ${rec.impacto_esperado}`;
    void navigator.clipboard.writeText(draft).then(
      () => toast.success('Draft copiado al portapapeles'),
      () => toast.error('No se pudo copiar'),
    );
  };

  const toggleDone = (n: number) => {
    setDoneMap((prev) => {
      const next = { ...prev, [n]: !prev[n] };
      toast.success(next[n] ? 'Marcada como hecha' : 'Marcada como pendiente');
      return next;
    });
  };

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 18px', height: '100%',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
      }}>
        Recomendaciones IA
      </div>

      {recommendations.length === 0 ? (
        <div style={{
          fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic',
          padding: '10px 0',
        }}>
          Sin recomendaciones activas para esta crisis.
        </div>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {recommendations.map((rec) => {
            const done = !!doneMap[rec.number];
            return (
              <li key={rec.number} style={{
                borderLeft: `2px solid ${done ? '#10B981' : 'var(--border)'}`,
                paddingLeft: 12,
                opacity: done ? 0.6 : 1,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                  lineHeight: 1.45, marginBottom: 4,
                  textDecoration: done ? 'line-through' : 'none',
                }}>
                  <span style={{
                    fontWeight: 700, color: 'var(--text-tertiary)',
                    marginRight: 6, fontFamily: 'monospace',
                  }}>
                    {rec.number}.
                  </span>
                  {rec.action}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>
                  Marco: <span style={{ color: 'var(--text-secondary)' }}>{rec.marco_sugerido}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                  Impacto: <span style={{ color: 'var(--text-secondary)' }}>{rec.impacto_esperado}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => copyDraft(rec)}
                    style={smallBtn}
                  >
                    Copiar draft
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDone(rec.number)}
                    style={{
                      ...smallBtn,
                      background: done ? 'rgba(16,185,129,0.12)' : 'var(--bg)',
                      color: done ? '#047857' : 'var(--text-secondary)',
                      borderColor: done ? '#10B981' : 'var(--border)',
                    }}
                  >
                    {done ? '✓ Hecho' : 'Marcar hecho'}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  padding: '4px 10px', fontSize: 11, fontWeight: 500,
  border: '1px solid var(--border)', borderRadius: 6,
  background: 'var(--bg)', color: 'var(--text-secondary)',
  cursor: 'pointer',
};
