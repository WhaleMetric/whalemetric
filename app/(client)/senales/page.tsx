'use client';

import { useState } from 'react';
import { SIGNALS, getSignalById } from '@/lib/mock/signals';
import SignalsSidebar from '@/components/client/signals/SignalsSidebar';
import SignalDetail from '@/components/client/signals/SignalDetail';

// Empty state when no signal is selected
function EmptyState() {
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
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity={0.4}
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M24 14v10l6 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 38 L14 34" strokeLinecap="round" />
        <path d="M38 38 L34 34" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
        Selecciona una señal
      </div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
        Elige una señal del panel izquierdo para ver su análisis detallado, tendencias y cobertura mediática.
      </div>
    </div>
  );
}

export default function SenalesPage() {
  // Default to first signal with an alert, or first signal overall
  const defaultId =
    SIGNALS.find((s) => s.hasAlert)?.id ?? SIGNALS[0]?.id ?? null;

  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(SIGNALS.filter((s) => s.isFavorite).map((s) => s.id)),
  );

  const selectedSignal = selectedId ? getSignalById(selectedId) : undefined;

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-subtle)',
      }}
    >
      <SignalsSidebar
        selectedId={selectedId}
        favorites={favorites}
        onSelect={setSelectedId}
        onToggleFavorite={toggleFavorite}
      />

      {selectedSignal ? (
        <SignalDetail
          signal={selectedSignal}
          isFavorite={favorites.has(selectedSignal.id)}
          onToggleFavorite={() => toggleFavorite(selectedSignal.id)}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
