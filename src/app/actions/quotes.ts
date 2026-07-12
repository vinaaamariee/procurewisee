'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logAuditTrail } from '@/lib/audit';
import { createNotificationHelper } from './notifications';

interface QuoteDetailInput {
  rfqItemId: number;
  unitPrice: number;
  isAvailable: boolean;
}

/**
 * Submits a quote from a supplier for a specific RFQ.
 * Cleans up any existing quote from the same supplier and updates within a database transaction.
 */
export async function submitQuoteAction({
  rfqId,
  supplierId,
  offeredDeliveryDays,
  quoteDetails,
}: {
  rfqId: number;
  supplierId: number;
  offeredDeliveryDays: number;
  quoteDetails: QuoteDetailInput[];
}) {
  try {
    // 1. Fetch RfqItems to get quantities for multiplier
    const rfqItems = await prisma.rfqItem.findMany({
      where: { rfqId },
    });

    const itemMap = new Map(rfqItems.map((item) => [item.id, item]));

    // 2. Compute total quoted amount
    let totalQuotedAmount = 0;
    const detailsToCreate: Array<{
      rfqItemId: number;
      unitPrice: number;
      quantityMultiplier: number;
      isAvailable: boolean;
    }> = [];

    for (const detail of quoteDetails) {
      const rfqItem = itemMap.get(detail.rfqItemId);
      if (!rfqItem) {
        throw new Error(`Item ID ${detail.rfqItemId} not found in RFQ ${rfqId}`);
      }

      const qty = rfqItem.quantity;
      const price = detail.isAvailable ? detail.unitPrice : 0;
      totalQuotedAmount += qty * price;

      detailsToCreate.push({
        rfqItemId: detail.rfqItemId,
        unitPrice: price,
        quantityMultiplier: qty,
        isAvailable: detail.isAvailable,
      });
    }

    // 3. Database Transaction: Clean up any old quote for this supplier and RFQ, then create new
    const result = await prisma.$transaction(async (tx) => {
      // Find existing quote
      const existingQuote = await tx.supplierQuote.findFirst({
        where: {
          rfqId,
          supplierId,
        },
      });

      if (existingQuote) {
        // Cascade delete will automatically delete child QuoteDetails
        await tx.supplierQuote.delete({
          where: { id: existingQuote.id },
        });
      }

      // Create new quote
      const newQuote = await tx.supplierQuote.create({
        data: {
          rfqId,
          supplierId,
          offeredDeliveryDays,
          totalQuotedAmount,
          status: 'Submitted',
          quoteDetails: {
            create: detailsToCreate,
          },
        },
      });

      return { existingQuote, newQuote };
    });

    logAuditTrail({
      actionType: 'SUBMIT_BID',
      tableAffected: 'supplier_quotes',
      recordId: result.newQuote.id,
      oldState: result.existingQuote,
      newState: result.newQuote,
    });

    // Notify Procurement Officer of Bid Submission
    const [supplier, rfq] = await Promise.all([
      prisma.supplier.findUnique({ where: { id: supplierId }, select: { companyName: true } }),
      prisma.requestForQuote.findUnique({ where: { id: rfqId }, select: { rfqNumber: true } })
    ]);

    await createNotificationHelper({
      title: 'Supplier Quote Received',
      description: `Supplier "${supplier?.companyName || 'Unknown'}" submitted a bid quote for RFQ ${rfq?.rfqNumber || 'N/A'}. Total quoted: ₱${Number(totalQuotedAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: '💵',
      role: 'Procurement Officer'
    });

    revalidatePath('/dashboard/supplier');
    revalidatePath(`/dashboard/supplier/rfq/${rfqId}`);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting quote:', error);
    return { success: false, error: error.message || 'Failed to submit quote.' };
  }
}

// Alias for compatibility
export const submitQuote = submitQuoteAction;

/**
 * Retrieves all supplier quotes submitted for a specific RFQ.
 */
export async function getQuotesForRfq(rfqId: number) {
  return await prisma.supplierQuote.findMany({
    where: { rfqId },
    include: {
      supplier: true,
      quoteDetails: {
        include: {
          rfqItem: true,
        },
      },
    },
    orderBy: {
      submissionDate: 'desc',
    },
  });
}
