'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/get-user-profile';
import { revalidatePath } from 'next/cache';
import { logAuditTrail } from '@/lib/audit';

/**
 * Creates acknowledgement log entries for all suppliers invited to an RFQ.
 * Called when an Officer opens the Annex E tab for the first time.
 */
export async function initRfqAcknowledgementsAction(rfqId: number) {
  await requireRole('Procurement Officer');
  try {
    const quotes = await prisma.supplierQuote.findMany({
      where: { rfqId },
      select: { supplierId: true, supplier: { select: { companyName: true } } },
    });

    const results = await Promise.all(
      quotes.map((q) =>
        (prisma as any).rfqAcknowledgementLog.upsert({
          where: { rfqId_supplierId: { rfqId, supplierId: q.supplierId } },
          update: {},
          create: {
            rfqId,
            supplierId: q.supplierId,
            acknowledged: false,
          },
        })
      )
    );

    revalidatePath('/dashboard/officer/rfq/[id]', 'page');
    return { success: true, count: results.length };
  } catch (error: any) {
    console.error('Error initializing RFQ acknowledgements:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates the acknowledgement record for a specific supplier on an RFQ.
 */
export async function updateRfqAcknowledgementAction(
  id: number,
  data: {
    receivedBy?: string;
    dateReceived?: string | null;
    acknowledged?: boolean;
  }
) {
  await requireRole('Procurement Officer');
  try {
    const updated = await (prisma as any).rfqAcknowledgementLog.update({
      where: { id },
      data: {
        receivedBy: data.receivedBy ?? undefined,
        dateReceived: data.dateReceived ? new Date(data.dateReceived) : undefined,
        acknowledged: data.acknowledged ?? undefined,
      },
    });

    logAuditTrail({
      actionType: 'UPDATE_RFQ_ACK',
      tableAffected: 'rfq_acknowledgement_logs',
      recordId: id,
      newState: updated,
    });

    revalidatePath('/dashboard/officer/rfq/[id]', 'page');
    return { success: true, log: updated };
  } catch (error: any) {
    console.error('Error updating RFQ acknowledgement:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Manually adds a supplier to an RFQ's acknowledgement list.
 * Used when a supplier is invited but has no submitted quote yet.
 */
export async function addSupplierToRfqAckAction(rfqId: number, supplierId: number) {
  await requireRole('Procurement Officer');
  try {
    const log = await (prisma as any).rfqAcknowledgementLog.upsert({
      where: { rfqId_supplierId: { rfqId, supplierId } },
      update: {},
      create: { rfqId, supplierId, acknowledged: false },
    });

    revalidatePath('/dashboard/officer/rfq/[id]', 'page');
    return { success: true, log };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves all acknowledgement log entries for an RFQ, with supplier details.
 */
export async function getRfqAcknowledgementsAction(rfqId: number) {
  await requireRole(['Procurement Officer', 'Administrative Approver']);
  try {
    const logs = await (prisma as any).rfqAcknowledgementLog.findMany({
      where: { rfqId },
      include: {
        supplier: {
          select: { id: true, companyName: true, contactPerson: true, contactNumber: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message, logs: [] };
  }
}
