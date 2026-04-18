'use client';

import { useEffect, useRef, useState } from 'react';

export interface MediaLogo {
  id: string;
  name: string;
  icon_url: string | null;
  type?: string | null;
}

const MAX_SLOTS = 40;
const FLASH_TICK_MS = 1_200;
const FLASH_DURATION_MS = 600;
const MAX_SIMULTANEOUS = 2;

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function MediaRadar({
  logos,
  total,
}: {
  logos: MediaLogo[];
  total: number;
}) {
  const [lit, setLit] = useState<Set<string>>(() => new Set());
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (logos.length === 0) return;

    const timers = new Set<number>();

    const intervalId = window.setInterval(() => {
      setLit((prev) => {
        if (prev.size >= MAX_SIMULTANEOUS) return prev;

        const candidates = logos.filter(
          (l) => !prev.has(l.id) && l.id !== lastIdRef.current
        );
        if (candidates.length === 0) return prev;

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        lastIdRef.current = pick.id;

        const timeoutId = window.setTimeout(() => {
          setLit((curr) => {
            const next = new Set(curr);
            next.delete(pick.id);
            return next;
          });
          timers.delete(timeoutId);
        }, FLASH_DURATION_MS);
        timers.add(timeoutId);

        const next = new Set(prev);
        next.add(pick.id);
        return next;
      });
    }, FLASH_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [logos]);

  const visible = logos.slice(0, MAX_SLOTS);

  return (
    <section
      className="media-radar"
      role="img"
      aria-label="Medios monitorizados por WhaleMetric"
      aria-live="off"
    >
      <div className="media-radar-header">
        <span className="media-radar-total">{total}</span> MEDIOS EN EL RADAR
      </div>

      {visible.length === 0 ? (
        <div className="media-radar-empty">Conectando con el radar…</div>
      ) : (
        <div className="media-radar-grid">
          {visible.map((logo) => {
            const isLit = lit.has(logo.id);
            return (
              <div
                key={logo.id}
                className={`media-radar-cell${isLit ? ' media-radar-cell-lit' : ''}`}
                title={logo.name}
              >
                {logo.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo.icon_url}
                    alt={logo.name}
                    loading="lazy"
                    className="media-radar-logo"
                  />
                ) : (
                  <span className="media-radar-initials" aria-hidden>
                    {logo.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
