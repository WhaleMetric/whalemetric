'use client';

import { Suspense, useState } from 'react';
import { Toaster } from 'sonner';
import { useBenchmarks } from '@/lib/hooks/useBenchmarks';
import { BenchmarkingSidebar } from './_components/BenchmarkingSidebar';
import { NewBenchmarkModal } from './_components/NewBenchmarkModal';

function BenchmarkingLayoutInner({ children }: { children: React.ReactNode }) {
  const { benchmarks, toggleFavorite } = useBenchmarks();
  const [showNew, setShowNew] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Toaster position="top-right" richColors />

      <BenchmarkingSidebar
        benchmarks={benchmarks}
        onToggleFavorite={toggleFavorite}
        onNewBenchmark={() => setShowNew(true)}
      />

      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-subtle)' }}>
        {children}
      </main>

      {showNew && <NewBenchmarkModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

export default function BenchmarkingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <BenchmarkingLayoutInner>{children}</BenchmarkingLayoutInner>
    </Suspense>
  );
}
