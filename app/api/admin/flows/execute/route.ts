import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flow_key } = body as { flow_key: string };

    if (!flow_key) {
      return NextResponse.json({ error: 'flow_key es obligatorio' }, { status: 400 });
    }

    const { data: flow, error: fetchError } = await supabase
      .from('automation_flows')
      .select('*')
      .eq('flow_key', flow_key)
      .single();

    if (fetchError) throw fetchError;
    if (!flow) return NextResponse.json({ error: 'Flujo no encontrado' }, { status: 404 });

    let triggerResult: { status: number; ok: boolean } | null = null;
    if (flow.webhook_url) {
      const triggerRes = await fetch(flow.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow_key, triggered_at: new Date().toISOString(), manual: true }),
      });
      triggerResult = { status: triggerRes.status, ok: triggerRes.ok };
    }

    await supabase
      .from('automation_flows')
      .update({ last_run_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('flow_key', flow_key);

    return NextResponse.json({
      success: true,
      flow_key,
      triggered_at: new Date().toISOString(),
      webhook: triggerResult,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
