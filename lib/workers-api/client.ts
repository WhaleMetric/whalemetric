/**
 * Server-only client for the Python workers API running on
 *   https://api.whalemetric.com
 *
 * Exposed via Cloudflare Tunnel from a local machine. Every call MUST
 * originate from a Next.js route handler or Server Component — NEVER
 * from a client component — so the bearer token stays out of the
 * browser.
 *
 * Config (set in Vercel):
 *   WORKERS_API_URL   (default: https://api.whalemetric.com)
 *   WORKERS_API_TOKEN (required; Bearer token)
 *
 * The documentation says /api/health is public, but the live API
 * rejects it without a token ("Missing bearer token"), so we always
 * attach the Authorization header when available.
 */

const DEFAULT_URL = 'https://api.whalemetric.com';
const DEFAULT_TIMEOUT_MS = 30_000;
export const RUN_TIMEOUT_MS = 60_000;

export type WorkersResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number | null };

export interface RssFetchStatus {
  enabled: boolean;
  interval_minutes: number;
  last_run_at: string | null;
  last_run_status: 'success' | 'error' | 'running' | 'idle' | string | null;
  last_run_count: number | null;
  next_run_at: string | null;
  total_sources?: number;
  total_news?: number;
}

export interface WorkersHealth {
  ok: boolean;
  status: number | null;
  latency_ms: number | null;
  error?: string;
}

function baseUrl() {
  return (process.env.WORKERS_API_URL || DEFAULT_URL).replace(/\/$/, '');
}

function authHeader(): Record<string, string> {
  const token = process.env.WORKERS_API_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<WorkersResult<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
        ...(init.headers as Record<string, string> | undefined),
      },
    });
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (!res.ok) {
      const msg =
        (body && typeof body === 'object' && 'message' in (body as Record<string, unknown>))
          ? String((body as { message?: unknown }).message)
          : `HTTP ${res.status}`;
      return { ok: false, error: msg, status: res.status };
    }
    return { ok: true, data: body as T };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'unknown',
      status: null,
    };
  } finally {
    clearTimeout(id);
  }
}

export async function workersHealth(): Promise<WorkersHealth> {
  const started = Date.now();
  const res = await request<{ status?: string; time?: string }>('/api/health');
  return {
    ok: res.ok,
    status: res.ok ? 200 : (res.status ?? null),
    latency_ms: Date.now() - started,
    error: res.ok ? undefined : res.error,
  };
}

export const workersApi = {
  /** Status of a specific flow (currently only rss_fetch is supported). */
  status: (slug: string) =>
    request<RssFetchStatus>(`/api/flows/${encodeURIComponent(slug)}/status`),

  enable: (slug: string) =>
    request<{ success: boolean; enabled: boolean; message?: string }>(
      `/api/flows/${encodeURIComponent(slug)}/enable`,
      { method: 'POST' }
    ),

  disable: (slug: string) =>
    request<{ success: boolean; enabled: boolean; message?: string }>(
      `/api/flows/${encodeURIComponent(slug)}/disable`,
      { method: 'POST' }
    ),

  runNow: (slug: string) =>
    request<{ success: boolean; job_id?: string; message?: string }>(
      `/api/flows/${encodeURIComponent(slug)}/run`,
      { method: 'POST' },
      RUN_TIMEOUT_MS
    ),

  setInterval: (slug: string, intervalMinutes: number) =>
    request<{ success: boolean; interval_minutes: number; message?: string }>(
      `/api/flows/${encodeURIComponent(slug)}/interval`,
      { method: 'PATCH', body: JSON.stringify({ interval_minutes: intervalMinutes }) }
    ),
};
