import { NextRequest, NextResponse } from 'next/server';
import { suggestAliases } from '@/lib/signal-aliases-mock';
import type { SignalCategory } from '@/lib/types/signals';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: unknown; type?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const type = typeof body.type === 'string' ? body.type : '';

    if (!name || name.length < 3) {
      return NextResponse.json({ aliases: [] });
    }

    // Simulate latency (client-side UX)
    await new Promise((r) => setTimeout(r, 800 + Math.floor(Math.random() * 600)));

    const all = suggestAliases(name, type as SignalCategory);
    const aliases = all.slice(0, 5);

    return NextResponse.json({ aliases });
  } catch {
    return NextResponse.json({ aliases: [] }, { status: 200 });
  }
}
