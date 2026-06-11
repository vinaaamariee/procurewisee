import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { QuoteStatus, RfqStatus } from "../src/generated/prisma/client";
import { officeItems } from "../src/lib/mock-price-data";



// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function mcdmScore(price: number, delivery: number, reliability: number) {
  // Weighted scoring: price 50%, delivery 30%, reliability 20%
  return parseFloat((price * 0.5 + delivery * 0.3 + reliability * 0.2).toFixed(2));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting ProcureWise seed...\n");

  // ── LEGACY: OfficeItem + PriceQuote (keep existing behaviour) ──────────────
  console.log("📦 Seeding legacy OfficeItems & PriceQuotes...");
  for (const item of officeItems) {
    await prisma.officeItem.upsert({
      where: { id: item.id },
      update: { name: item.name, unit: item.unit, category: item.category, description: item.description },
      create: { id: item.id, name: item.name, unit: item.unit, category: item.category, description: item.description },
    });
    for (const quote of item.quotes) {
      await prisma.priceQuote.upsert({
        where: { supplierId_itemId: { supplierId: quote.supplierId, itemId: item.id } },
        update: { unitPrice: quote.unitPrice, availability: quote.availability, deliveryDays: quote.deliveryDays, notes: quote.notes ?? null },
        create: { supplierId: quote.supplierId, itemId: item.id, unitPrice: quote.unitPrice, availability: quote.availability, deliveryDays: quote.deliveryDays, notes: quote.notes ?? null },
      });
    }
  }
  console.log("  ✔ Legacy tables seeded.\n");

  // ── 1. SUPPLIERS ──────────────────────────────────────────────────────────
  console.log("🏢 Seeding suppliers...");
  const supplierData = [
    {
      companyName: "Batanes General Trading Co.",
      tin: "123-456-789-000",
      contactPerson: "Ricardo Santos",
      contactNumber: "09171234567",
      businessAddress: "Brgy. Kayhuvokan, Basco, Batanes",
      reliabilityRating: 4.80,
      qualityComplianceRate: 97.50,
      historicalDeliveryDays: 7,
      isVerified: true,
    },
    {
      companyName: "North Luzon Office Supplies Inc.",
      tin: "987-654-321-000",
      contactPerson: "Maria Fernandez",
      contactNumber: "09189876543",
      businessAddress: "Tuguegarao City, Cagayan",
      reliabilityRating: 4.60,
      qualityComplianceRate: 95.00,
      historicalDeliveryDays: 14,
      isVerified: true,
    },
    {
      companyName: "Cagayan Valley Print & Sign",
      tin: "456-123-789-001",
      contactPerson: "Jose Reyes",
      contactNumber: "09209998877",
      businessAddress: "Cauayan City, Isabela",
      reliabilityRating: 4.30,
      qualityComplianceRate: 92.00,
      historicalDeliveryDays: 21,
      isVerified: true,
    },
    {
      companyName: "Batanes IT Solutions",
      tin: "321-654-987-002",
      contactPerson: "Ana Cruz",
      contactNumber: "09171112233",
      businessAddress: "Brgy. Chanarian, Basco, Batanes",
      reliabilityRating: 4.90,
      qualityComplianceRate: 99.00,
      historicalDeliveryDays: 5,
      isVerified: true,
    },
    {
      companyName: "Manila Office Depot Corp.",
      tin: "654-987-321-003",
      contactPerson: "Carlo Lim",
      contactNumber: "09554445566",
      businessAddress: "Binondo, Manila",
      reliabilityRating: 3.80,
      qualityComplianceRate: 88.50,
      historicalDeliveryDays: 30,
      isVerified: false,
    },
  ];

  const suppliers = [];
  for (const s of supplierData) {
    const supplier = await prisma.supplier.upsert({
      where: { tin: s.tin },
      update: s,
      create: s,
    });
    suppliers.push(supplier);
    console.log(`  ✔ ${supplier.companyName} (ID: ${supplier.id})`);
  }
  console.log();

  // ── 2. APP ITEMS ──────────────────────────────────────────────────────────
  console.log("📋 Seeding APP items...");
  const appItemsData = [
    {
      papCode: "PAP-ICT-2026-001",
      objectCode: "5-02-03-010",
      projectTitle: "ICT Equipment Procurement FY 2026",
      endUserUnit: "ICT Department",
      generalDescription: "Procurement of various ICT equipment including laptops, printers, and accessories for government operations.",
      modeOfProcurement: "Small Value Procurement",
      sourceOfFund: "GAA 2026",
      estimatedBudget: 250000.00,
      fyYear: 2026,
    },
    {
      papCode: "PAP-ADM-2026-002",
      objectCode: "5-02-03-020",
      projectTitle: "Office Supplies Replenishment Q2 2026",
      endUserUnit: "Administrative Division",
      generalDescription: "Quarterly replenishment of office supplies including bond papers, toners, pens, and other consumables.",
      modeOfProcurement: "Small Value Procurement",
      sourceOfFund: "GAA 2026",
      estimatedBudget: 85000.00,
      fyYear: 2026,
    },
    {
      papCode: "PAP-PIO-2026-003",
      objectCode: "5-02-99-010",
      projectTitle: "Tarpaulin & Signage Production — Independence Day 2026",
      endUserUnit: "Public Information Office",
      generalDescription: "Production of tarpaulins, matte vinyl sticker wraps with print, and event signage for the 128th Independence Day celebration.",
      modeOfProcurement: "Small Value Procurement",
      sourceOfFund: "Special Purpose Fund 2026",
      estimatedBudget: 42000.00,
      fyYear: 2026,
    },
  ];

  const appItems = [];
  for (const item of appItemsData) {
    const appItem = await prisma.appItem.create({ data: item });
    appItems.push(appItem);
    console.log(`  ✔ ${appItem.papCode} — ${appItem.projectTitle}`);
  }
  console.log();

  // ── 3. RFQs ──────────────────────────────────────────────────────────────
  console.log("📝 Seeding RFQs...");
  const rfq1 = await prisma.requestForQuote.upsert({
    where: { rfqNumber: "RFQ-2026-06-001" },
    update: {},
    create: {
      rfqNumber: "RFQ-2026-06-001",
      title: "Supply of Tarpaulin & Matte Vinyl Sticker Wraps",
      approvedBudgetContract: 42000.00,
      deadlineDate: new Date("2026-06-20"),
      status: RfqStatus.Evaluated,
    },
  });

  const rfq2 = await prisma.requestForQuote.upsert({
    where: { rfqNumber: "RFQ-2026-06-002" },
    update: {},
    create: {
      rfqNumber: "RFQ-2026-06-002",
      title: "Supply of Office Consumables Q2 2026",
      approvedBudgetContract: 85000.00,
      deadlineDate: new Date("2026-06-25"),
      status: RfqStatus.Closed,
    },
  });

  const rfq3 = await prisma.requestForQuote.upsert({
    where: { rfqNumber: "RFQ-2026-07-001" },
    update: {},
    create: {
      rfqNumber: "RFQ-2026-07-001",
      title: "Procurement of ICT Equipment — Laptops & Accessories",
      approvedBudgetContract: 150000.00,
      deadlineDate: new Date("2026-07-10"),
      status: RfqStatus.Published,
    },
  });
  console.log(`  ✔ ${rfq1.rfqNumber} — ${rfq1.title}`);
  console.log(`  ✔ ${rfq2.rfqNumber} — ${rfq2.title}`);
  console.log(`  ✔ ${rfq3.rfqNumber} — ${rfq3.title}\n`);

  // ── 4. RFQ ITEMS ──────────────────────────────────────────────────────────
  console.log("🗂  Seeding RFQ line items...");
  const rfq1Items = await Promise.all([
    prisma.rfqItem.create({ data: { rfqId: rfq1.id, appItemId: appItems[2].id, itemNumber: "001", particulars: "Matte Vinyl Sticker Wrap with full-color print (3ft x 8ft)", quantity: 10, unit: "pcs" } }),
    prisma.rfqItem.create({ data: { rfqId: rfq1.id, appItemId: appItems[2].id, itemNumber: "002", particulars: "Tarpaulin Banner (4ft x 8ft) with eyelets", quantity: 15, unit: "pcs" } }),
    prisma.rfqItem.create({ data: { rfqId: rfq1.id, appItemId: appItems[2].id, itemNumber: "003", particulars: "Foam Board Mounted Print (A2 size)", quantity: 5, unit: "pcs" } }),
  ]);

  const rfq2Items = await Promise.all([
    prisma.rfqItem.create({ data: { rfqId: rfq2.id, appItemId: appItems[1].id, itemNumber: "001", particulars: "Bond Paper, Sub 20, A4 size (500 sheets/ream)", quantity: 50, unit: "ream" } }),
    prisma.rfqItem.create({ data: { rfqId: rfq2.id, appItemId: appItems[1].id, itemNumber: "002", particulars: "Black Ink Toner Cartridge (compatible HP LaserJet)", quantity: 8, unit: "cart" } }),
    prisma.rfqItem.create({ data: { rfqId: rfq2.id, appItemId: appItems[1].id, itemNumber: "003", particulars: "Ballpen, Black, 0.5mm (box of 12)", quantity: 20, unit: "box" } }),
  ]);

  console.log(`  ✔ ${rfq1Items.length} items for ${rfq1.rfqNumber}`);
  console.log(`  ✔ ${rfq2Items.length} items for ${rfq2.rfqNumber}\n`);

  // ── 5. SUPPLIER QUOTES ────────────────────────────────────────────────────
  console.log("💰 Seeding supplier quotes...");

  // RFQ-001 quotes (3 suppliers)
  const quote1 = await prisma.supplierQuote.create({
    data: { rfqId: rfq1.id, supplierId: suppliers[0].id, totalQuotedAmount: 38500.00, offeredDeliveryDays: 7, status: QuoteStatus.Accepted },
  });
  const quote2 = await prisma.supplierQuote.create({
    data: { rfqId: rfq1.id, supplierId: suppliers[2].id, totalQuotedAmount: 40200.00, offeredDeliveryDays: 14, status: QuoteStatus.Rejected },
  });
  const quote3 = await prisma.supplierQuote.create({
    data: { rfqId: rfq1.id, supplierId: suppliers[4].id, totalQuotedAmount: 41800.00, offeredDeliveryDays: 21, status: QuoteStatus.Rejected },
  });

  // RFQ-002 quotes (2 suppliers)
  const quote4 = await prisma.supplierQuote.create({
    data: { rfqId: rfq2.id, supplierId: suppliers[1].id, totalQuotedAmount: 77500.00, offeredDeliveryDays: 10, status: QuoteStatus.UnderReview },
  });
  const quote5 = await prisma.supplierQuote.create({
    data: { rfqId: rfq2.id, supplierId: suppliers[0].id, totalQuotedAmount: 81000.00, offeredDeliveryDays: 7, status: QuoteStatus.UnderReview },
  });

  console.log(`  ✔ 3 quotes for ${rfq1.rfqNumber}`);
  console.log(`  ✔ 2 quotes for ${rfq2.rfqNumber}\n`);

  // ── 6. QUOTE DETAILS ──────────────────────────────────────────────────────
  console.log("📊 Seeding quote line-item details...");
  await Promise.all([
    // Quote 1 (Batanes General Trading — lowest bidder RFQ-001)
    prisma.quoteDetail.create({ data: { quoteId: quote1.id, rfqItemId: rfq1Items[0].id, unitPrice: 1800.00, quantityMultiplier: 10 } }),
    prisma.quoteDetail.create({ data: { quoteId: quote1.id, rfqItemId: rfq1Items[1].id, unitPrice: 1250.00, quantityMultiplier: 15 } }),
    prisma.quoteDetail.create({ data: { quoteId: quote1.id, rfqItemId: rfq1Items[2].id, unitPrice: 850.00,  quantityMultiplier: 5  } }),
    // Quote 2 (Cagayan Valley Print & Sign)
    prisma.quoteDetail.create({ data: { quoteId: quote2.id, rfqItemId: rfq1Items[0].id, unitPrice: 1950.00, quantityMultiplier: 10 } }),
    prisma.quoteDetail.create({ data: { quoteId: quote2.id, rfqItemId: rfq1Items[1].id, unitPrice: 1280.00, quantityMultiplier: 15 } }),
    prisma.quoteDetail.create({ data: { quoteId: quote2.id, rfqItemId: rfq1Items[2].id, unitPrice: 890.00,  quantityMultiplier: 5  } }),
    // Quote 3 (Manila Office Depot)
    prisma.quoteDetail.create({ data: { quoteId: quote3.id, rfqItemId: rfq1Items[0].id, unitPrice: 2050.00, quantityMultiplier: 10 } }),
    prisma.quoteDetail.create({ data: { quoteId: quote3.id, rfqItemId: rfq1Items[1].id, unitPrice: 1320.00, quantityMultiplier: 15 } }),
    prisma.quoteDetail.create({ data: { quoteId: quote3.id, rfqItemId: rfq1Items[2].id, unitPrice: 900.00,  quantityMultiplier: 5  } }),
  ]);
  console.log("  ✔ Quote details for RFQ-2026-06-001\n");

  // ── 7. CANVAS ABSTRACTS ───────────────────────────────────────────────────
  console.log("📄 Seeding canvas abstracts...");
  const canvas1 = await prisma.canvasAbstract.create({
    data: {
      rfqId: rfq1.id,
      openingDate: new Date("2026-06-18"),
      locationOpened: "Basco, Batanes",
    },
  });
  console.log(`  ✔ Canvas #${canvas1.id} for ${rfq1.rfqNumber}\n`);

  // ── 8. RECOMMENDATIONS (MCDM Output) ──────────────────────────────────────
  console.log("🤖 Seeding MCDM recommendations...");

  // Normalize scores (higher = better) — price inverted, lower is better
  // Batanes General: price 100 (lowest), delivery 100 (7 days), reliability 96 (4.80)
  // Cagayan Valley:  price  95 (mid),    delivery  75 (14 days), reliability 86 (4.30)
  // Manila Office:   price  92 (high),   delivery  50 (21 days), reliability 76 (3.80)

  const rec1Score = mcdmScore(100, 100, 96); // Rank 1
  const rec2Score = mcdmScore(95, 75, 86);   // Rank 2
  const rec3Score = mcdmScore(92, 50, 76);   // Rank 3

  await prisma.recommendation.create({
    data: {
      canvasId: canvas1.id,
      supplierId: suppliers[0].id,
      supplierQuoteId: quote1.id,
      compositeMcdmScore: rec1Score,
      priceScore: 100.00,
      deliveryScore: 100.00,
      reliabilityScore: 96.00,
      rankPosition: 1,
      approvalStatus: "Approved",
      justificationLog:
        `Batanes General Trading Co. ranked 1st with a composite MCDM score of ${rec1Score}. ` +
        `Offered the lowest bid of ₱38,500.00 (within ABC of ₱42,000.00), ` +
        `committed delivery of 7 days, and carries the highest reliability rating (4.80/5.00) ` +
        `with a 97.5% quality compliance rate. Recommended for award.`,
    },
  });

  await prisma.recommendation.create({
    data: {
      canvasId: canvas1.id,
      supplierId: suppliers[2].id,
      supplierQuoteId: quote2.id,
      compositeMcdmScore: rec2Score,
      priceScore: 95.00,
      deliveryScore: 75.00,
      reliabilityScore: 86.00,
      rankPosition: 2,
      approvalStatus: "Pending Review",
      justificationLog:
        `Cagayan Valley Print & Sign ranked 2nd with a composite MCDM score of ${rec2Score}. ` +
        `Quoted ₱40,200.00 with a 14-day delivery commitment. ` +
        `Ranked lower due to longer lead time and slightly reduced reliability score (4.30/5.00). ` +
        `Alternate supplier if Rank 1 fails to post performance bond.`,
    },
  });

  await prisma.recommendation.create({
    data: {
      canvasId: canvas1.id,
      supplierId: suppliers[4].id,
      supplierQuoteId: quote3.id,
      compositeMcdmScore: rec3Score,
      priceScore: 92.00,
      deliveryScore: 50.00,
      reliabilityScore: 76.00,
      rankPosition: 3,
      approvalStatus: "Pending Review",
      justificationLog:
        `Manila Office Depot Corp. ranked 3rd with a composite MCDM score of ${rec3Score}. ` +
        `Highest bid at ₱41,800.00 with a 30-day delivery commitment — longest lead time among all bidders. ` +
        `Unverified supplier status reduces confidence in compliance. Not recommended for current award.`,
    },
  });

  console.log("  ✔ 3 MCDM recommendations for Canvas #1\n");

  // ── 9. AUDIT TRAILS ───────────────────────────────────────────────────────
  console.log("🔒 Seeding audit trail entries...");
  await Promise.all([
    prisma.auditTrail.create({
      data: {
        actionType: "CREATE_RFQ",
        tableAffected: "requests_for_quote",
        recordId: rfq1.id,
        newState: { rfqNumber: rfq1.rfqNumber, status: "Draft" },
        ipAddress: "192.168.1.101",
      },
    }),
    prisma.auditTrail.create({
      data: {
        actionType: "PUBLISH_RFQ",
        tableAffected: "requests_for_quote",
        recordId: rfq1.id,
        oldState: { status: "Draft" },
        newState: { status: "Published" },
        ipAddress: "192.168.1.101",
      },
    }),
    prisma.auditTrail.create({
      data: {
        actionType: "SUBMIT_QUOTATION",
        tableAffected: "supplier_quotes",
        recordId: quote1.id,
        newState: { supplierId: suppliers[0].id, totalQuotedAmount: 38500.00 },
        ipAddress: "10.0.0.45",
      },
    }),
    prisma.auditTrail.create({
      data: {
        actionType: "APPROVE_CANVAS",
        tableAffected: "canvas_abstracts",
        recordId: canvas1.id,
        newState: { approvalStatus: "Approved", winnerSupplierId: suppliers[0].id },
        ipAddress: "192.168.1.102",
      },
    }),
  ]);
  console.log("  ✔ 4 audit trail entries\n");

  // ── 10. PRODUCT CATALOG ───────────────────────────────────────────────────
  console.log("📦 Seeding product catalog items...");
  const catalogProductsData = [
    {
      sku: "PAP-A4-001",
      name: "Paper A4 80gsm",
      category: "Office Supplies",
      description: "High-grade photocopy paper, A4 size, 80gsm, 500 sheets/ream.",
      unitOfMeasure: "ream",
      estimatedUnitCost: 220.00,
    },
    {
      sku: "INK-HP-85A",
      name: "HP 85A Black LaserJet Toner",
      category: "Office Supplies",
      description: "Original HP 85A Black LaserJet Toner Cartridge (CE285A).",
      unitOfMeasure: "cart",
      estimatedUnitCost: 4500.00,
    },
    {
      sku: "PEN-PIL-BLK",
      name: "Pilot G2 Gel Pen Black 0.5mm",
      category: "Office Supplies",
      description: "Retractable rolling ball gel pen, black ink, ultra fine 0.5mm.",
      unitOfMeasure: "box",
      estimatedUnitCost: 950.00,
    },
    {
      sku: "LAP-LEN-L14",
      name: "Lenovo ThinkPad L14 Gen 4",
      category: "ICT Equipment",
      description: "Intel Core i5, 16GB DDR4 RAM, 512GB SSD, 14 inch FHD display, Windows 11 Pro.",
      unitOfMeasure: "unit",
      estimatedUnitCost: 55000.00,
    },
    {
      sku: "PRN-EPS-L3210",
      name: "Epson EcoTank L3210 A4 All-in-One Printer",
      category: "ICT Equipment",
      description: "Multifunction ink tank printer with scan, copy, and print functions.",
      unitOfMeasure: "unit",
      estimatedUnitCost: 9800.00,
    },
    {
      sku: "TAR-STK-MATTE",
      name: "Matte Vinyl Sticker Wrap 3ft x 8ft",
      category: "Signage & Prints",
      description: "Custom printed matte vinyl sticker wrap, waterproof and fade resistant.",
      unitOfMeasure: "pcs",
      estimatedUnitCost: 1800.00,
    },
  ];

  for (const cp of catalogProductsData) {
    await prisma.catalogProduct.upsert({
      where: { sku: cp.sku },
      update: cp,
      create: cp,
    });
    console.log(`  ✔ Catalog Product: ${cp.name} (${cp.sku})`);
  }
  console.log();

  console.log("✅ ProcureWise seed complete!\n");
  console.log("Summary:");
  console.log(`  • ${suppliers.length} suppliers`);
  console.log(`  • ${appItems.length} APP items`);
  console.log("  • 3 RFQs (Evaluated / Closed / Published)");
  console.log("  • 6 RFQ line items");
  console.log("  • 5 supplier quotes");
  console.log("  • 9 quote detail lines");
  console.log("  • 1 canvas abstract");
  console.log("  • 3 MCDM recommendations");
  console.log("  • 4 audit trail entries");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
