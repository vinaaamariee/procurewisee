'use server';

import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

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
