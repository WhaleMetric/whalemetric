'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Globe, Rss, Tv, Radio, Search,
  Mic, Languages, Smile, Tag, Link2,
  FileText, Newspaper, AlertTriangle,
  Play, Settings2,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FlowStatus = 'ok' | 'error' | 'running' | 'idle';
export type FlowCategory = 'ingesta' | 'procesamiento' | 'generacion';

export interface FlowConfig {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: FlowCategory;
  enabled: boolean;
  schedule_cron: string | null;
  interval_seconds: number | null;
  last_run_at: string | null;
  last_status: FlowStatus;
  items_processed_today: number;
  params: Record<string, unknown>;
  has_worker: boolean;
}

export type FlowsGrouped = Record<FlowCategory, FlowConfig[]>;

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  created_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SECTIONS: { id: FlowCategory; label: string }[] = [
  { id: 'ingesta',       label: 'Ingesta' },
  { id: 'procesamiento', label: 'Procesamiento' },
  { id: 'generacion',    label: 'Generación' },
];

const FLOW_ICONS: Record<string, LucideIcon> = {
  scraping_web:        Globe,
  rss_fetch:           Rss,
  tv_recording:        Tv,
  radio_recording:     Radio,
  feed_discovery:      Search,
  audio_transcription: Mic,
  translation:         Languages,
  sentiment_analysis:  Smile,
  entity_extraction:   Tag,
  client_matching:     Link2,
  client_summaries:    FileText,
  daily_clipping:      Newspaper,
  critical_alerts:     AlertTriangle,
};

