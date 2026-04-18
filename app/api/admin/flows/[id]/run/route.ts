import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { workersApi } from '@/lib/workers-api/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/flows/[id]/run
 *
 * Forces an immediate run. Only allowed if the flow has a worker
 * (has_worker=true); otherwise returns 409.
 *
 * Response on success:
 *   { ok: true, job_id: string, triggered_at: iso }
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { id } = await params;

    const { data: flow, error: fetchErr } = await db
      .from('flows_config')
      .select('id, slug, has_worker')
      .eq('id', id)
      .single();
    if (fetchErr || !flow) {
      return NextResponse.json({ ok: false, error: fetchErr?.message ?? 'Flow no encontrado' }, { status: 404 });
    }

    if (!flow.has_worker) {
      return NextResponse.json(
        { ok: false, error: 'Este flujo todavía no tiene worker Python conectado.' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const workerRes = await workersApi.runNow(flow.slug);

    if (!workerRes.ok) {
      // Log to flow_logs for traceability even on failure.
      await db.from('flow_logs').insert({
        flow_id: id,
        level: 'error',
        message: `Run manual falló: ${workerRes.error}`,
        created_at: now,
      });
      return NextResponse.json(
        { ok: false, error: `API de workers no respondió: ${workerRes.error}` },
        { status: 502 }
      );
    }

    // Mark as running and log success.
    await db
      .from('flows_config')
      .update({ last_status: 'running', last_run_at: now, updated_at: now })
      .eq('id', id);
    await db.from('flow_logs').insert({
      flow_id: id,
      level: 'info',
      message: `Ejecución manual iniciada (job_id=${workerRes.data.job_id ?? 'n/a'})`,
      created_at: now,
    });

    return NextResponse.json({
      ok: true,
      job_id: workerRes.data.job_id ?? null,
      triggered_at: now,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
