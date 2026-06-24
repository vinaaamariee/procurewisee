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
}: {
  rfqNumber: string;
  title: string;
  approvedBudgetContract: number;
  deadlineDate: string;
  status: 'Draft' | 'Published';
  items: RfqItemInput[];
  overrideReason?: string;
  originalRfqNumber?: string;
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
          items: {
            create: items.map(item => ({
              itemNumber: item.itemNumber.trim(),
              particulars: item.particulars.trim(),
              quantity: item.quantity,
              unit: item.unit.trim(),
              appItemId: item.appItemId || null,
            })),
          },
        },
      });

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
