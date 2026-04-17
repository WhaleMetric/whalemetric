import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await db
      .from('flow_logs')
      .select('id, level, message, created_at')
      .eq('flow_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
