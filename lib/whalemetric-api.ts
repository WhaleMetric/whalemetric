// Server-side only — never import this in client components.
// Token is read from env; never hardcoded in source.

const API_BASE = 'https://api.whalemetric.com';

function getToken(): string {
  const token = process.env.WHALEMETRIC_API_TOKEN;
  if (!token) throw new Error('WHALEMETRIC_API_TOKEN not set in environment');
  return token;
}

async function apiCall(endpoint: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
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
