'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Display name overrides — takes precedence over the name stored in DB
const DISPLAY_NAMES: Partial<Record<string, string>> = {
  scraping_web: 'Scraping noticia completa',
};

export type FlowCategory = 'ingesta' | 'procesamiento' | 'generacion';
export type FlowStatus   = 'ok' | 'error' | 'running' | 'idle';

export interface FlowNodeData {
  slug:        string;
  name:        string;
  category:    FlowCategory;
  enabled:     boolean;
  last_status: FlowStatus;
  last_run_at: string | null;
  onToggle:    (slug: string, enabled: boolean) => void;
  onToast?:    (msg: string, ok: boolean) => void;
}

// ── Category icons (inline SVG) ───────────────────────────────────────────────

function IconIngesta() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  );
}
function IconProcesamiento() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  );
}
function IconGeneracion() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

const CATEGORY_ICONS = {
  ingesta:       IconIngesta,
  procesamiento: IconProcesamiento,
  generacion:    IconGeneracion,
};

// ── Status badge ──────────────────────────────────────────────────────────────

function getBadge(enabled: boolean, status: FlowStatus) {
  if (!enabled) return { label: 'parado', bg: '#F3F4F6', color: '#9CA3AF' };
  switch (status) {
    case 'running': return { label: 'running', bg: '#DBEAFE', color: '#1E40AF' };
    case 'ok':      return { label: 'ok',      bg: '#D1FAE5', color: '#065F46' };
    case 'error':   return { label: 'error',   bg: '#FEE2E2', color: '#991B1B' };
    default:        return { label: 'idle',    bg: '#F3F4F6', color: '#6B7280' };
  }
}

function getBorderColor(enabled: boolean, status: FlowStatus) {
  if (!enabled) return '#F0F0F0';
  if (status === 'running') return '#3B82F6';
  if (status === 'error')   return '#EF4444';
  return '#E5E7EB';
}

// ── iOS Toggle ────────────────────────────────────────────────────────────────

function IOSToggle({
  enabled,
  loading,
  onToggle,
}: {
  enabled: boolean;
  loading?: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); if (!loading) onToggle(); }}
      onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !loading) { e.stopPropagation(); onToggle(); } }}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: loading ? '#9CA3AF' : enabled ? '#22C55E' : '#D1D5DB',
        position: 'relative',
        cursor: loading ? 'wait' : 'pointer',
        flexShrink: 0,
        transition: 'background 0.22s ease',
        outline: 'none',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <div style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        top: 2,
        left: enabled ? 18 : 2,
        transition: 'left 0.22s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
      }} />
    </div>
  );
}

// ── Play icon ─────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );
}

// ── Node component ────────────────────────────────────────────────────────────

function FlowNodeComponent({ data }: NodeProps<FlowNodeData>) {
  const [toggling, setToggling] = useState(false);
  const [running,  setRunning]  = useState(false);

  const Icon        = CATEGORY_ICONS[data.category];
  const badge       = getBadge(data.enabled, data.last_status);
  const border      = getBorderColor(data.enabled, data.last_status);
  const displayName = DISPLAY_NAMES[data.slug] ?? data.name;
  const isRSS       = data.slug === 'rss_fetch';

  // For rss_fetch: call WhaleMetric API via our internal proxy
  async function handleToggle() {
    if (isRSS) {
      setToggling(true);
      const action = data.enabled ? 'disable' : 'enable';
      try {
        const res = await fetch(`/api/admin/rss/${action}`, { method: 'POST' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? `Error ${action}`);
        data.onToggle(data.slug, !data.enabled);
        data.onToast?.(`RSS ${action === 'enable' ? 'activado' : 'desactivado'}`, true);
      } catch (e) {
        data.onToast?.(e instanceof Error ? e.message : 'Error al cambiar estado', false);
      } finally {
        setToggling(false);
      }
    } else {
      // All other nodes: standard Supabase toggle
      data.onToggle(data.slug, !data.enabled);
    }
  }

  async function handleRun() {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/rss/run', { method: 'POST' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Error ejecutando RSS');
      data.onToast?.('RSS en ejecución', true);
    } catch (e) {
      data.onToast?.(e instanceof Error ? e.message : 'Error al ejecutar', false);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      aria-label={displayName}
      style={{
        width: 210,
        background: '#fff',
        border: `1.5px solid ${border}`,
        borderRadius: 10,
        padding: '10px 12px',
        opacity: data.enabled ? 1 : 0.55,
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#D1D5DB', width: 8, height: 8, border: 'none' }}
      />

      {/* Row 1: icon + badge + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={{ color: '#9CA3AF', display: 'flex', flexShrink: 0 }}>
          <Icon />
        </span>
        <span style={{
          padding: '1px 7px',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderRadius: 20,
          fontWeight: 600,
          background: badge.bg,
          color: badge.color,
          flexShrink: 0,
        }}>
          {badge.label}
        </span>
        <div style={{ flex: 1 }} />
        <IOSToggle
          enabled={data.enabled}
          loading={toggling}
          onToggle={handleToggle}
        />
      </div>

      {/* Name */}
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#111827',
        lineHeight: 1.3,
        marginBottom: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {displayName}
      </div>

      {/* Timestamp */}
      <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>
        {data.last_run_at
          ? formatDistanceToNow(new Date(data.last_run_at), { addSuffix: true, locale: es })
          : 'sin ejecuciones'}
      </div>

      {/* RSS-only: Ejecutar button */}
      {isRSS && data.enabled && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRun(); }}
          disabled={running}
          title="Ejecutar ahora"
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            fontSize: 11,
            fontWeight: 500,
            color: running ? '#9CA3AF' : '#374151',
            background: running ? '#F9FAFB' : '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            cursor: running ? 'wait' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <PlayIcon />
          {running ? 'Ejecutando…' : 'Ejecutar'}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#D1D5DB', width: 8, height: 8, border: 'none' }}
      />
    </div>
  );
}

export const FlowNode = memo(FlowNodeComponent);
