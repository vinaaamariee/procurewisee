import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { UserProfile } from '@/types/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { startTimer } from '@/lib/performance-logger';

/**
 * Returns the authenticated Supabase user + their user_profile row.
 * Redirects to login if unauthenticated.
 * Uses request headers to bypass Supabase getUser() network call,
 * caches the profile query per request, and uses Prisma Client.
 */
export const getAuthenticatedUser = cache(async (): Promise<{
  user: { id: string; email?: string };
  profile: UserProfile;
}> => {
  const timer = startTimer('getAuthenticatedUser');

  let userId: string | null = null;
  let userEmail: string | null = null;

  try {
    const headerStore = await headers();
    userId = headerStore.get('x-user-id');
  } catch (e) {
    // Headers read may fail outside of live request context (e.g. during build-time prerendering)
  }

  if (!userId) {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      timer.end();
      redirect('/login');
    }
    userId = user.id;
    userEmail = user.email ?? null;
  }

  // Fetch profile via Prisma (connection pool, significantly faster than Supabase REST)
  const profileRow = await prisma.userProfile.findUnique({
    where: { id: userId },
  });

  if (!profileRow) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    timer.end();
    redirect('/login?error=Account not configured. Contact your administrator.');
  }

  // Convert Prisma UserRole to App UserRole (with space)
  let appRole = profileRow.role as string;
  if (appRole === 'ProcurementOfficer') {
    appRole = 'Procurement Officer';
  } else if (appRole === 'AdministrativeApprover') {
    appRole = 'Administrative Approver';
  }

  if (appRole === 'Supplier') {
    const supabase = await createClient();
    await supabase.auth.signOut();
    timer.end();
    redirect('/login?error=Supplier login is disabled. Supplier accounts are for reference only.');
  }

  if (!profileRow.isActive) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    timer.end();
    redirect('/login?error=Your account has been deactivated.');
  }

  const profile: UserProfile = {
    id: profileRow.id,
    username: profileRow.username,
    fullName: profileRow.fullName,
    email: profileRow.email,
    role: appRole as any,
    isActive: profileRow.isActive,
    createdAt: profileRow.createdAt.toISOString(),
  };

  timer.end();
  return {
    user: { id: userId, email: userEmail ?? profileRow.email },
    profile,
  };
});

/**
 * Verifies auth AND enforces a specific role.
 * Redirects to /unauthorized if the user's role doesn't match.
 */
export async function requireRole(
  allowedRole: UserProfile['role'],
): Promise<{ user: { id: string; email?: string }; profile: UserProfile }> {
  const { user, profile } = await getAuthenticatedUser();

  if (profile.role !== allowedRole) {
    redirect('/unauthorized');
  }

  return { user, profile };
}

