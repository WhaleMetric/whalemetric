'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Stakeholder, StakeholderSide } from '@/lib/types/crisis';

interface Props {
  stakeholders: Stakeholder[];
}

const COL_STYLE: Record<StakeholderSide, { bg: string; accent: string; label: string }> = {
  attacker: { bg: 'rgba(220,38,38,0.05)', accent: '#991B1B', label: 'Atacantes'  },
  defender: { bg: 'rgba(16,185,129,0.05)', accent: '#047857', label: 'Defensores' },
  neutral:  { bg: 'rgba(107,114,128,0.05)', accent: '#374151', label: 'Neutrales'  },
};

export function StakeholderMap({ stakeholders }: Props) {
  const [selected, setSelected] = useState<Stakeholder | null>(null);

  const bySide: Record<StakeholderSide, Stakeholder[]> = {
    attacker: stakeholders.filter((s) => s.side === 'attacker'),
    defender: stakeholders.filter((s) => s.side === 'defender'),
    neutral:  stakeholders.filter((s) => s.side === 'neutral'),
  };

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: 14,
      }}>
        Mapa de stakeholders
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
      }}>
        <Column side="attacker" stakeholders={bySide.attacker} onSelect={setSelected} />
        <Column side="defender" stakeholders={bySide.defender} onSelect={setSelected} />
        <Column side="neutral"  stakeholders={bySide.neutral}  onSelect={setSelected} />
      </div>

      {selected && (
        <StakeholderModal
          stakeholder={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Column({
  side, stakeholders, onSelect,
}: { side: StakeholderSide; stakeholders: Stakeholder[]; onSelect: (s: Stakeholder) => void }) {
  const style = COL_STYLE[side];
  return (
    <div style={{
      background: style.bg, borderRadius: 8,
      padding: '12px 12px', border: '1px solid var(--border-light)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: style.accent,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 10,
      }}>
        {style.label} ({stakeholders.length})
      </div>
      {stakeholders.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          Ninguno identificado
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {stakeholders.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', textAlign: 'left',
                background: 'transparent', border: 'none', borderRadius: 6,
                cursor: 'pointer', transition: 'background 0.12s',
                fontSize: 12, color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}
              </span>
              <span style={{
                fontSize: 10, fontFamily: 'monospace',
                color: 'var(--text-tertiary)', flexShrink: 0,
              }}>
                {s.mentions}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StakeholderModal({
  stakeholder, onClose,
}: { stakeholder: Stakeholder; onClose: () => void }) {
  const style = COL_STYLE[stakeholder.side];
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: 12,
          padding: '22px 24px', width: '100%', maxWidth: 520,
          maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 24px 72px rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: style.accent,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
            }}>
              {style.label.slice(0, -1)} · {stakeholder.mentions} menciones
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {stakeholder.name}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
              {stakeholder.role}
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

        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginTop: 16, marginBottom: 8,
        }}>
          Declaraciones
        </div>

        {stakeholder.quotes.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
            Sin declaraciones registradas todavía.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stakeholder.quotes.map((q, i) => (
              <div key={i} style={{
                borderLeft: `2px solid ${style.accent}`,
                paddingLeft: 12,
              }}>
                <p style={{
                  fontSize: 13, color: 'var(--text-primary)',
                  lineHeight: 1.55, margin: '0 0 6px',
                  fontStyle: 'italic',
                }}>
                  “{q.text}”
                </p>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {q.source} · {formatDistanceToNow(new Date(q.at), { addSuffix: true, locale: es })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
