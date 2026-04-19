const API_BASE  = 'https://api.whalemetric.com';
const API_TOKEN = 'wm_8d5bc53cc4de1949d0444dba5dfebefb51c1d4fc30eaafc1ce626d34dd66744a';

async function apiCall(endpoint: string, method = 'GET', body?: unknown) {
  console.log('API Call:', { endpoint, method, token: API_TOKEN.substring(0, 10) + '...' });

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  console.log('Headers:', headers);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('API Error:', errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function healthCheck() {
  console.log('Health check →', `${API_BASE}/api/health`);
  const response = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
  console.log('Health status:', response.status);
  return response.json();
}

export const whalemetricApi = {
  rss: {
    status:  () => apiCall('/api/flows/rss_fetch/status'),
    enable:  () => apiCall('/api/flows/rss_fetch/enable',  'POST'),
    disable: () => apiCall('/api/flows/rss_fetch/disable', 'POST'),
    run:     () => apiCall('/api/flows/rss_fetch/run',     'POST'),
  },
};
