'use client';

import { useState, useCallback } from 'react';
import ScheduleGrid, { WeekSchedule, emptyWeekSchedule, getActiveRanges } from '../../../_components/ScheduleGrid';

export interface Channel {
  id: string;
  slug: string;
  name: string;
  type: 'tv' | 'radio';
  stream_url: string;
  enabled: boolean;
  schedule: WeekSchedule;
}

function LiveBadge({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'var(--red-bg)', color: 'var(--red-text)',
        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--red)',
          animation: 'pulse 1.2s ease-in-out infinite',
        }} />
        🔴 Activo
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'var(--bg-muted)', color: 'var(--text-tertiary)',
      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
    }}>
      ⚪ Inactivo
    </span>
  );
}

function ChannelAvatar({ name }: { name: string }) {
  const initials = name.replace(/[^A-Z0-9]/gi, '').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 6, background: 'var(--bg-muted)',
      border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ChannelCard({
  channel,
  onToggle,
  onScheduleChange,
  onSave,
}: {
  channel: Channel;
  onToggle: (id: string, enabled: boolean) => void;
  onScheduleChange: (id: string, schedule: WeekSchedule) => void;
  onSave: (id: string, schedule: WeekSchedule) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const allRanges = channel.schedule
    .map((mask, i) => {
      const r = getActiveRanges(mask);
      return r === 'Sin grabación' ? null : `${['L','M','X','J','V','S','D'][i]}: ${r.replace('Activo: ','')}`;
    })
    .filter(Boolean) as string[];

  const scheduleSummary = allRanges.length
    ? allRanges.slice(0, 2).join(' | ') + (allRanges.length > 2 ? ` +${allRanges.length - 2}` : '')
    : 'Sin franjas configuradas';

  return (
    <div className="card fade-in" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ChannelAvatar name={channel.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 550, fontSize: 14, color: 'var(--text-primary)' }}>{channel.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {scheduleSummary}
          </div>
        </div>
        <LiveBadge enabled={channel.enabled} />
        <label className="toggle" style={{ flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={channel.enabled}
            onChange={(e) => onToggle(channel.id, e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-thumb" />
        </label>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: '4px 8px', flexShrink: 0 }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Cerrar' : 'Configurar'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
            Haz clic (o arrastra) para marcar/desmarcar franjas de grabación. Cada cuadrado = 30 min.
          </div>
          <ScheduleGrid
            schedule={channel.schedule}
            onChange={(next) => onScheduleChange(channel.id, next)}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
              onClick={() => onScheduleChange(channel.id, emptyWeekSchedule())}
            >
              Borrar todo
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '5px 14px' }}
              onClick={() => {
                onSave(channel.id, channel.schedule);
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

interface ClientProps {
  initialChannels: Channel[];
  kind: 'tv' | 'radio';
}

export default function TvChannelsClient({ initialChannels, kind }: ClientProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
    try {
      await fetch(`/api/admin/channels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch {
      setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !enabled } : c)));
    }
  }, []);

  const handleScheduleChange = useCallback((id: string, schedule: WeekSchedule) => {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, schedule } : c)));
  }, []);

  const handleSave = useCallback(async (id: string, schedule: WeekSchedule) => {
    try {
      const res = await fetch(`/api/admin/channels/${id}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });
      if (!res.ok) throw new Error('save failed');
      showToast('Franjas guardadas');
    } catch {
      showToast('Error al guardar');
    }
  }, []);

  const activeCount = channels.filter((c) => c.enabled).length;
  const title = kind === 'tv' ? 'Configuración — Televisión' : 'Configuración — Radio';
  const breadcrumbLabel = kind === 'tv' ? 'Televisión' : 'Radio';
  const countLabel = kind === 'tv' ? 'canales' : 'emisoras';
  const otherHref = kind === 'tv' ? '/admin/flujos-locales/radio' : '/admin/flujos-locales/tv';
  const otherLabel = kind === 'tv' ? '→ Radio' : '→ Televisión';

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 60,
          background: 'var(--accent)', color: 'white',
          padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: 13,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}

      <header className="header">
        <div className="header-left">
          <div className="breadcrumb">
            <a href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>WhaleMetric</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <a href="/admin/flujos-locales" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Flujos en local</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="breadcrumb-current">{breadcrumbLabel}</span>
          </div>
        </div>
        <div className="header-right">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: 4 }}>
            {activeCount} / {channels.length} {countLabel} activos
          </span>
        </div>
      </header>

      <div className="content">
        <div className="page-header">
          <div>
            <div className="page-title">{title}</div>
            <div className="page-subtitle">
              Define en qué franjas horarias se captura cada {kind === 'tv' ? 'canal' : 'emisora'}. Haz clic en &quot;Configurar&quot; para editar.
            </div>
          </div>
          <a href={otherHref} className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: 13 }}>
            {otherLabel}
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {channels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onToggle={handleToggle}
              onScheduleChange={handleScheduleChange}
              onSave={handleSave}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
