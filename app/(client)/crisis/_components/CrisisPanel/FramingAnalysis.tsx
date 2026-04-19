import type { Framing } from '@/lib/types/crisis';

interface Props {
  framings: Framing[];
}

const TREND_GLYPH: Record<Framing['trend'], { glyph: string; color: string }> = {
  up:     { glyph: '↑', color: '#EF4444' },
  down:   { glyph: '↓', color: '#10B981' },
  stable: { glyph: '—', color: 'var(--text-tertiary)' },
};

export function FramingAnalysis({ framings }: Props) {
  const max = framings.reduce((m, f) => Math.max(m, f.pct), 1);
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: 14,
      }}>
        Encuadres dominantes
      </div>

      {framings.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          Sin encuadres detectados todavía.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {framings.map((f) => {
            const t = TREND_GLYPH[f.trend];
            return (
              <div key={f.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, marginBottom: 4,
                }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>
                    {f.label}
                  </span>
                  <span style={{ color: t.color, fontWeight: 600, fontSize: 13, minWidth: 14, textAlign: 'center' }}>
                    {t.glyph}
                  </span>
                  <span style={{
                    color: 'var(--text-secondary)', fontWeight: 600,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    minWidth: 42, textAlign: 'right',
                  }}>
                    {f.pct}%
                  </span>
                </div>
                <div style={{
                  height: 6, background: 'var(--bg-muted)',
                  borderRadius: 4, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${(f.pct / max) * 100}%`,
                    background: 'var(--text-secondary)', opacity: 0.72,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
