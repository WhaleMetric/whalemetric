// Server-side only — imported by API routes, never by client components.

const API_BASE  = 'https://api.whalemetric.com';
const API_TOKEN = 'wm_8d5bc53cc4de1949d0444dba5dfebefb51c1d4fc30eaafc1ce626d34dd66744a';

export async function apiCall(endpoint: string, method = 'GET', body?: unknown) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`[WM] ${method} ${url}`);

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  console.log(`[WM] → ${res.status}`);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[WM] Error body:`, text);
    throw new Error(text || `Error ${res.status}`);
  }

  return res.json();
}

export async function healthCheck() {
  const url = `${API_BASE}/api/health`;
  console.log(`[WM] GET ${url} (no auth)`);
  const res = await fetch(url, { cache: 'no-store' });
  console.log(`[WM] health → ${res.status}`);
  const text = await res.text();
  console.log(`[WM] health body:`, text);
  return { status: res.status, body: text };
}

export const whalemetricApi = {
  rss: {
    status:  () => apiCall('/api/flows/rss_fetch/status'),
    enable:  () => apiCall('/api/flows/rss_fetch/enable',  'POST'),
    disable: () => apiCall('/api/flows/rss_fetch/disable', 'POST'),
    run:     () => apiCall('/api/flows/rss_fetch/run',     'POST'),
  },
};
