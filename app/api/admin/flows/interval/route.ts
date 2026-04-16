import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flow_key, interval_minutes } = body as {
      flow_key: string;
      interval_minutes: number;
    };

    if (!flow_key || typeof interval_minutes !== 'number' || interval_minutes < 1) {
      return NextResponse.json(
        { error: 'flow_key (string) y interval_minutes (number ≥ 1) son obligatorios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('automation_flows')
      .update({ interval_minutes, updated_at: new Date().toISOString() })
      .eq('flow_key', flow_key)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
