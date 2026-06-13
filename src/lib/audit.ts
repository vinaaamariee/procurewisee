import { after } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

interface AuditTrailParams {
  actionType: string;
  tableAffected: string;
  recordId: number;
  oldState?: any;
  newState?: any;
}

/**
 * Schedules a background task to record an audit trail entry.
 * Runs asynchronously after the client response has resolved, preventing performance blockage.
 */
export function logAuditTrail({
  actionType,
  tableAffected,
  recordId,
  oldState,
  newState,
}: AuditTrailParams) {
  // Schedule database insertion post-response
  after(async () => {
    try {
      // 1. Capture request IP inside the async background context (Next.js 15+ headers is async)
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

      // 2. Fetch authenticated user inside the background context
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

      await prisma.auditTrail.create({
        data: {
          actionType,
          tableAffected,
          recordId,
          oldState: oldState ? JSON.parse(JSON.stringify(oldState)) : null,
          newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
          userId,
          ipAddress,
        },
      });
      console.log(`[AUDIT] Successfully logged ${actionType} on ${tableAffected} (ID: ${recordId})`);
    } catch (dbErr) {
      console.error('[AUDIT ERROR] Failed to write background audit log:', dbErr);
    }
  });
}
