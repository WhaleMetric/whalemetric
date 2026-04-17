import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type FlowRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: 'ingesta' | 'procesamiento' | 'generacion';
  enabled: boolean;
  schedule_cron: string | null;
  interval_seconds: number | null;
  last_run_at: string | null;
  last_status: 'ok' | 'error' | 'running' | 'idle';
  items_processed_today: number;
  params: Record<string, unknown>;
};

export async function GET() {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await db
      .from('flows_config')
      .select('id, slug, name, description, category, enabled, schedule_cron, interval_seconds, last_run_at, last_status, items_processed_today, params')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    const grouped: Record<'ingesta' | 'procesamiento' | 'generacion', FlowRow[]> = {
      ingesta: [],
      procesamiento: [],
      generacion: [],
    };
    for (const row of (data ?? []) as FlowRow[]) {
      if (row.category in grouped) grouped[row.category].push(row);
    }

    return NextResponse.json({ success: true, data: grouped });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
