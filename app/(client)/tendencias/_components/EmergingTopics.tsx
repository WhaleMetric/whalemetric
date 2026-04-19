'use client';

import type { EmergingTopic } from '@/lib/types/trends';

interface Props {
  topics: EmergingTopic[];
  onTopicClick?: (topic: EmergingTopic) => void;
}

export function EmergingTopics({ topics, onTopicClick }: Props) {
  if (topics.length === 0) return null;

  return (
    <div style={{
      display: 'flex', gap: 10, overflowX: 'auto',
      paddingBottom: 8, scrollbarWidth: 'thin',
    }}>
      {topics.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTopicClick?.(t)}
          style={{
            flexShrink: 0,
            minWidth: 200, maxWidth: 260,
            padding: '12px 14px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            textAlign: 'left',
            cursor: onTopicClick ? 'pointer' : 'default',
            transition: 'border-color 0.12s, transform 0.12s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = 'var(--text-tertiary)';
            if (onTopicClick) el.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = 'var(--border)';
            el.style.transform = 'none';
          }}
        >
          <div style={{
            fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
            marginBottom: 6, lineHeight: 1.3,
          }}>
            {t.word}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            {t.sources} medios · {t.mentions} menciones {formatWindow(t.window_hours)}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: t.growth_pct > 0 ? '#10B981' : '#EF4444',
          }}>
            {t.growth_pct > 0 ? '+' : ''}{t.growth_pct}% {formatWindow(t.window_hours, true)}
          </div>
        </button>
      ))}
    </div>
  );
}

function formatWindow(hours: number, short = false): string {
  if (hours < 48) return short ? `${hours}h` : `${hours}h`;
  const days = Math.round(hours / 24);
  return short ? `${days}d` : `${days} días`;
}
