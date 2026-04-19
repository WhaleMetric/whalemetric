import { NextRequest, NextResponse } from 'next/server';
import { whalemetricApi, healthCheck } from '@/lib/whalemetric-api';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;

  try {
    if (action === 'health') {
      const data = await healthCheck();
      return NextResponse.json({ ok: true, data });
    }
    if (action === 'status') {
      const data = await whalemetricApi.rss.status();
      return NextResponse.json({ ok: true, data });
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;

  try {
    let data: unknown;
    if      (action === 'enable')  data = await whalemetricApi.rss.enable();
    else if (action === 'disable') data = await whalemetricApi.rss.disable();
    else if (action === 'run')     data = await whalemetricApi.rss.run();
    else return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
