'use client';

import type { Amplifier } from '@/lib/types/crisis';

interface Props {
  amplifiers: Amplifier[];
  activeSource?: string | null;
  onSourceClick?: (source: string) => void;
}

export function TopAmplifiers({ amplifiers, activeSource, onSourceClick }: Props) {
  const max = amplifiers.reduce((m, a) => Math.max(m, a.pct), 1);

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
        Fuentes que más amplifican
      </div>

      {amplifiers.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          Sin datos de amplificación.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {amplifiers.slice(0, 10).map((a) => {
            const isActive = a.source === activeSource;
            return (
              <button
                key={a.source}
                type="button"
                onClick={() => onSourceClick?.(a.source)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '6px 8px', background: isActive ? 'var(--bg-muted)' : 'transparent',
                  border: 'none', borderRadius: 7,
                  cursor: onSourceClick ? 'pointer' : 'default',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (onSourceClick && !isActive)
                    (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.025)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div style={{
                  width: 150, fontSize: 12,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  flexShrink: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {a.source}
                </div>
                <div style={{
                  flex: 1, height: 6, background: 'var(--bg-muted)',
                  borderRadius: 4, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${(a.pct / max) * 100}%`,
                    background: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    opacity: isActive ? 1 : 0.68,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{
                  width: 72, fontSize: 11, color: 'var(--text-tertiary)',
                  textAlign: 'right', flexShrink: 0,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}>
                  {a.pct}% · {a.mentions}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
