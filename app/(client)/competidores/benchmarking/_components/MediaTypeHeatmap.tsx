'use client';

import { Globe, Newspaper, Radio, Tv } from 'lucide-react';
import type { BenchmarkActor, MediaTypeBreakdown, MediaTypeKey } from '@/lib/types/benchmark';

interface Props {
  actors: BenchmarkActor[];
  breakdown: MediaTypeBreakdown;
}

const MEDIA_LABELS: Record<MediaTypeKey, string> = {
  digital: 'Prensa Digital',
  escrita: 'Prensa Escrita',
  tv: 'Televisión',
  radio: 'Radio',
};

const MEDIA_ICONS: Record<MediaTypeKey, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  digital: Globe,
  escrita: Newspaper,
  tv: Tv,
  radio: Radio,
};

export function MediaTypeHeatmap({ actors, breakdown }: Props) {
  const mediaKeys: MediaTypeKey[] = ['digital', 'escrita', 'tv', 'radio'];

  return (
    <div className="bm-media-grid">
      {mediaKeys.map((key) => {
        const entries = [...breakdown[key]].sort((a, b) => b.pct - a.pct);
        const maxPct = Math.max(...entries.map((e) => e.pct));
        const Icon = MEDIA_ICONS[key];
        return (
          <div key={key} style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 14px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              marginBottom: 10,
            }}>
              <Icon size={16} strokeWidth={1.8} />
              <span>{MEDIA_LABELS[key]}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {entries.map((e) => {
                const a = actors.find((x) => x.id === e.actor_id);
                if (!a) return null;
                return (
                  <div key={e.actor_id} style={{ fontSize: 11 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      color: 'var(--text-primary)', marginBottom: 2,
                    }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.display_name}
                      </span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                        {e.pct}%
                      </span>
                    </div>
                    <div style={{
                      height: 4,
                      background: 'var(--bg-muted)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(e.pct / maxPct) * 100}%`,
                        height: '100%',
                        background: a.color,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <style>{`
        .bm-media-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 900px) {
          .bm-media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 520px) {
          .bm-media-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
