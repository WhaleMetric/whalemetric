import dagre from 'dagre';
import type { Edge, Node } from 'reactflow';

const NODE_W = 210;
const NODE_H = 88;

export function getLayoutedElements<N extends Node, E extends Edge>(
  nodes: N[],
  edges: E[],
): { nodes: N[]; edges: E[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 56 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      return {
        ...n,
        position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
        sourcePosition: 'right' as const,
        targetPosition: 'left' as const,
      };
    }),
    edges,
  };
}
