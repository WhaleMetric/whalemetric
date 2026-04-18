'use client';

import { useEffect, useState } from 'react';
import { feed, type FeedItem } from '@/lib/auth-feed';

const VISIBLE = 5;
const TICK_MS = 3_500;

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function NewsTicker() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const start = cycle % feed.length;
  const visible: FeedItem[] = Array.from(
    { length: VISIBLE },
    (_, i) => feed[(start + i) % feed.length]
  );

  return (
    <div className="news-ticker" role="log" aria-live="polite">
      {visible.map((item, i) => (
        <div
          // Re-mount every cycle so the entry animation replays cleanly.
          key={`${item.id}-${cycle}`}
          className="news-row"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span className="news-time">{item.time}</span>
          <span className="news-source">{item.source}</span>
          <span className="news-headline">{item.headline}</span>
        </div>
      ))}
    </div>
  );
}
