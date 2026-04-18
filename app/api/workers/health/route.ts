import { NextResponse } from 'next/server';
import { workersHealth } from '@/lib/workers-api/client';

// Re-check at most every ~10 s to avoid hammering the tunnel.
export const revalidate = 10;

export async function GET() {
  const h = await workersHealth();
  return NextResponse.json(
    {
      online: h.ok,
      status: h.status,
      latency_ms: h.latency_ms,
      error: h.error ?? null,
      checked_at: new Date().toISOString(),
    },
    {
      headers: { 'Cache-Control': 's-maxage=10, stale-while-revalidate=30' },
    }
  );
}
