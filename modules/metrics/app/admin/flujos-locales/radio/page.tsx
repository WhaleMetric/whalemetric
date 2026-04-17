'use client';

import { useState, useCallback } from 'react';
import ScheduleGrid, { WeekSchedule, emptyWeekSchedule, getActiveRanges } from '../../_components/ScheduleGrid';

interface Station {
  id: string;
  slug: string;
  name: string;
  type: 'radio';
  stream_url: string;
  enabled: boolean;
  schedule: WeekSchedule;
  live_status: 'recording' | 'idle';
  next_slot?: string;
}

const RADIO_STATIONS_INITIAL: Station[] = [
  'RAC1', 'Catalunya Ràdio', 'SER', 'COPE', 'Onda Cero', 'RNE',
].map((name, i) => ({
  id: String(i + 1),
  slug: name.toLowerCase().replace(/[\s\/àèéíïòóúü·]/g, (c) => ({ ' ': '_', 'à':'a','è':'e','é':'e','í':'i','ï':'i','ò':'o','ó':'o','ú':'u','ü':'u','·':'_' })[c] ?? c).replace(/[^a-z0-9_]/g, ''),
  name,
  type: 'radio',
  stream_url: '',
  enabled: false,
  schedule: emptyWeekSchedule(),
  live_status: 'idle',
  next_slot: undefined,
}));

function LiveBadge({ status, next }: { status: 'recording' | 'idle'; next?: string }) {
  if (status === 'recording') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'var(--red-bg)', color: 'var(--red-text)',
        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.2s ease-in-out infinite' }} />
        🔴 Grabando
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'var(--bg-muted)', color: 'var(--text-tertiary)',
      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
    }}>
      ⚪ Dormido{next ? ` hasta ${next}` : ''}
    </span>
  );
}

function StationAvatar({ name }: { name: string }) {
  const initials = name.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase() || '?';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 6,
      background: 'var(--purple-bg)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: 'var(--purple-text)', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function StationCard({
  station,
  onToggle,
  onScheduleChange,
}: {
  station: Station;
  onToggle: (id: string, enabled: boolean) => void;
  onScheduleChange: (id: string, schedule: WeekSchedule) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const allRanges = station.schedule
    .map((mask, i) => {
      const r = getActiveRanges(mask);
      return r === 'Sin grabación' ? null : `${['L','M','X','J','V','S','D'][i]}: ${r.replace('Activo: ','')}`;
    })
    .filter(Boolean);

  const scheduleSummary = allRanges.length
    ? allRanges.slice(0, 2).join(' | ') + (allRanges.length > 2 ? ` +${allRanges.length - 2}` : '')
    : 'Sin franjas configuradas';

  return (
    <div className="card fade-in" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <StationAvatar name={station.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 550, fontSize: 14, color: 'var(--text-primary)' }}>{station.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {scheduleSummary}
          </div>
        </div>
        <LiveBadge status={station.live_status} next={station.next_slot} />
        <label className="toggle" style={{ flexShrink: 0 }}>
          <input type="checkbox" checked={station.enabled} onChange={(e) => onToggle(station.id, e.target.checked)} />
          <span className="toggle-track" />
          <span className="toggle-thumb" />
        </label>
        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px', flexShrink: 0 }} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Cerrar' : 'Configurar'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
            Haz clic (o arrastra) para marcar/desmarcar franjas de grabación. Cada cuadrado = 30 min.
          </div>
          <ScheduleGrid
            schedule={station.schedule}
            onChange={(next) => onScheduleChange(station.id, next)}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => onScheduleChange(station.id, emptyWeekSchedule())}>
              Borrar todo
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '5px 14px' }}
              onClick={() => {
                fetch(`/api/admin/channels/${station.id}/schedule`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ schedule: station.schedule }),
                }).catch(() => {});
                setExpanded(false);
              }}
            >
              Guardar franjas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RadioPage() {
  const [stations, setStations] = useState<Station[]>(RADIO_STATIONS_INITIAL);

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
    fetch(`/api/admin/channels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    }).catch(() => {});
  }, []);

  const handleScheduleChange = useCallback((id: string, schedule: WeekSchedule) => {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, schedule } : s)));
  }, []);

  const activeCount = stations.filter((s) => s.enabled).length;

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="breadcrumb">
            <a href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>WhaleMetric</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <a href="/admin/flujos-locales" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Flujos en local</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="breadcrumb-current">Radio</span>
          </div>
        </div>
        <div className="header-right">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: 4 }}>
            {activeCount} / {stations.length} emisoras activas
          </span>
        </div>
      </header>

      <div className="content">
        <div className="page-header">
          <div>
            <div className="page-title">Configuración — Radio</div>
            <div className="page-subtitle">
              Define en qué franjas horarias se captura cada emisora. Haz clic en "Configurar" para editar la programación.
            </div>
          </div>
          <a href="/admin/flujos-locales/tv" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: 13 }}>
            ← Televisión
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stations.map((st) => (
            <StationCard
              key={st.id}
              station={st}
              onToggle={handleToggle}
              onScheduleChange={handleScheduleChange}
            />
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </>
  );
}
