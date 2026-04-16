'use client';

import { Keyword, Sentiment } from '@/lib/mock/signals';

interface Props {
  keywords: Keyword[];
}

function sentimentColor(s: Sentiment): string {
  switch (s) {
    case 'positivo': return '#10B981';
    case 'negativo': return '#EF4444';
    default:         return 'var(--text-secondary)';
  }
}

function sentimentBg(s: Sentiment): string {
  switch (s) {
    case 'positivo': return '#ECFDF5';
    case 'negativo': return '#FEF2F2';
    default:         return 'var(--bg-muted)';
  }
}

export default function SignalKeywords({ keywords }: Props) {
  if (!keywords.length) return null;

  const maxCount = Math.max(...keywords.map((k) => k.count));

  // Font size: 12–22px scaled by count
  function fontSize(count: number) {
    const min = 12, max = 22;
    return Math.round(min + ((count / maxCount) * (max - min)));
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 14,
        }}
      >
        Nube de palabras clave
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 10px',
          alignItems: 'center',
        }}
      >
        {keywords.map((kw) => (
          <span
            key={kw.word}
            title={`${kw.count} menciones`}
            style={{
              fontSize: fontSize(kw.count),
              fontWeight: kw.count > maxCount * 0.6 ? 600 : 400,
              color: sentimentColor(kw.sentiment),
              background: sentimentBg(kw.sentiment),
              padding: '3px 8px',
              borderRadius: 4,
              cursor: 'default',
              lineHeight: 1.4,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.75';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
            }}
          >
            {kw.word}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          gap: 16,
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981', display: 'inline-block' }} />
          Positivo
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bg-muted)', border: '1px solid var(--border)', display: 'inline-block' }} />
          Neutro
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#EF4444', display: 'inline-block' }} />
          Negativo
        </span>
      </div>
    </div>
  );
}
