import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { workersApi } from '@/lib/workers-api/client';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/flows/[id]/interval
 * Body: { interval_seconds: number|null, schedule_cron?: string|null }
 *       { interval_minutes: number } (also accepted for convenience)
 *
 * flows_config stores the source-of-truth as interval_seconds (+ optional cron).
 * The Python workers API expects MINUTES, so we convert before calling
 * PATCH /api/flows/{slug}/interval.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { id } = await params;
    const body = (await req.json()) as {
      interval_seconds?: number | null;
      interval_minutes?: number | null;
      schedule_cron?: string | null;
    };

    let intervalSeconds: number | null | undefined = body.interval_seconds;
    if (intervalSeconds === undefined && typeof body.interval_minutes === 'number') {
      intervalSeconds = body.interval_minutes * 60;
    }
    if (intervalSeconds === undefined && body.schedule_cron === undefined) {
      return NextResponse.json({ ok: false, error: 'Falta interval_seconds / interval_minutes / schedule_cron' }, { status: 400 });
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

    // 1) Update Supabase.
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (intervalSeconds !== undefined) patch.interval_seconds = intervalSeconds;
    if (body.schedule_cron !== undefined) patch.schedule_cron = body.schedule_cron;

    const { data: updated, error: updErr } = await db
      .from('flows_config')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (updErr) throw updErr;

    // 2) Sync worker interval (in MINUTES) when applicable.
    if (flow.has_worker && typeof intervalSeconds === 'number' && intervalSeconds > 0) {
      const minutes = Math.max(1, Math.round(intervalSeconds / 60));
      const workerRes = await workersApi.setInterval(flow.slug, minutes);
      if (!workerRes.ok) {
        return NextResponse.json({
          ok: true,
          data: updated,
          worker_sync: false,
          warning: `Intervalo guardado, pero la API de workers no respondió (${workerRes.error}).`,
        });
      }
    }

    return NextResponse.json({ ok: true, data: updated, worker_sync: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
