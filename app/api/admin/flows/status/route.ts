import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { workersApi, workersHealth } from '@/lib/workers-api/client';

export const dynamic = 'force-dynamic';

type Category = 'ingesta' | 'procesamiento' | 'generacion';

interface FlowRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: Category;
  enabled: boolean;
  schedule_cron: string | null;
  interval_seconds: number | null;
  last_run_at: string | null;
  last_status: 'ok' | 'error' | 'running' | 'idle';
  items_processed_today: number;
  params: Record<string, unknown>;
  has_worker: boolean;
  next_run_at?: string | null;
  last_run_count?: number | null;
}

const WORKER_SLUGS: string[] = ['rss_fetch'];

function mapWorkerStatus(s: string | null | undefined): FlowRow['last_status'] {
  if (s === 'success' || s === 'ok') return 'ok';
  if (s === 'error' || s === 'failed') return 'error';
  if (s === 'running') return 'running';
  return 'idle';
}

export async function GET() {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [flowsRes, health, ...workerStatuses] = await Promise.all([
      db
        .from('flows_config')
        .select('id, slug, name, description, category, enabled, schedule_cron, interval_seconds, last_run_at, last_status, items_processed_today, params, has_worker')
        .order('category', { ascending: true })
        .order('name', { ascending: true }),
      workersHealth(),
      ...WORKER_SLUGS.map((slug) => workersApi.status(slug)),
    ]);

    if (flowsRes.error) throw flowsRes.error;

    const workerStatusBySlug = new Map<string, FlowRow>();
    WORKER_SLUGS.forEach((slug, i) => {
      const r = workerStatuses[i];
      if (r && r.ok && r.data) {
        const d = r.data;
        workerStatusBySlug.set(slug, {
          // Only the fields we overlay; rest will come from Supabase
          id: '', slug, name: '', description: null, category: 'ingesta',
          enabled: d.enabled,
          schedule_cron: null,
          interval_seconds: typeof d.interval_minutes === 'number' ? d.interval_minutes * 60 : null,
          last_run_at: d.last_run_at ?? null,
          last_status: mapWorkerStatus(d.last_run_status as string | null),
          items_processed_today: d.last_run_count ?? 0,
          params: {},
          has_worker: true,
          next_run_at: d.next_run_at ?? null,
          last_run_count: d.last_run_count ?? null,
        });
      }
    });

    const grouped: Record<Category, FlowRow[]> = { ingesta: [], procesamiento: [], generacion: [] };
    for (const row of (flowsRes.data ?? []) as FlowRow[]) {
      const overlay = workerStatusBySlug.get(row.slug);
      const merged: FlowRow = overlay
        ? {
            ...row,
            // Worker API is authoritative for live state:
            last_run_at: overlay.last_run_at ?? row.last_run_at,
            last_status: overlay.last_status,
            next_run_at: overlay.next_run_at ?? null,
            last_run_count: overlay.last_run_count ?? null,
          }
        : row;
      if (merged.category in grouped) grouped[merged.category].push(merged);
    }

    return NextResponse.json({
      success: true,
      data: grouped,
      workers_api: {
        online: health.ok,
        last_check: new Date().toISOString(),
        latency_ms: health.latency_ms,
        error: health.error,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
