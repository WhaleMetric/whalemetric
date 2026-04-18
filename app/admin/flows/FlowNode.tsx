'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Database, Cpu, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export type FlowCategory = 'ingesta' | 'procesamiento' | 'generacion';
export type FlowStatus = 'ok' | 'error' | 'running' | 'idle';

export interface FlowNodeData {
  slug: string;
  name: string;
  category: FlowCategory;
  enabled: boolean;
  last_status: FlowStatus;
  last_run_at: string | null;
}

const CATEGORY_ICONS = {
  ingesta: Database,
  procesamiento: Cpu,
  generacion: FileText,
} as const;

function statusBadge(enabled: boolean, status: FlowStatus): { label: string; cls: string } {
  if (!enabled) {
    return { label: 'parado', cls: 'bg-[#F9FAFB] text-[#9CA3AF]' };
  }
  switch (status) {
    case 'running':
      return { label: 'running', cls: 'bg-[#DBEAFE] text-[#1E40AF]' };
    case 'ok':
      return { label: 'ok', cls: 'bg-[#D1FAE5] text-[#065F46]' };
    case 'error':
      return { label: 'error', cls: 'bg-[#FEE2E2] text-[#991B1B]' };
    case 'idle':
    default:
      return { label: 'idle', cls: 'bg-[#F3F4F6] text-[#6B7280]' };
  }
}

function borderColor(enabled: boolean, status: FlowStatus): string {
  if (!enabled) return 'border-[#F3F4F6]';
  if (status === 'running') return 'border-[#3B82F6] animate-pulse';
  if (status === 'error') return 'border-[#EF4444]';
  return 'border-[#E5E7EB]';
}

function FlowNodeComponent({ data }: NodeProps<FlowNodeData>) {
  const Icon = CATEGORY_ICONS[data.category];
  const badge = statusBadge(data.enabled, data.last_status);
  const border = borderColor(data.enabled, data.last_status);
  const opacity = data.enabled ? 'opacity-100' : 'opacity-50';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={data.name}
      className={`
        w-[200px] bg-white border rounded-[10px] p-3
        transition-all duration-150 ${border} ${opacity}
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-[1.02]
        cursor-pointer
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-300 !w-2 !h-2 !border-0" />

      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-500 shrink-0" />
        <span
          className={`px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full font-medium ${badge.cls}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="text-sm font-semibold text-gray-900 leading-tight mb-1 truncate">
        {data.name}
      </div>

      {data.last_run_at ? (
        <div className="text-[10px] text-gray-500 font-mono truncate">
          {formatDistanceToNow(new Date(data.last_run_at), { addSuffix: true, locale: es })}
        </div>
      ) : (
        <div className="text-[10px] text-gray-400 font-mono italic">sin ejecuciones</div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-gray-300 !w-2 !h-2 !border-0" />
    </div>
  );
}

export const FlowNode = memo(FlowNodeComponent);
