'use client';

import { NewsItem, Sentiment } from '@/lib/mock/signals';

interface Props {
  news: NewsItem[];
}

function sentimentBadge(s: Sentiment) {
  const styles: Record<Sentiment, { bg: string; color: string; label: string }> = {
    positivo: { bg: '#ECFDF5', color: '#059669', label: 'Positivo' },
    neutro:   { bg: 'var(--bg-muted)', color: 'var(--text-secondary)', label: 'Neutro' },
    negativo: { bg: '#FEF2F2', color: '#DC2626', label: 'Negativo' },
  };
  const st = styles[s];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        background: st.bg,
        color: st.color,
        padding: '2px 7px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
      }}
    >
      {st.label}
    </span>
  );
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Hace menos de 1h';
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d}d`;
}

export default function SignalNewsTable({ news }: Props) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Noticias recientes
        </span>
        <span
          style={{
            marginLeft: 8,
            fontSize: 11,
            color: 'var(--text-tertiary)',
            background: 'var(--bg-muted)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {news.length}
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)' }}>
              {['Titular', 'Fuente', 'Hora', 'Tono', 'Encuadre', ''].map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {news.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom:
                    idx < news.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    maxWidth: 360,
                  }}
                >
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.headline}
                  </span>
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.source}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--text-tertiary)',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {timeAgo(item.publishedAt)}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {sentimentBadge(item.sentiment)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-muted)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.frame}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
                    title="Abrir artículo"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M9 2h5v5M14 2L8 8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
