import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const now = new Date().toISOString();

    // Mark as running (worker Python polleará este estado)
    const { data, error } = await db
      .from('flows_config')
      .update({ last_status: 'running', last_run_at: now, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Insert a log entry for the manual trigger
    await db.from('flow_logs').insert({
      flow_id: id,
      level: 'info',
      message: 'Ejecución manual iniciada desde el panel admin',
      created_at: now,
    });

    return NextResponse.json({ success: true, data, triggered_at: now });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
