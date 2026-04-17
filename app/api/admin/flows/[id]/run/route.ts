import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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
    const now = new Date().toISOString();

    const { data, error } = await db
      .from('flows_config')
      .update({ last_status: 'running', last_run_at: now, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await db.from('flow_logs').insert({
      flow_id: id,
      level: 'info',
      message: 'Ejecución manual iniciada desde el panel admin',
      created_at: now,
    });

    return NextResponse.json({ success: true, data, triggered_at: now });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
