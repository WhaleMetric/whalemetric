'use client';

// TODO (bidirectional link): header chips "Tendencias detectadas (N)" and
// "Crisis activas (N)" linking to /tendencias?subject={signal.id} and
// /crisis?subject={signal.id}. Out of scope here.

import type { SignalRecord } from '@/lib/types/signals';
import { SIGNAL_CATEGORY_LABELS } from '@/lib/types/signals';

interface Props {
  signal: SignalRecord;
  onToggleFavorite: () => void;
}

const STATUS_CFG: Record<SignalRecord['status'], { label: string; bg: string; color: string }> = {
  warming_up: { label: 'Calentando datos', bg: '#FEF3C7', color: '#92400E' },
  ready:      { label: 'Activa',           bg: '#D1FAE5', color: '#065F46' },
  error:      { label: 'Error',            bg: '#FEE2E2', color: '#991B1B' },
  archived:   { label: 'Archivada',        bg: '#F3F4F6', color: '#374151' },
};

export default function SignalDetail({ signal, onToggleFavorite }: Props) {
  const status = STATUS_CFG[signal.status];
  const aliases = signal.aliases ?? [];

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 8px', borderRadius: 4,
            background: 'var(--bg-muted)', color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {SIGNAL_CATEGORY_LABELS[signal.type]}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '2px 8px', borderRadius: 4,
            background: status.bg, color: status.color,
          }}>
            {status.label}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={onToggleFavorite}
            title={signal.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, display: 'flex', alignItems: 'center',
            }}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16"
              fill={signal.is_favorite ? '#F59E0B' : 'none'}
              stroke={signal.is_favorite ? '#F59E0B' : 'var(--text-tertiary)'}
              strokeWidth="1.5"
            >
              <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5 4.2 12.6l.7-4.2-3-3 4.2-.6z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
          margin: '0 0 8px', letterSpacing: '-0.3px', lineHeight: 1.2,
        }}>
          {signal.name}
        </h1>

        {signal.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)',
            lineHeight: 1.6, margin: '0 0 10px', maxWidth: 720,
          }}>
            {signal.description}
          </p>
        )}

        {aliases.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4,
            }}>
              Aliases
            </span>
            {aliases.map((a) => (
              <span key={a} style={{
                fontSize: 11, fontWeight: 500,
                padding: '3px 9px', borderRadius: 5,
                background: 'var(--bg-muted)', color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
              }}>
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 28 }}>
        {signal.status === 'ready' ? (
          <ReadyPlaceholder />
        ) : signal.status === 'warming_up' ? (
          <WarmingUpCard />
        ) : signal.status === 'error' ? (
          <ErrorCard />
        ) : (
          <ArchivedCard />
        )}
      </div>
    </div>
  );
}

// ── Body states ──────────────────────────────────────────────────────────────

function ReadyPlaceholder() {
  return (
    <div style={{
      maxWidth: 640, margin: '24px auto',
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '32px 28px',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(16,185,129,0.12)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#047857" strokeWidth="2.2">
          <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        Señal activa
      </div>
      <p style={{
        fontSize: 13, color: 'var(--text-secondary)',
        lineHeight: 1.6, margin: '0 0 16px', maxWidth: 560,
      }}>
        Las métricas detalladas — menciones, alcance, sentimiento, encuadres narrativos, gráficos y noticias recientes — llegarán aquí en cuanto los procesos de análisis las calculen.
      </p>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexDirection: 'column', gap: 8,
        fontSize: 12, color: 'var(--text-tertiary)',
      }}>
        <Bullet>KPIs en vivo (menciones hoy, alcance, sentimiento, fuentes activas)</Bullet>
        <Bullet>Gráficos de volumen y evolución del sentimiento</Bullet>
        <Bullet>Encuadres narrativos dominantes y palabras emergentes</Bullet>
        <Bullet>Últimas noticias relacionadas y distribución por medio</Bullet>
      </ul>
      <p style={{
        fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.6,
        margin: '16px 0 0', fontStyle: 'italic',
      }}>
        La señal ya recibe datos; la vista detallada se activa cuando el backend haya acumulado suficiente historial.
      </p>
    </div>
  );
}

function WarmingUpCard() {
  return (
    <div style={{
      maxWidth: 540, margin: '48px auto', textAlign: 'center',
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '44px 36px',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
        Calentando datos
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
        Estamos procesando las primeras noticias para esta señal. Este proceso tarda entre 12 y 48 horas la primera vez.
      </p>
    </div>
  );
}

function ErrorCard() {
  return (
    <div style={{
      maxWidth: 540, margin: '48px auto', textAlign: 'center',
      background: 'var(--bg)', border: '1px solid #FCA5A5',
      borderRadius: 14, padding: '36px 28px',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#991B1B', marginBottom: 6 }}>
        Error al procesar la señal
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        Contacta con soporte para revisar el procesamiento de esta señal.
      </p>
    </div>
  );
}

function ArchivedCard() {
  return (
    <div style={{
      maxWidth: 540, margin: '48px auto', textAlign: 'center',
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '36px 28px',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
        Señal archivada
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
        Esta señal ya no está activa. Restáurala para volver a recibir datos.
      </p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{
        width: 4, height: 4, borderRadius: '50%',
        background: 'var(--text-tertiary)',
        marginTop: 7, flexShrink: 0,
      }} />
      <span>{children}</span>
    </li>
  );
}
