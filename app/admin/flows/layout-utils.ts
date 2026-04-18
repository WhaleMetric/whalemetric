import dagre from 'dagre';
import type { Edge, Node } from 'reactflow';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

export function getLayoutedElements<TNode extends Node, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[],
  direction: 'LR' | 'TB' = 'LR',
): { nodes: TNode[]; edges: TEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 140, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      sourcePosition: direction === 'LR' ? ('right' as const) : ('bottom' as const),
      targetPosition: direction === 'LR' ? ('left' as const) : ('top' as const),
    };
  });

  return { nodes: layoutedNodes, edges };
}
