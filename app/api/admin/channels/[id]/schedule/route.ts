import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/admin/channels/[id]/schedule
 * Body: { schedule: boolean[][] } — [7 days][48 half-hours]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { id } = await params;
    const body = await req.json();
    const schedule: boolean[][] = body.schedule;

    if (!Array.isArray(schedule) || schedule.length !== 7) {
      return NextResponse.json({ error: 'schedule debe ser boolean[7][48]' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const rows = schedule.map((mask, dayOfWeek) => ({
      channel_id: id,
      day_of_week: dayOfWeek,
      half_hour_slots: mask,
      updated_at: now,
    }));

    const { error } = await db
      .from('tv_channel_schedule')
      .upsert(rows, { onConflict: 'channel_id,day_of_week' });

    if (error) throw error;
    return NextResponse.json({ success: true, channel_id: id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
