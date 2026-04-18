'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials } from '@/lib/auth-testimonials';
import TestimonialCard from './TestimonialCard';

const ROTATION_MS = 8_000;
const MANUAL_PAUSE_MS = 30_000;

const STATS: Array<{ value: string; label: string }> = [
  { value: '12.500+', label: 'menciones indexadas' },
  { value: '100+',    label: 'medios monitorizados' },
  { value: '47',      label: 'canales de TV' },
  { value: '24/7',    label: 'vigilancia continua' },
];

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AuthHero() {
  const [index, setIndex] = useState(0);
  const [pausedUntil, setPausedUntil] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoplayRef = useRef<number | null>(null);

  const hasMultiple = testimonials.length > 1;

  // Autoplay — pausa si el usuario interactuó hace <30s o si está haciendo hover.
  useEffect(() => {
    if (!hasMultiple) return;
    if (prefersReducedMotion()) return;

    function tick() {
      const now = Date.now();
      if (now < pausedUntil || isHovering) return;
      setIndex((i) => (i + 1) % testimonials.length);
    }

    autoplayRef.current = window.setInterval(tick, ROTATION_MS);
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [hasMultiple, pausedUntil, isHovering]);

  function go(next: number) {
    setIndex(((next % testimonials.length) + testimonials.length) % testimonials.length);
    setPausedUntil(Date.now() + MANUAL_PAUSE_MS);
  }

  const prev = () => go(index - 1);
  const nextTestimonial = () => go(index + 1);

  const current = testimonials[index];
  if (!current) return null;

  return (
    <>
      {/* TOP — chip + heading */}
      <div>
        <div className="auth-chip-mono" aria-hidden>// CASOS DE USO</div>
        <p className="auth-hero-top" style={{ marginTop: 16 }}>
          La redacción no duerme.<br />
          Tu dossier de prensa tampoco.
        </p>
      </div>

      {/* CENTER — carousel + dots + stats */}
      <div className="auth-hero-center">
        <div
          className="hero-carousel-wrap"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* radial glow behind the card */}
          <div className="hero-glow-wrap" aria-hidden>
            <div className="hero-glow" />
          </div>

          {/* card(s) — crossfade */}
          <div className="hero-card-stack">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className={`hero-card-slide${i === index ? ' hero-card-slide-active' : ''}`}
                aria-hidden={i !== index}
              >
                <TestimonialCard data={t} />
              </div>
            ))}
          </div>

          {/* arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                className="hero-nav-btn hero-nav-btn-prev"
                aria-label="Testimonio anterior"
                onClick={prev}
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="hero-nav-btn hero-nav-btn-next"
                aria-label="Testimonio siguiente"
                onClick={nextTestimonial}
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        {/* dots */}
        {hasMultiple && (
          <div className="hero-dots" role="tablist" aria-label="Selector de testimonios">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir al testimonio ${i + 1}`}
                className={`hero-dot${i === index ? ' hero-dot-active' : ''}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        )}

        {/* stats bar */}
        <div className="hero-stats" role="list" aria-label="Métricas de WhaleMetric">
          {STATS.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              <div className="hero-stat" role="listitem">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
              {i < STATS.length - 1 && <span className="hero-stat-sep" aria-hidden />}
            </div>
          ))}
        </div>
      </div>

      {/* bottom spacer keeps the hero balanced */}
      <div aria-hidden />
    </>
  );
}
