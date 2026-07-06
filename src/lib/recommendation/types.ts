import { Supplier } from "@prisma/client";

export interface IndividualScores {
  priceScore: number;
  deliveryScore: number;
  reliabilityScore: number;
  complianceScore: number;
  historicalPerformanceScore: number;
}

export interface SupplierRecommendation {
  supplier: Supplier;
  overallScore: number;
  individualScores: IndividualScores;
  reason: string; // Dynamic explanations bullet list
  confidence: number; // Percentage
  confidenceLabel: "High" | "Medium" | "Low";
  price: number;
  deliveryDays: number;
}

export interface RecommendationEngineResult {
  productId: number;
  topSupplier: SupplierRecommendation | null;
  rankedSuppliers: SupplierRecommendation[];
  reason: string; // Academic explanation of MCDM model
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  forecastTrend: "increasing" | "decreasing" | "stable" | "unknown";
  expectedChange: string | null; // e.g. "+3.2%"
}

// ─── Canvassing Workflow Types ──────────────────────────────────────────────

export interface RfqQuoteRecommendation {
  quoteId: number;
  supplierId: number;
  supplierName: string;
  price: number;
  deliveryDays: number;
  individualScores: IndividualScores;
  overallScore: number;
  reason: string;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  historicalAvgPrice?: number;
  historicalMinPrice?: number;
  historicalLatestPrice?: number;
  forecastPrice?: number | null;
  forecastTrend?: "increasing" | "decreasing" | "stable" | "unknown";
  expectedChange?: string | null;
}

export interface RfqCanvassResult {
  rfqId: number;
  rfqNumber: string;
  title: string;
  approvedBudgetContract: number;
  status: string;
  topRecommendation: RfqQuoteRecommendation | null;
  rankedRecommendations: RfqQuoteRecommendation[];
  reason: string; // Academic explanation
}
