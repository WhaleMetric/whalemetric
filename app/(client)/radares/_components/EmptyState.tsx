'use client';

interface EmptyStateProps {
  view: string | null;
  folderId: string | null;
  onNewRadar: () => void;
}

const CONFIGS: Record<string, { icon: React.ReactNode; title: string; body: string }> = {
  todos: {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
        <circle cx="26" cy="26" r="20" />
        <circle cx="26" cy="26" r="10" />
        <circle cx="26" cy="26" r="2" fill="currentColor" stroke="none" />
        <path d="M26 6v6M26 40v6M6 26h6M40 26h6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Aún no tienes radares',
    body: 'Crea tu primer radar combinando dos o más señales para cruzar su cobertura mediática.',
  },
  favoritos: {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
        <path d="M26 10l4.5 9 10 1.5-7 7 1.7 10L26 33l-9.2 5 1.7-10-7-7 10-1.5z" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Sin radares favoritos',
    body: 'Marca un radar con la estrella ⭐ para encontrarlo rápidamente aquí.',
  },
  recientes: {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
        <circle cx="26" cy="26" r="18" />
        <path d="M26 14v12l7 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Sin actividad reciente',
    body: 'Los radares que abras aparecerán aquí ordenados por última visita.',
  },
  alertas: {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
        <path d="M26 8l20 36H6L26 8z" strokeLinejoin="round" />
        <path d="M26 28v-8M26 34v2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Todo en orden',
    body: 'No hay alertas activas en tus radares. Sigue así.',
  },
  'sin-carpeta': {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
        <path d="M8 18h36v26H8z" strokeLinejoin="round" />
        <path d="M8 18l6-8h12l4 8" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Sin radares sin carpeta',
    body: 'Todos tus radares están organizados en carpetas.',
  },
  folder: {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
        <path d="M8 18h36v26H8z" strokeLinejoin="round" />
        <path d="M8 18l6-8h12l4 8" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Carpeta vacía',
    body: 'Mueve radares aquí desde el menú contextual ⋯ o crea uno nuevo.',
  },
};

export function EmptyState({ view, folderId, onNewRadar }: EmptyStateProps) {
  const key = folderId ? 'folder' : (view ?? 'todos');
  const config = CONFIGS[key] ?? CONFIGS.todos;
  const showCTA = key === 'todos' || key === 'folder';

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 48,
      color: 'var(--text-tertiary)',
    }}>
      {config.icon}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
          {config.title}
        </div>
        <div style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.6 }}>
          {config.body}
        </div>
      </div>
      {showCTA && (
        <button
          onClick={onNewRadar}
          style={{
            marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', fontSize: 13, fontWeight: 600,
            background: 'var(--accent)', color: 'var(--bg)',
            border: 'none', borderRadius: 8, cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M8 2v12M2 8h12" strokeLinecap="round" />
          </svg>
          Nuevo radar
        </button>
      )}
    </div>
  );
}
