'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export interface CurrentUser {
  id: string;
  email: string | null;
  account_name: string | null;
  avatar_url: string | null;
  plan: string | null;
}

// ── Module-level cache (shared across mounts during a session) ──────────────

let cached: CurrentUser | null = null;
let inFlight: Promise<CurrentUser | null> | null = null;

async function loadCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData?.user;
  if (!authUser) return null;

  // Best-effort profile lookup. If the table/columns don't exist or RLS
  // rejects us, we still return a minimal user object from the auth session.
  let profile: Partial<Pick<CurrentUser, 'account_name' | 'avatar_url' | 'plan'>> = {};
  try {
    const { data } = await supabase
      .from('users')
      .select('account_name, avatar_url, plan')
      .eq('id', authUser.id)
      .maybeSingle();
    if (data) profile = data as typeof profile;
  } catch {
    /* swallow — fallback to auth-only below */
  }

  return {
    id: authUser.id,
    email: authUser.email ?? null,
    account_name: profile.account_name ?? null,
    avatar_url:   profile.avatar_url   ?? null,
    plan:         profile.plan         ?? null,
  };
}

export function clearCurrentUserCache() {
  cached = null;
  inFlight = null;
}

export function useCurrentUser() {
  const [user, setUser]     = useState<CurrentUser | null>(cached);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    // If the module cache is already populated, useState initialized us with
    // the right values — nothing to sync.
    if (cached) return;
    if (!inFlight) {
      inFlight = loadCurrentUser().catch((e) => {
        setError(e instanceof Error ? e.message : 'Error loading user');
        return null;
      });
    }
    let cancelled = false;
    void inFlight.then((u) => {
      if (cancelled) return;
      cached = u;
      setUser(u);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { user, loading, error };
}
