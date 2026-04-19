'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { useSignals } from '@/lib/hooks/useSignals';
import SignalsSidebar from '@/components/client/signals/SignalsSidebar';
import SignalDetail from '@/components/client/signals/SignalDetail';

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-tertiary)',
        gap: 12,
        padding: 40,
      }}
    >
      <svg
        width="48" height="48" viewBox="0 0 48 48"
        fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M24 14v10l6 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
        No tienes señales todavía
      </div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        Crea tu primera señal para empezar a monitorizar menciones, sentimiento y cobertura mediática.
      </div>
      <button
        onClick={onCreate}
        style={{
          marginTop: 8,
          padding: '9px 18px', fontSize: 13, fontWeight: 600,
          background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 7, cursor: 'pointer',
        }}
      >
        Crear primera señal
      </button>
    </div>
  );
}

function DetailPlaceholder() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-tertiary)',
        gap: 12,
        padding: 40,
      }}
    >
      <svg
        width="48" height="48" viewBox="0 0 48 48"
        fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M24 14v10l6 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
        Selecciona una señal
      </div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
        Elige una señal del panel izquierdo para ver su ficha.
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
      <div style={{ width: 280, background: 'var(--bg)', borderRight: '1px solid var(--border)' }} />
      <div style={{ flex: 1, padding: 28 }}>
        <div style={sk(60, 320)} />
        <div style={{ height: 16 }} />
        <div style={sk(200, '100%')} />
      </div>
      <style>{`@keyframes signals-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

function sk(h: number, w: number | string): React.CSSProperties {
  return {
    height: h, width: w, background: 'var(--bg-muted)',
    borderRadius: 10, animation: 'signals-pulse 1.4s ease-in-out infinite',
  };
}

export default function SenalesPage() {
  const router = useRouter();
  const { signals, loading, error, toggleFavorite } = useSignals({ status: 'ready' });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derive the effective selection. While no explicit selection (or the previous
  // one is no longer present) fall back to the first favorite, then the first
  // signal overall. Avoids a setState-in-effect for default-selection sync.
  const effectiveSelectedId = useMemo(() => {
    if (signals.length === 0) return null;
    if (selectedId && signals.some((s) => s.id === selectedId)) return selectedId;
    const first = signals.find((s) => s.is_favorite) ?? signals[0];
    return first?.id ?? null;
  }, [signals, selectedId]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#991B1B' }}>
          Error al cargar las señales
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', maxWidth: 520, textAlign: 'center' }}>
          {error}
        </div>
      </div>
    );
  }

  const handleCreate = () => router.push('/senales/nueva');

  const handleToggleFavorite = async (id: string, current: boolean) => {
    await toggleFavorite(id, current);
    toast.success(current ? 'Quitada de favoritos' : 'Añadida a favoritos');
  };

  const selectedSignal = effectiveSelectedId
    ? signals.find((s) => s.id === effectiveSelectedId)
    : undefined;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-subtle)',
      }}
    >
      <Toaster position="top-right" richColors />

      {signals.length === 0 ? (
        <>
          <SignalsSidebar
            signals={[]}
            selectedId={null}
            onSelect={setSelectedId}
            onToggleFavorite={handleToggleFavorite}
            onCreate={handleCreate}
          />
          <EmptyState onCreate={handleCreate} />
        </>
      ) : (
        <>
          <SignalsSidebar
            signals={signals}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            onToggleFavorite={handleToggleFavorite}
            onCreate={handleCreate}
          />
          {selectedSignal ? (
            <SignalDetail
              signal={selectedSignal}
              onToggleFavorite={() => handleToggleFavorite(selectedSignal.id, selectedSignal.is_favorite)}
            />
          ) : (
            <DetailPlaceholder />
          )}
        </>
      )}
    </div>
  );
}
