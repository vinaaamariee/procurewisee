"use server";

import { prisma } from "@/lib/prisma";
import { PoStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { requireRole } from "@/lib/auth/get-user-profile";
import { createNotificationHelper } from "./notifications";

import { DEFAULT_FUND_SOURCE } from "@/lib/constants/fund-sources";

// ---------------------------------------------------------------------------
// Create PO from an approved recommendation / award
// ---------------------------------------------------------------------------
export async function createPoFromAwardAction(recommendationId: number) {
  try {
    await requireRole("Procurement Officer");
    const result = await prisma.$transaction(async (tx) => {
      const rec = await tx.recommendation.findUnique({
        where: { id: recommendationId },
        include: {
          supplier: true,
          supplierQuote: {
            include: {
              quoteDetails: {
                include: { rfqItem: true },
              },
            },
          },
          canvas: { include: { rfq: true } },
        },
      });

      if (!rec) throw new Error("Recommendation not found.");

      // Return existing PO if already drafted
      const existing = await tx.purchaseOrder.findFirst({
        where: { rfqId: rec.canvas.rfqId, supplierId: rec.supplierId },
      });
      if (existing) return { po: existing, supplierName: rec.supplier.companyName };

      // Generate PO number
      const year = new Date().getFullYear();
      const count = await tx.purchaseOrder.count({
        where: { poNumber: { startsWith: `PO-${year}-` } },
      });
      const seq = String(count + 1).padStart(4, "0");
      const poNumber = `PO-${year}-${seq}`;

      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId: rec.supplierId,
          rfqId: rec.canvas.rfqId,
          totalCost: rec.supplierQuote.totalQuotedAmount,
          deliveryTerms: "FOB Destination",
          paymentTerms: "15 days upon complete delivery",
          entityName: "Batanes State College",
          modeOfProcurement: "Small Value Procurement",
          placeOfDelivery: "BATANES STATE COLLEGE",
          fundCluster: DEFAULT_FUND_SOURCE,
          status: PoStatus.Draft,
        },
      });

      for (const detail of rec.supplierQuote.quoteDetails) {
        const itemTotal = Number(detail.unitPrice) * detail.quantityMultiplier;
        await tx.purchaseOrderItem.create({
          data: {
            poId: po.id,
            description: detail.rfqItem.particulars,
            quantity: detail.quantityMultiplier,
            unitPrice: detail.unitPrice,
            totalCost: new Prisma.Decimal(itemTotal),
          },
        });
      }

      return { po, supplierName: rec.supplier.companyName };
    });

    logAuditTrail({
      actionType: "CREATE_PO",
      tableAffected: "purchase_orders",
      recordId: result.po.id,
      newState: result.po,
    });

    await createNotificationHelper({
      title: "Purchase Order Generated",
      description: `Purchase Order ${result.po.poNumber} has been drafted for supplier "${result.supplierName}" following bidding awards.`,
      icon: "📝",
      role: "Procurement Officer",
    });
    await createNotificationHelper({
      title: "Purchase Order Generated",
      description: `Purchase Order ${result.po.poNumber} has been drafted and is ready for signing.`,
      icon: "📝",
      role: "Administrative Approver",
    });

    revalidatePath("/", "layout");
    return { success: true, po: result.po };
  } catch (error: any) {
    console.error("Error creating PO from award:", error);
    return { success: false, error: error.message || "Failed to create PO." };
  }
}

// ---------------------------------------------------------------------------
// Update PO header fields (Appendix 61 editable metadata)
// ---------------------------------------------------------------------------
export async function updatePoAction(
  id: number,
  data: {
    deliveryTerms?: string;
    paymentTerms?: string;
    status?: PoStatus;
    entityName?: string | null;
    modeOfProcurement?: string | null;
    placeOfDelivery?: string | null;
    dateOfDelivery?: string | null;
    fundCluster?: string | null;
    orsBursNumber?: string | null;
    fundsAvailable?: number | null;
    dateOfOrsBurs?: string | null;
    chiefAccountantName?: string | null;
    authorizedOfficialName?: string | null;
  }
) {
  try {
    if (data.status === PoStatus.Approved) {
      await requireRole("Administrative Approver");
    } else {
      await requireRole("Procurement Officer");
    }
    const old = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PO not found." };

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        deliveryTerms: data.deliveryTerms ?? old.deliveryTerms,
        paymentTerms: data.paymentTerms ?? old.paymentTerms,
        status: data.status ?? old.status,
        ...(data.entityName !== undefined && { entityName: data.entityName }),
        ...(data.modeOfProcurement !== undefined && { modeOfProcurement: data.modeOfProcurement }),
        ...(data.placeOfDelivery !== undefined && { placeOfDelivery: data.placeOfDelivery }),
        ...(data.dateOfDelivery !== undefined && {
          dateOfDelivery: data.dateOfDelivery ? new Date(data.dateOfDelivery) : null,
        }),
        ...(data.fundCluster !== undefined && { fundCluster: data.fundCluster }),
        ...(data.orsBursNumber !== undefined && { orsBursNumber: data.orsBursNumber }),
        ...(data.fundsAvailable !== undefined && {
          fundsAvailable: data.fundsAvailable !== null ? new Prisma.Decimal(data.fundsAvailable) : null,
        }),
        ...(data.dateOfOrsBurs !== undefined && {
          dateOfOrsBurs: data.dateOfOrsBurs ? new Date(data.dateOfOrsBurs) : null,
        }),
        ...(data.chiefAccountantName !== undefined && { chiefAccountantName: data.chiefAccountantName }),
        ...(data.authorizedOfficialName !== undefined && { authorizedOfficialName: data.authorizedOfficialName }),
      },
    });

    logAuditTrail({
      actionType: "UPDATE_PO",
      tableAffected: "purchase_orders",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, po: updated };
  } catch (error: any) {
    console.error("Error updating PO:", error);
    return { success: false, error: error.message || "Failed to update PO." };
  }
}

