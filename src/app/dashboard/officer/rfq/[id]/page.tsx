import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { forecastProductPrice } from '@/lib/forecast/engine';
import RfqEvaluationClient from './RfqEvaluationClient';
import { startTimer } from '@/lib/performance-logger';
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = { title: 'Evaluate Solicitations — ProcureWise' };

type Params = Promise<{ id: string }>;

export default async function RfqEvaluationPage({ params }: { params: Params }) {
  const { id } = await params;
  const rfqId = parseInt(id);

  if (isNaN(rfqId)) {
    return notFound();
  }

  // 1. Enforce Procurement Officer role
  await requireRole('Procurement Officer');

  // 2. Fetch RFQ, Quotes, and existing recommendations in parallel
  const timer1 = startTimer(`RfqEvaluationPage-Fetch-rfqId-${rfqId}`);
  const [rfq, quotes, recommendations] = await Promise.all([
    prisma.requestForQuote.findUnique({
      where: { id: rfqId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }),
    prisma.supplierQuote.findMany({
      where: { rfqId },
      include: {
        supplier: {
          include: {
            evaluations: true,
            purchaseOrders: true
          }
        }
      }
    }),
    prisma.recommendation.findMany({
      where: {
        canvas: { rfqId }
      },
      include: {
        supplier: true,
        supplierQuote: true
      },
      orderBy: {
        rankPosition: 'asc'
      }
    })
  ]);
  timer1.end();

  if (!rfq) {
    return notFound();
  }

  // 3. Pre-fetch historical and forecast parameters for the main items in parallel
  const timer2 = startTimer(`RfqEvaluationPage-Analysis-rfqId-${rfqId}`);
  const productIds = rfq.items.map(item => item.productId).filter((id): id is number => id !== null);
  const supplierIds = quotes.map(q => q.supplierId);
  const firstProductId = productIds.length > 0 ? productIds[0] : null;

  const [
    forecast,
    avgPriceRes,
    latestPriceRes,
    allSpecificHistPrices,
    allGeneralHistPrices
  ] = await Promise.all([
    firstProductId ? forecastProductPrice(firstProductId) : Promise.resolve(null),
    firstProductId ? prisma.historicalPrice.aggregate({
      _avg: { unitPrice: true },
      _min: { unitPrice: true },
      where: { productId: firstProductId }
    }) : Promise.resolve(null),
    firstProductId ? prisma.historicalPrice.findFirst({
      where: { productId: firstProductId },
      orderBy: { procurementDate: 'desc' },
      select: { unitPrice: true }
    }) : Promise.resolve(null),
    prisma.historicalPrice.findMany({
      where: {
        productId: { in: productIds },
        supplierId: { in: supplierIds }
      },
      orderBy: { procurementDate: 'asc' }
    }),
    prisma.historicalPrice.findMany({
      where: {
        supplierId: { in: supplierIds }
      },
      orderBy: { procurementDate: 'asc' }
    })
  ]);
  timer2.end();

  let forecastPrice: number | null = null;
  let forecastTrend: "increasing" | "decreasing" | "stable" | "unknown" = "unknown";
  let expectedChange: string | null = null;
  let historicalAvgPrice: number | undefined = undefined;
  let historicalMinPrice: number | undefined = undefined;
  let historicalLatestPrice: number | undefined = undefined;

  if (firstProductId) {
    if (forecast && forecast.points.length > 0) {
      forecastPrice = forecast.points[0].value;
      forecastTrend = forecast.trend;
      
      const firstProduct = rfq.items.find(item => item.productId === firstProductId)?.product;
      const estCost = firstProduct ? Number(firstProduct.estimatedUnitCost) : 0;
      if (estCost > 0) {
        const changePct = ((forecastPrice - estCost) / estCost) * 100;
        expectedChange = changePct >= 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`;
      }
    }

    if (avgPriceRes) {
      historicalAvgPrice = avgPriceRes._avg.unitPrice ? avgPriceRes._avg.unitPrice.toNumber() : undefined;
      historicalMinPrice = avgPriceRes._min.unitPrice ? avgPriceRes._min.unitPrice.toNumber() : undefined;
    }

    historicalLatestPrice = latestPriceRes ? latestPriceRes.unitPrice.toNumber() : undefined;
  }

  // 4. Gather historical price lists for each supplier using pre-fetched data (no N+1 queries)
  const quoteMetrics = [];
  for (const quote of quotes) {
    const supplier = quote.supplier;
    
    // Filter specific prices from pre-fetched array in memory
    const supplierHistPrices = allSpecificHistPrices.filter(
      hp => hp.supplierId === supplier.id
    );
    let pricesList = supplierHistPrices.map(hp => hp.unitPrice.toNumber());

    if (pricesList.length === 0) {
      // Fallback: Filter general prices from pre-fetched array in memory
      const generalHistPrices = allGeneralHistPrices.filter(
        hp => hp.supplierId === supplier.id
      );
      pricesList = generalHistPrices.map(hp => hp.unitPrice.toNumber());
    }

    quoteMetrics.push({
      quoteId: quote.id,
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      price: Number(quote.totalQuotedAmount),
      deliveryDays: quote.offeredDeliveryDays,
      historicalDeliveryDays: supplier.historicalDeliveryDays || 7,
      totalDeliveriesCount: supplier.totalDeliveriesCount,
      lateDeliveriesCount: supplier.lateDeliveriesCount,
      reliabilityRating: supplier.reliabilityRating ? Number(supplier.reliabilityRating) : undefined,
      qualityComplianceRate: supplier.qualityComplianceRate ? Number(supplier.qualityComplianceRate) : undefined,
      isVerified: supplier.isVerified,
      tin: supplier.tin,
      businessAddress: supplier.businessAddress,
      contactNumber: supplier.contactNumber,
      contactPerson: supplier.contactPerson,
      evaluations: supplier.evaluations || [],
      purchaseOrders: supplier.purchaseOrders || [],
      pricesList,
    });
  }



  return (
  <div className="space-y-8 max-w-6xl mx-auto">
    
    <SectionHeader
      title="Solicitation Canvass & Evaluation"
      subtitle="Evaluate submitted bids using the MCDM engine, run sensitivity analyses, and export structured recommendations."
    />

    <RfqEvaluationClient
      rfq={rfq}
      quoteMetrics={quoteMetrics}
      initialRecommendations={recommendations}
      forecastInfo={{
        forecastPrice,
        forecastTrend,
        expectedChange,
        historicalAvgPrice,
        historicalMinPrice,
        historicalLatestPrice
      }}
    />
  </div>
);
}
