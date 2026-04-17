/**
 * Thin server-side client for the local workers API running on
 * http://api.whalemetric.com. Every call must originate from a Next.js
 * route handler or Server Component — NEVER from a client component —
 * because the API is served over http and the panel is https (mixed
 * content would be blocked by the browser).
 *
 * TODO: When https is enabled on api.whalemetric.com, revisit the
 * `http://` default below and the fetch timeout handling.
 */

const DEFAULT_URL = 'http://api.whalemetric.com';
const DEFAULT_TIMEOUT_MS = 4000;

export interface WorkerStatus {
  slug: string;
  status: 'ok' | 'error' | 'running' | 'idle';
  last_run_at: string | null;
  items_processed_today: number;
  message?: string;
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

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader(), ...(init.headers as Record<string, string> | undefined) },
    });
  } finally {
    clearTimeout(id);
  }
}

export async function workersHealth(): Promise<WorkersHealth> {
  const started = Date.now();
  try {
    const res = await fetchWithTimeout(`${baseUrl()}/api/health`);
    return {
      ok: res.ok,
      status: res.status,
      latency_ms: Date.now() - started,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      ok: false,
      status: null,
      latency_ms: Date.now() - started,
      error: e instanceof Error ? e.message : 'unknown',
    };
  }
}

export async function workersGetAllStatus(): Promise<WorkerStatus[] | null> {
  try {
    const res = await fetchWithTimeout(`${baseUrl()}/api/flows/status`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: WorkerStatus[] } | WorkerStatus[];
    return Array.isArray(json) ? json : json.data ?? null;
  } catch {
    return null;
  }
}

async function workersPost(path: string, body?: unknown): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${baseUrl()}${path}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function workersPatch(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${baseUrl()}${path}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const workersApi = {
  start: (slug: string) => workersPost(`/api/flows/${slug}/start`),
  stop: (slug: string) => workersPost(`/api/flows/${slug}/stop`),
  runNow: (slug: string) => workersPost(`/api/flows/${slug}/run-now`),
  config: (slug: string, body: { interval_seconds?: number | null; schedule_cron?: string | null; params?: Record<string, unknown> }) =>
    workersPatch(`/api/flows/${slug}/config`, body),
};
