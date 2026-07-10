import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ─────────────────────────────────────────────────────────────────────────────
// Role → dashboard route mapping
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_HOME: Record<string, string> = {
  'Procurement Officer':    '/dashboard/officer',
  'Administrative Approver': '/dashboard/approver',
  'Supplier':               '/unauthorized',
  'End User':               '/dashboard/end-user',
};

// Which role is required to access each dashboard prefix
const ROUTE_ROLE: Array<{ prefix: string; role: string }> = [
  { prefix: '/dashboard/officer',  role: 'Procurement Officer' },
  { prefix: '/dashboard/approver', role: 'Administrative Approver' },
  { prefix: '/dashboard/supplier', role: 'Supplier' },
  { prefix: '/dashboard/end-user', role: 'End User' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Proxy — runs on every matched request before rendering
// ─────────────────────────────────────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a mutable response so Supabase can refresh session cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create a Supabase client that can read/write cookies on this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies back to both request and response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ── Bypassing Non-Auth Routes ─────────────────────────────────────────────
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isLoginRoute = pathname === '/login';

  if (!isDashboardRoute && !isLoginRoute) {
    return response;
  }

  // ── Verify session locally (getSession is fast, cookie-only) ──────────────
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // If there's no active session
  if (!user) {
    if (request.cookies.has('pw-user-role')) {
      response.cookies.delete('pw-user-role');
    }
    if (isDashboardRoute) {
      const nextUrl = request.nextUrl.pathname + request.nextUrl.search;
      const redirectResponse = NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(nextUrl)}`, request.url)
      );
      redirectResponse.cookies.delete('pw-user-role');
      return redirectResponse;
    }
    return response;
  }

  // ── Read cached role from cookie ──────────────────────────────────────────
  let role = request.cookies.get('pw-user-role')?.value;
  let didFetchRole = false;

  if (!role) {
    // Fallback: Query profile from database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    role = profile?.role;
    didFetchRole = true;
  }

  // No profile row → account not fully set up
  if (!role) {
    await supabase.auth.signOut();
    const redirectResponse = NextResponse.redirect(
      new URL('/login?error=Account not configured. Contact your administrator.', request.url),
    );
    redirectResponse.cookies.delete('pw-user-role');
    return redirectResponse;
  }

  if (role === 'Supplier') {
    await supabase.auth.signOut();
    const redirectResponse = NextResponse.redirect(
      new URL('/login?error=Supplier login is disabled. Supplier accounts are for reference only.', request.url),
    );
    redirectResponse.cookies.delete('pw-user-role');
    return redirectResponse;
  }

  // If we fetched the role from the database, cache it in cookies
  if (didFetchRole) {
    response.cookies.set('pw-user-role', role, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      secure: true,
      sameSite: 'lax',
    });
  }

  // ── PUBLIC ROUTE: Login page (/login) ─────────────────────────────────────
  if (isLoginRoute) {
    const dest = ROLE_HOME[role] ?? '/unauthorized';
    const redirectResponse = NextResponse.redirect(new URL(dest, request.url));
    if (didFetchRole) {
      redirectResponse.cookies.set('pw-user-role', role, {
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: true,
        sameSite: 'lax',
      });
    }
    return redirectResponse;
  }

  // ── PROTECTED: /dashboard/** ──────────────────────────────────────────────
  // 1. Role-based route guard
  const routeGuard = ROUTE_ROLE.find(({ prefix }) => 
    pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (routeGuard && role !== routeGuard.role) {
    const correctDest = ROLE_HOME[role] ?? '/unauthorized';
    const redirectResponse = NextResponse.redirect(new URL(correctDest, request.url));
    if (didFetchRole) {
      redirectResponse.cookies.set('pw-user-role', role, {
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: true,
        sameSite: 'lax',
      });
    }
    return redirectResponse;
  }

  // 2. /dashboard root → redirect to role home
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    const correctDest = ROLE_HOME[role] ?? '/unauthorized';
    const redirectResponse = NextResponse.redirect(new URL(correctDest, request.url));
    if (didFetchRole) {
      redirectResponse.cookies.set('pw-user-role', role, {
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: true,
        sameSite: 'lax',
      });
    }
    return redirectResponse;
  }

  // 3. Attach role to request headers so Server Components can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-role', role);
  requestHeaders.set('x-user-id', user.id);

  // Re-build response to attach headers and potential cookies
  const nextResponse = NextResponse.next({ request: { headers: requestHeaders } });
  nextResponse.headers.set('x-user-role', role);

  if (didFetchRole) {
    nextResponse.cookies.set('pw-user-role', role, {
      path: '/',
      maxAge: 60 * 60 * 24,
      secure: true,
      sameSite: 'lax',
    });
  }

  return nextResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
// Matcher — apply proxy to all routes except Next.js internals & static assets
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
