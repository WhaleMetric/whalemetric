import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * OAuth / email-confirm callback.
 *
 * Flow:
 *   1. Supabase redirects here with `?code=…` after the user clicks the
 *      confirmation link in their email.
 *   2. We exchange the code for a session (cookies are written by the
 *      server client).
 *   3. If the query string carries `account_name`, we upsert the row in
 *      public.users so the signup record is complete.
 *   4. Redirect to `next` (or /dashboard by default).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const accountName = searchParams.get('account_name') ?? undefined;
  const next = searchParams.get('next') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Enlace de confirmación inválido')}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? 'No se pudo confirmar el enlace')}`
    );
  }

  // Best-effort upsert on public.users so every confirmed account has a
  // profile row. Failures here should NOT block login.
  if (accountName) {
    try {
      await supabase.from('users').upsert(
        { id: data.user.id, account_name: accountName },
        { onConflict: 'id' }
      );
    } catch {
      // swallow — user still gets into the app
    }
  }

  return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : `/${next}`}`);
}
