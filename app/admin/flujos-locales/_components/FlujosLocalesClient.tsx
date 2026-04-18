'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  next_run_at?: string | null;
  last_run_count?: number | null;
}

export type FlowsGrouped = Record<FlowCategory, FlowConfig[]>;

export interface WorkersApiState {
  online: boolean;
  last_check: string;
  error: string | null;
  latency_ms?: number | null;
}

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  created_at: string;
}

interface Toast {
  id: number;
  msg: string;
  tone: 'info' | 'warn' | 'error';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const POLL_MS = 15_000;
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

// ─── Logs Modal — 2 tabs (Logs de BD / Estado worker) ─────────────────────────

function LogsModal({
  flow,
  onClose,
}: {
  flow: FlowConfig;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'db' | 'worker'>('db');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [workerJson, setWorkerJson] = useState<string>('');
  const [loadingWorker, setLoadingWorker] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/flows/${flow.id}/logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoadingLogs(false));
  }, [flow.id]);

  useEffect(() => {
    if (tab !== 'worker' || !flow.has_worker) return;
    setLoadingWorker(true);
    setWorkerError(null);
    fetch(`/api/admin/flows/status`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const slice = [...(d.data?.ingesta ?? []), ...(d.data?.procesamiento ?? []), ...(d.data?.generacion ?? [])]
          .find((f: FlowConfig) => f.id === flow.id);
        if (!d.workers_api?.online) {
          setWorkerError('No se pudo contactar con el worker.');
        }
        setWorkerJson(JSON.stringify(slice ?? {}, null, 2));
      })
      .catch((e) => setWorkerError(String(e)))
      .finally(() => setLoadingWorker(false));
  }, [tab, flow.id, flow.has_worker]);

  const levelColor: Record<LogEntry['level'], string> = {
    info: 'var(--text-secondary)',
    warn: 'var(--amber-text)',
    error: 'var(--red-text)',
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="modal-title">{flow.name}</span>
            <div style={{ display: 'flex', gap: 2, background: 'var(--bg-muted)', padding: 2, borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setTab('db')}
                className={tab === 'db' ? 'tab-btn tab-btn-active' : 'tab-btn'}
              >
                Logs de BD
              </button>
              <button
                onClick={() => setTab('worker')}
                className={tab === 'worker' ? 'tab-btn tab-btn-active' : 'tab-btn'}
                disabled={!flow.has_worker}
                title={flow.has_worker ? '' : 'Este flujo no tiene worker conectado'}
              >
                Estado worker
              </button>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 12, maxHeight: 460 }}>
          {tab === 'db' && (
            <>
              {loadingLogs && <div className="spinner" style={{ margin: '20px auto' }} />}
              {!loadingLogs && logs.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0', fontFamily: 'inherit' }}>Sin logs recientes</p>
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
            </>
          )}

          {tab === 'worker' && (
            <>
              {loadingWorker && <div className="spinner" style={{ margin: '20px auto' }} />}
              {!loadingWorker && workerError && (
                <div style={{ color: 'var(--red-text)', background: 'var(--red-bg)', padding: 10, borderRadius: 'var(--radius-sm)', fontFamily: 'inherit' }}>
                  ⚠️ {workerError}
                </div>
              )}
              {!loadingWorker && !workerError && (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)', margin: 0 }}>
                  {workerJson || '{}'}
                </pre>
              )}
            </>
          )}
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
  onRun: (flow: FlowConfig) => void;
  onLogs: (flow: FlowConfig) => void;
}) {
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    try { await onRun(flow); } finally { setRunning(false); }
  }

  const Icon = FLOW_ICONS[flow.slug] ?? Settings2;
  const hasConfigBtn = flow.slug === 'tv_recording' || flow.slug === 'radio_recording';
  const configHref = flow.slug === 'tv_recording' ? '/admin/flujos-locales/tv' : '/admin/flujos-locales/radio';

  return (
    <div className="flow-card fade-in">
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

      <div className="flow-card-meta">
        <StatusBadge status={flow.last_status} />
        <span className="meta-item">Última: <strong>{timeAgo(flow.last_run_at)}</strong></span>
        <span className="meta-item meta-mono">Hoy: <strong>{flow.items_processed_today}</strong></span>
        {!flow.has_worker && (
          <span
            className="badge badge-idle"
            title="El worker Python de este flujo aún no está implementado"
          >
            Sin worker
          </span>
        )}
      </div>

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

      <div className="flow-card-footer">
        {hasConfigBtn ? (
          <a href={configHref} className="btn btn-secondary flow-card-config">
            Configurar
          </a>
        ) : <span />}
        <div className="flow-card-footer-right">
          <button className="link-ghost" onClick={() => onLogs(flow)}>
            Ver logs
          </button>
          {flow.has_worker && (
            <button
              className="link-ghost link-ghost-run"
              disabled={running || !flow.enabled}
              onClick={handleRun}
              title={flow.enabled ? 'Ejecutar manualmente' : 'Activa el flujo para poder ejecutarlo'}
            >
              {running
                ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                : <Play className="link-ghost-icon" strokeWidth={2} />}
              {running ? 'Lanzando…' : 'Ejecutar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function FlujosLocalesClient({
  initialFlows,
  initialWorkers,
}: {
  initialFlows: FlowsGrouped;
  initialWorkers: WorkersApiState;
}) {
  const [flows, setFlows] = useState<FlowsGrouped>(initialFlows);
  const [workers, setWorkers] = useState<WorkersApiState>(initialWorkers);
  const [logsModal, setLogsModal] = useState<FlowConfig | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  // Remember previous last_run_at per flow — used to detect run completion.
  const prevRunRef = useRef<Record<string, string | null>>({});
  useEffect(() => {
    const all = [...flows.ingesta, ...flows.procesamiento, ...flows.generacion];
    all.forEach((f) => {
      if (!(f.id in prevRunRef.current)) prevRunRef.current[f.id] = f.last_run_at;
    });
  }, [flows]);

  const pushToast = useCallback((msg: string, tone: Toast['tone'] = 'info') => {
    const id = toastId.current++;
    setToasts((prev) => [...prev, { id, msg, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const updateFlow = useCallback((id: string, patch: Partial<FlowConfig>) => {
    setFlows((prev) => {
      const next: FlowsGrouped = { ingesta: [...prev.ingesta], procesamiento: [...prev.procesamiento], generacion: [...prev.generacion] };
      (Object.keys(next) as FlowCategory[]).forEach((cat) => {
        next[cat] = next[cat].map((f) => (f.id === id ? { ...f, ...patch } : f));
      });
      return next;
    });
  }, []);

  // ── Polling every 15 s to /api/admin/flows/status ──────────────────────────
  useEffect(() => {
    let stopped = false;

    async function tick() {
      try {
        const res = await fetch('/api/admin/flows/status', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json() as {
          success: boolean;
          data: FlowsGrouped;
          workers_api: WorkersApiState;
        };
        if (stopped) return;
        if (json.success) {
          // Detect run completion for toast
          const all = [...json.data.ingesta, ...json.data.procesamiento, ...json.data.generacion];
          all.forEach((f) => {
            const prev = prevRunRef.current[f.id];
            if (f.has_worker && prev !== undefined && prev !== f.last_run_at && f.last_status !== 'running') {
              const count = f.last_run_count ?? f.items_processed_today ?? 0;
              if (f.last_status === 'ok') pushToast(`✅ ${f.name}: ${count} items procesados`, 'info');
              else if (f.last_status === 'error') pushToast(`❌ ${f.name}: la última ejecución falló`, 'error');
            }
            prevRunRef.current[f.id] = f.last_run_at;
          });
          setFlows(json.data);
          setWorkers(json.workers_api);
        }
      } catch { /* offline / transient — ignore */ }
    }

    const t = setInterval(tick, POLL_MS);
    return () => { stopped = true; clearInterval(t); };
  }, [pushToast]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    updateFlow(id, { enabled });
    try {
      const res = await fetch(`/api/admin/flows/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        updateFlow(id, { enabled: !enabled });
        pushToast(`Error: ${json.error ?? 'no se pudo guardar'}`, 'error');
        return;
      }
      if (json.worker_sync === false) {
        pushToast(json.warning ?? 'Guardado pero el worker no respondió', 'warn');
      }
    } catch {
      updateFlow(id, { enabled: !enabled });
      pushToast('Error de red al togglear', 'error');
    }
  }, [updateFlow, pushToast]);

  const handleChangeSchedule = useCallback(async (id: string, seconds: number | null, cron: string | null) => {
    updateFlow(id, { interval_seconds: seconds, schedule_cron: cron });
    try {
      const res = await fetch(`/api/admin/flows/${id}/interval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval_seconds: seconds, schedule_cron: cron }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        pushToast(`Error: ${json.error ?? 'no se pudo guardar'}`, 'error');
        return;
      }
      if (json.worker_sync === false) {
        pushToast(json.warning ?? 'Intervalo guardado pero el worker no respondió', 'warn');
      } else {
        pushToast('Frecuencia guardada', 'info');
      }
    } catch {
      pushToast('Error de red al cambiar frecuencia', 'error');
    }
  }, [updateFlow, pushToast]);

  const handleRun = useCallback(async (flow: FlowConfig) => {
    if (!flow.has_worker) return;
    const ok = window.confirm(`¿Ejecutar "${flow.name}" ahora? Puede tardar 5-15 min.`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/flows/${flow.id}/run`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        pushToast(`Error: ${json.error ?? 'no se pudo ejecutar'}`, 'error');
        return;
      }
      updateFlow(flow.id, { last_run_at: new Date().toISOString(), last_status: 'running' });
      pushToast(`⏳ Ejecución iniciada${json.job_id ? ` (${json.job_id})` : ''}`, 'info');
    } catch {
      pushToast('Error de red al ejecutar', 'error');
    }
  }, [updateFlow, pushToast]);

  const totalFlows = flows.ingesta.length + flows.procesamiento.length + flows.generacion.length;
  const enabledCount = [flows.ingesta, flows.procesamiento, flows.generacion].reduce(
    (acc, arr) => acc + arr.filter((f) => f.enabled).length,
    0
  );

  return (
    <>
      {/* Toasts */}
      <div className="flow-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`flow-toast flow-toast-${t.tone}`}>{t.msg}</div>
        ))}
      </div>

      {/* Logs modal */}
      {logsModal && <LogsModal flow={logsModal} onClose={() => setLogsModal(null)} />}

      <header className="header">
        <div className="header-left">
          <div className="breadcrumb">
            <a href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>WhaleMetric</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="breadcrumb-current">Flujos en local</span>
          </div>
        </div>
        <div className="header-right">
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: workers.online ? 'var(--green-text)' : 'var(--text-tertiary)',
              background: workers.online ? 'var(--green-bg)' : 'var(--bg-muted)',
              padding: '3px 10px', borderRadius: 4,
            }}
            title={`Último check: ${new Date(workers.last_check).toLocaleTimeString('es-ES')}`}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: workers.online ? 'var(--green)' : 'var(--text-tertiary)' }} />
            API workers {workers.online ? 'online' : 'offline'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: 4 }}>
            {enabledCount} / {totalFlows} activos
          </span>
        </div>
      </header>

      <div className="content">
        {!workers.online && (
          <div className="offline-banner" role="status">
            <AlertTriangle strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>
              <strong>API de workers offline.</strong> Los cambios se guardan pero no se sincronizarán con los workers Python hasta que la API vuelva a estar online.
              {workers.error ? ` (${workers.error})` : ''}
            </span>
          </div>
        )}

        <div className="page-header">
          <div>
            <div className="page-title">Flujos en local</div>
            <div className="page-subtitle">Automatización de ingesta, procesamiento y generación ejecutada en el servidor local</div>
          </div>
        </div>

        {totalFlows === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            No hay flujos configurados. Aplica la migración <code>flows_local_panel</code> para inicializar los flujos.
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
                    onLogs={(f) => setLogsModal(f)}
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
