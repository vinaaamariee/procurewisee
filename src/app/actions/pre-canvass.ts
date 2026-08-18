"use server";

import { prisma } from "@/lib/prisma";
import { PreCanvassStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { requireRole, getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { createNotificationHelper } from "./notifications";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SupplierSelection {
  supplierId: number;
}

interface PreCanvassResponseItemInput {
  prItemId: number;
  unitPrice: number;
  quantityQuoted?: number;
  quantityAvailable?: number;
  isAvailable: boolean;
  deliveryDays?: number;
  remarks?: string;
}

interface PreCanvassResponseInput {
  preCanvassId: number;
  quotationNumber?: string;
  quotationDate?: Date | string;
  items: PreCanvassResponseItemInput[];
  remarks?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Generate Pre-Canvass Number
// ─────────────────────────────────────────────────────────────────────────────

function generatePreCanvassNumber(): string {
  const year = new Date().getFullYear();
  const ref = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PC-${year}-${ref}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE PRE-CANVASS
// ─────────────────────────────────────────────────────────────────────────────

export async function createPreCanvassAction(prId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: prId },
      include: { preCanvass: true },
    });

    if (!pr) {
      return { success: false, error: "Purchase Request not found." };
    }

    if (pr.preCanvass) {
      return {
        success: false,
        error: "This Purchase Request already has a pre-canvass record.",
      };
    }

    // PR must be approved or received (in procurement review)
    const validStatuses = ["Approved", "Received", "PendingProcurementReview"];
    if (!validStatuses.includes(pr.status)) {
      return {
        success: false,
        error: `PR must be approved or in procurement review before creating a pre-canvass. Current status: ${pr.status}`,
      };
    }

    const preCanvassNumber = generatePreCanvassNumber();

    const result = await prisma.$transaction(async (tx) => {
      const preCanvass = await tx.preCanvass.create({
        data: {
          preCanvassNumber,
          prId: pr.id,
          status: PreCanvassStatus.Draft,
          createdById: profile.id,
        },
      });

      await logAuditTrail({
        actionType: "CREATE_PRE_CANVASS",
        tableAffected: "pre_canvasses",
        recordId: preCanvass.id,
        newState: preCanvass,
        tx,
      });

      return preCanvass;
    });

    revalidatePath("/", "layout");
    return { success: true, preCanvass: result };
  } catch (error: any) {
    console.error("Error creating pre-canvass:", error);
    return {
      success: false,
      error: error.message || "Failed to create pre-canvass.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SELECT SUPPLIERS (exactly 3 required)
// ─────────────────────────────────────────────────────────────────────────────

export async function selectPreCanvassSuppliersAction(
  preCanvassId: number,
  suppliers: SupplierSelection[]
) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    // Validate exactly 3 suppliers
    if (suppliers.length !== 3) {
      return {
        success: false,
        error: "Exactly 3 suppliers must be selected for pre-canvassing.",
      };
    }

    // Check for duplicate supplier IDs
    const supplierIds = suppliers.map((s) => s.supplierId);
    const uniqueIds = new Set(supplierIds);
    if (uniqueIds.size !== 3) {
      return {
        success: false,
        error: "Duplicate suppliers are not allowed. Please select 3 unique suppliers.",
      };
    }

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
      include: { suppliers: true },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    if (preCanvass.status !== PreCanvassStatus.Draft) {
      return {
        success: false,
        error: "Suppliers can only be selected when the pre-canvass is in Draft status.",
      };
    }

    // Validate all suppliers exist and are active
    const dbSuppliers = await prisma.supplier.findMany({
      where: {
        id: { in: supplierIds },
      },
    });

    if (dbSuppliers.length !== 3) {
      return {
        success: false,
        error: "One or more selected suppliers do not exist or are inactive.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Delete existing supplier selections if any
      await tx.preCanvassSupplier.deleteMany({
        where: { preCanvassId },
      });

      // Create new supplier selections
      const createdSuppliers = await Promise.all(
        suppliers.map((s) =>
          tx.preCanvassSupplier.create({
            data: {
              preCanvassId,
              supplierId: s.supplierId,
              selectedById: profile.id,
              responseStatus: "Pending",
            },
          })
        )
      );

      // Update pre-canvass status
      const updated = await tx.preCanvass.update({
        where: { id: preCanvassId },
        data: { status: PreCanvassStatus.SuppliersSelected },
      });

      await logAuditTrail({
        actionType: "SELECT_PRE_CANVASS_SUPPLIERS",
        tableAffected: "pre_canvass_suppliers",
        recordId: preCanvassId,
        oldState: { suppliers: preCanvass.suppliers },
        newState: { suppliers: createdSuppliers },
        tx,
      });

      return updated;
    });

    revalidatePath("/", "layout");
    return { success: true, preCanvass: result };
  } catch (error: any) {
    console.error("Error selecting pre-canvass suppliers:", error);
    return {
      success: false,
      error: error.message || "Failed to select suppliers.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SEND PRE-CANVASS TO SUPPLIERS
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPreCanvassAction(preCanvassId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
      include: {
        suppliers: true,
        purchaseRequest: true,
      },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    if (preCanvass.status !== PreCanvassStatus.SuppliersSelected) {
      return {
        success: false,
        error: "Pre-canvass must have exactly 3 suppliers selected before sending.",
      };
    }

    if (preCanvass.suppliers.length !== 3) {
      return {
        success: false,
        error: "Exactly 3 suppliers must be selected. Current count: " + preCanvass.suppliers.length,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update status to Sent and record sentAt timestamp
      const updated = await tx.preCanvass.update({
        where: { id: preCanvassId },
        data: {
          status: PreCanvassStatus.Sent,
          sentAt: new Date(),
        },
      });

      // Update all suppliers to Invited status
      await tx.preCanvassSupplier.updateMany({
        where: { preCanvassId },
        data: {
          responseStatus: "Invited",
          invitedAt: new Date(),
        },
      });

      await logAuditTrail({
        actionType: "SEND_PRE_CANVASS",
        tableAffected: "pre_canvasses",
        recordId: preCanvassId,
        oldState: { status: preCanvass.status },
        newState: { status: PreCanvassStatus.Sent },
        tx,
      });

      return updated;
    });

    // Notify suppliers (in real implementation, this would send emails)
    const suppliers = await prisma.preCanvassSupplier.findMany({
      where: { preCanvassId },
      include: { supplier: true },
    });

    for (const ps of suppliers) {
      await createNotificationHelper({
        title: "Pre-Canvass Request",
        description: `You have been invited to submit a pre-canvass quotation for PR ${preCanvass.purchaseRequest.prNumber}.`,
        icon: "📋",
        role: "Supplier",
      });
    }

    // Notify procurement officer
    await createNotificationHelper({
      title: "Pre-Canvass Sent",
      description: `Pre-canvass ${preCanvass.preCanvassNumber} has been sent to ${suppliers.length} suppliers.`,
      icon: "📤",
      userId: profile.id,
    });

    revalidatePath("/", "layout");
    return { success: true, preCanvass: result };
  } catch (error: any) {
    console.error("Error sending pre-canvass:", error);
    return {
      success: false,
      error: error.message || "Failed to send pre-canvass.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUBMIT SUPPLIER RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export async function submitPreCanvassResponseAction(
  input: PreCanvassResponseInput
) {
  try {
    const { profile } = await requireRole("Supplier");

    if (!profile.supplierId) {
      return { success: false, error: "Your account is not linked to a supplier." };
    }

    const preCanvassSupplier = await prisma.preCanvassSupplier.findUnique({
      where: { id: input.preCanvassId },
      include: {
        preCanvass: true,
        response: true,
      },
    });

    if (!preCanvassSupplier) {
      return { success: false, error: "Pre-canvass supplier record not found." };
    }

    // Verify the authenticated supplier owns this invitation
    if (preCanvassSupplier.supplierId !== profile.supplierId) {
      return { success: false, error: "You are not authorized to respond to this pre-canvass." };
    }

    // Verify the pre-canvass is open for responses
    if (preCanvassSupplier.preCanvass.status !== PreCanvassStatus.Sent) {
      return {
        success: false,
        error: "This pre-canvass is not currently accepting responses.",
      };
    }

    // Verify supplier has already responded
    if (preCanvassSupplier.response) {
      return {
        success: false,
        error: "You have already submitted a response for this pre-canvass.",
      };
    }

    // Validate at least one item is provided
    if (!input.items || input.items.length === 0) {
      return {
        success: false,
        error: "At least one item must be included in the response.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the response
      const response = await tx.preCanvassResponse.create({
        data: {
          preCanvassId: preCanvassSupplier.preCanvassId,
          preCanvassSupplierId: preCanvassSupplier.id,
          quotationNumber: input.quotationNumber || null,
          quotationDate: input.quotationDate ? new Date(input.quotationDate) : null,
          remarks: input.remarks || null,
          submittedAt: new Date(),
        },
      });

      // Create response items
      for (const item of input.items) {
        await tx.preCanvassResponseItem.create({
          data: {
            responseId: response.id,
            prItemId: item.prItemId,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            quantityQuoted: item.quantityQuoted || null,
            quantityAvailable: item.quantityAvailable || null,
            isAvailable: item.isAvailable,
            deliveryDays: item.deliveryDays || null,
            remarks: item.remarks || null,
          },
        });
      }

      // Update supplier response status
      await tx.preCanvassSupplier.update({
        where: { id: preCanvassSupplier.id },
        data: {
          responseStatus: "Submitted",
          respondedAt: new Date(),
        },
      });

      // Check if all 3 suppliers have responded
      const allSuppliers = await tx.preCanvassSupplier.findMany({
        where: { preCanvassId: preCanvassSupplier.preCanvassId },
      });

      const respondedCount = allSuppliers.filter(
        (s) => s.responseStatus === "Submitted"
      ).length;

      // Update pre-canvass status based on responses
      let newStatus: PreCanvassStatus;
      if (respondedCount === allSuppliers.length) {
        newStatus = PreCanvassStatus.FullyResponded;
      } else {
        newStatus = PreCanvassStatus.PartiallyResponded;
      }

      await tx.preCanvass.update({
        where: { id: preCanvassSupplier.preCanvassId },
        data: { status: newStatus },
      });

      await logAuditTrail({
        actionType: "SUBMIT_PRE_CANVASS_RESPONSE",
        tableAffected: "pre_canvass_responses",
        recordId: response.id,
        newState: response,
        tx,
      });

      return response;
    });

    revalidatePath("/", "layout");
    return { success: true, response: result };
  } catch (error: any) {
    console.error("Error submitting pre-canvass response:", error);
    return {
      success: false,
      error: error.message || "Failed to submit response.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENERATE PRE-CANVASS ABSTRACT (AOQ)
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePreCanvassAbstractAction(preCanvassId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
      include: {
        suppliers: {
          include: {
            supplier: true,
            response: {
              include: {
                items: true,
              },
            },
          },
        },
        purchaseRequest: {
          include: {
            items: true,
          },
        },
        abstract: true,
      },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    if (
      preCanvass.status !== PreCanvassStatus.FullyResponded &&
      preCanvass.status !== PreCanvassStatus.PartiallyResponded
    ) {
      return {
        success: false,
        error: "Pre-canvass must have at least one supplier response before generating an abstract.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Delete existing abstract if regenerating
      if (preCanvass.abstract) {
        await tx.preCanvassAbstract.delete({
          where: { preCanvassId },
        });
      }

      // Create new abstract
      const abstract = await tx.preCanvassAbstract.create({
        data: {
          preCanvassId,
          generatedById: profile.id,
          status: "Generated",
        },
      });

      await logAuditTrail({
        actionType: "GENERATE_PRE_CANVASS_ABSTRACT",
        tableAffected: "pre_canvass_abstracts",
        recordId: abstract.id,
        newState: abstract,
        tx,
      });

      return abstract;
    });

    revalidatePath("/", "layout");
    return { success: true, abstract: result };
  } catch (error: any) {
    console.error("Error generating pre-canvass abstract:", error);
    return {
      success: false,
      error: error.message || "Failed to generate abstract.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET PRE-CANVASS DATA
// ─────────────────────────────────────────────────────────────────────────────

export async function getPreCanvassAction(preCanvassId: number) {
  try {
    await getAuthenticatedUser();

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
      include: {
        purchaseRequest: {
          include: {
            items: {
              include: {
                unit: true,
                product: true,
              },
            },
          },
        },
        suppliers: {
          include: {
            supplier: true,
            selectedBy: true,
            response: {
              include: {
                items: true,
              },
            },
          },
        },
        abstract: true,
        createdBy: true,
      },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    return { success: true, preCanvass };
  } catch (error: any) {
    console.error("Error fetching pre-canvass:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch pre-canvass.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET PRE-CANVASS BY PR
// ─────────────────────────────────────────────────────────────────────────────

export async function getPreCanvassByPrAction(prId: number) {
  try {
    await getAuthenticatedUser();

    const preCanvassRecord = await prisma.preCanvass.findUnique({
      where: { prId },
      include: {
        purchaseRequest: true,
        suppliers: {
          include: {
            supplier: true,
            response: {
              include: {
                items: true,
              },
            },
          },
        },
        abstract: true,
      },
    });

    return { success: true, preCanvass: preCanvassRecord };
  } catch (error: any) {
    console.error("Error fetching pre-canvass by PR:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch pre-canvass.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CLOSE PRE-CANVASS
// ─────────────────────────────────────────────────────────────────────────────

export async function closePreCanvassAction(preCanvassId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    if (
      preCanvass.status === PreCanvassStatus.Closed ||
      preCanvass.status === PreCanvassStatus.Cancelled
    ) {
      return {
        success: false,
        error: "Pre-canvass is already closed or cancelled.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update any Pending/Invited suppliers to NoResponse
      await tx.preCanvassSupplier.updateMany({
        where: {
          preCanvassId,
          responseStatus: { in: ["Pending", "Invited"] },
        },
        data: {
          responseStatus: "NoResponse",
        },
      });

      const updated = await tx.preCanvass.update({
        where: { id: preCanvassId },
        data: {
          status: PreCanvassStatus.Closed,
          closedAt: new Date(),
        },
      });

      await logAuditTrail({
        actionType: "CLOSE_PRE_CANVASS",
        tableAffected: "pre_canvasses",
        recordId: preCanvassId,
        oldState: { status: preCanvass.status },
        newState: { status: PreCanvassStatus.Closed },
        tx,
      });

      return updated;
    });

    revalidatePath("/", "layout");
    return { success: true, preCanvass: result };
  } catch (error: any) {
    console.error("Error closing pre-canvass:", error);
    return {
      success: false,
      error: error.message || "Failed to close pre-canvass.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. CANCEL PRE-CANVASS
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelPreCanvassAction(
  preCanvassId: number,
  remarks: string
) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    if (!remarks || !remarks.trim()) {
      return {
        success: false,
        error: "A reason is required when cancelling a pre-canvass.",
      };
    }

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    if (
      preCanvass.status === PreCanvassStatus.Closed ||
      preCanvass.status === PreCanvassStatus.Cancelled
    ) {
      return {
        success: false,
        error: "Pre-canvass is already closed or cancelled.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.preCanvass.update({
        where: { id: preCanvassId },
        data: {
          status: PreCanvassStatus.Cancelled,
          remarks: remarks.trim(),
          closedAt: new Date(),
        },
      });

      await logAuditTrail({
        actionType: "CANCEL_PRE_CANVASS",
        tableAffected: "pre_canvasses",
        recordId: preCanvassId,
        oldState: { status: preCanvass.status },
        newState: { status: PreCanvassStatus.Cancelled, remarks: remarks.trim() },
        tx,
      });

      return updated;
    });

    revalidatePath("/", "layout");
    return { success: true, preCanvass: result };
  } catch (error: any) {
    console.error("Error cancelling pre-canvass:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel pre-canvass.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. LIST AVAILABLE SUPPLIERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAvailableSuppliersAction() {
  try {
    await requireRole("Procurement Officer");

    const suppliers = await prisma.supplier.findMany({
      where: {
        // In a real system, you might filter by eligibility, verification status, etc.
      },
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        contactNumber: true,
        businessAddress: true,
        reliabilityRating: true,
        isVerified: true,
        historicalDeliveryDays: true,
        onTimeDeliveryRate: true,
      },
      orderBy: { companyName: "asc" },
    });

    return { success: true, suppliers };
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch suppliers.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10b. GET SUPPLIER PRE-CANVASS RESPONSES (for supplier-facing UI)
// ─────────────────────────────────────────────────────────────────────────────

export async function getSupplierPreCanvassResponsesAction() {
  try {
    const { profile } = await requireRole("Supplier");

    if (!profile.supplierId) {
      return { success: false, error: "Your account is not linked to a supplier." };
    }

    const preCanvassSuppliers = await prisma.preCanvassSupplier.findMany({
      where: { supplierId: profile.supplierId },
      include: {
        preCanvass: {
          include: {
            purchaseRequest: {
              include: {
                items: {
                  include: {
                    unit: true,
                    product: true,
                  },
                },
              },
            },
          },
        },
        response: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, preCanvassSuppliers };
  } catch (error: any) {
    console.error("Error fetching supplier pre-canvass responses:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch supplier responses.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10c. GET SUPPLIER PRE-CANVASS DETAIL (for response submission)
// ─────────────────────────────────────────────────────────────────────────────

export async function getSupplierPreCanvassDetailAction(
  preCanvassId: number
) {
  try {
    const { profile } = await requireRole("Supplier");

    if (!profile.supplierId) {
      return { success: false, error: "Your account is not linked to a supplier." };
    }

    // Verify the supplier is part of this pre-canvass
    const preCanvassSupplier = await prisma.preCanvassSupplier.findFirst({
      where: {
        preCanvassId,
        supplierId: profile.supplierId,
      },
      include: {
        preCanvass: {
          include: {
            purchaseRequest: {
              include: {
                items: {
                  include: {
                    unit: true,
                    product: true,
                  },
                },
              },
            },
          },
        },
        response: {
          include: {
            items: true,
          },
        },
        supplier: true,
      },
    });

    if (!preCanvassSupplier) {
      return {
        success: false,
        error: "You are not authorized to access this pre-canvass.",
      };
    }

    return { success: true, preCanvassSupplier };
  } catch (error: any) {
    console.error("Error fetching supplier pre-canvass detail:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch pre-canvass detail.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. GET PRE-CANVASS ABSTRACT DATA (for AOQ generation)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPreCanvassAbstractDataAction(preCanvassId: number) {
  try {
    await requireRole("Procurement Officer");

    const preCanvass = await prisma.preCanvass.findUnique({
      where: { id: preCanvassId },
      include: {
        purchaseRequest: {
          include: {
            items: {
              include: {
                unit: true,
                product: true,
              },
            },
          },
        },
        suppliers: {
          include: {
            supplier: true,
            response: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!preCanvass) {
      return { success: false, error: "Pre-Canvass not found." };
    }

    // Build comparison data for each PR item
    const prItems = preCanvass.purchaseRequest.items;
    const comparisons = prItems.map((prItem) => {
      const supplierPrices = preCanvass.suppliers.map((pcs) => {
        const responseItem = pcs.response?.items.find(
          (ri) => ri.prItemId === prItem.id
        );

        return {
          supplierId: pcs.supplierId,
          supplierName: pcs.supplier.companyName,
          unitPrice: responseItem ? Number(responseItem.unitPrice) : null,
          quantityAvailable: responseItem?.quantityAvailable || null,
          isAvailable: responseItem?.isAvailable ?? false,
          deliveryDays: responseItem?.deliveryDays || null,
          remarks: responseItem?.remarks || null,
          responded: pcs.responseStatus === "Submitted",
        };
      });

      // Find lowest available price
      const availablePrices = supplierPrices
        .filter((sp) => sp.isAvailable && sp.unitPrice !== null)
        .sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0));

      return {
        prItemId: prItem.id,
        description: prItem.description,
        specification: prItem.specification,
        quantity: prItem.quantity,
        unit: prItem.unit?.abbreviation || "unit",
        estimatedUnitCost: Number(prItem.estimatedUnitCost),
        supplierPrices,
        lowestPrice: availablePrices.length > 0 ? availablePrices[0].unitPrice : null,
        lowestSupplier: availablePrices.length > 0 ? availablePrices[0].supplierName : null,
        hasIncompleteData: supplierPrices.some((sp) => !sp.responded),
      };
    });

    return {
      success: true,
      preCanvassNumber: preCanvass.preCanvassNumber,
      prNumber: preCanvass.purchaseRequest.prNumber,
      department: preCanvass.purchaseRequest.department,
      office: preCanvass.purchaseRequest.office,
      purpose: preCanvass.purchaseRequest.purpose,
      comparisons,
    };
  } catch (error: any) {
    console.error("Error fetching pre-canvass abstract data:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch abstract data.",
    };
  }
}
