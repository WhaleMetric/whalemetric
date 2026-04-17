import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const type = req.nextUrl.searchParams.get('type'); // 'tv' | 'radio'

    let query = db
      .from('tv_channels')
      .select(`
        id, slug, name, type, stream_url, enabled, created_at,
        tv_channel_schedule (id, day_of_week, half_hour_slots, updated_at)
      `)
      .order('name');

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
