export const dynamic = 'force-dynamic';

const API_BASE  = 'https://api.whalemetric.com';
const API_TOKEN = 'wm_8d5bc53cc4de1949d0444dba5dfebefb51c1d4fc30eaafc1ce626d34dd66744a';

export async function GET() {
  // Test 1: no auth
  const r1 = await fetch(`${API_BASE}/api/health`).catch((e) => ({ error: String(e) }));

  // Test 2: Bearer token
  const r2 = await fetch(`${API_BASE}/api/health`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` },
  }).catch((e) => ({ error: String(e) }));

  // Test 3: token without Bearer prefix
  const r3 = await fetch(`${API_BASE}/api/health`, {
    headers: { 'Authorization': API_TOKEN },
  }).catch((e) => ({ error: String(e) }));

  // Test 4: X-API-Key header
  const r4 = await fetch(`${API_BASE}/api/health`, {
    headers: { 'X-API-Key': API_TOKEN },
  }).catch((e) => ({ error: String(e) }));

  // Test 5: authenticated status endpoint with Bearer
  const r5 = await fetch(`${API_BASE}/api/flows/rss_fetch/status`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` },
  }).catch((e) => ({ error: String(e) }));

  async function read(r: Response | { error: string }) {
    if ('error' in r) return { fetchError: r.error };
    const body = await r.text().catch(() => '');
    return { status: r.status, body };
  }

  return Response.json({
    'no-auth':       await read(r1 as Response),
    'Bearer token':  await read(r2 as Response),
    'raw token':     await read(r3 as Response),
    'X-API-Key':     await read(r4 as Response),
    'status-Bearer': await read(r5 as Response),
  });
}
