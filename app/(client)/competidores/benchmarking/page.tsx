'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBenchmarks, resolveDefaultBenchmarkId } from '@/lib/hooks/useBenchmarks';
import { BenchmarkCard } from './_components/BenchmarkCard';

type Filter = 'favoritos' | 'recientes';

export default function BenchmarkingRootPage() {
  return (
    <Suspense>
      <BenchmarkingRootInner />
    </Suspense>
  );
}

function BenchmarkingRootInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const { benchmarks } = useBenchmarks();

  // No view → redirect to the default benchmark
  useEffect(() => {
    if (view) return;
    const defaultId = resolveDefaultBenchmarkId(benchmarks);
    if (defaultId) {
      router.replace(`/competidores/benchmarking/${defaultId}`);
    }
  }, [view, benchmarks, router]);

  if (!view) {
    if (benchmarks.length === 0) return <EmptyState />;
    return <RedirectingState />;
  }

  return <FilteredView view={view as Filter} />;
}

function FilteredView({ view }: { view: Filter }) {
  const { benchmarks } = useBenchmarks();

  const filtered =
    view === 'favoritos'
      ? benchmarks.filter((b) => b.is_favorite)
      : [...benchmarks].sort((a, b) => {
          const ta = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0;
          const tb = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0;
          return tb - ta;
        });

  const title = view === 'favoritos' ? 'Favoritos' : 'Recientes';
  const subtitle =
    view === 'favoritos'
      ? 'Tus benchmarks marcados como favoritos'
      : 'Benchmarks ordenados por última visita';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
            {view === 'favoritos' ? 'Aún no tienes benchmarks favoritos.' : 'No hay benchmarks visitados recientemente.'}
          </div>
        ) : (
          <div className="bm-grid">
            {filtered.map((b) => (
              <BenchmarkCard key={b.id} benchmark={b} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .bm-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 1000px) {
          .bm-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function RedirectingState() {
  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-tertiary)', fontSize: 13,
    }}>
      Cargando benchmark…
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
        Aún no tienes benchmarks
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: 360 }}>
        Usa el botón &quot;Nuevo benchmark&quot; del panel lateral para crear tu primera comparativa.
      </div>
    </div>
  );
}
