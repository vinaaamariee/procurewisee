'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface QuoteDetailInput {
  rfqItemId: number;
  unitPrice: number;
  isAvailable: boolean;
}

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
    await prisma.$transaction(async (tx) => {
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
      await tx.supplierQuote.create({
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
    });

    revalidatePath('/dashboard/supplier');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting quote:', error);
    return { success: false, error: error.message || 'Failed to submit quote.' };
  }
}
