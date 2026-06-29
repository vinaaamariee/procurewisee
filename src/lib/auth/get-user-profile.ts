import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { UserProfile } from '@/types/auth';

/**
 * Returns the authenticated Supabase user + their user_profile row.
 * Redirects to login if unauthenticated.
 * Never trust getSession() alone — always use getUser() for server-side auth.
 */
export async function getAuthenticatedUser(): Promise<{
  user: { id: string; email?: string };
  profile: UserProfile;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, username, "fullName", email, role, "isActive", "createdAt"')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // Profile not found — sign out and redirect
    await supabase.auth.signOut();
    redirect('/login?error=Account not configured. Contact your administrator.');
  }

  if (profile.role === 'Supplier') {
    await supabase.auth.signOut();
    redirect('/login?error=Supplier login is disabled. Supplier accounts are for reference only.');
  }

  if (!profile.isActive) {
    await supabase.auth.signOut();
    redirect('/login?error=Your account has been deactivated.');
  }

  return { user, profile: profile as UserProfile };
}

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
