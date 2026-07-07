'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/auth';

const ROLE_HOME: Record<UserRole, string> = {
  'Procurement Officer':    '/dashboard/officer',
  'Administrative Approver': '/dashboard/approver',
  'Supplier':               '/unauthorized',
  'End User':               '/dashboard/end-user',
};

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    return redirect('/login?error=Invalid credentials. Please try again.');
  }

  // Fetch role from user_profiles — never trust JWT claims alone
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, "isActive"')
    .eq('id', authData.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return redirect('/login?error=Account not configured. Contact your administrator.');
  }

  if (profile.role === 'Supplier') {
    await supabase.auth.signOut();
    return redirect('/login?error=Supplier login is disabled. Supplier accounts are for reference only.');
  }

  if (!profile.isActive) {
    await supabase.auth.signOut();
    return redirect('/login?error=Your account has been deactivated.');
  }

  const next = formData.get('next') as string;

  revalidatePath('/', 'layout');
  if (next && next.startsWith('/') && !next.startsWith('/login') && !next.startsWith('/unauthorized')) {
    return redirect(next);
  }
  return redirect(ROLE_HOME[profile.role as UserRole] ?? '/dashboard/officer');
}

export async function register(formData: FormData) {
  return redirect('/login?error=Supplier registration is disabled. Supplier accounts are for reference only.');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  return redirect('/');
}