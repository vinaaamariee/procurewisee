'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/get-user-profile';
import { revalidatePath } from 'next/cache';
import { logAuditTrail } from '@/lib/audit';

interface RfqItemInput {
  itemNumber: string;
  particulars: string;
  quantity: number;
  unit: string;
  appItemId?: number | null;
  productId?: number | null;
}

export async function createRfqAction({
  rfqNumber,
  title,
  approvedBudgetContract,
  deadlineDate,
  status,
  items,
  overrideReason,
  originalRfqNumber,
  prId,
}: {
  rfqNumber: string;
  title: string;
  approvedBudgetContract: number;
  deadlineDate: string;
  status: 'Draft' | 'Published';
  items: RfqItemInput[];
  overrideReason?: string;
  originalRfqNumber?: string;
  prId?: number | null;
}) {
  try {
    // 1. Enforce Procurement Officer role and retrieve profile
    const { profile } = await requireRole('Procurement Officer');

    // 2. Server-side validations
    if (!rfqNumber || !rfqNumber.trim()) {
      return { success: false, error: 'RFQ Reference Number is required.' };
    }
    if (!title || !title.trim()) {
      return { success: false, error: 'RFQ Title is required.' };
    }
    if (approvedBudgetContract <= 0) {
      return { success: false, error: 'Approved Budget must be a positive number.' };
    }
    if (!deadlineDate) {
      return { success: false, error: 'Deadline Date is required.' };
    }
    if (items.length === 0) {
      return { success: false, error: 'At least one line item is required.' };
    }

    // Line item validations
    for (const item of items) {
      if (!item.itemNumber || !item.itemNumber.trim()) {
        return { success: false, error: 'Each item must have an Item Number.' };
      }
      if (!item.particulars || !item.particulars.trim()) {
        return { success: false, error: `Item ${item.itemNumber} particulars/specification cannot be empty.` };
      }
      if (item.quantity <= 0) {
        return { success: false, error: `Item ${item.itemNumber} quantity must be a positive number.` };
      }
      if (!item.unit || !item.unit.trim()) {
        return { success: false, error: `Item ${item.itemNumber} unit is required.` };
      }
    }

    // 3. Database Transaction: Check duplicate RFQ Number and insert records
    const result = await prisma.$transaction(async (tx) => {
      const existingRfq = await tx.requestForQuote.findUnique({
        where: { rfqNumber },
      });

      if (existingRfq) {
        throw new Error(`RFQ Number "${rfqNumber}" already exists.`);
      }

      const newRfq = await tx.requestForQuote.create({
        data: {
          rfqNumber: rfqNumber.trim(),
          title: title.trim(),
          approvedBudgetContract,
          deadlineDate: new Date(deadlineDate),
          status,
          createdById: profile.id,
          prId: prId || null,
          items: {
            create: items.map(item => ({
              itemNumber: item.itemNumber.trim(),
              particulars: item.particulars.trim(),
              quantity: item.quantity,
              unit: {
                connectOrCreate: {
                  where: { name: item.unit.trim() },
                  create: { name: item.unit.trim(), abbreviation: item.unit.trim().slice(0, 15) }
                }
              },
              ...(item.appItemId != null ? { appItem: { connect: { id: item.appItemId } } } : {}),
              ...(item.productId != null ? { product: { connect: { id: item.productId } } } : {}),
            })),
          },
        },
      });

      // If prId is provided, update PR status to ConvertedToRfq and add to status history
      if (prId) {
        const prCheck = await tx.purchaseRequest.findUnique({
          where: { id: prId },
          select: { status: true, prNumber: true },
        });

        if (prCheck?.status === 'ConvertedToRfq') {
          throw new Error(`Purchase Request ${prCheck.prNumber} is already converted to an RFQ.`);
        }

        await tx.purchaseRequest.update({
          where: { id: prId },
          data: { status: 'ConvertedToRfq' },
        });

        await tx.purchaseRequestStatusHistory.create({
          data: {
            purchaseRequestId: prId,
            status: 'ConvertedToRfq',
            remarks: `Converted to RFQ #${rfqNumber.trim()} by Procurement Staff`,
            changedById: profile.id,
          },
        });
      }

      return newRfq;
    });

    // 4. Log creation audit trail
    logAuditTrail({
      actionType: 'CREATE_RFQ',
      tableAffected: 'requests_for_quote',
      recordId: result.id,
      newState: result,
    });

    // 5. If sequence was overridden, log override audit trail
    if (overrideReason && overrideReason.trim()) {
      logAuditTrail({
        actionType: 'RFQ_NUMBER_OVERRIDE',
        tableAffected: 'requests_for_quote',
        recordId: result.id,
        oldState: { expectedRfqNumber: originalRfqNumber || 'unknown' },
        newState: { overriddenRfqNumber: rfqNumber.trim(), reason: overrideReason.trim() },
      });
    }

    revalidatePath('/dashboard/officer');
    return { success: true, rfqId: result.id };
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return { success: false, error: error.message || 'Failed to create RFQ.' };
  }
}
