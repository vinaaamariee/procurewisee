'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/auth';

const ROLE_HOME: Record<UserRole, string> = {
  'Procurement Officer':    '/dashboard/officer',
  'Administrative Approver': '/dashboard/approver',
  'Supplier':               '/dashboard/supplier',
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
    return redirect('/?error=Invalid credentials. Please try again.');
  }

  // Fetch role from user_profiles — never trust JWT claims alone
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, "isActive"')
    .eq('id', authData.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return redirect('/?error=Account not configured. Contact your administrator.');
  }

  if (!profile.isActive) {
    await supabase.auth.signOut();
    return redirect('/?error=Your account has been deactivated.');
  }

  revalidatePath('/', 'layout');
  return redirect(ROLE_HOME[profile.role as UserRole] ?? '/dashboard/officer');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  return redirect('/');
}