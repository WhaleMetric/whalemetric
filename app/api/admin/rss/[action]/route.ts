import { NextRequest, NextResponse } from 'next/server';
import { whalemetricApi, healthCheck } from '@/lib/whalemetric-api';

export const dynamic = 'force-dynamic';

const ALLOWED_GET    = new Set(['status', 'health']);
const ALLOWED_POST   = new Set(['enable', 'disable', 'run']);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!ALLOWED_GET.has(action)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const data = action === 'health'
      ? await healthCheck()
      : await whalemetricApi.rss.status();
    return NextResponse.json({ ok: true, data });
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
  if (!ALLOWED_POST.has(action)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    let data: unknown;
    if (action === 'enable')  data = await whalemetricApi.rss.enable();
    else if (action === 'disable') data = await whalemetricApi.rss.disable();
    else                      data = await whalemetricApi.rss.run();

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