// ---------------------------------------------------------------------------
// Approve PO (shorthand)
// ---------------------------------------------------------------------------
export async function approvePoAction(id: number) {
  return await updatePoAction(id, { status: PoStatus.Approved });
}

// ---------------------------------------------------------------------------
// Update PO status (extended workflow transitions)
// ---------------------------------------------------------------------------
export async function updatePoStatusAction(id: number, status: PoStatus) {
  try {
    await requireRole("Procurement Officer");
    const old = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PO not found." };

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    });

    logAuditTrail({
      actionType: "STATUS_CHANGE_PO",
      tableAffected: "purchase_orders",
      recordId: id,
      oldState: { status: old.status },
      newState: { status },
    });

    revalidatePath("/", "layout");
    return { success: true, po: updated };
  } catch (error: any) {
    console.error("Error updating PO status:", error);
    return { success: false, error: error.message || "Failed to update PO status." };
  }
}

// ---------------------------------------------------------------------------
// Upsert ALL items for a PO (replace-all strategy)
// ---------------------------------------------------------------------------
export interface PoItemInput {
  description: string;
  brand?: string | null;
  specification?: string | null;
  unit?: string | null;
  stockNo?: string | null;
  quantity: number;
  unitPrice: number;
}

export async function upsertPoItemsAction(poId: number, items: PoItemInput[]) {
  try {
    await requireRole("Procurement Officer");
    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
    if (!po) return { success: false, error: "PO not found." };
    if (po.status !== "Draft") return { success: false, error: "Can only edit items on a Draft PO." };

    await prisma.$transaction(async (tx) => {
      // Delete all existing items
      await tx.purchaseOrderItem.deleteMany({ where: { poId } });

      // Recompute total
      let newTotal = 0;
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;
        newTotal += itemTotal;
        await tx.purchaseOrderItem.create({
          data: {
            poId,
            description: item.description,
            brand: item.brand ?? null,
            specification: item.specification ?? null,
            unit: item.unit ?? null,
            stockNo: item.stockNo ?? null,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalCost: new Prisma.Decimal(itemTotal),
          },
        });
      }

      // Update PO total
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { totalCost: new Prisma.Decimal(newTotal) },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting PO items:", error);
    return { success: false, error: error.message || "Failed to save PO items." };
  }
}

// ---------------------------------------------------------------------------
// Delete a single PO item
// ---------------------------------------------------------------------------
export async function deletePoItemAction(itemId: number) {
  try {
    await requireRole("Procurement Officer");
    const item = await prisma.purchaseOrderItem.findUnique({
      where: { id: itemId },
      include: { po: true },
    });
    if (!item) return { success: false, error: "Item not found." };
    if (item.po.status !== "Draft") return { success: false, error: "Can only delete items on a Draft PO." };

    await prisma.purchaseOrderItem.delete({ where: { id: itemId } });

    // Recalculate total
    const remaining = await prisma.purchaseOrderItem.findMany({ where: { poId: item.poId } });
    const newTotal = remaining.reduce((s, i) => s + Number(i.totalCost), 0);
    await prisma.purchaseOrder.update({
      where: { id: item.poId },
      data: { totalCost: new Prisma.Decimal(newTotal) },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting PO item:", error);
    return { success: false, error: error.message || "Failed to delete item." };
  }
}

// ---------------------------------------------------------------------------
// Fetch all POs (with filters)
// ---------------------------------------------------------------------------
export async function getPurchaseOrders(filters?: { supplierId?: number; status?: PoStatus }) {
  try {
    const where: any = {};
    if (filters?.supplierId) where.supplierId = filters.supplierId;
    if (filters?.status) where.status = filters.status;

    return await prisma.purchaseOrder.findMany({
      where,
      include: { supplier: true, items: true, rfq: true, pr: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching POs:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Log PO print action
// ---------------------------------------------------------------------------
export async function logPoPrintedAction(poId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { supplier: true },
    });
    if (!po) return { success: false, error: "PO not found" };

    logAuditTrail({
      actionType: "PRINT_PO",
      tableAffected: "purchase_orders",
      recordId: poId,
      newState: po,
    });

    await createNotificationHelper({
      title: "Purchase Order Printed",
      description: `Purchase Order ${po.poNumber} for supplier "${po.supplier.companyName}" was printed by ${profile.fullName}.`,
      icon: "🖨️",
      role: "Procurement Officer",
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error logging PO print:", err);
    return { success: false, error: err.message };
  }
}