const INTERVAL_OPTIONS: { label: string; seconds: number | null; cron?: string }[] = [
  { label: 'Cada 5 min',         seconds: 300 },
  { label: 'Cada 15 min',        seconds: 900 },
  { label: 'Cada 30 min',        seconds: 1800 },
  { label: 'Cada hora',          seconds: 3600 },
  { label: 'Cada 6h',            seconds: 21600 },
  { label: 'Diario a las 07:00', seconds: null, cron: '0 7 * * *' },
  { label: 'Diario a las 08:00', seconds: null, cron: '0 8 * * *' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return 'Nunca';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'Hace <1 min';
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

function StatusBadge({ status }: { status: FlowStatus }) {
  const map: Record<FlowStatus, { cls: string; label: string }> = {
    ok:      { cls: 'badge badge-ok',      label: 'OK' },
    error:   { cls: 'badge badge-error',   label: 'Error' },
    running: { cls: 'badge badge-running', label: 'Running' },
    idle:    { cls: 'badge badge-idle',    label: 'Parado' },
  };
  const { cls, label } = map[status];
  return <span className={cls}>{label}</span>;
}

function currentOptLabel(flow: FlowConfig): string {
  if (flow.schedule_cron) {
    const opt = INTERVAL_OPTIONS.find((o) => o.cron === flow.schedule_cron);
    return opt ? opt.label : 'Personalizado';
  }
  if (flow.interval_seconds) {
    const opt = INTERVAL_OPTIONS.find((o) => o.seconds === flow.interval_seconds);
    return opt ? opt.label : 'Personalizado';
  }
  return '—';
}

// ─── Log Modal ────────────────────────────────────────────────────────────────

function LogModal({
  flowId,
  flowName,
  onClose,
}: {
  flowId: string;
  flowName: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/flows/${flowId}/logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [flowId]);

  const levelColor: Record<LogEntry['level'], string> = {
    info: 'var(--text-secondary)',
    warn: 'var(--amber-text)',
    error: 'var(--red-text)',
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <span className="modal-title">Logs — {flowName}</span>
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 12 }}>
          {loading && <div className="spinner" style={{ margin: '20px auto' }} />}
          {!loading && logs.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>Sin logs recientes</p>
          )}
          {logs.map((log) => (
            <div key={log.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '6px 0', display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                {new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span style={{ color: levelColor[log.level] ?? 'var(--text-secondary)', flexShrink: 0, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>
                {log.level}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Compact Flow Card ────────────────────────────────────────────────────────

function FlowCard({
  flow,
  onToggle,
  onChangeSchedule,
  onRun,
  onLogs,
}: {
  flow: FlowConfig;
  onToggle: (id: string, enabled: boolean) => void;
  onChangeSchedule: (id: string, seconds: number | null, cron: string | null) => void;
  onRun: (id: string) => void;
  onLogs: (id: string, name: string) => void;
}) {
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    try { await onRun(flow.id); } finally { setRunning(false); }
  }

  const Icon = FLOW_ICONS[flow.slug] ?? Settings2;
  const hasConfigBtn = flow.slug === 'tv_recording' || flow.slug === 'radio_recording';
  const configHref = flow.slug === 'tv_recording' ? '/admin/flujos-locales/tv' : '/admin/flujos-locales/radio';
  const configLabel = flow.slug === 'tv_recording' ? 'Configurar' : 'Configurar';

  return (
    <div className="flow-card fade-in">
      {/* Header: icon + name + toggle */}
      <div className="flow-card-head">
        <div className="flow-card-title">
          <Icon className="flow-card-icon" strokeWidth={1.75} />
          <div className="flow-card-name-wrap">
            <div className="flow-card-name">{flow.name}</div>
            {flow.description && <div className="flow-card-desc" title={flow.description}>{flow.description}</div>}
          </div>
        </div>
        <label className="toggle" style={{ flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={flow.enabled}
            onChange={(e) => onToggle(flow.id, e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-thumb" />
        </label>
      </div>

      {/* Meta row: status + last + today + no-worker badge */}
      <div className="flow-card-meta">
        <StatusBadge status={flow.last_status} />
        <span className="meta-item">Última: <strong>{timeAgo(flow.last_run_at)}</strong></span>
        <span className="meta-item meta-mono">Hoy: <strong>{flow.items_processed_today}</strong></span>
        {!flow.has_worker && <span className="badge badge-idle" title="Aún no hay worker Python conectado para este flujo">Sin worker</span>}
      </div>

      {/* Frequency select (full width) */}
      <select
        className="select-input flow-card-select"
        value={currentOptLabel(flow)}
        onChange={(e) => {
          const opt = INTERVAL_OPTIONS.find((o) => o.label === e.target.value);
          if (!opt) return;
          onChangeSchedule(flow.id, opt.seconds ?? null, opt.cron ?? null);
        }}
      >
        {currentOptLabel(flow) === 'Personalizado' && <option value="Personalizado">Personalizado</option>}
        {currentOptLabel(flow) === '—' && <option value="—">— Sin programar —</option>}
        {INTERVAL_OPTIONS.map((o) => (
          <option key={o.label} value={o.label}>{o.label}</option>
        ))}
      </select>

      {/* Footer: config (primary secondary) + logs + run-now (tertiary) */}
      <div className="flow-card-footer">
        {hasConfigBtn ? (
          <a href={configHref} className="btn btn-secondary flow-card-config">
            {configLabel}
          </a>
        ) : <span />}
        <div className="flow-card-footer-right">
          <button className="link-ghost" onClick={() => onLogs(flow.id, flow.name)}>
            Ver logs
          </button>
          <button
            className="link-ghost link-ghost-run"
            disabled={running || !flow.enabled}
            onClick={handleRun}
            title={flow.enabled ? 'Ejecutar manualmente' : 'Activa el flujo para poder ejecutarlo'}
          >
            {running
              ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
              : <Play className="link-ghost-icon" strokeWidth={2} />}
            {running ? 'Ejecutando…' : 'Ejecutar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function FlujosLocalesClient({ initialFlows }: { initialFlows: FlowsGrouped }) {
  const [flows, setFlows] = useState<FlowsGrouped>(initialFlows);
  const [logsModal, setLogsModal] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const updateFlow = useCallback((id: string, patch: Partial<FlowConfig>) => {
    setFlows((prev) => {
      const next: FlowsGrouped = { ingesta: [...prev.ingesta], procesamiento: [...prev.procesamiento], generacion: [...prev.generacion] };
      (Object.keys(next) as FlowCategory[]).forEach((cat) => {
        next[cat] = next[cat].map((f) => (f.id === id ? { ...f, ...patch } : f));
      });
      return next;
    });
  }, []);

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    updateFlow(id, { enabled });
    try {
      await fetch(`/api/admin/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch {
      updateFlow(id, { enabled: !enabled });
    }
  }, [updateFlow]);

  const handleChangeSchedule = useCallback(async (id: string, seconds: number | null, cron: string | null) => {
    updateFlow(id, { interval_seconds: seconds, schedule_cron: cron });
    try {
      await fetch(`/api/admin/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval_seconds: seconds, schedule_cron: cron }),
      });
      showToast('Frecuencia guardada');
    } catch { /* silent */ }
  }, [updateFlow]);

  const handleRun = useCallback(async (id: string) => {
    try {
      await fetch(`/api/admin/flows/${id}/run`, { method: 'POST' });
      updateFlow(id, { last_run_at: new Date().toISOString(), last_status: 'running' });
      showToast('Flujo iniciado');
    } catch {
      showToast('Error al ejecutar el flujo');
    }
  }, [updateFlow]);

  const totalFlows = flows.ingesta.length + flows.procesamiento.length + flows.generacion.length;
  const enabledCount = [flows.ingesta, flows.procesamiento, flows.generacion].reduce(
    (acc, arr) => acc + arr.filter((f) => f.enabled).length,
    0
  );

  return (
    <>
      {toast && (
        <div className="flow-toast">{toast}</div>
      )}

      {logsModal && (
        <LogModal
          flowId={logsModal.id}
          flowName={logsModal.name}
          onClose={() => setLogsModal(null)}
        />
      )}

      <header className="header">
        <div className="header-left">
          <div className="breadcrumb">
            <a href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>WhaleMetric</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="breadcrumb-current">Flujos en local</span>
          </div>
        </div>
        <div className="header-right">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: 4 }}>
            {enabledCount} / {totalFlows} activos
          </span>
        </div>
      </header>

      <div className="content">
        <div className="page-header">
          <div>
            <div className="page-title">Flujos en local</div>
            <div className="page-subtitle">Automatización de ingesta, procesamiento y generación ejecutada en el servidor local</div>
          </div>
        </div>

        {totalFlows === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            No hay flujos configurados. Aplica la migración <code>flows_local_panel</code> para inicializar los 13 flujos.
          </div>
        )}

        {SECTIONS.map((section) => {
          const items = flows[section.id];
          if (!items.length) return null;
          return (
            <section key={section.id} className="flow-section">
              <h2 className="flow-section-title">{section.label}</h2>
              <div className="flow-grid">
                {items.map((flow) => (
                  <FlowCard
                    key={flow.id}
                    flow={flow}
                    onToggle={handleToggle}
                    onChangeSchedule={handleChangeSchedule}
                    onRun={handleRun}
                    onLogs={(id, name) => setLogsModal({ id, name })}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
