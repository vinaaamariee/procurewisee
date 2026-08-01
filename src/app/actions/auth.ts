'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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
  const profileRow = await prisma.userProfile.findUnique({
    where: { id: authData.user.id },
    select: { role: true, isActive: true },
  });

  if (!profileRow) {
    await supabase.auth.signOut();
    return redirect('/login?error=Account not configured. Contact your administrator.');
  }

  // Convert Prisma UserRole to App UserRole (with space)
  let appRole = profileRow.role as string;
  if (appRole === 'ProcurementOfficer') {
    appRole = 'Procurement Officer';
  } else if (appRole === 'AdministrativeApprover') {
    appRole = 'Administrative Approver';
  } else if (appRole === 'EndUser') {
    appRole = 'End User';
  }

  if (appRole === 'Supplier') {
    await supabase.auth.signOut();
    return redirect('/login?error=Supplier login is disabled. Supplier accounts are for reference only.');
  }

  if (!profileRow.isActive) {
    await supabase.auth.signOut();
    return redirect('/login?error=Your account has been deactivated.');
  }

  // Set role cookie
  const cookieStore = await cookies();
  cookieStore.set('pw-user-role', appRole, {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    secure: true,
    sameSite: 'lax',
  });

  const next = formData.get('next') as string;

  revalidatePath('/', 'layout');
  if (next && next.startsWith('/') && !next.startsWith('/login') && !next.startsWith('/unauthorized')) {
    return redirect(next);
  }
  return redirect(ROLE_HOME[appRole as UserRole] ?? '/dashboard/officer');
}

export async function register(formData: FormData) {
  return redirect('/login?error=Supplier registration is disabled. Supplier accounts are for reference only.');
}

export async function registerEndUser(formData: FormData) {
  const supabase = await createClient();

  const fullName = (formData.get('fullName') as string || '').trim();
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!fullName || !email || !password) {
    return redirect('/end-user/login?tab=register&error=Please fill in all required fields.');
  }

  if (password.length < 6) {
    return redirect('/end-user/login?tab=register&error=Password must be at least 6 characters long.');
  }

  if (confirmPassword && password !== confirmPassword) {
    return redirect('/end-user/login?tab=register&error=Passwords do not match.');
  }

  // 1. Sign up with Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !authData.user) {
    return redirect(`/end-user/login?tab=register&error=${encodeURIComponent(signUpError?.message || 'Failed to create account.')}`);
  }

  const userId = authData.user.id;
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const username = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;

  // 2. Upsert UserProfile row with EndUser role
  try {
    await prisma.userProfile.upsert({
      where: { id: userId },
      update: {
        fullName,
        email,
        username,
        role: 'EndUser',
        isActive: true,
      },
      create: {
        id: userId,
        fullName,
        email,
        username,
        role: 'EndUser',
        isActive: true,
      },
    });
  } catch (err: any) {
    console.error('Failed to create End User profile in database:', err);
    return redirect('/end-user/login?tab=register&error=Database account provisioning failed. Please try again.');
  }

  // 3. Set pw-user-role cookie
  const cookieStore = await cookies();
  cookieStore.set('pw-user-role', 'End User', {
    path: '/',
    maxAge: 60 * 60 * 24,
    secure: true,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
  return redirect('/dashboard/end-user?welcome=true');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete('pw-user-role');

  revalidatePath('/', 'layout');
  return redirect('/');
}