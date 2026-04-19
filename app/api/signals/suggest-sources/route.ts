import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: unknown; type?: unknown; aliases?: unknown };
    const type = typeof body.type === 'string' ? body.type : '';

    const supabase = await createClient();

    // MOCK: return all sources flagged as is_top_source=true.
    // TODO: replace with semantic scoring once the worker exists.
    const { data: sources, error } = await supabase
      .from('sources')
      .select('id')
      .eq('is_top_source', true);

    if (error) {
      return NextResponse.json(
        { source_ids: [], reasoning: '', error: error.message },
        { status: 500 },
      );
    }

    // Simulated reasoning delay
    await new Promise((r) => setTimeout(r, 900));

    return NextResponse.json({
      source_ids: (sources ?? []).map((s) => (s as { id: string }).id),
      reasoning: `Sugerencia basada en señal tipo "${type}"`,
    });
  } catch (e) {
    return NextResponse.json(
      { source_ids: [], reasoning: '', error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    );
  }
}
