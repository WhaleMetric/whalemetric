import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const body = await req.json();
    const { flow_key, enabled } = body as { flow_key: string; enabled: boolean };

    if (!flow_key || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'flow_key (string) y enabled (boolean) son obligatorios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('automation_flows')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('flow_key', flow_key)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
