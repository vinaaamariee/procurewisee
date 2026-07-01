'use server';

import { prisma } from "@/lib/prisma";
import { RfqStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";

/**
 * Creates a Request for Quote (RFQ) along with its requisition line items.
 * If no `rfqNumber` is provided, it auto-generates one in the format: RFQ-YYYY-MM-XXX.
 */
export async function createRfq(data: {
  rfqNumber?: string;
  title: string;
  approvedBudgetContract: number;
  deadlineDate: Date | string;
  status?: RfqStatus;
  createdById?: string | null;
  items: Array<{
    itemNumber: string;
    particulars: string;
    quantity: number;
    unit: string;
    appItemId?: number | null;
    productId?: number | null;
  }>;
}) {
  try {
    let rfqNumber = data.rfqNumber;
    if (!rfqNumber) {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      // Compute total count to increment suffix
      const count = await prisma.requestForQuote.count();
      rfqNumber = `RFQ-${year}-${month}-${String(count + 1).padStart(3, '0')}`;
    }

    const createdRfq = await prisma.requestForQuote.create({
      data: {
        rfqNumber,
        title: data.title,
        approvedBudgetContract: data.approvedBudgetContract,
        deadlineDate: new Date(data.deadlineDate),
        status: data.status || RfqStatus.Draft,
        createdById: data.createdById || null,
        items: {
          create: data.items.map(item => ({
            itemNumber: item.itemNumber,
            particulars: item.particulars,
            quantity: item.quantity,
            unit: {
              connectOrCreate: {
                where: { name: item.unit.trim() },
                create: { name: item.unit.trim(), abbreviation: item.unit.trim().slice(0, 15) }
              }
            },
            appItemId: item.appItemId || null,
            productId: item.productId || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    logAuditTrail({
      actionType: "CREATE_RFQ",
      tableAffected: "requests_for_quote",
      recordId: createdRfq.id,
      newState: createdRfq,
    });

    revalidatePath("/", "layout");
    return { success: true, data: createdRfq };
  } catch (error: any) {
    console.error("Error creating RFQ:", error);
    return { success: false, error: error.message || "Failed to create RFQ." };
  }
}

// Alias to ensure compatibility with client-side component calls
export const createRfqAction = createRfq;

/**
 * Transitions an RFQ's status to `Published` (open for bidding).
 */
export async function publishRfq(rfqId: number) {
  const oldRfq = await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
  });

  const updated = await prisma.requestForQuote.update({
    where: { id: rfqId },
    data: { status: RfqStatus.Published },
  });

  logAuditTrail({
    actionType: "PUBLISH_RFQ",
    tableAffected: "requests_for_quote",
    recordId: rfqId,
    oldState: oldRfq,
    newState: updated,
  });

  revalidatePath("/", "layout");
  return updated;
}

/**
 * Transitions an RFQ's status to `Closed` (no longer accepting quotes).
 */
export async function closeRfq(rfqId: number) {
  const oldRfq = await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
  });

  const updated = await prisma.requestForQuote.update({
    where: { id: rfqId },
    data: { status: RfqStatus.Closed },
  });

  logAuditTrail({
    actionType: "CLOSE_RFQ",
    tableAffected: "requests_for_quote",
    recordId: rfqId,
    oldState: oldRfq,
    newState: updated,
  });

  revalidatePath("/", "layout");
  return updated;
}

/**
 * Retrieves a full RFQ record including its line items and all submitted supplier quotes.
 */
export async function getRfqWithQuotes(rfqId: number) {
  return await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
    include: {
      items: true,
      quotes: {
        include: {
          supplier: true,
          quoteDetails: true,
        },
      },
    },
  });
}
