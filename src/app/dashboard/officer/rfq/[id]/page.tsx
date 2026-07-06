import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { forecastProductPrice } from '@/lib/forecast/engine';
import RfqEvaluationClient from './RfqEvaluationClient';

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

  // 2. Fetch RFQ details with its items
  const rfq = await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!rfq) {
    return notFound();
  }

  // 3. Fetch quotes submitted for this RFQ
  const quotes = await prisma.supplierQuote.findMany({
    where: { rfqId },
    include: {
      supplier: {
        include: {
          evaluations: true,
          purchaseOrders: true
        }
      }
    }
  });

  // 4. Pre-fetch historical and forecast parameters for the main items
  const productIds = rfq.items.map(item => item.productId).filter((id): id is number => id !== null);
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
      
      const firstProduct = rfq.items.find(item => item.productId === firstProductId)?.product;
      const estCost = firstProduct ? Number(firstProduct.estimatedUnitCost) : 0;
      if (estCost > 0) {
        const changePct = ((forecastPrice - estCost) / estCost) * 100;
        expectedChange = changePct >= 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`;
      }
    }

    const avgPriceRes = await prisma.historicalPrice.aggregate({
      _avg: { unitPrice: true },
      _min: { unitPrice: true },
      where: { productId: firstProductId }
    });
    historicalAvgPrice = avgPriceRes._avg.unitPrice ? avgPriceRes._avg.unitPrice.toNumber() : undefined;
    historicalMinPrice = avgPriceRes._min.unitPrice ? avgPriceRes._min.unitPrice.toNumber() : undefined;

    const latestPriceRes = await prisma.historicalPrice.findFirst({
      where: { productId: firstProductId },
      orderBy: { procurementDate: 'desc' },
      select: { unitPrice: true }
    });
    historicalLatestPrice = latestPriceRes ? latestPriceRes.unitPrice.toNumber() : undefined;
  }

  // 5. Gather historical price lists for each supplier
  const quoteMetrics = [];
  for (const quote of quotes) {
    const supplier = quote.supplier;
    
    let supplierHistPrices = await prisma.historicalPrice.findMany({
      where: { productId: { in: productIds }, supplierId: supplier.id },
      orderBy: { procurementDate: 'asc' }
    });
    let pricesList = supplierHistPrices.map(hp => hp.unitPrice.toNumber());

    if (pricesList.length === 0) {
      const generalHistPrices = await prisma.historicalPrice.findMany({
        where: { supplierId: supplier.id },
        orderBy: { procurementDate: 'asc' }
      });
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

  // 6. Fetch existing recommendations if any
  const recommendations = await prisma.recommendation.findMany({
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
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1f2937', margin: 0, letterSpacing: '-0.5px' }}>
          Solicitation Canvass & Evaluation
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
          Evaluate submitted bids using the MCDM engine, run sensitivity analyses, and export recommendations.
        </p>
      </div>

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
