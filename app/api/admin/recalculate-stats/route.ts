import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  'https://txxygcdafjcuyvvzbbnx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eHlnY2RhZmpjdXl2dnpiYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTA1NjEsImV4cCI6MjA5MTU4NjU2MX0.JCeVp6a3bRKbSPkG_aoYvVwMIFTFn7-IFaXjaeZ0Ik0'
);

export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = today + 'T00:00:00.000Z';
    const todayEnd = today + 'T23:59:59.999Z';

    // Fetch all news created today with source type
    const { data: newsItems, error: newsError } = await db
      .from('news')
      .select('title, description, sources(type)')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    if (newsError) throw newsError;

    // Group by source_type; approximate bytes from content length
    const byType: Record<string, { count: number; bytes: number }> = {};
    for (const n of newsItems ?? []) {
      const t = (n.sources as any)?.type ?? 'unknown';
      if (!byType[t]) byType[t] = { count: 0, bytes: 0 };
      byType[t].count++;
      byType[t].bytes += (n.title?.length ?? 0) + (n.description?.length ?? 0);
    }

    // Upsert rows for today per source_type
    for (const [type, stats] of Object.entries(byType)) {
      const { data: existing } = await db
        .from('daily_stats')
        .select('id')
        .eq('date', today)
        .eq('source_type', type)
        .maybeSingle();

      if (existing) {
        await db.from('daily_stats').update({ news_count: stats.count, bytes_total: stats.bytes }).eq('id', existing.id);
      } else {
        await db.from('daily_stats').insert({ date: today, source_type: type, news_count: stats.count, bytes_total: stats.bytes });
      }

      // Recalculate cumulative_bytes for this source_type (all historical rows)
      const { data: allRows } = await db
        .from('daily_stats')
        .select('id, bytes_total')
        .eq('source_type', type)
        .order('date', { ascending: true });

      let cumulative = 0;
      for (const row of allRows ?? []) {
        cumulative += row.bytes_total ?? 0;
        await db.from('daily_stats').update({ cumulative_bytes: cumulative }).eq('id', row.id);
      }
    }

    return NextResponse.json({ success: true, date: today, types: Object.keys(byType), counts: byType });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
