-- DropTable (old Supplier model replaced by new suppliers table)
DROP TABLE IF EXISTS "Supplier" CASCADE;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Procurement Officer', 'Supplier', 'Administrative Approver');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('Draft', 'Published', 'Closed', 'Evaluated');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('Submitted', 'Under Review', 'Accepted', 'Rejected');

-- CreateTable: user_profiles
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: suppliers
CREATE TABLE "suppliers" (
    "supplier_id" SERIAL NOT NULL,
    "companyName" VARCHAR(150) NOT NULL,
    "tin" VARCHAR(15),
    "contactPerson" VARCHAR(100),
    "contactNumber" VARCHAR(20),
    "businessAddress" TEXT NOT NULL,
    "reliabilityRating" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "qualityComplianceRate" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "historicalDeliveryDays" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable: app_items
CREATE TABLE "app_items" (
    "app_item_id" SERIAL NOT NULL,
    "papCode" VARCHAR(50) NOT NULL,
    "objectCode" VARCHAR(50),
    "projectTitle" VARCHAR(255) NOT NULL,
    "endUserUnit" VARCHAR(100) NOT NULL,
    "generalDescription" TEXT NOT NULL,
    "modeOfProcurement" VARCHAR(100) NOT NULL DEFAULT 'Small Value Procurement',
    "sourceOfFund" VARCHAR(100) NOT NULL,
    "estimatedBudget" DECIMAL(12,2) NOT NULL,
    "fyYear" INTEGER NOT NULL DEFAULT 2026,
    "createdById" TEXT,

    CONSTRAINT "app_items_pkey" PRIMARY KEY ("app_item_id")
);

-- CreateTable: requests_for_quote
CREATE TABLE "requests_for_quote" (
    "rfq_id" SERIAL NOT NULL,
    "rfqNumber" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "approvedBudgetContract" DECIMAL(12,2) NOT NULL,
    "deadlineDate" DATE NOT NULL,
    "status" "RfqStatus" NOT NULL DEFAULT 'Draft',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_for_quote_pkey" PRIMARY KEY ("rfq_id")
);

-- CreateTable: rfq_items
CREATE TABLE "rfq_items" (
    "rfq_item_id" SERIAL NOT NULL,
    "rfqId" INTEGER NOT NULL,
    "appItemId" INTEGER,
    "itemNumber" VARCHAR(10) NOT NULL,
    "particulars" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" VARCHAR(20) NOT NULL,

    CONSTRAINT "rfq_items_pkey" PRIMARY KEY ("rfq_item_id")
);

-- CreateTable: supplier_quotes
CREATE TABLE "supplier_quotes" (
    "quote_id" SERIAL NOT NULL,
    "rfqId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "submissionDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "totalQuotedAmount" DECIMAL(12,2) NOT NULL,
    "offeredDeliveryDays" INTEGER NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'Submitted',

    CONSTRAINT "supplier_quotes_pkey" PRIMARY KEY ("quote_id")
);

-- CreateTable: quote_details
CREATE TABLE "quote_details" (
    "detail_id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "rfqItemId" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "quantityMultiplier" INTEGER NOT NULL DEFAULT 1,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quote_details_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable: canvas_abstracts
CREATE TABLE "canvas_abstracts" (
    "canvas_id" SERIAL NOT NULL,
    "rfqId" INTEGER NOT NULL,
    "openingDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "locationOpened" VARCHAR(100) NOT NULL DEFAULT 'Basco, Batanes',
    "compiledById" TEXT,

    CONSTRAINT "canvas_abstracts_pkey" PRIMARY KEY ("canvas_id")
);

-- CreateTable: recommendations
CREATE TABLE "recommendations" (
    "recomm_id" SERIAL NOT NULL,
    "canvasId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "supplierQuoteId" INTEGER NOT NULL,
    "compositeMcdmScore" DECIMAL(5,2) NOT NULL,
    "priceScore" DECIMAL(5,2) NOT NULL,
    "deliveryScore" DECIMAL(5,2) NOT NULL,
    "reliabilityScore" DECIMAL(5,2) NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "justificationLog" TEXT NOT NULL,
    "approverRemarks" TEXT,
    "approvalStatus" VARCHAR(30) NOT NULL DEFAULT 'Pending Review',
    "reviewedById" TEXT,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("recomm_id")
);

-- CreateTable: audit_trails
CREATE TABLE "audit_trails" (
    "audit_id" SERIAL NOT NULL,
    "userId" TEXT,
    "actionType" VARCHAR(50) NOT NULL,
    "tableAffected" VARCHAR(50) NOT NULL,
    "recordId" INTEGER NOT NULL,
    "oldState" JSONB,
    "newState" JSONB,
    "ipAddress" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trails_pkey" PRIMARY KEY ("audit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_username_key" ON "user_profiles"("username");
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");
CREATE UNIQUE INDEX "suppliers_tin_key" ON "suppliers"("tin");
CREATE UNIQUE INDEX "requests_for_quote_rfqNumber_key" ON "requests_for_quote"("rfqNumber");

-- AddForeignKey
ALTER TABLE "app_items" ADD CONSTRAINT "app_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "requests_for_quote" ADD CONSTRAINT "requests_for_quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "requests_for_quote"("rfq_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_appItemId_fkey" FOREIGN KEY ("appItemId") REFERENCES "app_items"("app_item_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "requests_for_quote"("rfq_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quote_details" ADD CONSTRAINT "quote_details_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "supplier_quotes"("quote_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quote_details" ADD CONSTRAINT "quote_details_rfqItemId_fkey" FOREIGN KEY ("rfqItemId") REFERENCES "rfq_items"("rfq_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "canvas_abstracts" ADD CONSTRAINT "canvas_abstracts_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "requests_for_quote"("rfq_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "canvas_abstracts" ADD CONSTRAINT "canvas_abstracts_compiledById_fkey" FOREIGN KEY ("compiledById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvas_abstracts"("canvas_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_supplierQuoteId_fkey" FOREIGN KEY ("supplierQuoteId") REFERENCES "supplier_quotes"("quote_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_trails" ADD CONSTRAINT "audit_trails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
