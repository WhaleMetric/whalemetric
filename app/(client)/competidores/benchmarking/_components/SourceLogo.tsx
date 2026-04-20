'use client';

import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface Props {
  url: string | null | undefined;
  name: string;
  size?: number;
  radius?: number;
}

export function SourceLogo({ url, name, size = 14, radius = 2 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <span
        title={name}
        style={{
          width: size, height: size, borderRadius: radius,
          background: 'var(--bg-muted)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-tertiary)', flexShrink: 0,
        }}
      >
        <Newspaper size={Math.max(8, size - 4)} strokeWidth={1.8} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: radius,
        objectFit: 'contain', background: 'var(--bg-muted)',
        flexShrink: 0,
      }}
    />
  );
}
