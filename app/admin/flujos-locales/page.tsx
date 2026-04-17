import { createClient } from '@supabase/supabase-js';
import FlujosLocalesClient, {
  type FlowConfig,
  type FlowsGrouped,
} from './_components/FlujosLocalesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchFlowsGrouped(): Promise<FlowsGrouped> {
  const empty: FlowsGrouped = { ingesta: [], procesamiento: [], generacion: [] };

  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await db
      .from('flows_config')
      .select('id, slug, name, description, category, enabled, schedule_cron, interval_seconds, last_run_at, last_status, items_processed_today, params, has_worker')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data) return empty;

    const grouped: FlowsGrouped = { ingesta: [], procesamiento: [], generacion: [] };
    for (const row of data as FlowConfig[]) {
      if (row.category in grouped) grouped[row.category].push(row);
    }
    return grouped;
  } catch {
    return empty;
  }
}

export default async function FlujosLocalesPage() {
  const initialFlows = await fetchFlowsGrouped();
  return <FlujosLocalesClient initialFlows={initialFlows} />;
}
