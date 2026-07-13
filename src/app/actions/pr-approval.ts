'use server';

import { prisma } from '@/lib/prisma';
import { PrStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { logAuditTrail } from '@/lib/audit';
import { requireRole } from '@/lib/auth/get-user-profile';
import { createNotificationHelper } from './notifications';

/**
 * Administrative Approver starts review on a submitted PR.
 * Transitions status to UnderReview and creates a status history record.
 */
export async function startPrReview(prId: number) {
  try {
    const { profile } = await requireRole('Administrative Approver');

    const old = await prisma.purchaseRequest.findUnique({ where: { id: prId } });
    if (!old) return { success: false, error: 'Purchase Request not found.' };

    if (old.status !== 'Submitted' && old.status !== 'Received') {
      return { success: false, error: `Purchase Request is in ${old.status} state. Review can only be started for Submitted or Received requests.` };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id: prId },
        data: { status: 'UnderReview' },
      });

      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: prId,
          status: 'UnderReview',
          remarks: 'Approver started audit review.',
          changedById: profile.id,
        },
      });

      return pr;
    });

    logAuditTrail({
      actionType: 'START_PR_REVIEW',
      tableAffected: 'purchase_requests',
      recordId: prId,
      oldState: old,
      newState: updated,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/dashboard/approver');
    revalidatePath('/dashboard/approver/history');
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error('Error starting PR review:', error);
    return { success: false, error: error.message || 'Failed to start review.' };
  }
}

/**
 * Administrative Approver approves the Purchase Request.
 * Transitions status to Approved and updates approvedAt timestamp.
 */
export async function approvePr(prId: number, remarks?: string) {
  try {
    const { profile } = await requireRole('Administrative Approver');

    const old = await prisma.purchaseRequest.findUnique({ where: { id: prId } });
    if (!old) return { success: false, error: 'Purchase Request not found.' };

    if (old.status !== 'UnderReview') {
      return { success: false, error: 'Purchase Request must be Under Review to approve.' };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id: prId },
        data: {
          status: 'Approved',
          approvedAt: new Date(),
        },
      });

      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: prId,
          status: 'Approved',
          remarks: remarks?.trim() || 'Approved for procurement.',
          changedById: profile.id,
        },
      });

      // Increment spent budget upon approval
      const deptBudget = await tx.departmentBudget.findUnique({
        where: { department: old.department },
      });

      if (deptBudget) {
        await tx.departmentBudget.update({
          where: { department: old.department },
          data: {
            spentBudget: {
              increment: old.totalCost,
            },
          },
        });
      }

      return pr;
    });

    logAuditTrail({
      actionType: 'APPROVE_PR',
      tableAffected: 'purchase_requests',
      recordId: prId,
      oldState: old,
      newState: updated,
    });

    // Notify Requisitioner (End User)
    if (old.requestedById) {
      await createNotificationHelper({
        title: 'Purchase Request Approved',
        description: `Your Purchase Request ${old.prNumber} has been approved by the Administrative Approver.`,
        icon: '✅',
        userId: old.requestedById
      });
    }
    // Notify Procurement Officers
    await createNotificationHelper({
      title: 'PR Approved (Awaiting RFQ)',
      description: `Purchase Request ${old.prNumber} has been approved and is ready for RFQ drafting.`,
      icon: '📋',
      role: 'Procurement Officer'
    });

    revalidatePath('/', 'layout');
    revalidatePath('/dashboard/approver');
    revalidatePath('/dashboard/approver/history');
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error('Error approving PR:', error);
    return { success: false, error: error.message || 'Failed to approve PR.' };
  }
}

/**
 * Administrative Approver returns the PR for revision.
 * Releases (decrements) the department's spent budget.
 */
export async function returnPr(prId: number, remarks: string) {
  try {
    const { profile } = await requireRole('Administrative Approver');

    if (!remarks || !remarks.trim()) {
      return { success: false, error: 'Remarks are required when returning a request.' };
    }

    const old = await prisma.purchaseRequest.findUnique({ where: { id: prId } });
    if (!old) return { success: false, error: 'Purchase Request not found.' };

    if (old.status !== 'UnderReview') {
      return { success: false, error: 'Purchase Request must be Under Review to return for revision.' };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id: prId },
        data: { status: 'ReturnedForRevision' },
      });

      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: prId,
          status: 'ReturnedForRevision',
          remarks: remarks.trim(),
          changedById: profile.id,
        },
      });

      return pr;
    });

    logAuditTrail({
      actionType: 'RETURN_PR_FOR_REVISION',
      tableAffected: 'purchase_requests',
      recordId: prId,
      oldState: old,
      newState: updated,
    });

    // Notify Requisitioner (End User)
    if (old.requestedById) {
      await createNotificationHelper({
        title: 'Purchase Request Returned',
        description: `Your Purchase Request ${old.prNumber} has been returned for revision. Remarks: "${remarks}"`,
        icon: '↩️',
        userId: old.requestedById
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/dashboard/approver');
    revalidatePath('/dashboard/approver/history');
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error('Error returning PR:', error);
    return { success: false, error: error.message || 'Failed to return PR.' };
  }
}

/**
 * Administrative Approver rejects the Purchase Request.
 * Releases (decrements) the department's spent budget.
 */
export async function rejectPr(prId: number, remarks: string) {
  try {
    const { profile } = await requireRole('Administrative Approver');

    if (!remarks || !remarks.trim()) {
      return { success: false, error: 'Remarks are required when rejecting a request.' };
    }

    const old = await prisma.purchaseRequest.findUnique({ where: { id: prId } });
    if (!old) return { success: false, error: 'Purchase Request not found.' };

    if (old.status !== 'UnderReview') {
      return { success: false, error: 'Purchase Request must be Under Review to reject.' };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id: prId },
        data: { status: 'Rejected' },
      });

      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: prId,
          status: 'Rejected',
          remarks: remarks.trim(),
          changedById: profile.id,
        },
      });

      return pr;
    });

    logAuditTrail({
      actionType: 'REJECT_PR',
      tableAffected: 'purchase_requests',
      recordId: prId,
      oldState: old,
      newState: updated,
    });

    // Notify Requisitioner (End User)
    if (old.requestedById) {
      await createNotificationHelper({
        title: 'Purchase Request Rejected',
        description: `Your Purchase Request ${old.prNumber} has been rejected. Reason: "${remarks}"`,
        icon: '❌',
        userId: old.requestedById
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/dashboard/approver');
    revalidatePath('/dashboard/approver/history');
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error('Error rejecting PR:', error);
    return { success: false, error: error.message || 'Failed to reject PR.' };
  }
}
