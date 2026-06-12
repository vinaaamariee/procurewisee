import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ─────────────────────────────────────────────────────────────────────────────
// Role → dashboard route mapping
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_HOME: Record<string, string> = {
  'Procurement Officer':    '/dashboard/officer',
  'Administrative Approver': '/dashboard/approver',
  'Supplier':               '/dashboard/supplier',
};

// Which role is required to access each dashboard prefix
const ROUTE_ROLE: Array<{ prefix: string; role: string }> = [
  { prefix: '/dashboard/officer',  role: 'Procurement Officer' },
  { prefix: '/dashboard/approver', role: 'Administrative Approver' },
  { prefix: '/dashboard/supplier', role: 'Supplier' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Proxy — runs on every matched request before rendering
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
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

  // ── Verify session ────────────────────────────────────────────────────────
  // getUser() validates with the Supabase Auth server — never trust getSession() alone
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── PUBLIC ROUTE: Login page (/) ─────────────────────────────────────────
  if (pathname === '/') {
    if (user) {
      // Already signed in → skip login, go to role dashboard
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const dest = profile ? (ROLE_HOME[profile.role] ?? '/dashboard/officer') : '/unauthorized';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    // Not signed in → let them see the login page
    return response;
  }

  // ── PUBLIC ROUTE: Unauthorized page ──────────────────────────────────────
  if (pathname === '/unauthorized') {
    return response;
  }

  // ── PROTECTED: /dashboard/** ──────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    // 1. Not authenticated → send to login
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. Fetch the user's role from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // No profile row → account not fully set up
    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/?error=Account not configured. Contact your administrator.', request.url),
      );
    }

    // 3. Role-based route guard - match exact segment or sub-paths to avoid sibling prefix collisions (e.g. /dashboard/supplier-profiles matching /dashboard/supplier)
    const routeGuard = ROUTE_ROLE.find(({ prefix }) => 
      pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (routeGuard && profile.role !== routeGuard.role) {
      // Wrong role for this section → send to their correct dashboard
      const correctDest = ROLE_HOME[profile.role] ?? '/unauthorized';
      return NextResponse.redirect(new URL(correctDest, request.url));
    }

    // 4. /dashboard root → redirect to role home
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      return NextResponse.redirect(
        new URL(ROLE_HOME[profile.role] ?? '/unauthorized', request.url),
      );
    }

    // 5. Attach role to request headers so Server Components can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', profile.role);
    requestHeaders.set('x-user-id', user.id);

    response = NextResponse.next({ request: { headers: requestHeaders } });
    // Also expose on response for debugging
    response.headers.set('x-user-role', profile.role);
    return response;
  }

  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// Matcher — apply proxy to all routes except Next.js internals & static assets
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
