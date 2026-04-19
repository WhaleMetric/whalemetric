'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { useRadares } from '@/lib/hooks/useRadares';
import { useRadarFolders } from '@/lib/hooks/useRadarFolders';
import { MOCK_SNAPSHOTS, MOCK_RADARS } from '@/lib/mock/radares';
import { RadarGrid } from './_components/RadarGrid';
import { EmptyState } from './_components/EmptyState';
import { NewRadarModal } from './_components/NewRadarModal';
import type { Radar, RadarSnapshot, VolumePoint } from '@/lib/types/radares';

const VIEW_LABELS: Record<string, string> = {
  favoritos:   'Favoritos',
  recientes:   'Recientes',
  alertas:     'Con alertas',
};

function RadaresPageInner() {
  const searchParams = useSearchParams();
  const view         = searchParams.get('view');
  const folderId     = searchParams.get('folder');
  const search       = searchParams.get('q') ?? '';

  const { folders } = useRadarFolders();
  const {
    radars, loading,
    toggleFavorite, moveToFolder, deleteRadar, archiveRadar, duplicateRadar,
    refresh,
  } = useRadares(view, folderId, search);

  const [editingRadar, setEditingRadar] = useState<Radar | null>(null);
  const [showNewRadar, setShowNewRadar] = useState(false);

  const isFiltered = !!view || !!folderId || !!search;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isFiltered ? (
        <FilteredView
          view={view}
          folderId={folderId}
          search={search}
          folders={folders}
          radars={radars}
          loading={loading}
          onNewRadar={() => setShowNewRadar(true)}
          onEditRadar={setEditingRadar}
          onToggleFavorite={toggleFavorite}
          onMoveToFolder={moveToFolder}
          onDelete={(id) => { deleteRadar(id); toast.success('Radar eliminado'); }}
          onArchive={(id) => { archiveRadar(id); toast.success('Radar archivado'); }}
          onDuplicate={duplicateRadar}
        />
      ) : (
        <AggregateDashboard
          folders={folders}
          onNewRadar={() => setShowNewRadar(true)}
          onEditRadar={setEditingRadar}
          onToggleFavorite={toggleFavorite}
          onMoveToFolder={moveToFolder}
          onDelete={(id) => { deleteRadar(id); toast.success('Radar eliminado'); }}
          onArchive={(id) => { archiveRadar(id); toast.success('Radar archivado'); }}
          onDuplicate={duplicateRadar}
        />
      )}

      {/* skeleton pulse animation */}
      <style>{`
        @keyframes radar-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Modals */}
      {showNewRadar && (
        <NewRadarModal
          folders={folders}
          onClose={() => setShowNewRadar(false)}
          onSaved={refresh}
        />
      )}
      {editingRadar && (
        <NewRadarModal
          folders={folders}
          radar={editingRadar}
          onClose={() => setEditingRadar(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

export default function RadaresPage() {
  return (
    <Suspense>
      <RadaresPageInner />
    </Suspense>
  );
}

// ── Aggregate dashboard (default view) ───────────────────────────────────────

type RadarActionProps = {
  folders: ReturnType<typeof useRadarFolders>['folders'];
  onNewRadar: () => void;
  onEditRadar: (r: Radar) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onMoveToFolder: (id: string, folderId: string | null) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (r: Radar) => void;
};

function AggregateDashboard({
  folders, onNewRadar, onEditRadar,
  onToggleFavorite, onMoveToFolder, onDelete, onArchive, onDuplicate,
}: RadarActionProps) {
  const snapshots = useMemo(
    () => MOCK_RADARS.map((r) => MOCK_SNAPSHOTS[r.id]).filter(Boolean),
    [],
  );
  const agg = useMemo(() => aggregateSnapshots(snapshots), [snapshots]);
  const recentNews = useMemo(() => gatherRecentNews(snapshots, 6), [snapshots]);
  const topRadars = useMemo(() => MOCK_RADARS.slice(0, 6), []);

  return (
    <>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Radares
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
              Vista agregada de todos los radares activos
            </p>
          </div>
          <button
            onClick={onNewRadar}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--bg)',
              border: 'none', borderRadius: 8, cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M8 2v12M2 8h12" strokeLinecap="round" />
            </svg>
            Nuevo radar
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KpiCard label="Menciones hoy"        value={agg.mentions.toLocaleString()}  delta={agg.mentionsDelta} />
          <KpiCard label="Alcance total"        value={formatReach(agg.reach)}         delta={agg.reachDelta} />
          <KpiCard label="Sentimiento promedio" value={`${agg.sentiment}%`}            delta={agg.sentimentDelta} />
          <KpiCard label="Fuentes activas"      value={agg.sources.toString()}         delta={agg.sourcesDelta} />
        </div>

        {/* Volume + alerts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <Card title="Volumen de menciones · 14 días">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agg.volume14d} barSize={8}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="positive" stackId="a" fill="#10B981" />
                <Bar dataKey="neutral"  stackId="a" fill="#9CA3AF" />
                <Bar dataKey="negative" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Últimas alertas">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentNews.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '8px 0' }}>
                  Sin alertas recientes
                </div>
              ) : (
                recentNews.map((n) => <AlertRow key={n.id} news={n} />)
              )}
            </div>
          </Card>
        </div>

        {/* Top radars */}
        <div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            marginBottom: 10,
          }}>
            Radares más activos
          </div>
          <RadarGrid
            radars={topRadars}
            loading={false}
            folders={folders}
            onToggleFavorite={onToggleFavorite}
            onMoveToFolder={onMoveToFolder}
            onEdit={onEditRadar}
            onDelete={onDelete}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
          />
        </div>
      </div>
    </>
  );
}

// ── Filtered (old) grid view ─────────────────────────────────────────────────

function FilteredView({
  view, folderId, search, folders, radars, loading,
  onNewRadar, onEditRadar,
  onToggleFavorite, onMoveToFolder, onDelete, onArchive, onDuplicate,
}: {
  view: string | null;
  folderId: string | null;
  search: string;
  radars: Radar[];
  loading: boolean;
} & RadarActionProps) {
  const activeFolder = folderId ? folders.find((f) => f.id === folderId) : null;
  const viewLabel = activeFolder?.name ?? VIEW_LABELS[view ?? ''] ?? 'Filtrados';
  const radarCount = radars.length;
  const alertCount = radars.reduce((acc, r) => acc + (r.radar_alerts[0]?.count ?? 0), 0);

  return (
    <>
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Radares · {viewLabel}
            </h1>
            {!loading && (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                {radarCount} radar{radarCount !== 1 ? 'es' : ''}
                {alertCount > 0 && ` · ${alertCount} alerta${alertCount > 1 ? 's' : ''} activa${alertCount > 1 ? 's' : ''}`}
                {search ? ` · búsqueda "${search}"` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onNewRadar}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--bg)',
              border: 'none', borderRadius: 8, cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M8 2v12M2 8h12" strokeLinecap="round" />
            </svg>
            Nuevo radar
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {!loading && radars.length === 0 ? (
          <EmptyState
            view={view}
            folderId={folderId}
            onNewRadar={onNewRadar}
          />
        ) : (
          <RadarGrid
            radars={radars}
            loading={loading}
            folders={folders}
            onToggleFavorite={onToggleFavorite}
            onMoveToFolder={onMoveToFolder}
            onEdit={onEditRadar}
            onDelete={onDelete}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
          />
        )}
      </div>
    </>
  );
}

// ── Small reusable bits ──────────────────────────────────────────────────────

function KpiCard({ label, value, delta }: { label: string; value: string; delta: number }) {
  const up = delta >= 0;
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: up ? '#10B981' : '#EF4444' }}>
        {up ? '↑' : '↓'} {Math.abs(delta)}%
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 20px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function AlertRow({ news }: { news: RadarSnapshot['recent_news'][number] }) {
  const colors: Record<string, string> = {
    positivo: '#10B981',
    neutro:   '#9CA3AF',
    negativo: '#EF4444',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '8px 0', borderBottom: '1px solid var(--border-light)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: colors[news.sentiment] ?? colors.neutro,
        marginTop: 6, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: 1.3,
        }}>
          {news.headline}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
          {news.source} · {formatDistanceToNow(new Date(news.published_at), { addSuffix: true, locale: es })}
        </div>
      </div>
    </div>
  );
}

// ── Aggregation helpers ──────────────────────────────────────────────────────

function aggregateSnapshots(snapshots: RadarSnapshot[]) {
  const mentions   = snapshots.reduce((a, s) => a + s.kpis.mentions_today, 0);
  const reach      = snapshots.reduce((a, s) => a + s.kpis.reach_estimated, 0);
  const sources    = snapshots.reduce((a, s) => a + s.kpis.active_sources, 0);
  const sentiment  = snapshots.length
    ? Math.round(snapshots.reduce((a, s) => a + s.kpis.sentiment_positive_pct, 0) / snapshots.length)
    : 0;

  // Deltas as simple weighted averages
  const avgDelta = (sel: (s: RadarSnapshot) => number) =>
    snapshots.length
      ? Math.round(snapshots.reduce((a, s) => a + sel(s), 0) / snapshots.length)
      : 0;

  return {
    mentions,
    mentionsDelta: avgDelta((s) => s.kpis.mentions_delta),
    reach,
    reachDelta: avgDelta((s) => s.kpis.reach_delta),
    sentiment,
    sentimentDelta: avgDelta((s) => s.kpis.sentiment_delta),
    sources,
    sourcesDelta: avgDelta((s) => s.kpis.active_sources_delta),
    volume14d: mergeVolumeTrends(snapshots),
  };
}

function mergeVolumeTrends(snapshots: RadarSnapshot[]): VolumePoint[] {
  const byDate = new Map<string, VolumePoint>();
  for (const s of snapshots) {
    for (const pt of s.volume_trend_14d) {
      const existing = byDate.get(pt.date);
      if (existing) {
        existing.positive += pt.positive;
        existing.neutral  += pt.neutral;
        existing.negative += pt.negative;
      } else {
        byDate.set(pt.date, { ...pt });
      }
    }
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function gatherRecentNews(
  snapshots: RadarSnapshot[],
  limit: number,
): RadarSnapshot['recent_news'] {
  const all = snapshots.flatMap((s) => s.recent_news);
  return all
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, limit);
}

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
