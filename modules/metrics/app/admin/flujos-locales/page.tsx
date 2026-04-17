'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlowStatus = 'ok' | 'error' | 'running' | 'idle';
type FlowCategory = 'ingesta' | 'procesamiento' | 'generacion';

interface FlowConfig {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: FlowCategory;
  enabled: boolean;
  schedule_cron: string | null;
  interval_seconds: number | null;
  last_run_at: string | null;
  last_status: FlowStatus;
  items_processed_today: number;
  params: Record<string, unknown>;
}

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  created_at: string;
}

// ─── Mock (seed) data — shown while APIs aren't connected ─────────────────────

const MOCK_FLOWS: FlowConfig[] = [
  // INGESTA
  { id: '1', slug: 'scraping_web', name: 'Scraping web de medios', description: 'Descarga y parsea artículos de portadas de medios digitales seleccionados', category: 'ingesta', enabled: false, schedule_cron: null, interval_seconds: 1800, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  { id: '2', slug: 'rss_medios', name: 'RSS de medios digitales', description: 'Monitoriza feeds RSS y encola noticias nuevas para procesamiento', category: 'ingesta', enabled: false, schedule_cron: null, interval_seconds: 300, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  { id: '3', slug: 'tv_recording', name: 'Grabación TV en directo', description: 'Captura stream de canales de TV configurados según franja horaria', category: 'ingesta', enabled: false, schedule_cron: null, interval_seconds: null, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: { channels_configured: 0 } },
  { id: '4', slug: 'radio_recording', name: 'Grabación radio en directo', description: 'Captura audio de emisoras de radio según franja horaria configurada', category: 'ingesta', enabled: false, schedule_cron: null, interval_seconds: null, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: { channels_configured: 0 } },
  // PROCESAMIENTO
  { id: '5', slug: 'whisper_transcription', name: 'Transcripción de audio (Whisper local)', description: 'Transcribe grabaciones de TV y radio usando Whisper en local', category: 'procesamiento', enabled: false, schedule_cron: null, interval_seconds: 600, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: { model: 'medium' } },
  { id: '6', slug: 'translation', name: 'Traducción a español', description: 'Traduce contenido en otros idiomas al español (Argos Translate)', category: 'procesamiento', enabled: false, schedule_cron: null, interval_seconds: 600, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  { id: '7', slug: 'sentiment_analysis', name: 'Análisis de sentimiento (Ollama)', description: 'Clasifica tono (positivo/neutro/negativo) usando un modelo LLM local', category: 'procesamiento', enabled: false, schedule_cron: null, interval_seconds: 900, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: { model: 'llama3' } },
  { id: '8', slug: 'entity_extraction', name: 'Extracción de entidades y keywords', description: 'Detecta personas, organizaciones, lugares y keywords relevantes', category: 'procesamiento', enabled: false, schedule_cron: null, interval_seconds: 900, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  { id: '9', slug: 'news_linking', name: 'Vinculación noticia ↔ cliente', description: 'Asocia noticias procesadas con las señales de cada cliente', category: 'procesamiento', enabled: false, schedule_cron: null, interval_seconds: 300, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  // GENERACION
  { id: '10', slug: 'client_summaries', name: 'Resúmenes por cliente', description: 'Genera un resumen narrativo diario de cobertura por cliente', category: 'generacion', enabled: false, schedule_cron: '0 7 * * *', interval_seconds: null, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  { id: '11', slug: 'daily_clipping', name: 'Notas / clipping diario por cliente', description: 'Prepara el clipping de prensa con las noticias más relevantes del día', category: 'generacion', enabled: false, schedule_cron: '30 7 * * *', interval_seconds: null, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
  { id: '12', slug: 'mention_alerts', name: 'Alertas de menciones críticas', description: 'Envía alertas inmediatas cuando se detecta una mención de alto impacto', category: 'generacion', enabled: false, schedule_cron: null, interval_seconds: 300, last_run_at: null, last_status: 'idle', items_processed_today: 0, params: {} },
];

const SECTIONS: { id: FlowCategory; label: string; color: string }[] = [
  { id: 'ingesta',        label: 'A  ·  Ingesta',        color: 'var(--blue-text)' },
  { id: 'procesamiento',  label: 'B  ·  Procesamiento',  color: 'var(--purple-text)' },
  { id: 'generacion',     label: 'C  ·  Generación',     color: 'var(--green-text)' },
];

const INTERVAL_OPTIONS = [
  { label: 'Cada 5 min',      seconds: 300 },
  { label: 'Cada 15 min',     seconds: 900 },
  { label: 'Cada 30 min',     seconds: 1800 },
  { label: 'Cada hora',       seconds: 3600 },
  { label: 'Cada 6h',         seconds: 21600 },
  { label: 'Diario a las 07:00', seconds: null, cron: '0 7 * * *' },
  { label: 'Diario a las 08:00', seconds: null, cron: '0 8 * * *' },
  { label: 'Custom',          seconds: -1 },
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

function intervalLabel(flow: FlowConfig): string {
  if (flow.schedule_cron) {
    const opt = INTERVAL_OPTIONS.find((o) => o.cron === flow.schedule_cron);
    return opt ? opt.label : `Cron: ${flow.schedule_cron}`;
  }
  if (!flow.interval_seconds) return '—';
  const opt = INTERVAL_OPTIONS.find((o) => o.seconds === flow.interval_seconds);
  return opt ? opt.label : `${flow.interval_seconds}s`;
}

function statusBadge(status: FlowStatus) {
  const map: Record<FlowStatus, { cls: string; icon: string; label: string }> = {
    ok:      { cls: 'badge badge-ok',      icon: '✅', label: 'OK' },
    error:   { cls: 'badge badge-error',   icon: '❌', label: 'Error' },
    running: { cls: 'badge badge-running', icon: '⏳', label: 'Running' },
    idle:    { cls: 'badge badge-idle',    icon: '⚪', label: 'Parado' },
  };
  const { cls, icon, label } = map[status];
  return <span className={cls}>{icon} {label}</span>;
}

// ─── Log Modal ────────────────────────────────────────────────────────────────

function LogModal({ flowId, flowName, onClose }: { flowId: string; flowName: string; onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/flows/${flowId}/logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [flowId]);

  const levelColor = { info: 'var(--text-secondary)', warn: 'var(--amber-text)', error: 'var(--red-text)' };

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

// ─── Flow Card ────────────────────────────────────────────────────────────────

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
  const [scheduleMode, setScheduleMode] = useState<'preset' | 'custom'>('preset');
  const [customSeconds, setCustomSeconds] = useState(String(flow.interval_seconds ?? 300));

  const currentOptValue = flow.schedule_cron
    ? (INTERVAL_OPTIONS.find((o) => o.cron === flow.schedule_cron)?.label ?? 'Custom')
    : flow.interval_seconds
      ? (INTERVAL_OPTIONS.find((o) => o.seconds === flow.interval_seconds)?.label ?? 'Custom')
      : '—';

  async function handleRun() {
    setRunning(true);
    try { await onRun(flow.id); } finally { setRunning(false); }
  }

  // Config buttons for tv/radio
  const hasConfigBtn = flow.slug === 'tv_recording' || flow.slug === 'radio_recording';
  const configHref = flow.slug === 'tv_recording' ? '/admin/flujos-locales/tv' : '/admin/flujos-locales/radio';
  const configLabel = flow.slug === 'tv_recording' ? 'Configurar canales' : 'Configurar emisoras';

  return (
    <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Row 1 — name + toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 550, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{flow.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{flow.description}</div>
        </div>
        <label className="toggle" style={{ flexShrink: 0, marginTop: 2 }}>
          <input
            type="checkbox"
            checked={flow.enabled}
            onChange={(e) => onToggle(flow.id, e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-thumb" />
        </label>
      </div>

      {/* Row 2 — status + meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {statusBadge(flow.last_status)}
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Última ejecución: <strong style={{ color: 'var(--text-secondary)' }}>{timeAgo(flow.last_run_at)}</strong>
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Items hoy: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>{flow.items_processed_today}</strong>
        </span>
      </div>

      {/* Row 3 — frequency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>Frecuencia:</span>
        {scheduleMode === 'preset' ? (
          <select
            className="select-input"
            value={currentOptValue}
            onChange={(e) => {
              const opt = INTERVAL_OPTIONS.find((o) => o.label === e.target.value);
              if (!opt) return;
              if (opt.seconds === -1) { setScheduleMode('custom'); return; }
              onChangeSchedule(flow.id, opt.seconds ?? null, opt.cron ?? null);
            }}
          >
            {INTERVAL_OPTIONS.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number"
              min={60}
              value={customSeconds}
              onChange={(e) => setCustomSeconds(e.target.value)}
              style={{ width: 80, height: 30, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 8px', fontSize: 12 }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>segundos</span>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => { onChangeSchedule(flow.id, Number(customSeconds), null); setScheduleMode('preset'); }}
            >
              OK
            </button>
            <button className="btn btn-ghost" onClick={() => setScheduleMode('preset')}>Cancelar</button>
          </div>
        )}
      </div>

      {/* Row 4 — actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: 12, padding: '5px 12px' }}
          disabled={running || !flow.enabled}
          onClick={handleRun}
        >
          {running ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
          {running ? 'Ejecutando…' : 'Ejecutar ahora'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => onLogs(flow.id, flow.name)}
        >
          Ver logs
        </button>
        {hasConfigBtn && (
          <a href={configHref} className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px', marginLeft: 'auto', textDecoration: 'none' }}>
            {configLabel} →
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlujosLocalesPage() {
  const [flows, setFlows] = useState<FlowConfig[]>(MOCK_FLOWS);
  const [logsModal, setLogsModal] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Attempt to load real data from Supabase
  useEffect(() => {
    fetch('/api/admin/flows')
      .then((r) => r.json())
      .then((d) => { if (d.data?.length) setFlows(d.data); })
      .catch(() => {/* keep mock */});
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    setFlows((prev) => prev.map((f) => f.id === id ? { ...f, enabled } : f));
    try {
      await fetch(`/api/admin/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch { setFlows((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !enabled } : f)); }
  }, []);

  const handleChangeSchedule = useCallback(async (id: string, seconds: number | null, cron: string | null) => {
    setFlows((prev) => prev.map((f) => f.id === id ? { ...f, interval_seconds: seconds, schedule_cron: cron } : f));
    try {
      await fetch(`/api/admin/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval_seconds: seconds, schedule_cron: cron }),
      });
      showToast('Frecuencia guardada');
    } catch { /* silent */ }
  }, []);

  const handleRun = useCallback(async (id: string) => {
    try {
      await fetch(`/api/admin/flows/${id}/run`, { method: 'POST' });
      setFlows((prev) => prev.map((f) => f.id === id ? { ...f, last_run_at: new Date().toISOString(), last_status: 'running' } : f));
      showToast('Flujo iniciado');
    } catch { showToast('Error al ejecutar el flujo'); }
  }, []);

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 60,
          background: 'var(--accent)', color: 'white',
          padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: 13,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'fadeInUp 200ms ease',
        }}>
          {toast}
        </div>
      )}

      {/* ── Log Modal ── */}
      {logsModal && (
        <LogModal
          flowId={logsModal.id}
          flowName={logsModal.name}
          onClose={() => setLogsModal(null)}
        />
      )}

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="breadcrumb">
            <a href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>WhaleMetric</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="breadcrumb-current">Flujos en local</span>
          </div>
        </div>
        <div className="header-right">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: 4 }}>
            {flows.filter((f) => f.enabled).length} / {flows.length} activos
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="content">
        <div className="page-header">
          <div>
            <div className="page-title">Flujos en local</div>
            <div className="page-subtitle">Automatización de ingesta, procesamiento y generación ejecutada en el servidor local</div>
          </div>
        </div>

        {SECTIONS.map((section, si) => (
          <div key={section.id} style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ color: section.color }}>{section.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {flows.filter((f) => f.category === section.id).map((flow) => (
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
          </div>
        ))}
      </div>
    </>
  );
}
