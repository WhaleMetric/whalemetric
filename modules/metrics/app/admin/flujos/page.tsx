'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────

interface AutomationFlow {
  id: string;
  flow_key: string;
  name: string;
  description?: string;
  enabled: boolean;
  interval_minutes: number;
  last_run_at?: string;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
  status?: 'ok' | 'error' | 'never';
}

// ─── Helpers ──────────────────────────────────────────────

function timeAgo(isoStr?: string): string {
  if (!isoStr) return 'Nunca';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Hace menos de 1 min';
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d}d`;
}

function intervalLabel(mins: number): string {
  if (mins < 60) return `${mins} min`;
  if (mins % 60 === 0) return `${mins / 60}h`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

const INTERVAL_OPTIONS = [
  { value: 15,   label: '15 min' },
  { value: 30,   label: '30 min' },
  { value: 60,   label: '1 hora' },
  { value: 120,  label: '2 horas' },
  { value: 360,  label: '6 horas' },
  { value: 720,  label: '12 horas' },
  { value: 1440, label: '24 horas' },
];

// ─── Flow card ────────────────────────────────────────────

interface FlowCardProps {
  flow: AutomationFlow;
  onToggle: (key: string, enabled: boolean) => Promise<void>;
  onChangeInterval: (key: string, minutes: number) => Promise<void>;
  onExecute: (key: string) => Promise<void>;
  executing: boolean;
}

function FlowCard({ flow, onToggle, onChangeInterval, onExecute, executing }: FlowCardProps) {
  const [toggling, setToggling] = useState(false);
  const [editingInterval, setEditingInterval] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await onToggle(flow.flow_key, !flow.enabled);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              flow.enabled ? 'bg-emerald-50' : 'bg-gray-100'
            }`}
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${flow.enabled ? 'text-emerald-600' : 'text-gray-400'}`}
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm leading-snug">{flow.name}</div>
            {flow.description && (
              <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{flow.description}</div>
            )}
            <div className="text-gray-400 text-xs mt-1 font-mono">{flow.flow_key}</div>
          </div>
        </div>

        {/* Enable / disable toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            flow.enabled
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          } disabled:opacity-50`}
          title={flow.enabled ? 'Desactivar flujo' : 'Activar flujo'}
        >
          {toggling ? (
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
          ) : flow.enabled ? (
            <PauseIcon className="w-3.5 h-3.5" />
          ) : (
            <PlayIcon className="w-3.5 h-3.5" />
          )}
          {flow.enabled ? 'Activo' : 'Inactivo'}
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5" />
          Último: <span className="text-gray-700 font-medium">{timeAgo(flow.last_run_at)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <BoltIcon className="w-3.5 h-3.5" />
          Intervalo:{' '}
          {editingInterval ? (
            <select
              autoFocus
              defaultValue={flow.interval_minutes}
              onChange={async (e) => {
                setEditingInterval(false);
                await onChangeInterval(flow.flow_key, Number(e.target.value));
              }}
              onBlur={() => setEditingInterval(false)}
              className="ml-1 border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingInterval(true)}
              className="text-gray-700 font-medium underline underline-offset-2 decoration-dashed hover:text-gray-900 transition-colors"
              title="Cambiar intervalo"
            >
              {intervalLabel(flow.interval_minutes)}
            </button>
          )}
        </span>
        {flow.status === 'error' && (
          <span className="flex items-center gap-1 text-red-500">
            <ExclamationCircleIcon className="w-3.5 h-3.5" />
            Error en última ejecución
          </span>
        )}
        {flow.status === 'ok' && (
          <span className="flex items-center gap-1 text-emerald-500">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            OK
          </span>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() => onExecute(flow.flow_key)}
          disabled={executing || !flow.enabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {executing ? (
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <BoltIcon className="w-3.5 h-3.5" />
          )}
          Ejecutar ahora
        </button>
        {!flow.enabled && (
          <span className="text-xs text-gray-400 italic">
            Activa el flujo para ejecutarlo
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
        <ArrowPathIcon className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-gray-700 font-semibold text-sm">Sin flujos configurados</div>
      <div className="text-gray-400 text-xs mt-1 max-w-xs">
        Inserta registros en la tabla <code className="bg-gray-100 px-1 rounded">automation_flows</code> de Supabase para verlos aquí.
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function FlujoPage() {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingKey, setExecutingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const loadFlows = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/flows');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error cargando flujos');
      setFlows(json.data ?? []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  async function handleToggle(flow_key: string, enabled: boolean) {
    const res = await fetch('/api/admin/flows/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_key, enabled }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.error ?? 'Error', false); return; }
    setFlows((prev) =>
      prev.map((f) => (f.flow_key === flow_key ? { ...f, enabled } : f))
    );
    showToast(enabled ? 'Flujo activado' : 'Flujo desactivado');
  }

  async function handleChangeInterval(flow_key: string, interval_minutes: number) {
    const res = await fetch('/api/admin/flows/interval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_key, interval_minutes }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.error ?? 'Error', false); return; }
    setFlows((prev) =>
      prev.map((f) => (f.flow_key === flow_key ? { ...f, interval_minutes } : f))
    );
    showToast(`Intervalo actualizado a ${intervalLabel(interval_minutes)}`);
  }

  async function handleExecute(flow_key: string) {
    setExecutingKey(flow_key);
    try {
      const res = await fetch('/api/admin/flows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow_key }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error ejecutando flujo');
      setFlows((prev) =>
        prev.map((f) =>
          f.flow_key === flow_key
            ? { ...f, last_run_at: new Date().toISOString() }
            : f
        )
      );
      showToast('Flujo ejecutado correctamente');
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setExecutingKey(null);
    }
  }

  const enabledCount = flows.filter((f) => f.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.ok
              ? 'bg-gray-900 text-white'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.ok ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Admin
            </a>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900 text-sm">Flujos Automáticos</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!loading && flows.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {enabledCount} / {flows.length} activos
              </span>
            )}
            <button
              onClick={() => { setLoading(true); loadFlows(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Recargar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse"
              >
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-100 rounded-lg w-28" />
              </div>
            ))}
          </div>
        ) : flows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                onToggle={handleToggle}
                onChangeInterval={handleChangeInterval}
                onExecute={handleExecute}
                executing={executingKey === flow.flow_key}
              />
            ))}
          </div>
        )}

        {/* Info footer */}
        {!loading && flows.length > 0 && (
          <div className="mt-8 flex items-start gap-2 text-xs text-gray-400 bg-gray-100 rounded-xl px-4 py-3">
            <BoltIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Los intervalos son orientativos — la ejecución real depende del scheduler configurado
              en Supabase Edge Functions o del cron de Make.{' '}
              <a
                href="https://supabase.com/dashboard/project/txxygcdafjcuyvvzbbnx"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 transition-colors"
              >
                Ver Supabase →
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
