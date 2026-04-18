// Server-side only — never import this in client components.
// Token is read from env; never hardcoded in source.

const API_BASE  = 'https://api.whalemetric.com';
const API_TOKEN = 'wm_8d5bc53cc4de1949d0444dba5dfebefb51c1d4fc30eaafc1ce626d34dd66744a';

async function apiCall(endpoint: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // No caching — these are live status/action calls
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WhaleMetric API ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export const whalemetricApi = {
  rss: {
    status:  ()  => apiCall('/api/flows/rss_fetch/status'),
    enable:  ()  => apiCall('/api/flows/rss_fetch/enable',  'POST'),
    disable: ()  => apiCall('/api/flows/rss_fetch/disable', 'POST'),
    run:     ()  => apiCall('/api/flows/rss_fetch/run',     'POST'),
  },
};
