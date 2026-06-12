'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
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

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;
  const role = 'Supplier';
  
  const companyName = formData.get('companyName') as string;
  const tin = formData.get('tin') as string;
  const contactNumber = formData.get('contactNumber') as string;
  const businessAddress = formData.get('businessAddress') as string;

  if (!email || !password || !fullName || !username || !companyName || !businessAddress) {
    return redirect('/?error=Please fill in all required fields.');
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
        role: role,
      },
    },
  });

  if (signUpError) {
    return redirect(`/?error=${encodeURIComponent(signUpError.message)}`);
  }

  // Create Supplier record using Prisma
  try {
    await prisma.supplier.create({
      data: {
        companyName,
        tin: tin || null,
        contactNumber: contactNumber || null,
        contactPerson: fullName,
        businessAddress,
      },
    });
  } catch (error) {
    console.error('Failed to create supplier database record:', error);
  }

  // If session is returned (email confirmation disabled), redirect to dashboard
  if (signUpData.session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', signUpData.user!.id)
      .single();

    if (profile) {
      revalidatePath('/', 'layout');
      return redirect(ROLE_HOME[profile.role as UserRole] ?? '/dashboard/officer');
    }
  }

  return redirect('/?success=Account created successfully! You can now log in.');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  return redirect('/');
}