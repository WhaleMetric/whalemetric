const API_BASE  = 'https://api.whalemetric.com';
const API_TOKEN = 'wm_8d5bc53cc4de1949d0444dba5dfebefb51c1d4fc30eaafc1ce626d34dd66744a';

async function apiCall(endpoint: string, method = 'GET', body?: unknown) {
  console.log('WM API Call:', method, endpoint);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  console.log('WM Response status:', response.status);

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    console.error('WM Error:', error);
    throw new Error(error || `Error ${response.status}`);
  }

  return response.json();
}

export async function healthCheck() {
  console.log('WM Health check →', `${API_BASE}/api/health`);
  const response = await fetch(`${API_BASE}/api/health`);
  console.log('WM Health status:', response.status);
  const text = await response.text();
  console.log('WM Health body:', text);
  return text;
}

export const whalemetricApi = {
  rss: {
    status:  () => apiCall('/api/flows/rss_fetch/status'),
    enable:  () => apiCall('/api/flows/rss_fetch/enable',  'POST'),
    disable: () => apiCall('/api/flows/rss_fetch/disable', 'POST'),
    run:     () => apiCall('/api/flows/rss_fetch/run',     'POST'),
  },
};
