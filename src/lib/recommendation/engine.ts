import { prisma } from "../prisma";
import { WEIGHTS, CriterionWeights } from "./weights";
import {
  calculatePriceScore,
  calculateDeliveryScore,
  calculateReliabilityScore,
  calculateComplianceScore,
  calculateHistoricalPerformanceScore,
} from "./scoring";
import { forecastProductPrice } from "../forecast/engine";
import type {
  SupplierRecommendation,
  RecommendationEngineResult,
  IndividualScores,
  RfqQuoteRecommendation,
  RfqCanvassResult,
} from "./types";

/**
 * Maps a confidence score percentage to a descriptive level label.
 * Rules:
 *   90–100 → High
 *   70–89  → Medium
 *   Below 70 → Low
 */
export function getConfidenceLabel(percentage: number): "High" | "Medium" | "Low" {
  if (percentage >= 90) return "High";
  if (percentage >= 70) return "Medium";
  return "Low";
}

/**
 * Executes the Multi-Criteria Decision-Making (MCDM) scoring engine for a given catalog product.
 * Fetches data from active supplier prices or falls back to historical records.
 */
export async function recommendBestSupplierInternal(productId: number): Promise<RecommendationEngineResult> {
  // 1. Fetch the product details to verify it exists
  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId, isActive: true },
  });

  if (!product) {
    return {
      productId,
      topSupplier: null,
      rankedSuppliers: [],
      reason: "Catalog product not found or is inactive.",
      confidence: 0,
      confidenceLabel: "Low",
      forecastTrend: "unknown",
      expectedChange: null,
    };
  }

  // 2. Fetch ARIMA forecast
  const forecast = await forecastProductPrice(productId);
  const forecastPrice = forecast && forecast.points.length > 0 ? forecast.points[0].value : null;
  const forecastTrend = forecast ? forecast.trend : "unknown";

  // Calculate Expected Change percentage from the forecast
  let expectedChange: string | null = null;
  if (forecastPrice !== null && product.estimatedUnitCost > 0) {
    const changePct = ((forecastPrice - Number(product.estimatedUnitCost)) / Number(product.estimatedUnitCost)) * 100;
    expectedChange = changePct >= 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`;
  }

  // 3. Fetch active supplier prices
  let activePrices = await prisma.supplierProductPrice.findMany({
    where: { productId, available: true },
    include: {
      supplier: {
        include: {
          evaluations: true,
          purchaseOrders: true,
        },
      },
    },
  });

  const recommendations: SupplierRecommendation[] = [];

  // Determine if we need to fall back to historical records because of no active pricing
  if (activePrices.length === 0) {
    // Graceful Fallback: Query historical prices for this product to find suppliers
    const histRecords = await prisma.historicalPrice.findMany({
      where: { productId },
      orderBy: { procurementDate: "desc" },
    });

    if (histRecords.length === 0) {
      return {
        productId,
        topSupplier: null,
        rankedSuppliers: [],
        reason: "No active supplier prices or historical procurement records exist for this product.",
        confidence: 20,
        confidenceLabel: "Low",
        forecastTrend: "unknown",
        expectedChange: null,
      };
    }

    // Get unique suppliers who supplied this product historically
    const uniqueSupplierIds = Array.from(
      new Set(histRecords.map((h) => h.supplierId).filter((id): id is number => id !== null))
    );

    const suppliers = await prisma.supplier.findMany({
      where: { id: { in: uniqueSupplierIds } },
      include: {
        evaluations: true,
        purchaseOrders: true,
      },
    });

    // Compute metrics using historical prices as current quotes
    const minPrice = Math.min(...histRecords.map((h) => h.unitPrice.toNumber()));
    const minDeliveryDays = Math.min(...suppliers.map((s) => s.historicalDeliveryDays).filter((d) => d > 0));

    for (const supplier of suppliers) {
      const supplierHistRecords = histRecords.filter((h) => h.supplierId === supplier.id);
      const currentPrice = supplierHistRecords.length > 0 ? supplierHistRecords[0].unitPrice.toNumber() : 0;
      const deliveryDays = supplier.historicalDeliveryDays || 7; // fallback default

      const rec = await computeMCDMScores({
        supplier,
        productId,
        currentPrice,
        deliveryDays,
        minPrice,
        minDeliveryDays: minDeliveryDays > 0 ? minDeliveryDays : undefined,
        forecastPrice,
      });

      recommendations.push(rec);
    }
  } else {
    // Normal Flow: Process active supplier quotes
    const minPrice = Math.min(...activePrices.map((sp) => sp.unitPrice.toNumber()));
    const minDeliveryDays = Math.min(
      ...activePrices.map((sp) => sp.supplier.historicalDeliveryDays).filter((d) => d > 0)
    );

    for (const ap of activePrices) {
      const currentPrice = ap.unitPrice.toNumber();
      const deliveryDays = ap.supplier.historicalDeliveryDays || 7;

      const rec = await computeMCDMScores({
        supplier: ap.supplier,
        productId,
        currentPrice,
        deliveryDays,
        minPrice,
        minDeliveryDays: minDeliveryDays > 0 ? minDeliveryDays : undefined,
        forecastPrice,
      });

      recommendations.push(rec);
    }
  }

  // 4. Sort and Rank Suppliers (Highest overallScore first)
  recommendations.sort((a, b) => b.overallScore - a.overallScore);

  const topSupplier = recommendations.length > 0 ? recommendations[0] : null;

  // 5. Academic explanation explaining the MCDM structure
  const academicExplanation =
    "Generated using a Multi-Criteria Decision-Making (MCDM) Weighted Scoring Model. " +
    "Rather than choosing solely by lowest cost, this model balances price (40%), delivery speed (20%), " +
    "historical reliability (20%), compliance (10%), and historical performance (10%) to identify " +
    "the best overall value for the institution.";

  const overallConfidence = topSupplier ? topSupplier.confidence : 30;
  const overallConfidenceLabel = getConfidenceLabel(overallConfidence);

  return {
    productId,
    topSupplier,
    rankedSuppliers: recommendations.slice(0, 5), // Top 5 Suppliers
    reason: academicExplanation,
    confidence: overallConfidence,
    confidenceLabel: overallConfidenceLabel,
    forecastTrend,
    expectedChange,
  };
}

/**
 * Computes the individual MCDM scores, overall weighted score, reasons, and confidence for a single supplier.
 */
async function computeMCDMScores({
  supplier,
  productId,
  currentPrice,
  deliveryDays,
  minPrice,
  minDeliveryDays,
  forecastPrice,
}: {
  supplier: any; // Supplier with evaluations and purchaseOrders
  productId: number;
  currentPrice: number;
  deliveryDays: number;
  minPrice: number;
  minDeliveryDays?: number;
  forecastPrice: number | null;
}): Promise<SupplierRecommendation> {
  // 1. Gather historical prices for this product and supplier
  const supplierHistPrices = await prisma.historicalPrice.findMany({
    where: { productId, supplierId: supplier.id },
    orderBy: { procurementDate: "asc" },
  });
  let pricesList = supplierHistPrices.map((hp) => hp.unitPrice.toNumber());

  // Fallback: If no prices for this specific product, query general historical prices for this supplier
  if (pricesList.length === 0) {
    const generalHistPrices = await prisma.historicalPrice.findMany({
      where: { supplierId: supplier.id },
      orderBy: { procurementDate: "asc" },
    });
    pricesList = generalHistPrices.map((hp) => hp.unitPrice.toNumber());
  }

  // 2. Gather evaluation stats
  const evaluations = supplier.evaluations || [];
  const evaluationsCount = evaluations.length;

  let ratingsSum = 0;
  let ratingsCount = 0;
  let docSum = 0;
  let docCount = 0;

  evaluations.forEach((ev: any) => {
    const fields = [
      ev.productQuality,
      ev.deliveryCompliance,
      ev.accuracy,
      ev.responsiveness,
      ev.communication,
      ev.costEffectiveness,
      ev.overallSatisfaction,
      ev.rfqResponsiveness,
      ev.competitivePricing,
      ev.specificationCompliance,
      ev.documentCompliance,
      ev.deliveryPerformance,
    ];
    fields.forEach((f) => {
      if (f !== null && f !== undefined) {
        ratingsSum += f;
        ratingsCount++;
      }
    });

    if (ev.documentCompliance !== null && ev.documentCompliance !== undefined) {
      docSum += ev.documentCompliance;
      docCount++;
    }
  });

  const avgEvaluationRating = ratingsCount > 0 ? ratingsSum / ratingsCount : undefined;
  const avgDocumentCompliance = docCount > 0 ? docSum / docCount : null;

  // 3. PO completion stats
  const purchaseOrders = supplier.purchaseOrders || [];
  const nonDraftPos = purchaseOrders.filter((po: any) => po.status !== "Draft");
  const completedPos = nonDraftPos.filter((po: any) => po.status === "Delivered" || po.status === "Closed");

  // 4. Compute Sub-Scores (0 to 100)
  const rawPriceScore = calculatePriceScore(currentPrice, minPrice);

  const rawDeliveryScore = calculateDeliveryScore({
    historicalDeliveryDays: supplier.historicalDeliveryDays,
    totalDeliveries: supplier.totalDeliveriesCount,
    lateDeliveries: supplier.lateDeliveriesCount,
    minDeliveryDays,
  });

  const rawReliabilityScore = calculateReliabilityScore({
    reliabilityRating: supplier.reliabilityRating ? Number(supplier.reliabilityRating) : undefined,
    hasEvaluations: evaluationsCount > 0,
    avgEvaluationRating,
    qualityComplianceRate: supplier.qualityComplianceRate ? Number(supplier.qualityComplianceRate) : undefined,
    totalPOs: nonDraftPos.length,
    completedPOs: completedPos.length,
  });

  const rawComplianceScore = calculateComplianceScore({
    isVerified: supplier.isVerified,
    tin: supplier.tin,
    businessAddress: supplier.businessAddress,
    contactNumber: supplier.contactNumber,
    avgDocumentCompliance,
  });

  const rawHistPerformanceScore = calculateHistoricalPerformanceScore({
    historicalPrices: pricesList,
    currentPrice,
    forecastPrice,
  });

  // 5. Apply Weights (MCDM Model)
  const weightedPrice = rawPriceScore * WEIGHTS.price;
  const weightedDelivery = rawDeliveryScore * WEIGHTS.delivery;
  const weightedReliability = rawReliabilityScore * WEIGHTS.reliability;
  const weightedCompliance = rawComplianceScore * WEIGHTS.compliance;
  const weightedHist = rawHistPerformanceScore * WEIGHTS.historicalPerformance;

  const overallScore = Math.round((weightedPrice + weightedDelivery + weightedReliability + weightedCompliance + weightedHist) * 100) / 100;

  const individualScores: IndividualScores = {
    priceScore: Math.round(rawPriceScore * 100) / 100,
    deliveryScore: Math.round(rawDeliveryScore * 100) / 100,
    reliabilityScore: Math.round(rawReliabilityScore * 100) / 100,
    complianceScore: Math.round(rawComplianceScore * 100) / 100,
    historicalPerformanceScore: Math.round(rawHistPerformanceScore * 100) / 100,
  };

  // 6. Calculate Confidence score (0 to 100) based on data completeness
  let infoScore = 0;
  if (supplier.tin) infoScore += 10;
  if (supplier.businessAddress) infoScore += 5;
  if (supplier.contactNumber) infoScore += 5;
  if (supplier.contactPerson) infoScore += 5;

  let histScore = 0;
  if (pricesList.length >= 6) histScore = 25;
  else if (pricesList.length >= 3) histScore = 15;
  else if (pricesList.length >= 1) histScore = 8;

  let delivScore = 0;
  if (supplier.totalDeliveriesCount > 0 || supplier.historicalDeliveryDays > 0) {
    delivScore = 25;
  }

  let evalScore = 0;
  if (evaluationsCount >= 3) evalScore = 25;
  else if (evaluationsCount >= 1) evalScore = 15;

  const confidence = infoScore + histScore + delivScore + evalScore;
  const confidenceLabel = getConfidenceLabel(confidence);

  // 7. Compile explanation reasons dynamically from calculated scores (Point 2)
  const explanations: string[] = [];
  if (individualScores.priceScore >= 95) {
    explanations.push("Lowest evaluated price among suppliers");
  } else if (individualScores.priceScore >= 80) {
    explanations.push("Competitive price quote");
  }

  if (individualScores.deliveryScore >= 85) {
    explanations.push("Excellent delivery performance");
  } else if (individualScores.deliveryScore >= 70) {
    explanations.push("Satisfactory delivery speed and history");
  }

  if (individualScores.reliabilityScore >= 80) {
    explanations.push("High supplier reliability");
  } else if (individualScores.reliabilityScore >= 60) {
    explanations.push("Moderate supplier reliability");
  }

  if (individualScores.complianceScore >= 90) {
    explanations.push("Complete compliance documents");
  } else if (individualScores.complianceScore >= 70) {
    explanations.push("Adequate regulatory compliance");
  }

  if (individualScores.historicalPerformanceScore >= 80) {
    explanations.push("Stable historical pricing trend");
  } else if (individualScores.historicalPerformanceScore >= 60) {
    explanations.push("Moderate price stability");
  }

  const reasonString = explanations.map((e) => `• ${e}`).join("\n");

  return {
    supplier: {
      ...supplier,
      reliabilityRating: supplier.reliabilityRating ? Number(supplier.reliabilityRating) : null,
      qualityComplianceRate: supplier.qualityComplianceRate ? Number(supplier.qualityComplianceRate) : null,
      onTimeDeliveryRate: supplier.onTimeDeliveryRate ? Number(supplier.onTimeDeliveryRate) : null,
    },
    overallScore,
    individualScores,
    reason: reasonString || "• Recommended based on balanced MCDM score metrics",
    confidence,
    confidenceLabel,
    price: currentPrice,
    deliveryDays,
  };
}

// ─── CANVASSING WORKFLOW ENGINE ──────────────────────────────────────────────

/**
 * Scores and compares submitted quotes for a specific RFQ using custom or default MCDM weights.
 * This directly supports RFQ evaluation, supplier comparison, award recommendation, and sensitivity analysis.
 */
export async function scoreRfqQuotesInternal(
  rfqId: number,
  customWeights?: CriterionWeights
): Promise<RfqCanvassResult | null> {
  const w = customWeights || WEIGHTS;

  // 1. Fetch RFQ, items, and products
  const rfq = await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!rfq) return null;

  // 2. Fetch quotes submitted for this RFQ
  const quotes = await prisma.supplierQuote.findMany({
    where: { rfqId },
    include: {
      supplier: {
        include: {
          evaluations: true,
          purchaseOrders: true,
        },
      },
    },
  });

  if (quotes.length === 0) {
    return {
      rfqId,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      approvedBudgetContract: Number(rfq.approvedBudgetContract),
      status: rfq.status,
      topRecommendation: null,
      rankedRecommendations: [],
      reason: "No supplier quotes submitted for this RFQ.",
    };
  }

  // 3. Find benchmarks across quotes
  const prices = quotes.map((q) => Number(q.totalQuotedAmount));
  const minPrice = Math.min(...prices);

  const deliveries = quotes.map((q) => q.offeredDeliveryDays);
  const minDeliveryDays = Math.min(...deliveries);

  // 4. Retrieve first product forecast as reference if items exist
  const productIds = rfq.items.map((item) => item.productId).filter((id): id is number => id !== null);
  let forecastPrice: number | null = null;
  let forecastTrend: "increasing" | "decreasing" | "stable" | "unknown" = "unknown";
  let expectedChange: string | null = null;
  let historicalAvgPrice: number | undefined = undefined;
  let historicalMinPrice: number | undefined = undefined;
  let historicalLatestPrice: number | undefined = undefined;

  if (productIds.length > 0) {
    const firstProductId = productIds[0];
    const forecast = await forecastProductPrice(firstProductId);
    if (forecast && forecast.points.length > 0) {
      forecastPrice = forecast.points[0].value;
      forecastTrend = forecast.trend;

      const firstProduct = rfq.items.find((item) => item.productId === firstProductId)?.product;
      const estCost = firstProduct ? Number(firstProduct.estimatedUnitCost) : 0;
      if (estCost > 0) {
        const changePct = ((forecastPrice - estCost) / estCost) * 100;
        expectedChange = changePct >= 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`;
      }
    }

    // Historical price metrics for dashboard
    const avgPriceRes = await prisma.historicalPrice.aggregate({
      _avg: { unitPrice: true },
      _min: { unitPrice: true },
      where: { productId: firstProductId },
    });
    historicalAvgPrice = avgPriceRes._avg.unitPrice ? avgPriceRes._avg.unitPrice.toNumber() : undefined;
    historicalMinPrice = avgPriceRes._min.unitPrice ? avgPriceRes._min.unitPrice.toNumber() : undefined;

    const latestPriceRes = await prisma.historicalPrice.findFirst({
      where: { productId: firstProductId },
      orderBy: { procurementDate: "desc" },
      select: { unitPrice: true },
    });
    historicalLatestPrice = latestPriceRes ? latestPriceRes.unitPrice.toNumber() : undefined;
  }

  const scoredQuotes: RfqQuoteRecommendation[] = [];

  // 5. Compute MCDM Scores for each submitted quote
  for (const quote of quotes) {
    const supplier = quote.supplier;
    const currentPrice = Number(quote.totalQuotedAmount);
    const deliveryDays = quote.offeredDeliveryDays;

    // A. Price Score (Lowest evaluated price gets 100%)
    const rawPriceScore = calculatePriceScore(currentPrice, minPrice);

    // B. Delivery Score (Speed + On-Time Rate)
    const rawDeliveryScore = calculateDeliveryScore({
      historicalDeliveryDays: deliveryDays,
      totalDeliveries: supplier.totalDeliveriesCount,
      lateDeliveries: supplier.lateDeliveriesCount,
      minDeliveryDays,
    });

    // C. Reliability Score
    const evaluations = supplier.evaluations || [];
    const evaluationsCount = evaluations.length;
    let ratingsSum = 0;
    let ratingsCount = 0;
    let docSum = 0;
    let docCount = 0;

    evaluations.forEach((ev: any) => {
      const fields = [
        ev.productQuality,
        ev.deliveryCompliance,
        ev.accuracy,
        ev.responsiveness,
        ev.communication,
        ev.costEffectiveness,
        ev.overallSatisfaction,
        ev.rfqResponsiveness,
        ev.competitivePricing,
        ev.specificationCompliance,
        ev.documentCompliance,
        ev.deliveryPerformance,
      ];
      fields.forEach((f) => {
        if (f !== null && f !== undefined) {
          ratingsSum += f;
          ratingsCount++;
        }
      });
      if (ev.documentCompliance !== null && ev.documentCompliance !== undefined) {
        docSum += ev.documentCompliance;
        docCount++;
      }
    });

    const avgEvaluationRating = ratingsCount > 0 ? ratingsSum / ratingsCount : undefined;
    const avgDocumentCompliance = docCount > 0 ? docSum / docCount : null;

    const purchaseOrders = supplier.purchaseOrders || [];
    const nonDraftPos = purchaseOrders.filter((po: any) => po.status !== "Draft");
    const completedPos = nonDraftPos.filter((po: any) => po.status === "Delivered" || po.status === "Closed");

    const rawReliabilityScore = calculateReliabilityScore({
      reliabilityRating: supplier.reliabilityRating ? Number(supplier.reliabilityRating) : undefined,
      hasEvaluations: evaluationsCount > 0,
      avgEvaluationRating,
      qualityComplianceRate: supplier.qualityComplianceRate ? Number(supplier.qualityComplianceRate) : undefined,
      totalPOs: nonDraftPos.length,
      completedPOs: completedPos.length,
    });

    // D. Compliance Score
    const rawComplianceScore = calculateComplianceScore({
      isVerified: supplier.isVerified,
      tin: supplier.tin,
      businessAddress: supplier.businessAddress,
      contactNumber: supplier.contactNumber,
      avgDocumentCompliance,
    });

    // E. Historical Performance Score
    let supplierHistPrices = await prisma.historicalPrice.findMany({
      where: { productId: { in: productIds }, supplierId: supplier.id },
      orderBy: { procurementDate: "asc" },
    });
    let pricesList = supplierHistPrices.map((hp) => hp.unitPrice.toNumber());

    if (pricesList.length === 0) {
      const generalHistPrices = await prisma.historicalPrice.findMany({
        where: { supplierId: supplier.id },
        orderBy: { procurementDate: "asc" },
      });
      pricesList = generalHistPrices.map((hp) => hp.unitPrice.toNumber());
    }

    const rawHistPerformanceScore = calculateHistoricalPerformanceScore({
      historicalPrices: pricesList,
      currentPrice,
      forecastPrice,
    });

    // F. Apply MCDM weights dynamically
    const weightedPrice = rawPriceScore * w.price;
    const weightedDelivery = rawDeliveryScore * w.delivery;
    const weightedReliability = rawReliabilityScore * w.reliability;
    const weightedCompliance = rawComplianceScore * w.compliance;
    const weightedHist = rawHistPerformanceScore * w.historicalPerformance;

    const overallScore = Math.round((weightedPrice + weightedDelivery + weightedReliability + weightedCompliance + weightedHist) * 100) / 100;

    const individualScores: IndividualScores = {
      priceScore: Math.round(rawPriceScore * 100) / 100,
      deliveryScore: Math.round(rawDeliveryScore * 100) / 100,
      reliabilityScore: Math.round(rawReliabilityScore * 100) / 100,
      complianceScore: Math.round(rawComplianceScore * 100) / 100,
      historicalPerformanceScore: Math.round(rawHistPerformanceScore * 100) / 100,
    };

    // G. Confidence Score (completeness indicators)
    let infoScore = 0;
    if (supplier.tin) infoScore += 10;
    if (supplier.businessAddress) infoScore += 5;
    if (supplier.contactNumber) infoScore += 5;
    if (supplier.contactPerson) infoScore += 5;

    let priceHistScore = 0;
    if (pricesList.length >= 6) priceHistScore = 25;
    else if (pricesList.length >= 3) priceHistScore = 15;
    else if (pricesList.length >= 1) priceHistScore = 8;

    let delivHistScore = 0;
    if (supplier.totalDeliveriesCount > 0 || supplier.historicalDeliveryDays > 0) {
      delivHistScore = 25;
    }

    let evalHistScore = 0;
    if (evaluationsCount >= 3) evalHistScore = 25;
    else if (evaluationsCount >= 1) evalHistScore = 15;

    const confidence = infoScore + priceHistScore + delivHistScore + evalHistScore;
    const confidenceLabel = getConfidenceLabel(confidence);

    // H. Auto-explanations from calculated scores
    const explanations: string[] = [];
    if (individualScores.priceScore >= 95) {
      explanations.push("Lowest evaluated price among suppliers");
    } else if (individualScores.priceScore >= 80) {
      explanations.push("Competitive price quote");
    }

    if (individualScores.deliveryScore >= 85) {
      explanations.push("Excellent delivery performance");
    } else if (individualScores.deliveryScore >= 70) {
      explanations.push("Satisfactory delivery speed and history");
    }

    if (individualScores.reliabilityScore >= 80) {
      explanations.push("High supplier reliability");
    } else if (individualScores.reliabilityScore >= 60) {
      explanations.push("Moderate supplier reliability");
    }

    if (individualScores.complianceScore >= 90) {
      explanations.push("Complete compliance documents");
    } else if (individualScores.complianceScore >= 70) {
      explanations.push("Adequate regulatory compliance");
    }

    if (individualScores.historicalPerformanceScore >= 80) {
      explanations.push("Stable historical pricing trend");
    } else if (individualScores.historicalPerformanceScore >= 60) {
      explanations.push("Moderate price stability");
    }

    const reasonString = explanations.map((e) => `• ${e}`).join("\n");

    scoredQuotes.push({
      quoteId: quote.id,
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      price: currentPrice,
      deliveryDays,
      individualScores,
      overallScore,
      reason: reasonString,
      confidence,
      confidenceLabel,
      historicalAvgPrice,
      historicalMinPrice,
      historicalLatestPrice,
      forecastPrice,
      forecastTrend,
      expectedChange,
    });
  }

  // 6. Sort by overall score descending
  scoredQuotes.sort((a, b) => b.overallScore - a.overallScore);

  const topRecommendation = scoredQuotes.length > 0 ? scoredQuotes[0] : null;

  const academicExplanation =
    "Generated using a Multi-Criteria Decision-Making (MCDM) Weighted Scoring Model. " +
    "Balances price, delivery performance, supplier reliability, document compliance, and historical performance " +
    "to recommend the optimal procurement award.";

  return {
    rfqId,
    rfqNumber: rfq.rfqNumber,
    title: rfq.title,
    approvedBudgetContract: Number(rfq.approvedBudgetContract),
    status: rfq.status,
    topRecommendation,
    rankedRecommendations: scoredQuotes,
    reason: academicExplanation,
  };
}
