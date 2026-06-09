# Supplier Database — Implementation Plan

## Overview

This plan introduces the **core relational backbone** of ProcureWise: a supplier intelligence database driven by the Technical Data Dictionary, integrated with the existing Prisma + Supabase + Next.js 16 stack. 

The five tables form a complete procurement lifecycle — from user identity and role access, through solicitation, to algorithmic best-value output.

---

## Architecture Context

| Layer | Current State | After This Feature |
|---|---|---|
| Auth | Supabase Auth (email/password only) | Supabase Auth + `users` profile table with roles |
| Database | 3 tables: `Supplier`, `OfficeItem`, `PriceQuote` (mock data) | +5 new tables aligned to the Data Dictionary |
| ORM | Prisma 7 with `@prisma/adapter-pg` | Extended schema + new migration |
| API | Server Actions (auth only) | New Server Actions per domain |
| UI | Login → `/end-user` blank dashboard | Role-gated dashboards per user type |

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Role Assignment Flow:** How does a new user get a role? Options:
> - Admin assigns via a management panel (most secure)  
> - Role is embedded in Supabase user metadata at invite time  
> - Self-registration with role selection (requires approval gate)
>
> This decision affects the `users` table design and auth flow.

> [!IMPORTANT]
> **Q2 — Relationship to Existing Tables:** The current `Supplier` model has `name`, `location`, `contact`, `rating`. The new `suppliers` table in the Data Dictionary has `reliability_rating`, `quality_compliance_rate`, etc. Should these be:
> - **Merged** (extend the existing `Supplier` model with the new columns), or
> - **Kept separate** (new `suppliers` table links to existing `Supplier` via FK)?
>
> Merging is cleaner. Separating preserves the current price comparison data exactly.

> [!IMPORTANT]
> **Q3 — MCDM Algorithm Location:** The `recommendations` table stores `composite_mcdm_score`. Where does the computation run?
> - A **Next.js Server Action** (simple, in-process)
> - A **Supabase Edge Function** (scalable, isolated)
> - A **Postgres stored procedure** (runs inside the DB)
>
> This affects what's built in this phase vs. deferred.

> [!WARNING]
> **Q4 — `users` table vs. Supabase Auth `auth.users`:** Supabase already manages user identity in the `auth.users` table (not accessible via Prisma directly). The `users` table from the Data Dictionary should be a **profile/extension table** that stores role and status, keyed to `auth.users.id` (a UUID), NOT a replacement. The `SERIAL` type in the spec should map to the Supabase UUID pattern.

---

## Proposed Changes

### Layer 1 — Database Schema (Prisma)

#### [MODIFY] [schema.prisma](file:///c:/Users/sy/procurewise/prisma/schema.prisma)

Add 5 new models. The existing `Supplier`, `OfficeItem`, `PriceQuote` are **preserved** to avoid breaking the price comparison feature. The new `SupplierProfile` extends the existing `Supplier` with intelligence metrics.

**New `UserProfile` model** (bridges Supabase Auth → role system):
```prisma
model UserProfile {
  id        String   @id  // matches auth.users.id (UUID from Supabase)
  username  String   @unique
  role      UserRole
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  quotesSubmitted SupplierQuote[] @relation("SubmittedBy")
  rfqsCreated     RequestForQuote[] @relation("CreatedBy")
}

enum UserRole {
  ProcurementOfficer
  Supplier
  AdministrativeApprover
}
```

> [!NOTE]
> `password_hash` is **omitted** — passwords are managed entirely by Supabase Auth. Storing a second hash would be a security anti-pattern.

**New `SupplierProfile` model** (performance intelligence):
```prisma
model SupplierProfile {
  id                     String   @id @default(uuid())
  supplierId             String   @unique  // FK → existing Supplier.id
  supplier               Supplier @relation(fields: [supplierId], references: [id])
  reliabilityRating      Decimal  @db.Decimal(3, 2)  // 0.00–5.00
  qualityComplianceRate  Decimal  @db.Decimal(5, 2)  // 0.00–100.00
  historicalDeliveryDays Int      @default(0)
  isVerified             Boolean  @default(false)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  
  quotes SupplierQuote[]
}
```

**New `RequestForQuote` model** (solicitation master):
```prisma
model RequestForQuote {
  id                    String    @id @default(uuid())
  rfqNumber             String    @unique  // e.g. RFQ-2026-06-001
  status                RfqStatus @default(Draft)
  approvedBudgetContract Decimal  @db.Decimal(12, 2)
  createdById           String    // FK → UserProfile.id
  createdBy             UserProfile @relation("CreatedBy", fields: [createdById], references: [id])
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  quotes          SupplierQuote[]
  recommendations Recommendation[]
}

enum RfqStatus {
  Draft
  Published
  Closed
  Evaluated
}
```

**New `SupplierQuote` model** (bidding inputs):
```prisma
model SupplierQuote {
  id                 String          @id @default(uuid())
  rfqId              String
  rfq                RequestForQuote @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  supplierProfileId  String
  supplierProfile    SupplierProfile @relation(fields: [supplierProfileId], references: [id])
  submittedById      String?
  submittedBy        UserProfile?    @relation("SubmittedBy", fields: [submittedById], references: [id])
  totalQuotedAmount  Decimal         @db.Decimal(12, 2)
  offeredDeliveryDays Int
  submittedAt        DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  recommendations Recommendation[]
}
```

