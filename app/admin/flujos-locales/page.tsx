import { createClient } from '@supabase/supabase-js';
import { workersApi, workersHealth } from '@/lib/workers-api/client';
import FlujosLocalesClient, {
  type FlowConfig,
  type FlowsGrouped,
  type WorkersApiState,
} from './_components/FlujosLocalesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WORKER_SLUGS: string[] = ['rss_fetch'];

function mapWorkerStatus(s: string | null | undefined): FlowConfig['last_status'] {
  if (s === 'success' || s === 'ok') return 'ok';
  if (s === 'error' || s === 'failed') return 'error';
  if (s === 'running') return 'running';
  return 'idle';
}

async function loadInitial(): Promise<{ flows: FlowsGrouped; workers: WorkersApiState }> {
  const empty: FlowsGrouped = { ingesta: [], procesamiento: [], generacion: [] };

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

    if (flowsRes.error || !flowsRes.data) {
      return { flows: empty, workers: { online: health.ok, last_check: new Date().toISOString(), error: health.error ?? null } };
    }

    const overlay = new Map<string, Partial<FlowConfig>>();
    WORKER_SLUGS.forEach((slug, i) => {
      const r = workerStatuses[i];
      if (r && r.ok && r.data) {
        overlay.set(slug, {
          last_run_at: r.data.last_run_at ?? null,
          last_status: mapWorkerStatus(r.data.last_run_status as string | null),
          items_processed_today: r.data.last_run_count ?? 0,
        });
      }
    });

    const grouped: FlowsGrouped = { ingesta: [], procesamiento: [], generacion: [] };
    for (const row of flowsRes.data as FlowConfig[]) {
      const over = overlay.get(row.slug);
      const merged: FlowConfig = over ? { ...row, ...over } : row;
      if (merged.category in grouped) grouped[merged.category].push(merged);
    }

    return {
      flows: grouped,
      workers: {
        online: health.ok,
        last_check: new Date().toISOString(),
        error: health.error ?? null,
      },
    };
  } catch {
    return {
      flows: empty,
      workers: { online: false, last_check: new Date().toISOString(), error: 'unknown' },
    };
  }
}

export default async function FlujosLocalesPage() {
  const { flows, workers } = await loadInitial();
  return <FlujosLocalesClient initialFlows={flows} initialWorkers={workers} />;
}
