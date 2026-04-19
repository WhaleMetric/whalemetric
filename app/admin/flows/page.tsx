'use client';

import 'reactflow/dist/style.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from 'reactflow';

import { createClient } from '@/lib/supabase/browser';
import { FlowNode, type FlowNodeData } from './FlowNode';
import { AnimatedEdge, type AnimatedEdgeData } from './AnimatedEdge';
import { FLOW_GRAPH, EXCLUDED_SLUGS } from './flow-graph';
import { getLayoutedElements } from './layout-utils';

const nodeTypes = { custom: FlowNode };
const edgeTypes = { animated: AnimatedEdge };

// ── Toast ─────────────────────────────────────────────────────────────────────

interface Toast { id: number; msg: string; ok: boolean }

// ── Build nodes + edges ───────────────────────────────────────────────────────

function buildGraph(
  flows: FlowNodeData[],
  reducedMotion: boolean,
): { nodes: Node<FlowNodeData>[]; edges: Edge<AnimatedEdgeData>[] } {
  const bySlug = new Map(flows.map((f) => [f.slug, f]));

  const nodes: Node<FlowNodeData>[] = flows
    .filter((f) => !EXCLUDED_SLUGS.has(f.slug))
    .map((f) => ({
      id:       f.slug,
      type:     'custom',
      data:     f,
      position: { x: 0, y: 0 },
    }));

  const edges: Edge<AnimatedEdgeData>[] = [];
  for (const [src, targets] of Object.entries(FLOW_GRAPH)) {
    const srcFlow = bySlug.get(src);
    if (!srcFlow) continue;
    for (const tgt of targets) {
      const tgtFlow = bySlug.get(tgt);
      if (!tgtFlow) continue;
      edges.push({
        id:       `${src}→${tgt}`,
        source:   src,
        target:   tgt,
        type:     'animated',
        animated: false,
        data: { active: srcFlow.enabled && tgtFlow.enabled, reducedMotion },
      });
    }
  }

  return getLayoutedElements(nodes, edges);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FlowsPage() {
  const [flows,         setFlows]         = useState<FlowNodeData[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [toasts,        setToasts]        = useState<Toast[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AnimatedEdgeData>([]);

  const rfRef         = useRef<ReactFlowInstance | null>(null);
  const initialFitRef = useRef(false);
  const toastIdRef    = useRef(0);

  // ── Toast helper ─────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string, ok: boolean) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, msg, ok }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── prefers-reduced-motion ───────────────────────────────────────────────

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // ── Supabase toggle (all nodes except rss_fetch which uses its own handler) ─

  const handleToggle = useCallback(async (slug: string, enabled: boolean) => {
    setFlows((prev) => prev.map((f) => f.slug === slug ? { ...f, enabled } : f));
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('flows_config')
        .update({ enabled })
        .eq('slug', slug);
      if (err) throw err;
    } catch {
      setFlows((prev) => prev.map((f) => f.slug === slug ? { ...f, enabled: !enabled } : f));
    }
  }, []);

  // ── Fetch all flows from Supabase ────────────────────────────────────────

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    setError(null);
    initialFitRef.current = false;
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('flows_config')
        .select('slug, name, category, enabled, last_status, last_run_at')
        .order('category', { ascending: true });
      if (err) throw err;
      setFlows((data ?? []) as unknown as FlowNodeData[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando flujos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlows(); }, [fetchFlows]);

  // ── Health check on mount (debug 401) ────────────────────────────────────

  useEffect(() => {
    fetch('/api/admin/rss/health')
      .then((r) => r.json())
      .then((d) => console.log('[WhaleMetric] health:', d))
      .catch((e) => console.error('[WhaleMetric] health error:', e));
  }, []);

  // ── Poll rss_fetch status every 30s ─────────────────────────────────────

  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch('/api/admin/rss/status');
        const json = await res.json();
        if (!json.ok) return;
        const { enabled, last_status, last_run_at } = json.data ?? {};
        setFlows((prev) =>
          prev.map((f) =>
            f.slug === 'rss_fetch'
              ? {
                  ...f,
                  ...(enabled      !== undefined && { enabled }),
                  ...(last_status  !== undefined && { last_status }),
                  ...(last_run_at  !== undefined && { last_run_at }),
                }
              : f,
          ),
        );
      } catch {
        // Silent — don't disrupt the UI for background polls
      }
    };

    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Rebuild graph ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!flows.length) return;
    const flowsWithCb: FlowNodeData[] = flows.map((f) => ({
      ...f,
      onToggle: handleToggle,
      onToast:  showToast,
    }));
    const { nodes: n, edges: e } = buildGraph(flowsWithCb, reducedMotion);
    setNodes(n);
    setEdges(e);
  }, [flows, reducedMotion, handleToggle, showToast, setNodes, setEdges]);

  // ── fitView once ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!rfRef.current || !nodes.length || initialFitRef.current) return;
    initialFitRef.current = true;
    const t = setTimeout(() => rfRef.current?.fitView({ padding: 0.12 }), 60);
    return () => clearTimeout(t);
  }, [nodes]);

  const activeCount = useMemo(() => flows.filter((f) => f.enabled).length, [flows]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#FAFAFA' }}>

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            background: t.ok ? '#111827' : '#FEF2F2',
            color:      t.ok ? '#fff'    : '#991B1B',
            border:     t.ok ? 'none'   : '1px solid #FECACA',
            animation: 'rfFadeUp 0.2s ease',
          }}>
            {t.msg}
          </div>
        ))}
        <style>{`@keyframes rfFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
      </div>

      {/* Header */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid #E5E7EB',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            Pipeline de Flujos
          </h1>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '1px 0 0' }}>
            Ingesta → Procesamiento → Generación
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {flows.length > 0 && (
            <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: 20 }}>
              {activeCount} / {flows.length} activos
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LegendDot color="#10B981" label="OK" />
            <LegendDot color="#3B82F6" label="Running" pulse />
            <LegendDot color="#EF4444" label="Error" />
            <LegendDot color="#D1D5DB" label="Inactivo" />
          </div>
          <button
            onClick={fetchFlows}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', fontSize: 12, cursor: 'pointer',
              border: '1px solid #E5E7EB', borderRadius: 8,
              background: '#fff', color: '#374151',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshIcon spinning={loading} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        role="application"
        aria-label="Diagrama del pipeline de flujos"
        style={{ flex: 1, position: 'relative' }}
      >
        {error ? (
          <Centered>
            <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 8 }}>{error}</p>
            <button onClick={fetchFlows} style={ghostBtnStyle}>Reintentar</button>
          </Centered>
        ) : loading && !flows.length ? (
          <Centered>
            <SpinnerIcon />
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8 }}>Cargando pipeline…</p>
          </Centered>
        ) : !flows.length ? (
          <Centered>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Sin flujos en flows_config.</p>
          </Centered>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={(i) => { rfRef.current = i; }}
            fitView
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#E5E7EB" gap={18} size={1} />
            <Controls position="bottom-right" showInteractive={false} />
            <MiniMap
              nodeColor={(n) => {
                const d = n.data as FlowNodeData;
                if (!d?.enabled)                return '#F3F4F6';
                if (d.last_status === 'running') return '#3B82F6';
                if (d.last_status === 'error')   return '#EF4444';
                if (d.last_status === 'ok')      return '#10B981';
                return '#D1D5DB';
              }}
              maskColor="rgba(0,0,0,0.04)"
              position="bottom-left"
              style={{ width: 140, height: 96 }}
              pannable
              zoomable
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

function LegendDot({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', animation: pulse ? 'rfPulse 1.5s ease-in-out infinite' : 'none' }} />
      {label}
      <style>{`@keyframes rfPulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </span>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? 'rfSpin 0.7s linear infinite' : 'none' }}>
      <style>{`@keyframes rfSpin{to{transform:rotate(360deg)}}`}</style>
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"
      style={{ animation: 'rfSpin 0.7s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="#6B7280"/>
    </svg>
  );
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '5px 12px', fontSize: 12, cursor: 'pointer',
  border: '1px solid #E5E7EB', borderRadius: 6,
  background: '#fff', color: '#374151',
};
