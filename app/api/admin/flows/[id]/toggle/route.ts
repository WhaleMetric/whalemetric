import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { workersApi } from '@/lib/workers-api/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/flows/[id]/toggle
 * Body: { enabled: boolean }
 *
 * 1. Updates flows_config.enabled in Supabase (source of truth for config).
 * 2. If the flow has a worker (has_worker=true), calls the external workers
 *    API: /enable or /disable.
 * 3. Response contract:
 *      { ok: true, data: {...updatedFlow}, worker_sync: boolean, warning?: string }
 *    When worker_sync=false the UI shows an amber toast; Supabase is NOT
 *    rolled back — the worker will catch up when the tunnel is back online.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { id } = await params;
    const { enabled } = (await req.json()) as { enabled?: boolean };
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'enabled:boolean requerido' }, { status: 400 });
    }

    // Look up flow (need slug + has_worker).
    const { data: flow, error: fetchErr } = await db
      .from('flows_config')
      .select('id, slug, has_worker')
      .eq('id', id)
      .single();
    if (fetchErr || !flow) {
      return NextResponse.json({ ok: false, error: fetchErr?.message ?? 'Flow no encontrado' }, { status: 404 });
    }

    // 1) Update Supabase first (source of truth for config).
    const now = new Date().toISOString();
    const { data: updated, error: updErr } = await db
      .from('flows_config')
      .update({ enabled, updated_at: now })
      .eq('id', id)
      .select()
      .single();
    if (updErr) throw updErr;

    // 2) If there is a worker, sync with the external API.
    if (flow.has_worker) {
      const workerRes = enabled
        ? await workersApi.enable(flow.slug)
        : await workersApi.disable(flow.slug);

      if (!workerRes.ok) {
        return NextResponse.json({
          ok: true,
          data: updated,
          worker_sync: false,
          warning: `API de workers no respondió (${workerRes.error}). El cambio se guardó en la configuración pero el worker se sincronizará cuando la API vuelva a estar online.`,
        });
      }
    }

    return NextResponse.json({ ok: true, data: updated, worker_sync: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
