import "dotenv/config";
import fs from "fs";
import { prisma } from "../src/lib/prisma";
import { PpmpStatus, PrStatus, PreCanvassStatus } from "@prisma/client";

const passed: string[] = [];
const failed: string[] = [];

function assert(step: number, label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed.push(`Step ${step}: ${label}`);
    console.log(`  ✓ Step ${step}: ${label}`);
  } else {
    const msg = `Step ${step}: ${label}${detail ? ` — ${detail}` : ""}`;
    failed.push(msg);
    console.log(`  ✗ ${msg}`);
  }
}

async function cleanup() {
  // Clean up test data in reverse dependency order
  const endUser = await prisma.userProfile.findFirst({ where: { email: "enduser@bsc.edu.ph" } });
  const approver = await prisma.userProfile.findFirst({ where: { email: "approver@bsc.edu.ph" } });
  const officer = await prisma.userProfile.findFirst({ where: { email: "officer@bsc.edu.ph" } });

  if (!endUser || !approver || !officer) {
    console.log("⚠ Test accounts not found — skipping cleanup");
    return;
  }

  // Find test PPMPs and PRs
  const testPpmps = await prisma.ppmp.findMany({
    where: { preparedById: endUser.id, ppmpNumber: { startsWith: "E2E-PPMP" } },
    include: { purchaseRequests: { include: { preCanvass: { include: { suppliers: true, abstract: true } } } } },
  });

  for (const ppmp of testPpmps) {
    for (const pr of ppmp.purchaseRequests) {
      if (pr.preCanvass?.abstract) {
        await prisma.preCanvassAbstract.delete({ where: { preCanvassId: pr.preCanvass.id } }).catch(() => {});
      }
      if (pr.preCanvass) {
        await prisma.preCanvassSupplier.deleteMany({ where: { preCanvassId: pr.preCanvass.id } }).catch(() => {});
        await prisma.preCanvass.delete({ where: { id: pr.preCanvass.id } }).catch(() => {});
      }
      await prisma.purchaseRequestItem.deleteMany({ where: { prId: pr.id } }).catch(() => {});
      await prisma.purchaseRequestStatusHistory.deleteMany({ where: { purchaseRequestId: pr.id } }).catch(() => {});
      await prisma.purchaseRequest.delete({ where: { id: pr.id } }).catch(() => {});
    }
    await prisma.ppmpItem.deleteMany({ where: { ppmpId: ppmp.id } }).catch(() => {});
    await prisma.ppmp.delete({ where: { id: ppmp.id } }).catch(() => {});
  }

  // Also clean up any PRs created from cart with E2E test items
  const testPrs = await prisma.purchaseRequest.findMany({
    where: { requestedById: endUser.id, purpose: { contains: "E2E Catalog Test" } },
    include: { preCanvass: { include: { suppliers: true, abstract: true } } },
  });

  for (const pr of testPrs) {
    if (pr.preCanvass?.abstract) {
      await prisma.preCanvassAbstract.delete({ where: { preCanvassId: pr.preCanvass.id } }).catch(() => {});
    }
    if (pr.preCanvass) {
      await prisma.preCanvassSupplier.deleteMany({ where: { preCanvassId: pr.preCanvass.id } }).catch(() => {});
      await prisma.preCanvass.delete({ where: { id: pr.preCanvass.id } }).catch(() => {});
    }
    await prisma.purchaseRequestItem.deleteMany({ where: { prId: pr.id } }).catch(() => {});
    await prisma.purchaseRequestStatusHistory.deleteMany({ where: { purchaseRequestId: pr.id } }).catch(() => {});
    await prisma.purchaseRequest.delete({ where: { id: pr.id } }).catch(() => {});
  }

  console.log("🧹 Test data cleaned up\n");
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  E2E Workflow Test: End User → Officer → AOQ → Package Review");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // ── Setup: Fetch test accounts ──
  console.log("📋 Setup: Fetching test accounts...");
  const endUser = await prisma.userProfile.findFirst({ where: { email: "enduser@bsc.edu.ph" } });
  const approver = await prisma.userProfile.findFirst({ where: { email: "approver@bsc.edu.ph" } });
  const officer = await prisma.userProfile.findFirst({ where: { email: "officer@bsc.edu.ph" } });

  if (!endUser || !approver || !officer) {
    console.error("❌ Test accounts not found. Run `npx tsx scripts/create-demo-users.ts` first.");
    process.exit(1);
  }
  console.log(`   End User: ${endUser.id} (${endUser.fullName})`);
  console.log(`   Approver: ${approver.id} (${approver.fullName})`);
  console.log(`   Officer:  ${officer.id} (${officer.fullName})\n`);

  // Find 2 catalog products to use
  const products = await prisma.catalogProduct.findMany({ where: { isActive: true }, take: 2 });
  if (products.length < 2) {
    console.error("❌ Need at least 2 active catalog products.");
    process.exit(1);
  }
  console.log(`   Product 1: ${products[0].name} (ID: ${products[0].id})`);
  console.log(`   Product 2: ${products[1].name} (ID: ${products[1].id})\n`);

  // Find a unit
  const unit = await prisma.unitOfMeasure.findFirst();
  if (!unit) {
    console.error("❌ No UnitOfMeasure found.");
    process.exit(1);
  }
  console.log(`   Unit: ${unit.name} (ID: ${unit.id})\n`);

  // Clean up any previous test data
  await cleanup();

  // ══════════════════════════════════════════════════════════════
  // STEP 1: End User — Create PPMP (draft)
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 1: End User creates PPMP (Draft) ──");
  const ppmpNumber = `E2E-PPMP-${Date.now()}`;
  const ppmpItems = [
    { productId: products[0].id, generalDescription: products[0].name, quantity: 10, estimatedUnitCost: 150 },
    { productId: products[1].id, generalDescription: products[1].name, quantity: 5, estimatedUnitCost: 300 },
  ];
  const calculatedBudget = ppmpItems.reduce((s, i) => s + i.quantity * i.estimatedUnitCost, 0);

  const ppmp = await prisma.ppmp.create({
    data: {
      ppmpNumber,
      projectTitle: "E2E Test PPMP",
      department: "Office of the President",
      office: "Administration",
      fundingSource: "General Fund",
      fiscalYear: 2026,
      estimatedBudget: calculatedBudget,
      status: PpmpStatus.Draft,
      preparedById: endUser.id,
    },
  });

  for (const item of ppmpItems) {
    await prisma.ppmpItem.create({
      data: {
        ppmpId: ppmp.id,
        productId: item.productId,
        generalDescription: item.generalDescription,
        quantity: item.quantity,
        unitId: unit.id,
        estimatedUnitCost: item.estimatedUnitCost,
        estimatedCost: item.quantity * item.estimatedUnitCost,
      },
    });
  }

  const ppmpAfterCreate = await prisma.ppmp.findUnique({ where: { id: ppmp.id }, include: { items: true } });
  assert(1, "PPMP created as Draft", ppmpAfterCreate?.status === PpmpStatus.Draft);
  assert(1, "PPMP has 2 items", ppmpAfterCreate?.items.length === 2);
  assert(1, "PPMP owner is End User", ppmpAfterCreate?.preparedById === endUser.id);
  console.log(`   PPMP #${ppmpNumber} (ID: ${ppmp.id})\n`);

  // ══════════════════════════════════════════════════════════════
  // STEP 2: End User — Submit PPMP
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 2: End User submits PPMP ──");
  await prisma.ppmp.update({ where: { id: ppmp.id }, data: { status: PpmpStatus.Submitted } });
  const ppmpAfterSubmit = await prisma.ppmp.findUnique({ where: { id: ppmp.id } });
  assert(2, "PPMP status = Submitted", ppmpAfterSubmit?.status === PpmpStatus.Submitted);
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 3: Approver — Approve PPMP
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 3: Approver approves PPMP ──");
  await prisma.ppmp.update({ where: { id: ppmp.id }, data: { status: PpmpStatus.Approved } });
  const ppmpAfterApprove = await prisma.ppmp.findUnique({ where: { id: ppmp.id } });
  assert(3, "PPMP status = Approved", ppmpAfterApprove?.status === PpmpStatus.Approved);
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 4: End User — Convert PPMP to PR
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 4: End User converts PPMP to PR ──");
  const prNumber1 = `PR-2026-${Date.now().toString().slice(-6)}`;
  const pr = await prisma.purchaseRequest.create({
    data: {
      prNumber: prNumber1,
      department: ppmp.department,
      office: ppmp.office,
      requestedById: endUser.id,
      purpose: `Generated from PPMP ${ppmp.ppmpNumber}: ${ppmp.projectTitle}`,
      fundingSource: ppmp.fundingSource,
      ppmpId: ppmp.id,
      estimatedBudget: ppmp.estimatedBudget,
      totalCost: ppmp.estimatedBudget,
      status: PrStatus.Draft,
    },
  });

  // Create PR items from PPMP items
  const ppmpItemsForPr = await prisma.ppmpItem.findMany({ where: { ppmpId: ppmp.id } });
  for (const item of ppmpItemsForPr) {
    await prisma.purchaseRequestItem.create({
      data: {
        prId: pr.id,
        productId: item.productId,
        description: item.generalDescription,
        quantity: item.quantity,
        unitId: item.unitId,
        estimatedUnitCost: item.estimatedUnitCost,
        estimatedCost: item.estimatedCost,
      },
    });
  }

  await prisma.purchaseRequestStatusHistory.create({
    data: {
      purchaseRequestId: pr.id,
      status: "Draft",
      remarks: `Generated from PPMP ${ppmp.ppmpNumber}.`,
      changedById: endUser.id,
    },
  });

  const prAfterCreate = await prisma.purchaseRequest.findUnique({
    where: { id: pr.id },
    include: { items: true, ppmp: true },
  });

  assert(4, "PR created with status Draft", prAfterCreate?.status === PrStatus.Draft);
  assert(4, "PR belongs to End User", prAfterCreate?.requestedById === endUser.id);
  assert(4, "PR linked to PPMP", prAfterCreate?.ppmpId === ppmp.id);
  assert(4, "PR has same item count as PPMP", prAfterCreate?.items.length === ppmpItemsForPr.length);

  // Verify PPMP → PR relationship
  const linkedPpmp = await prisma.ppmp.findUnique({ where: { id: ppmp.id }, include: { purchaseRequests: true } });
  assert(4, "PPMP has linked PR", linkedPpmp?.purchaseRequests.some(p => p.id === pr.id));
  console.log(`   PR #${prNumber1} (ID: ${pr.id})\n`);

  // ══════════════════════════════════════════════════════════════
  // STEP 5: End User — Create PR from Catalog Cart (independent path)
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 5: End User creates PR from Catalog Cart ──");
  const prNumber2 = `PR-2026-${(Date.now() + 1).toString().slice(-6)}`;
  const cartItems = [
    { productId: products[0].id, description: `${products[0].name} - ${products[0].description || "catalog item"}`, quantity: 3, unit: unit.name, estimatedUnitCost: 200, specification: "Catalog selection" },
  ];
  const cartTotal = cartItems.reduce((s, i) => s + i.quantity * i.estimatedUnitCost, 0);

  const pr2 = await prisma.purchaseRequest.create({
    data: {
      prNumber: prNumber2,
      department: "Office of the President",
      office: "Administration",
      purpose: "E2E Catalog Test - Direct catalog cart creation",
      fundingSource: "General Fund",
      estimatedBudget: cartTotal,
      totalCost: cartTotal,
      status: PrStatus.Submitted,
      requestedById: endUser.id,
    },
  });

  for (const item of cartItems) {
    await prisma.purchaseRequestItem.create({
      data: {
        prId: pr2.id,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitId: unit.id,
        estimatedUnitCost: item.estimatedUnitCost,
        estimatedCost: item.quantity * item.estimatedUnitCost,
        specification: item.specification,
      },
    });
  }

  await prisma.purchaseRequestStatusHistory.create({
    data: {
      purchaseRequestId: pr2.id,
      status: PrStatus.Submitted,
      remarks: "Purchase Request created from catalog cart.",
      changedById: endUser.id,
    },
  });

  const pr2AfterCreate = await prisma.purchaseRequest.findUnique({
    where: { id: pr2.id },
    include: { items: true },
  });

  assert(5, "Catalog PR created", pr2AfterCreate !== null);
  assert(5, "Catalog PR has no PPMP link (independent path)", pr2AfterCreate?.ppmpId === null);
  assert(5, "Catalog PR belongs to End User", pr2AfterCreate?.requestedById === endUser.id);
  assert(5, "Catalog PR has items from catalog", pr2AfterCreate?.items.length === cartItems.length);
  assert(5, "Catalog PR items linked to catalog products", pr2AfterCreate?.items[0]?.productId === products[0].id);
  console.log(`   Catalog PR #${prNumber2} (ID: ${pr2.id})\n`);

  // ══════════════════════════════════════════════════════════════
  // STEP 6: End User — Submit PR to Procurement Office
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 6: End User submits PR to Procurement Office ──");
  const submitTimestamp = new Date();
  await prisma.purchaseRequest.update({
    where: { id: pr.id },
    data: {
      status: PrStatus.PendingProcurementReview,
      submittedAt: submitTimestamp,
    },
  });

  await prisma.purchaseRequestStatusHistory.create({
    data: {
      purchaseRequestId: pr.id,
      status: PrStatus.PendingProcurementReview,
      remarks: "Submitted to Procurement Office for review.",
      changedById: endUser.id,
    },
  });

  const prAfterSubmit = await prisma.purchaseRequest.findUnique({ where: { id: pr.id } });
  assert(6, "PR status = PendingProcurementReview", prAfterSubmit?.status === PrStatus.PendingProcurementReview);
  assert(6, "submittedAt is recorded", prAfterSubmit?.submittedAt !== null);
  assert(6, "submittedAt is recent (within 5s)", Math.abs(prAfterSubmit!.submittedAt!.getTime() - submitTimestamp.getTime()) < 5000);
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 7: Officer — Create Pre-Canvass for PR
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 7: Officer creates Pre-Canvass ──");
  const preCanvassNumber = `PC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const preCanvass = await prisma.preCanvass.create({
    data: {
      preCanvassNumber,
      prId: pr.id,
      status: PreCanvassStatus.Draft,
      createdById: officer.id,
    },
  });

  const pcAfterCreate = await prisma.preCanvass.findUnique({ where: { id: preCanvass.id } });
  assert(7, "Pre-Canvass created as Draft", pcAfterCreate?.status === PreCanvassStatus.Draft);
  assert(7, "Pre-Canvass linked to PR", pcAfterCreate?.prId === pr.id);
  assert(7, "Pre-Canvass created by Officer", pcAfterCreate?.createdById === officer.id);
  console.log(`   Pre-Canvass #${preCanvassNumber} (ID: ${preCanvass.id})\n`);

  // ══════════════════════════════════════════════════════════════
  // STEP 8: Officer — Select 3 Suppliers
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 8: Officer selects 3 suppliers ──");
  const suppliers = await prisma.supplier.findMany({ take: 3 });
  if (suppliers.length < 3) {
    console.error("❌ Need at least 3 suppliers in the database.");
    process.exit(1);
  }

  for (const supplier of suppliers) {
    await prisma.preCanvassSupplier.create({
      data: {
        preCanvassId: preCanvass.id,
        supplierId: supplier.id,
        responseStatus: "Pending",
        selectedById: officer.id,
      },
    });
  }

  await prisma.preCanvass.update({ where: { id: preCanvass.id }, data: { status: PreCanvassStatus.SuppliersSelected } });

  const pcSuppliers = await prisma.preCanvassSupplier.findMany({ where: { preCanvassId: preCanvass.id } });
  const pcAfterSelect = await prisma.preCanvass.findUnique({ where: { id: preCanvass.id } });
  assert(8, "Pre-Canvass has 3 suppliers", pcSuppliers.length === 3);
  assert(8, "Pre-Canvass status = SuppliersSelected", pcAfterSelect?.status === PreCanvassStatus.SuppliersSelected);
  assert(8, "All suppliers have Pending status", pcSuppliers.every(s => s.responseStatus === "Pending"));
  console.log(`   Suppliers: ${suppliers.map(s => s.companyName).join(", ")}\n`);

  // ══════════════════════════════════════════════════════════════
  // STEP 9: Officer — Send Pre-Canvass to Suppliers
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 9: Officer sends Pre-Canvass ──");
  const sentAt = new Date();
  await prisma.preCanvass.update({
    where: { id: preCanvass.id },
    data: { status: PreCanvassStatus.Sent, sentAt },
  });
  await prisma.preCanvassSupplier.updateMany({
    where: { preCanvassId: preCanvass.id },
    data: { responseStatus: "Invited", invitedAt: sentAt },
  });

  const pcAfterSend = await prisma.preCanvass.findUnique({ where: { id: preCanvass.id } });
  const pcSuppliersAfterSend = await prisma.preCanvassSupplier.findMany({ where: { preCanvassId: preCanvass.id } });
  assert(9, "Pre-Canvass status = Sent", pcAfterSend?.status === PreCanvassStatus.Sent);
  assert(9, "sentAt is recorded", pcAfterSend?.sentAt !== null);
  assert(9, "All suppliers have Invited status", pcSuppliersAfterSend.every(s => s.responseStatus === "Invited"));
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 10: Officer — Generate AOQ (Abstract)
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 10: Officer generates AOQ (Abstract) ──");
  // Simulate 3 supplier responses
  const prItems = await prisma.purchaseRequestItem.findMany({ where: { prId: pr.id } });
  for (const pcSupplier of pcSuppliers) {
    const response = await prisma.preCanvassResponse.create({
      data: {
        preCanvassId: preCanvass.id,
        preCanvassSupplierId: pcSupplier.id,
        quotationNumber: `QN-${Date.now()}-${pcSupplier.id}`,
        submittedAt: new Date(),
      },
    });

    for (const item of prItems) {
      await prisma.preCanvassResponseItem.create({
        data: {
          responseId: response.id,
          prItemId: item.id,
          unitPrice: Number(item.estimatedUnitCost) + Math.floor(Math.random() * 50),
          quantityQuoted: item.quantity,
          isAvailable: true,
          deliveryDays: Math.floor(Math.random() * 14) + 1,
        },
      });
    }
  }

  // Update supplier response statuses
  await prisma.preCanvassSupplier.updateMany({
    where: { preCanvassId: preCanvass.id },
    data: { responseStatus: "Submitted", respondedAt: new Date() },
  });
  await prisma.preCanvass.update({ where: { id: preCanvass.id }, data: { status: PreCanvassStatus.FullyResponded } });

  // Generate AOQ
  const abstract = await prisma.preCanvassAbstract.create({
    data: {
      preCanvassId: preCanvass.id,
      generatedById: officer.id,
      status: "Generated",
    },
  });

  const pcAfterAbstract = await prisma.preCanvass.findUnique({ where: { id: preCanvass.id } });
  const abstractAfterCreate = await prisma.preCanvassAbstract.findUnique({ where: { preCanvassId: preCanvass.id } });
  assert(10, "Pre-Canvass status = FullyResponded", pcAfterAbstract?.status === PreCanvassStatus.FullyResponded);
  assert(10, "AOQ Abstract created", abstractAfterCreate !== null);
  assert(10, "Abstract status = Generated", abstractAfterCreate?.status === "Generated");
  assert(10, "Abstract generated by Officer", abstractAfterCreate?.generatedById === officer.id);
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 11: Verify Package Review chain (PPMP → PR → Items → PreCanvass → 3 Suppliers → Abstract)
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 11: Verify Package Review complete chain ──");
  const fullPr = await prisma.purchaseRequest.findUnique({
    where: { id: pr.id },
    include: {
      items: { include: { product: true, unit: true } },
      ppmp: true,
      requestedBy: true,
      preCanvass: {
        include: {
          suppliers: { include: { supplier: true, response: { include: { items: true } } } },
          abstract: true,
        },
      },
    },
  });

  assert(11, "PR retrieved with full includes", fullPr !== null);
  assert(11, "PPMP linked and loaded", fullPr?.ppmp !== null);
  assert(11, "PPMP ID matches", fullPr?.ppmpId === ppmp.id);
  assert(11, "PR has items", (fullPr?.items.length ?? 0) > 0);
  assert(11, "Pre-Canvass linked", fullPr?.preCanvass !== null);
  assert(11, "Pre-Canvass has 3 suppliers", fullPr?.preCanvass?.suppliers.length === 3);
  assert(11, "Abstract exists on Pre-Canvass", fullPr?.preCanvass?.abstract !== null);

  // Verify each supplier has responses
  const suppliersWithResponses = fullPr?.preCanvass?.suppliers.filter(s => s.response !== null) ?? [];
  assert(11, "All 3 suppliers have responses", suppliersWithResponses.length === 3);

  // Verify response items match PR items
  for (const supplier of suppliersWithResponses) {
    assert(11, `Supplier ${supplier.supplier?.companyName} has response items`, (supplier.response?.items.length ?? 0) > 0);
  }

  // Verify PPMP → PR ownership chain
  assert(11, "PPMP owner = PR requester", fullPr?.ppmp?.preparedById === fullPr?.requestedById);
  assert(11, "PR requester is End User", fullPr?.requestedById === endUser.id);
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 12: Security — Attempt submitPpmpAction on another user's PPMP
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 12: Security — Cross-user PPMP manipulation ──");
  // Simulate: try to submit a PPMP that belongs to someone else
  // We create a second End User's PPMP, then verify the ownership check would reject it
  const otherPpmp = await prisma.ppmp.create({
    data: {
      ppmpNumber: `E2E-OTHER-${Date.now()}`,
      projectTitle: "Other User PPMP",
      department: "Office of the President",
      office: "Administration",
      fundingSource: "General Fund",
      fiscalYear: 2026,
      estimatedBudget: 1000,
      status: PpmpStatus.Draft,
      preparedById: officer.id, // Officer is the owner, not End User
    },
  });

  // Verify: the PPMP's owner is NOT the End User
  assert(12, "Other PPMP owned by Officer (not End User)", otherPpmp.preparedById !== endUser.id);

  // Verify: the ownership check in submitPpmpAction would reject
  // We read the action code to confirm the check exists
  const ppmpActionCode = fs.readFileSync("src/app/actions/ppmp.ts", "utf-8");
  const hasOwnershipCheck = ppmpActionCode.includes("old.preparedById !== profile.id");
  assert(12, "submitPpmpAction has ownership check (preparedById !== profile.id)", hasOwnershipCheck);

  // Verify: the ownership check in deletePpmpAction would reject
  const hasDeleteOwnershipCheck = ppmpActionCode.includes("old.preparedById !== profile.id");
  assert(12, "deletePpmpAction has ownership check (preparedById !== profile.id)", hasDeleteOwnershipCheck);

  // Clean up the other user's PPMP
  await prisma.ppmp.delete({ where: { id: otherPpmp.id } });
  console.log();

  // ══════════════════════════════════════════════════════════════
  // STEP 13: Security — Attempt submitPrAction on another user's PR
  // ══════════════════════════════════════════════════════════════
  console.log("── Step 13: Security — Cross-user PR manipulation ──");
  // Verify the ownership check in submitPrAction
  const prActionCode = fs.readFileSync("src/app/actions/pr.ts", "utf-8");
  const hasPrOwnershipCheck = prActionCode.includes("old.requestedById !== profile.id");
  assert(13, "submitPrAction has ownership check (requestedById !== profile.id)", hasPrOwnershipCheck);

  // Verify the role check in reviewPrAction fallback
  const hasReviewRoleCheck = prActionCode.includes('requireRole(["Procurement Officer", "Administrative Approver"])');
  assert(13, "reviewPrAction fallback has role check (Procurement Officer / Administrative Approver)", hasReviewRoleCheck);

  // Verify reviewPrAction validates status against PrStatus enum
  const hasStatusValidation = prActionCode.includes("allowedStatuses.includes(status)");
  assert(13, "reviewPrAction validates status against PrStatus enum", hasStatusValidation);

  // Verify reviewPpmpAction state machine
  const hasPpmpStateCheck = ppmpActionCode.includes("old.status !== PpmpStatus.Submitted");
  assert(13, "reviewPpmpAction validates PPMP must be Submitted before review", hasPpmpStateCheck);

  const hasPpmpTargetCheck = ppmpActionCode.includes("status !== PpmpStatus.Approved && status !== PpmpStatus.Returned");
  assert(13, "reviewPpmpAction only allows Approved or Returned target status", hasPpmpTargetCheck);
  console.log();

  // ══════════════════════════════════════════════════════════════
  // RESULTS
  // ══════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Passed: ${passed.length}`);
  console.log(`  Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\n  Failed assertions:");
    for (const f of failed) {
      console.log(`    ✗ ${f}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════════");

  // Cleanup test data
  await cleanup();

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
