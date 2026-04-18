'use client';

import { useEffect, useState } from 'react';

function formatTime(d: Date) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function LiveStatus() {
  // SSR renders a dash-placeholder so there's no hydration mismatch.
  const [time, setTime] = useState<string>('--:--:--');

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="live-status" aria-label="Estado del feed en vivo">
      <div className="live-status-left">
        <span className="live-status-dot" aria-hidden />
        <span className="live-status-label">LIVE FEED</span>
      </div>
      <span className="live-status-clock" aria-live="off">
        {time}
      </span>
    </div>
  );
}
