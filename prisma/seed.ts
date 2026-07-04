import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { QuoteStatus, RfqStatus, PpmpStatus, PrStatus, PoStatus, DeliveryStatus, EvaluationType } from "@prisma/client";
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
  const pcsUnit = await prisma.unitOfMeasure.upsert({
    where: { name: "pcs" },
    update: {},
    create: { name: "pcs", abbreviation: "pcs" }
  });
  const reamUnit = await prisma.unitOfMeasure.upsert({
    where: { name: "ream" },
    update: {},
    create: { name: "ream", abbreviation: "ream" }
  });
  const cartUnit = await prisma.unitOfMeasure.upsert({
    where: { name: "cart" },
    update: {},
    create: { name: "cart", abbreviation: "cart" }
  });
  const boxUnit = await prisma.unitOfMeasure.upsert({
    where: { name: "box" },
    update: {},
    create: { name: "box", abbreviation: "box" }
  });

  const rfq1Items = await Promise.all([
    prisma.rfqItem.create({ data: { rfqId: rfq1.id, appItemId: appItems[2].id, itemNumber: "001", particulars: "Matte Vinyl Sticker Wrap with full-color print (3ft x 8ft)", quantity: 10, unitId: pcsUnit.id } }),
    prisma.rfqItem.create({ data: { rfqId: rfq1.id, appItemId: appItems[2].id, itemNumber: "002", particulars: "Tarpaulin Banner (4ft x 8ft) with eyelets", quantity: 15, unitId: pcsUnit.id } }),
    prisma.rfqItem.create({ data: { rfqId: rfq1.id, appItemId: appItems[2].id, itemNumber: "003", particulars: "Foam Board Mounted Print (A2 size)", quantity: 5, unitId: pcsUnit.id } }),
  ]);

  const rfq2Items = await Promise.all([
    prisma.rfqItem.create({ data: { rfqId: rfq2.id, appItemId: appItems[1].id, itemNumber: "001", particulars: "Bond Paper, Sub 20, A4 size (500 sheets/ream)", quantity: 50, unitId: reamUnit.id } }),
    prisma.rfqItem.create({ data: { rfqId: rfq2.id, appItemId: appItems[1].id, itemNumber: "002", particulars: "Black Ink Toner Cartridge (compatible HP LaserJet)", quantity: 8, unitId: cartUnit.id } }),
    prisma.rfqItem.create({ data: { rfqId: rfq2.id, appItemId: appItems[1].id, itemNumber: "003", particulars: "Ballpen, Black, 0.5mm (box of 12)", quantity: 20, unitId: boxUnit.id } }),
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
      brand: "Hard Copy",
      popularity: 85,
      technicalSpecifications: "A4 size, 80gsm, 500 sheets per ream, ultra-white.",
      preferredSupplierId: suppliers[0].id,
    },
    {
      sku: "INK-HP-85A",
      name: "HP 85A Black LaserJet Toner",
      category: "Office Supplies",
      description: "Original HP 85A Black LaserJet Toner Cartridge (CE285A).",
      unitOfMeasure: "cart",
      estimatedUnitCost: 4500.00,
      brand: "HP",
      popularity: 60,
      technicalSpecifications: "Laser jet toner, CE285A, black, yields approx 1600 pages.",
      preferredSupplierId: suppliers[1].id,
    },
    {
      sku: "PEN-PIL-BLK",
      name: "Pilot G2 Gel Pen Black 0.5mm",
      category: "Office Supplies",
      description: "Retractable rolling ball gel pen, black ink, ultra fine 0.5mm.",
      unitOfMeasure: "box",
      estimatedUnitCost: 950.00,
      brand: "Pilot",
      popularity: 90,
      technicalSpecifications: "G2 retractable, gel ink black, 0.5mm tip, box of 12.",
      preferredSupplierId: suppliers[0].id,
    },
    {
      sku: "LAP-LEN-L14",
      name: "Lenovo ThinkPad L14 Gen 4",
      category: "ICT Equipment",
      description: "Intel Core i5, 16GB DDR4 RAM, 512GB SSD, 14 inch FHD display, Windows 11 Pro.",
      unitOfMeasure: "unit",
      estimatedUnitCost: 55000.00,
      brand: "Lenovo",
      popularity: 95,
      technicalSpecifications: "Core i5-1335U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 years warranty.",
      preferredSupplierId: suppliers[3].id,
    },
    {
      sku: "PRN-EPS-L3210",
      name: "Epson EcoTank L3210 A4 All-in-One Printer",
      category: "ICT Equipment",
      description: "Multifunction ink tank printer with scan, copy, and print functions.",
      unitOfMeasure: "unit",
      estimatedUnitCost: 9800.00,
      brand: "Epson",
      popularity: 80,
      technicalSpecifications: "EcoTank multifunction, print/scan/copy, borderless photo printing.",
      preferredSupplierId: suppliers[3].id,
    },
    {
      sku: "TAR-STK-MATTE",
      name: "Matte Vinyl Sticker Wrap 3ft x 8ft",
      category: "Signage & Prints",
      description: "Custom printed matte vinyl sticker wrap, waterproof and fade resistant.",
      unitOfMeasure: "pcs",
      estimatedUnitCost: 1800.00,
      brand: "Mactac",
      popularity: 45,
      technicalSpecifications: "3ft x 8ft vinyl matte sticker wrap, 1440dpi high resolution print.",
      preferredSupplierId: suppliers[2].id,
    },
  ];

  const seededProducts = [];
  for (const cp of catalogProductsData) {
    const categoryRecord = await prisma.category.upsert({
      where: { name: cp.category.trim() },
      update: {},
      create: { name: cp.category.trim() },
    });

    const unitRecord = await prisma.unitOfMeasure.upsert({
      where: { name: cp.unitOfMeasure.trim() },
      update: {},
      create: { name: cp.unitOfMeasure.trim(), abbreviation: cp.unitOfMeasure.trim().slice(0, 15) },
    });

    const brandRecord = await prisma.brand.upsert({
      where: { name: cp.brand.trim() },
      update: {},
      create: { name: cp.brand.trim() },
    });

    const prod = await prisma.catalogProduct.upsert({
      where: { productCode: cp.sku },
      update: {
        name: cp.name,
        description: cp.description,
        categoryId: categoryRecord.id,
        unitId: unitRecord.id,
        brandId: brandRecord.id,
        estimatedUnitCost: cp.estimatedUnitCost,
        popularity: cp.popularity,
      },
      create: {
        productCode: cp.sku,
        name: cp.name,
        description: cp.description,
        categoryId: categoryRecord.id,
        unitId: unitRecord.id,
        brandId: brandRecord.id,
        estimatedUnitCost: cp.estimatedUnitCost,
        popularity: cp.popularity,
      },
      include: {
        category: true,
        unit: true,
        brand: true,
      }
    });

    // Also seed SupplierProductPrice for these products so we have prices!
    await prisma.supplierProductPrice.upsert({
      where: {
        supplierId_productId: {
          supplierId: cp.preferredSupplierId,
          productId: prod.id,
        }
      },
      update: {
        unitPrice: cp.estimatedUnitCost,
        available: true,
      },
      create: {
        supplierId: cp.preferredSupplierId,
        productId: prod.id,
        unitPrice: cp.estimatedUnitCost,
        available: true,
        priceEffectiveDate: new Date(),
      }
    });

    seededProducts.push(prod);
    console.log(`  ✔ Catalog Product: ${cp.name} (${cp.sku})`);
  }
  console.log();

  // ── 11. PPMPs ─────────────────────────────────────────────────────────────
  console.log("📅 Seeding PPMPs...");
  const ppmp1 = await prisma.ppmp.upsert({
    where: { ppmpNumber: "PPMP-2026-ICT-001" },
    update: {},
    create: {
      ppmpNumber: "PPMP-2026-ICT-001",
      projectTitle: "ICT Equipment Upgrades 2026",
      department: "ICT Department",
      office: "Information & Communications Technology Office",
      fundingSource: "GAA 2026",
      estimatedBudget: 150000.00,
      status: PpmpStatus.Approved,
      items: {
        create: [
          {
            generalDescription: "Lenovo ThinkPad L14 Gen 4",
            quantity: 2,
            unit: {
              connectOrCreate: {
                where: { name: "unit" },
                create: { name: "unit", abbreviation: "unit" }
              }
            },
            estimatedUnitCost: 55000.00,
            estimatedCost: 110000.00,
            schedule: "Q1-Q2",
          },
          {
            generalDescription: "Epson EcoTank L3210 Printer",
            quantity: 4,
            unit: {
              connectOrCreate: {
                where: { name: "unit" },
                create: { name: "unit", abbreviation: "unit" }
              }
            },
            estimatedUnitCost: 9800.00,
            estimatedCost: 39200.00,
            schedule: "Q1-Q2",
          }
        ]
      }
    }
  });

  const ppmp2 = await prisma.ppmp.upsert({
    where: { ppmpNumber: "PPMP-2026-ADM-002" },
    update: {},
    create: {
      ppmpNumber: "PPMP-2026-ADM-002",
      projectTitle: "Administrative General Supplies 2026",
      department: "Administrative Division",
      office: "Office of the Director for Administration",
      fundingSource: "GAA 2026",
      estimatedBudget: 85000.00,
      status: PpmpStatus.Draft,
      items: {
        create: [
          {
            generalDescription: "Paper A4 80gsm",
            quantity: 100,
            unit: {
              connectOrCreate: {
                where: { name: "ream" },
                create: { name: "ream", abbreviation: "ream" }
              }
            },
            estimatedUnitCost: 220.00,
            estimatedCost: 22000.00,
            schedule: "Q3",
          }
        ]
      }
    }
  });
  console.log(`  ✔ PPMP Approved: ${ppmp1.ppmpNumber}`);
  console.log(`  ✔ PPMP Draft: ${ppmp2.ppmpNumber}\n`);

  // ── 12. PURCHASE REQUESTS (PRs) ───────────────────────────────────────────
  console.log("🛍️  Seeding Purchase Requests...");
  const pr1 = await prisma.purchaseRequest.upsert({
    where: { prNumber: "PR-2026-ICT-001" },
    update: {},
    create: {
      prNumber: "PR-2026-ICT-001",
      trackingNumber: "PROC-2026-0001",
      department: "ICT Department",
      office: "Information & Communications Technology Office",
      purpose: "Urgent upgrade of developer work laptops and shared scanners",
      fundingSource: "GAA 2026",
      ppmpId: ppmp1.id,
      estimatedBudget: 120000.00,
      totalCost: 119600.00,
      status: PrStatus.Received,
      items: {
        create: [
          {
            product: { connect: { id: seededProducts[3].id } },
            description: seededProducts[3].name,
            brand: seededProducts[3].brand?.name,
            quantity: 2,
            unit: { connect: { id: seededProducts[3].unitId } },
            estimatedUnitCost: seededProducts[3].estimatedUnitCost,
            estimatedCost: 110000.00,
            specification: catalogProductsData[3].technicalSpecifications,
          },
          {
            product: { connect: { id: seededProducts[4].id } },
            description: seededProducts[4].name,
            brand: seededProducts[4].brand?.name,
            quantity: 1,
            unit: { connect: { id: seededProducts[4].unitId } },
            estimatedUnitCost: seededProducts[4].estimatedUnitCost,
            estimatedCost: 9600.00,
            specification: catalogProductsData[4].technicalSpecifications,
          }
        ]
      }
    }
  });

  const pr2 = await prisma.purchaseRequest.upsert({
    where: { prNumber: "PR-2026-ADM-002" },
    update: {},
    create: {
      prNumber: "PR-2026-ADM-002",
      department: "Administrative Division",
      office: "Office of the Director for Administration",
      purpose: "Office replenishment",
      fundingSource: "GAA 2026",
      estimatedBudget: 50000.00,
      totalCost: 22000.00,
      status: PrStatus.Draft,
      items: {
        create: [
          {
            product: { connect: { id: seededProducts[0].id } },
            description: seededProducts[0].name,
            brand: seededProducts[0].brand?.name,
            quantity: 100,
            unit: { connect: { id: seededProducts[0].unitId } },
            estimatedUnitCost: seededProducts[0].estimatedUnitCost,
            estimatedCost: 22000.00,
            specification: catalogProductsData[0].technicalSpecifications,
          }
        ]
      }
    }
  });
  console.log(`  ✔ PR Received: ${pr1.prNumber} (${pr1.trackingNumber})`);
  console.log(`  ✔ PR Draft: ${pr2.prNumber}\n`);

  // ── 13. PURCHASE ORDERS (POs) ─────────────────────────────────────────────
  console.log("📜 Seeding Purchase Orders...");
  const po1 = await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-2026-0001" },
    update: {},
    create: {
      poNumber: "PO-2026-0001",
      supplierId: suppliers[0].id, // Batanes General Trading
      rfqId: rfq1.id,
      prId: pr1.id,
      totalCost: 38500.00,
      deliveryTerms: "FOB Destination, 7 calendar days",
      paymentTerms: "Charge Account, 30 days after complete delivery",
      status: PoStatus.Approved,
      items: {
        create: [
          {
            description: "Matte Vinyl Sticker Wrap with print (3ft x 8ft)",
            quantity: 10,
            unitPrice: 1800.00,
            totalCost: 18000.00,
          },
          {
            description: "Tarpaulin Banner (4ft x 8ft)",
            quantity: 15,
            unitPrice: 1250.00,
            totalCost: 18750.00,
          },
          {
            description: "Foam Board Mounted Print (A2 size)",
            quantity: 5,
            unitPrice: 350.00,
            totalCost: 1750.00,
          }
        ]
      }
    }
  });
  console.log(`  ✔ PO Approved: ${po1.poNumber}\n`);

  // ── 14. ACKNOWLEDGEMENT RECEIPTS ──────────────────────────────────────────
  console.log("🚛 Seeding Acknowledgement Receipts...");
  const receipt1 = await prisma.acknowledgementReceipt.upsert({
    where: { receiptNumber: "REC-2026-0001" },
    update: {},
    create: {
      receiptNumber: "REC-2026-0001",
      poId: po1.id,
      supplierId: suppliers[0].id,
      receivedBy: "Ricardo Santos",
      dateReceived: new Date("2026-06-22"),
      deliveryStatus: DeliveryStatus.CompleteDelivery,
      remarks: "All items inspected and found compliant with specifications.",
    }
  });
  console.log(`  ✔ Receipt Logged: ${receipt1.receiptNumber}\n`);

  // ── 15. SUPPLIER EVALUATIONS ──────────────────────────────────────────────
  console.log("⭐ Seeding Supplier Evaluations...");
  await prisma.supplierEvaluation.create({
    data: {
      supplierId: suppliers[0].id,
      evaluationType: EvaluationType.EndUser,
      evaluatorName: "Dr. Juan Dela Cruz",
      evaluationDate: new Date("2026-06-23"),
      productQuality: 4,
      deliveryCompliance: 4,
      accuracy: 3,
      responsiveness: 4,
      communication: 4,
      costEffectiveness: 3,
      overallSatisfaction: 4,
      comments: "Excellent print quality on the vinyl sticker wraps. Highly recommended.",
    }
  });

  await prisma.supplierEvaluation.create({
    data: {
      supplierId: suppliers[0].id,
      evaluationType: EvaluationType.ProcurementOffice,
      evaluatorName: "Procurement Officer Admin",
      evaluationDate: new Date("2026-06-23"),
      rfqResponsiveness: 4,
      competitivePricing: 3,
      specificationCompliance: 4,
      documentCompliance: 4,
      deliveryPerformance: 4,
      comments: "Quick bid response and perfect document completeness.",
    }
  });
  console.log("  ✔ 2 supplier evaluations for Batanes General Trading\n");

  // ── 16. FORM TEMPLATES & WORKFLOW CONFIGS ──────────────────────────────────
  console.log("⚙️  Seeding Form & Workflow Builders...");
  await prisma.formTemplate.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Supplier Evaluation Form v1",
      version: 1,
      fields: [
        { name: "productQuality", label: "Product Quality", type: "number", required: true },
        { name: "deliveryCompliance", label: "Delivery Compliance", type: "number", required: true },
        { name: "comments", label: "Additional Comments", type: "textarea", required: false }
      ],
      notes: "Standard form used for end-user evaluations of goods and services."
    }
  });

  await prisma.workflowConfig.upsert({
    where: { moduleName: "PR" },
    update: {},
    create: {
      moduleName: "PR",
      steps: [
        { role: "End User", level: 1, action: "Submit" },
        { role: "Administrative Approver", level: 2, action: "Budget Audit" },
        { role: "Procurement Officer", level: 3, action: "Final Review & Receive" }
      ]
    }
  });
  console.log("  ✔ Form and Workflow builder seeded.\n");

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
