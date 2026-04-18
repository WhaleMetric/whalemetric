'use client';

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

export default function FlowsPage() {
  const nodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Test Node 1' } },
    { id: '2', position: { x: 300, y: 100 }, data: { label: 'Test Node 2' } },
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2' },
  ];

  return (
    <div className="w-full h-screen">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
