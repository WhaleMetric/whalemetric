import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PROTECTED = ['/dashboard', '/admin'];
const AUTH_PAGES = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // 1. No session trying to access a protected route → /login?next=<pathname>
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // 2. Logged-in user on /login or /signup → /dashboard
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Ignore Next internals and static assets so the middleware doesn't
  // fire on every image / font request.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|imgs|logos|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf|eot|mp4|webm|map)$).*)',
  ],
};
