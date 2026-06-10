-- =============================================================================
-- ProcureWise — Initial Schema Migration
-- Generated from prisma/schema.prisma
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('Procurement Officer', 'Supplier', 'Administrative Approver');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RfqStatus" AS ENUM ('Draft', 'Published', 'Closed', 'Evaluated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "QuoteStatus" AS ENUM ('Submitted', 'Under Review', 'Accepted', 'Rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USER PROFILES
-- Mirrors auth.users (UUID PK) — no password_hash stored here.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
    id          TEXT PRIMARY KEY,              -- UUID matching auth.users.id
    username    VARCHAR(50)  UNIQUE NOT NULL,
    "fullName"  VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    role        "UserRole"   NOT NULL,
    "isActive"  BOOLEAN      NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. REGISTERED SUPPLIERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id              SERIAL PRIMARY KEY,
    "companyName"            VARCHAR(150) NOT NULL,
    tin                      VARCHAR(15)  UNIQUE,
    "contactPerson"          VARCHAR(100),
    "contactNumber"          VARCHAR(20),
    "businessAddress"        TEXT         NOT NULL,
    "reliabilityRating"      DECIMAL(3,2) NOT NULL DEFAULT 5.00
                             CHECK ("reliabilityRating" BETWEEN 0 AND 5),
    "qualityComplianceRate"  DECIMAL(5,2) NOT NULL DEFAULT 100.00
                             CHECK ("qualityComplianceRate" BETWEEN 0 AND 100),
    "historicalDeliveryDays" INT          NOT NULL DEFAULT 0,
    "isVerified"             BOOLEAN      NOT NULL DEFAULT FALSE,
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ANNUAL PROCUREMENT PLAN (APP) ITEMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_items (
    app_item_id          SERIAL PRIMARY KEY,
    "papCode"            VARCHAR(50)  NOT NULL,
    "objectCode"         VARCHAR(50),
    "projectTitle"       VARCHAR(255) NOT NULL,
    "endUserUnit"        VARCHAR(100) NOT NULL,
    "generalDescription" TEXT         NOT NULL,
    "modeOfProcurement"  VARCHAR(100) NOT NULL DEFAULT 'Small Value Procurement',
    "sourceOfFund"       VARCHAR(100) NOT NULL,
    "estimatedBudget"    DECIMAL(12,2) NOT NULL CHECK ("estimatedBudget" > 0),
    "fyYear"             INT          NOT NULL DEFAULT 2026,
    "createdById"        TEXT         REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. REQUESTS FOR QUOTATION (RFQ MASTER)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS requests_for_quote (
    rfq_id                   SERIAL PRIMARY KEY,
    "rfqNumber"              VARCHAR(50)  UNIQUE NOT NULL,
    title                    VARCHAR(255) NOT NULL,
    "approvedBudgetContract" DECIMAL(12,2) NOT NULL,
    "deadlineDate"           DATE         NOT NULL,
    status                   "RfqStatus"  NOT NULL DEFAULT 'Draft',
    "createdById"            TEXT         REFERENCES user_profiles(id) ON DELETE SET NULL,
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RFQ ITEM REQUISITION DETAILS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rfq_items (
    rfq_item_id  SERIAL PRIMARY KEY,
    "rfqId"      INT          NOT NULL REFERENCES requests_for_quote(rfq_id) ON DELETE CASCADE,
    "appItemId"  INT          REFERENCES app_items(app_item_id) ON DELETE SET NULL,
    "itemNumber" VARCHAR(10)  NOT NULL,
    particulars  TEXT         NOT NULL,
    quantity     INT          NOT NULL CHECK (quantity > 0),
    unit         VARCHAR(20)  NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SUPPLIER QUOTATION SUBMISSIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_quotes (
    quote_id               SERIAL PRIMARY KEY,
    "rfqId"                INT          NOT NULL REFERENCES requests_for_quote(rfq_id) ON DELETE CASCADE,
    "supplierId"           INT          NOT NULL REFERENCES suppliers(supplier_id),
    "submissionDate"       DATE         NOT NULL DEFAULT CURRENT_DATE,
    "totalQuotedAmount"    DECIMAL(12,2) NOT NULL,
    "offeredDeliveryDays"  INT          NOT NULL,
    status                 "QuoteStatus" NOT NULL DEFAULT 'Submitted'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. QUOTATION LINE-ITEM BREAKDOWN
-- Note: totalPrice is computed in app logic (quantityMultiplier * unitPrice)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quote_details (
    detail_id            SERIAL PRIMARY KEY,
    "quoteId"            INT          NOT NULL REFERENCES supplier_quotes(quote_id) ON DELETE CASCADE,
    "rfqItemId"          INT          NOT NULL REFERENCES rfq_items(rfq_item_id),
    "unitPrice"          DECIMAL(12,2) NOT NULL CHECK ("unitPrice" >= 0),
    "quantityMultiplier" INT          NOT NULL DEFAULT 1,
    "isAvailable"        BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. CANVAS ABSTRACTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS canvas_abstracts (
    canvas_id        SERIAL PRIMARY KEY,
    "rfqId"          INT          NOT NULL REFERENCES requests_for_quote(rfq_id),
    "openingDate"    DATE         NOT NULL DEFAULT CURRENT_DATE,
    "locationOpened" VARCHAR(100) NOT NULL DEFAULT 'Basco, Batanes',
    "compiledById"   TEXT         REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. BEST-VALUE MACHINE RECOMMENDATIONS (MCDM Output)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recommendations (
    recomm_id              SERIAL PRIMARY KEY,
    "canvasId"             INT          NOT NULL REFERENCES canvas_abstracts(canvas_id) ON DELETE CASCADE,
    "supplierId"           INT          NOT NULL REFERENCES suppliers(supplier_id),
    "supplierQuoteId"      INT          NOT NULL REFERENCES supplier_quotes(quote_id),
    "compositeMcdmScore"   DECIMAL(5,2) NOT NULL,
    "priceScore"           DECIMAL(5,2) NOT NULL,
    "deliveryScore"        DECIMAL(5,2) NOT NULL,
    "reliabilityScore"     DECIMAL(5,2) NOT NULL,
    "rankPosition"         INT          NOT NULL,
    "justificationLog"     TEXT         NOT NULL,
    "approverRemarks"      TEXT,
    "approvalStatus"       VARCHAR(30)  NOT NULL DEFAULT 'Pending Review',
    "reviewedById"         TEXT         REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. IMMUTABLE SECURITY AUDIT TRAIL
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_trails (
    audit_id        SERIAL PRIMARY KEY,
    "userId"        TEXT         REFERENCES user_profiles(id) ON DELETE SET NULL,
    "actionType"    VARCHAR(50)  NOT NULL,
    "tableAffected" VARCHAR(50)  NOT NULL,
    "recordId"      INT          NOT NULL,
    "oldState"      JSONB,
    "newState"      JSONB,
    "ipAddress"     VARCHAR(45),
    "timestamp"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- LEGACY — Price Comparison Dashboard (OfficeItem + PriceQuote)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "OfficeItem" (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    unit        TEXT NOT NULL,
    category    TEXT NOT NULL,
    description TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PriceQuote" (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "supplierId"   TEXT    NOT NULL,
    "itemId"       TEXT    NOT NULL REFERENCES "OfficeItem"(id) ON DELETE CASCADE,
    "unitPrice"    FLOAT8  NOT NULL,
    availability   TEXT    NOT NULL,
    "deliveryDays" INT     NOT NULL,
    notes          TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("supplierId", "itemId")
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PRISMA MIGRATIONS TRACKING TABLE (tells Prisma the DB is in sync)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    id                  VARCHAR(36) PRIMARY KEY,
    checksum            VARCHAR(64) NOT NULL,
    finished_at         TIMESTAMPTZ,
    migration_name      VARCHAR(255) NOT NULL,
    logs                TEXT,
    rolled_back_at      TIMESTAMPTZ,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_steps_count INT NOT NULL DEFAULT 0
);
