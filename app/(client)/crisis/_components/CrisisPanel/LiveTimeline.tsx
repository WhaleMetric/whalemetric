'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type { CrisisEvent, CrisisEventKind } from '@/lib/types/crisis';

interface Props {
  events: CrisisEvent[];
}

const KIND_COLOR: Record<CrisisEventKind, string> = {
  start:              '#6B7280',
  escalation:         '#DC2626',
  peak_volume:        '#D97706',
  new_framing:        '#9D174D',
  stakeholder_enters: '#1D4ED8',
  response_published: '#047857',
  user_note:          '#6D28D9',
  de_escalation:      '#0F766E',
  resolution:         '#047857',
};

const KIND_LABEL: Record<CrisisEventKind, string> = {
  start:              'Inicio',
  escalation:         'Escalada',
  peak_volume:        'Pico',
  new_framing:        'Nuevo encuadre',
  stakeholder_enters: 'Entra stakeholder',
  response_published: 'Respuesta',
  user_note:          'Nota',
  de_escalation:      'Desescalada',
  resolution:         'Resolución',
};

export function LiveTimeline({ events }: Props) {
  const [localEvents, setLocalEvents] = useState<CrisisEvent[]>(events);
  const [adding, setAdding] = useState(false);
  const [noteText, setNoteText] = useState('');

  const addNote = () => {
    const text = noteText.trim();
    if (!text) return;
    const newEvent: CrisisEvent = {
      id: `note-${Date.now()}`,
      kind: 'user_note',
      title: text.split('\n')[0].slice(0, 80),
      description: text.length > 80 ? text : undefined,
      at: new Date().toISOString(),
      is_user_note: true,
    };
    setLocalEvents((prev) => [...prev, newEvent]);
    setNoteText('');
    setAdding(false);
    toast.success('Nota añadida al timeline');
  };

  const removeNote = (id: string) => {
    setLocalEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success('Nota borrada');
  };

  const ordered = [...localEvents].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: 14,
      }}>
        Timeline en vivo
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ordered.map((ev, idx) => (
          <TimelineRow
            key={ev.id}
            event={ev}
            isLast={idx === ordered.length - 1}
            onRemove={ev.is_user_note ? () => removeNote(ev.id) : undefined}
          />
        ))}
      </div>

      <div style={{ marginTop: 14, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
        {adding ? (
          <div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Documenta una acción tomada…"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 10px', fontSize: 12,
                border: '1px solid var(--border)', borderRadius: 7,
                background: 'var(--bg-muted)', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setAdding(false); setNoteText(''); }}
                style={ghostBtn}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={addNote}
                disabled={!noteText.trim()}
                style={{
                  ...ghostBtn,
                  background: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  color: 'var(--bg)',
                  opacity: noteText.trim() ? 1 : 0.5,
                  cursor: noteText.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Añadir nota
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{
              ...ghostBtn,
              width: '100%', textAlign: 'center',
              borderStyle: 'dashed',
            }}
          >
            + Añadir nota
          </button>
        )}
      </div>
    </div>
  );
}

function TimelineRow({
  event, isLast, onRemove,
}: { event: CrisisEvent; isLast: boolean; onRemove?: () => void }) {
  const color = KIND_COLOR[event.kind];
  return (
    <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
      {/* dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, flexShrink: 0,
          boxShadow: `0 0 0 3px ${color}22`,
        }} />
        {!isLast && (
          <span style={{
            flex: 1, width: 1,
            background: 'var(--border)',
            marginTop: 4, minHeight: 20,
          }} />
        )}
      </div>

      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {KIND_LABEL[event.kind]}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {formatDistanceToNow(new Date(event.at), { addSuffix: true, locale: es })}
          </span>
          <div style={{ flex: 1 }} />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Borrar nota"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: 14, lineHeight: 1,
                padding: 2,
              }}
            >
              ×
            </button>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {event.title}
        </div>
        {event.description && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
            {event.description}
          </div>
        )}
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: '7px 12px', fontSize: 12, fontWeight: 500,
  border: '1px solid var(--border)', borderRadius: 7,
  background: 'var(--bg)', color: 'var(--text-secondary)',
  cursor: 'pointer',
};