**New `Recommendation` model** (MCDM output):
```prisma
model Recommendation {
  id                 String          @id @default(uuid())
  rfqId              String
  rfq                RequestForQuote @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  supplierQuoteId    String
  supplierQuote      SupplierQuote   @relation(fields: [supplierQuoteId], references: [id])
  compositeMcdmScore Decimal         @db.Decimal(5, 2)
  rankPosition       Int
  justificationLog   String          @db.Text
  generatedAt        DateTime        @default(now())
}
```

---

### Layer 2 — Database Migration

#### [NEW] Migration via `pnpm prisma migrate dev --name supplier_database`

This generates a new migration file under `prisma/migrations/` without touching the existing `20260609072053_init` migration.

**Migration sequence:**
1. Add `UserRole` and `RfqStatus` enums
2. Create `UserProfile` table
3. Add `SupplierProfile` table (references existing `Supplier`)
4. Create `RequestForQuote` table
5. Create `SupplierQuote` table
6. Create `Recommendation` table

---

### Layer 3 — TypeScript Types

#### [NEW] `src/lib/types/supplier-database.ts`

Exports inferred Prisma types + composite types for the UI layer:
- `UserProfileWithRole`
- `RfqWithQuotes`
- `SupplierQuoteWithProfile`
- `RecommendationWithRank`

---

### Layer 4 — Server Actions

#### [NEW] `src/app/actions/users.ts`
- `createUserProfile(userId, username, role)` — called after Supabase sign-up
- `getUserProfile(userId)` — fetch role/status for middleware
- `updateUserStatus(userId, isActive)` — admin activation/deactivation

#### [NEW] `src/app/actions/suppliers.ts`
- `upsertSupplierProfile(supplierId, data)` — create/update intelligence metrics
- `getSupplierProfiles()` — list all with verification status
- `verifySupplier(supplierProfileId)` — toggle `isVerified`

#### [NEW] `src/app/actions/rfq.ts`
- `createRfq(data)` — creates a Draft RFQ with auto-generated `rfqNumber`
- `publishRfq(rfqId)` — transitions status to `Published`
- `closeRfq(rfqId)` — transitions to `Closed`
- `getRfqWithQuotes(rfqId)` — full RFQ + all submitted quotes

#### [NEW] `src/app/actions/quotes.ts`
- `submitQuote(rfqId, supplierProfileId, data)` — supplier submits a bid
- `getQuotesForRfq(rfqId)` — all quotes for a solicitation

#### [NEW] `src/app/actions/recommendations.ts`
- `generateRecommendations(rfqId)` — runs MCDM scoring and saves results
- `getRecommendations(rfqId)` — fetch ranked results for display

---

### Layer 5 — Middleware (Role-Based Routing)

#### [MODIFY] [middleware.ts](file:///c:/Users/sy/procurewise/src/middleware.ts)

Extend the existing middleware to:
- Read the user's role from Supabase session metadata or `UserProfile` lookup
- Route to role-specific dashboards:
  - `ProcurementOfficer` → `/dashboard/procurement`
  - `Supplier` → `/dashboard/supplier`
  - `AdministrativeApprover` → `/dashboard/approver`

---

### Layer 6 — UI Pages (Scaffolds)

#### [NEW] `src/app/dashboard/procurement/page.tsx`
Procurement Officer view: RFQ list, create RFQ button, recommendations viewer.

#### [NEW] `src/app/dashboard/supplier/page.tsx`
Supplier view: Active RFQs to bid on, submitted quotes status.

#### [NEW] `src/app/dashboard/approver/page.tsx`
Approver view: Pending RFQs, recommendation summaries, approve/reject actions.

#### [NEW] `src/app/dashboard/supplier-profiles/page.tsx`
Admin view: All supplier profiles, verification status, performance metrics table.

---

## MCDM Scoring — Preliminary Design

The `composite_mcdm_score` is computed as a **weighted sum** of normalized factors:

| Factor | Source Field | Default Weight |
|---|---|---|
| Price (lowest = best) | `totalQuotedAmount` vs. ABC | 50% |
| Delivery Speed | `offeredDeliveryDays` (lower = better) | 30% |
| Reliability | `reliabilityRating` | 20% |

Formula:
```
score = (0.50 × priceScore) + (0.30 × deliveryScore) + (0.20 × reliabilityScore)
```

Where each sub-score is normalized 0–100 relative to competing quotes in the same RFQ.

---

## Verification Plan

### Automated
- `pnpm prisma validate` — confirm schema is valid before migration
- `pnpm prisma migrate dev --name supplier_database` — apply migration
- `pnpm prisma generate` — regenerate Prisma client types
- `pnpm build` — full TypeScript compile check

### Manual Verification
1. **Schema check:** Verify all 5 tables appear in Supabase Table Editor
2. **Auth + profile:** Sign in, confirm `UserProfile` row is created with correct role
3. **RFQ flow:** Create Draft → Publish → submit a supplier quote → generate recommendation
4. **Rank output:** Confirm rank 1 matches expected best-value supplier

---

## Migration Risk Notes

> [!WARNING]
> The existing `Supplier` model in Prisma uses `String @id` (manually assigned). The new `SupplierProfile` uses UUID. The FK from `SupplierProfile.supplierId → Supplier.id` must respect this — no type mismatch.

> [!CAUTION]
> Supabase `auth.users` is managed by GoTrue and lives in the `auth` schema, which Prisma cannot directly introspect. The `UserProfile.id` field must be **manually kept in sync** with `auth.users.id` using a Supabase trigger or a post-signup Server Action.
