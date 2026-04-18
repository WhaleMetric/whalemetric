'use client';

import { useEffect, useState } from 'react';
import { testimonials } from '@/lib/auth-testimonials';
import TestimonialCard from './TestimonialCard';

const ROTATION_MS = 8_000;

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AuthHero() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    if (prefersReducedMotion()) return;

    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % testimonials.length);
        setFading(false);
      }, 400);
    }, ROTATION_MS);

    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];
  if (!current) return null;

  return (
    <>
      <div>
        <div className="auth-chip-mono" aria-hidden>// CASOS DE USO</div>
        <p className="auth-hero-top" style={{ marginTop: 16 }}>
          La redacción no duerme.<br />
          Tu dossier de prensa tampoco.
        </p>
      </div>

      <div className="auth-hero-center">
        <div style={{ width: '100%', opacity: fading ? 0 : 1, transition: 'opacity 400ms ease' }}>
          <TestimonialCard data={current} />
        </div>
      </div>

      {/* bottom spacer keeps the hero balanced */}
      <div aria-hidden />
    </>
  );
}
