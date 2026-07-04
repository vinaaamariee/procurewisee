'use server';

import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Maps standard auth role strings (with or without spaces) to Prisma's UserRole enum.
 */
function mapRoleToPrisma(role: string): UserRole {
  const normalized = role.replace(/\s+/g, "").toLowerCase();
  if (normalized === "procurementofficer") {
    return UserRole.ProcurementOfficer;
  }
  if (normalized === "administrativeapprover") {
    return UserRole.AdministrativeApprover;
  }
  if (normalized === "supplier") {
    return UserRole.Supplier;
  }
  throw new Error(`Unknown user role: ${role}`);
}

/**
 * Creates a new UserProfile record in the database using Prisma.
 * This is typically called post-signup.
 */
export async function createUserProfile(data: {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}) {
  const prismaRole = mapRoleToPrisma(data.role);

  const profile = await prisma.userProfile.create({
    data: {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: prismaRole,
      isActive: true,
    },
  });

  return profile;
}

/**
 * Fetches a user profile by ID.
 * Typically used by middleware or layout checks.
 */
export async function getUserProfile(userId: string) {
  if (!userId) return null;

  return await prisma.userProfile.findUnique({
    where: { id: userId },
  });
}

/**
 * Updates a user's active status (admin activation/deactivation).
 */
export async function updateUserStatus(userId: string, isActive: boolean) {
  const profile = await prisma.userProfile.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/", "layout");
  return profile;
}

/**
 * Creates a new Procurement Officer or Administrative Approver account.
 * Restricts invocation to logged-in Administrative Approvers.
 * Uses a cookie-free Supabase client to avoid invalidating the admin session.
 */
export async function createStaffAccount(formData: FormData) {
  try {
    // 1. Gate to Administrative Approvers only
    await requireRole('Administrative Approver');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;
    const role = formData.get('role') as string;

    if (!email || !password || !fullName || !username || !role) {
      return { success: false, error: 'All fields are required.' };
    }

    if (role !== 'Procurement Officer' && role !== 'Administrative Approver') {
      return { success: false, error: 'Invalid staff role selection.' };
    }

    // 2. Initialize cookie-free Supabase client
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // 3. Create the user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signUp({
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

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/approver');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}
