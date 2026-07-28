import { after } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

interface AuditTrailParams {
  actionType: string;
  tableAffected: string;
  recordId: number;
  oldState?: any;
  newState?: any;
  /**
   * Optional transaction client. When provided, the audit log is written
   * synchronously inside the caller's `prisma.$transaction` block so it
   * commits (or rolls back) atomically with the business mutation.
   * When omitted, the write is deferred to a background task via `after()`.
   */
  tx?: Prisma.TransactionClient;
}

/**
 * Captures request-scoped metadata (IP address, authenticated user id)
 * that is only available during the active request.
 */
async function captureRequestContext(): Promise<{ ipAddress: string; userId: string | null }> {
  let ipAddress = 'unknown';
  try {
    const headersList = await headers();
    ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      'unknown';
  } catch (e) {
    // Fails silently if called outside an active request context
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
    }
  } catch (authErr) {
    console.warn('[AUDIT] No authenticated user detected in background context:', authErr);
  }

  return { ipAddress, userId };
}

/**
 * Records an audit trail entry.
 *
 * When `tx` is provided, the entry is written synchronously using that
 * transaction client so it participates in the caller's database
 * transaction (atomic commit/rollback).
 *
 * When `tx` is omitted, the write is deferred to a background task via
 * Next.js `after()` so it does not block the response.
 */
export async function logAuditTrail({
  actionType,
  tableAffected,
  recordId,
  oldState,
  newState,
  tx,
}: AuditTrailParams) {
  const payload = {
    actionType,
    tableAffected,
    recordId,
    oldState: oldState ? JSON.parse(JSON.stringify(oldState)) : null,
    newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
  };

  // Synchronous path: write inside the caller's transaction
  if (tx) {
    const { ipAddress, userId } = await captureRequestContext();
    await tx.auditTrail.create({
      data: { ...payload, userId, ipAddress },
    });
    console.log(`[AUDIT] Logged ${actionType} on ${tableAffected} (ID: ${recordId}) [tx]`);
    return;
  }

  // Deferred path: schedule post-response background write
  after(async () => {
    try {
      const { ipAddress, userId } = await captureRequestContext();
      await prisma.auditTrail.create({
        data: { ...payload, userId, ipAddress },
      });
      console.log(`[AUDIT] Logged ${actionType} on ${tableAffected} (ID: ${recordId})`);
    } catch (dbErr) {
      console.error('[AUDIT ERROR] Failed to write background audit log:', dbErr);
    }
  });
}
