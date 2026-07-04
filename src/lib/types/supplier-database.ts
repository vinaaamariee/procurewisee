import { Prisma } from "@prisma/client";

// 1. User profile representing a fully typed profile
export type UserProfileWithRole = Prisma.UserProfileGetPayload<{}>;

// 2. RFQ including its requisition line items and all submitted quotes
export type RfqWithQuotes = Prisma.RequestForQuoteGetPayload<{
  include: {
    items: true;
    quotes: {
      include: {
        supplier: true;
        quoteDetails: true;
      };
    };
  };
}>;

// 3. A supplier's quote along with the supplier's master metadata and line-item details
export type SupplierQuoteWithProfile = Prisma.SupplierQuoteGetPayload<{
  include: {
    supplier: true;
    quoteDetails: {
      include: {
        rfqItem: true;
      };
    };
  };
}>;

// 4. Recommendation containing the MCDM scores, supplier metadata, and associated quote details
export type RecommendationWithRank = Prisma.RecommendationGetPayload<{
  include: {
    supplier: true;
    supplierQuote: true;
    canvas: true;
  };
}>;
