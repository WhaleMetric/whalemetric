'use client';

import 'reactflow/dist/style.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Loader2, RotateCw } from 'lucide-react';

import { createClient } from '@/lib/supabase/browser';
import { FlowNode, type FlowNodeData } from './FlowNode';
import { AnimatedEdge } from './AnimatedEdge';
import { FLOW_GRAPH } from './flow-graph';
import { getLayoutedElements } from './layout-utils';

const nodeTypes = { custom: FlowNode };
const edgeTypes = { animated: AnimatedEdge };

function buildNodesAndEdges(
  flows: FlowNodeData[],
  graph: Record<string, string[]>,
  reducedMotion: boolean,
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const nodes: Node<FlowNodeData>[] = flows.map((flow) => ({
    id: flow.slug,
    type: 'custom',
    data: flow,
    position: { x: 0, y: 0 },
  }));

  const flowsBySlug = new Map(flows.map((f) => [f.slug, f]));

  const edges: Edge[] = [];
  for (const [source, targets] of Object.entries(graph)) {
    const sourceFlow = flowsBySlug.get(source);
    if (!sourceFlow) continue;
    for (const target of targets) {
      const targetFlow = flowsBySlug.get(target);
      if (!targetFlow) continue;
      edges.push({
        id: `${source}-${target}`,
        source,
        target,
        type: 'animated',
        animated: false,
        data: {
          active: sourceFlow.enabled && targetFlow.enabled,
          reducedMotion,
        },
      });
    }
  }

  return getLayoutedElements(nodes, edges, 'LR');
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<FlowNodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('flows_config')
        .select('slug, name, category, enabled, last_status, last_run_at')
        .order('category', { ascending: true })
        .order('slug', { ascending: true });

      if (err) throw err;
      setFlows((data ?? []) as FlowNodeData[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando flujos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  useEffect(() => {
    if (flows.length === 0) return;
    const { nodes: n, edges: e } = buildNodesAndEdges(flows, FLOW_GRAPH, reducedMotion);
    console.log('Layout aplicado:', n[0]?.position);
    setNodes(n);
    setEdges(e);
  }, [flows, reducedMotion, setNodes, setEdges]);

  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      setTimeout(() => rfInstance.fitView({ padding: 0.2 }), 50);
    }
  }, [rfInstance, nodes]);

  const activeCount = useMemo(() => flows.filter((f) => f.enabled).length, [flows]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Pipeline de Flujos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Automatización de ingesta, procesamiento y generación
            </p>
          </div>

          <div className="flex items-center gap-3">
            {flows.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {activeCount} / {flows.length} activos
              </span>
            )}

            <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-500">
              <LegendDot color="#10B981" label="OK" />
              <LegendDot color="#3B82F6" label="Running" pulse />
              <LegendDot color="#EF4444" label="Error" />
              <LegendDot color="#9CA3AF" label="Parado" />
            </div>

            <button
              onClick={fetchFlows}
              disabled={loading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="h-[calc(100vh-200px)] w-full bg-gray-50"
        role="application"
        aria-label="Diagrama del pipeline de flujos"
      >
        {error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchFlows}
                className="mt-3 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : loading && flows.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando pipeline...</p>
            </div>
          </div>
        ) : flows.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-500">Sin flujos configurados en flows_config.</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={setRfInstance}
            fitView
            minZoom={0.4}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#E5E7EB" gap={16} size={1} />
            <Controls position="bottom-right" showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                const data = node.data as FlowNodeData;
                if (!data?.enabled) return '#F3F4F6';
                if (data.last_status === 'running') return '#3B82F6';
                if (data.last_status === 'error') return '#EF4444';
                if (data.last_status === 'ok') return '#10B981';
                return '#D1D5DB';
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
              position="bottom-left"
              style={{ width: 140, height: 100 }}
              pannable
              zoomable
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
