# ProcureWise Development Roadmap & Project Audit

> [!NOTE]
> This document serves as the official project roadmap and codebase audit for the **ProcureWise Procurement Management System** at Batanes State College. It details the actual implementation status of all system components, identifies technical debt, outlines remaining priorities, and establishes a production-readiness roadmap. All assessments are based directly on the implemented source code.

---

## 1. Introduction

The purpose of this document is to catalog the structural and operational features of the ProcureWise system. By auditing actual files, schemas, and Server Actions, we establish an objective, thesis-ready overview of what has been built, what is under configuration, and what remains pending. 

The codebase acts as the single source of truth. Features are verified against direct Next.js Server Components, API routes, Prisma schemas, and client-side visualization logic.

---

## 2. Feature Completion Matrix

The following matrix represents the audited completion status of ProcureWise's primary business modules:

| Module | Status | Notes |
| :--- | :--- | :--- |
| **Authentication & RBAC** | ✅ Complete | Dynamic routing and edge security proxy (`src/proxy.ts`) enforcing role redirects (Officer, Approver, End User, Supplier). Deactivation check (`isActive`) redirects disabled accounts. |
| **Centralized Catalog** | ✅ Complete | Unified browse grid (`/dashboard/catalog` and `/catalog`) with multi-filters, real-time specifications mapping, and relational tables (`Category`, `Brand`, `UnitOfMeasure`). |
| **PPMP Planning** | ✅ Complete | Department annual planning workspace (`/dashboard/end-user/ppmp`) locked to catalog products, showing price trends, department budget checks, and PR auto-generation. |
| **Purchase Requests (PR)** | ✅ Complete | Auditing dashboard (`/dashboard/officer/pr`) featuring check-off items, inline units of measure corrections, budget spent adjustments, and return-for-revision logs. |
| **RFQ Management** | ✅ Complete | Sequential numbering (`[YYYY]-[XXX]`) with manual override logs, deadline enforcement, and RFQ publishing actions. |
| **Bidding & Quotations** | ✅ Complete | Double bid submission: manual web form submission or offline Excel spreadsheet upload/parsing via `xlsx` library in Server Actions. |
| **Canvas Abstract** | ✅ Complete | Automated compilation of bidding profiles, lead times, and unit pricing comparison sheets. |
| **MCDM Recommendation** | ✅ Complete | 5-criteria score model (Price, Delivery, Reliability, Compliance, Historical Performance) with interactive sliders, compliance justification logs, and stability indices. |
| **Purchase Orders (PO)** | ✅ Complete | Appendix 61 compliant high-fidelity drafting and printing layouts, editable payment/delivery clauses, and supplier receipt conformes. |
| **Supplier Evaluation** | ✅ Complete | 7-criteria performance rating sheet (`/dashboard/end-user/evaluation`) with verification locks that auto-recalculates supplier stars and quality indices. |
| **Historical Price Ingestion** | ✅ Complete | Idempotent CLI script (`scripts/import-historical-prices.ts`) utilizing fuzzy catalog string token matching and uncategorized automatic seeder. |
| **ARIMA Forecasting** | ✅ Complete | Pure typescript time-series forecasting, stationarity differentials, ACF/PACF autocorrelation parameter fitting, MAPE backtesting, and dashboard buying strategy alerts. |
| **Tracking Portal** | ✅ Complete | Cryptographically secure tracked routes (`/track`) utilizing UUID tokens without exposing database primary keys. |
| **Analytics Dashboard** | ✅ Complete | Executive interface for officers (`/dashboard/officer/analytics`) displaying SVG spending lines, budget utilization status, radar profile spider charts, and cost savings ledgers. |
| **Audit Trail** | ✅ Complete | Forensic logging layer executing asynchronously via Next.js `after()` schedule block, stamping operations with IP addresses and active session IDs. |
| **CSV Data Exporter** | ✅ Complete | Data reporting workspace (`/dashboard/approver/reports`) enabling administrative CSV exports of PPMPs, PRs, RFQs, POs, and Suppliers. |
| **Workflows & Forms Customizer** | ✅ Complete | Interactive template management pages built in the code but unlinked from default navigations to simplify officer menus. |
| **Notifications Inbox** | ⏳ Pending | The system currently lacks a centralized, database-driven notifications backend and persistent notification center. |

---

## 3. Project Timeline & Development Phases

### Phase 1 — Foundation (✅ Complete)
* Relational database setup (`schema.prisma`) with PostgreSQL.
* User account registration and activation checks.
* Security layers, route authorization, and session-based Edge Proxy routing.
* Core product catalog structure.

### Phase 2 — Procurement Planning (✅ Complete)
* Public/unauthenticated departmental PPMP draft builders.
* Integration of standard catalog specifications.
* Departmental fiscal budget allocations and utilization checks.
* Automated conversion from approved planning plans into Purchase Requests.

### Phase 3 — Procurement Processing (✅ Complete)
* Purchase request validation, checklist auditing, and UOM corrections.
* Solicitation RFQ creation, sequential numbering, and deadline gates.
* Interactive supplier quote submissions (online form + Excel parsing).
* Programmatic generation of Canvas Abstracts.

### Phase 4 — Decision Support (✅ Complete)
* Multi-Criteria Decision-Making (MCDM) scoring engine.
* Sensitivity analysis slider controls (Price, Delivery, Reliability, Compliance, and Historical).
* Programmatic generation of justification compliance text.
* Draft-to-approval workflows for procurement recommendations.

### Phase 5 — Post-Procurement Execution (✅ Complete)
* Purchase Order drafting using Appendix 61 high-fidelity structures.
* Supplier contract conforme submission and delivery logs.
* Post-delivery 7-criteria supplier evaluation grids.
* Auto-calculation of vendor performance stars and quality compliance rates.

### Phase 6 — Analytics & Price Intelligence (✅ Complete)
* Idempotent import seeder with token-intersection fuzzy catalog mapping.
* Historical prices database mapping.
* Pure TypeScript ARIMA time-series fitting, stationarity logic, and confidence tiers.
* Multi-chart executive analytics dashboards (spend curves, radar plots, cost savings).

### Phase 7 — Production Hardening (🚧 In Progress)
* Error boundaries, try-catch diagnostics, and offline fallback gates.
* Database index optimizations.
* Centralized notifications backend (Pending).
* Full documentation suite and compiler verification.

---

## 4. Remaining Work (Unfinished Features)

### Medium Priority

#### 1. Centralized Notifications Inbox & Alerts
* **Estimated Complexity**: Medium
* **Files/Modules Involved**:
  * `prisma/schema.prisma` (Add `Notification` database model)
  * `src/app/actions/notifications.ts` (Create, read, and delete actions)
  * `src/app/dashboard/layout.tsx` (Add notification header dropdown menu)
* **Rationale**: Requesters, officers, and suppliers currently rely on checking tracker codes or local pages. A persistent, database-backed alert system is needed to notify users of status changes (e.g., "PR Returned for Revision", "New RFQ Published", "PO Conforme Signed").

### Low Priority

#### 2. Re-integration of Administrative Customizers
* **Estimated Complexity**: Low
* **Files/Modules Involved**:
  * `src/app/dashboard/layout.tsx` (Re-add navigation links to Approver dashboard)
* **Rationale**: The Workflows builder, Form Templates customizer, and Reports pages are fully coded but hidden from default navigations to minimize UI noise. If the college administrators request custom adjustments, these routes should be re-enabled in the layout navigation bar.

---

## 5. Technical Debt & Code Improvements

The codebase audit identified the following refactoring and optimization opportunities:

1. **Server Actions Consolidation**:
   * *Issue*: Redundant action files exist in `src/app/actions/`. Specifically, `rfq.ts` and `rfq-actions.ts` share related RFQ mutators, and `quotes.ts` and `quote-actions.ts` handle duplicate pricing checks.
   * *Resolution*: Merge these files into single consolidated modules (`rfq.ts` and `quotes.ts`) to prevent namespace drift and streamline API maintenance.
2. **SVG Chart Component Extraction**:
   * *Issue*: Complex SVG visualizers (like the radar criteria profile spider chart, savings ledger, and spend charts) are written as monolithic inline code blocks inside their client dashboard views.
   * *Resolution*: Extract the pure SVG layout logic into a folder of reusable charting components under `/components/ui/charts/`.
3. **Database Index Tuning**:
   * *Issue*: Several relation foreign keys (`productId` in `PpmpItem`, `requisitionId` in `RequisitionItem`, and `quoteId` in `QuoteDetail`) lack standard database indexes.
   * *Resolution*: Define explicit `@@index` properties in `prisma/schema.prisma` to prevent query degradation as transaction records accumulate.
4. **Session Local Cache Fallbacks**:
   * *Issue*: Real-time edge routing proxy (`src/proxy.ts`) queries Supabase session data on every route change.
   * *Resolution*: Implement safe local cookie session validation to reduce edge latency during high traffic or Supabase latency spikes.

---

## 6. Documentation Audit

The documentation suite of the ProcureWise repository has been audited for compliance and completeness:

| Document | File Path | Status | Notes |
| :--- | :--- | :--- | :--- |
| **System Overview** | `README.md` | ✅ Complete | Extensively documents overall stack, core workflows, database schema ERDs, setup guides, and environment variables. |
| **Entity Relationship Diagram** | `README.md` | ✅ Complete | Features interactive Mermaid ERD code documenting all relational linkages. |
| **System Flowcharts** | `docs/system_flowcharts.md` | ✅ Complete | Features 5 thesis-ready, standard Mermaid diagrams (overall, procurement, analytics, public user, access workflow). |
| **Data Flow Diagrams (DFD)** | `docs/data_flow_diagrams.md` | ✅ Complete | Context Diagram (Level 0) and Detailed Diagram (Level 1) mapped to standard process numbers and logical data stores. |
| **Development Roadmap** | `docs/development_roadmap.md` | ✅ Complete | This document. Serves as the official codebase audit and roadmap. |
| **Setup & Deployment Guide** | `README.md` | ✅ Complete | Explains env configs, seeder triggers, pooler overrides, direct direct IPv6/IPv4 rewrite rules, and production database settings. |

---

## 7. Production Readiness Checklist

### Security
* **Authentication**: ✅ Verified. Active edge proxy blocks dashboard access.
* **Authorization (RBAC)**: ✅ Verified. Server action checks (`requireRole`) prevent API bypasses.
* **Input Validation**: ✅ Verified. Quantities bounded to positive numbers and budgets validated on servers.
* **Database Access**: ✅ Verified. Transaction and Direct connection poolers configured with secure runtime fallbacks.
* **Secure Routing**: ✅ Verified. Tracking routes obfuscated via cryptographically secure UUID tokens.

### Performance
* **Bundle Optimization**: ✅ Verified. Zero-overhead SVG charting library eliminates heavy bundle dependencies.
* **Query Latency**: 🚧 Needs optimization. Missing database indexes on foreign keys require schema migration.
* **Memory Optimization**: ✅ Verified. Background seeder caches lookups, running seeder operations in memory batches.

### User Experience (UX)
* **Loading Indicators**: ✅ Verified. Submitting spinners and buttons disable during active Server Actions.
* **Empty/Error States**: ✅ Verified. Custom diagnostics render readable database failures instead of generic 500 pages.
* **Responsive Layouts**: ✅ Verified. Dashboards fluidly resize down to mobile layout breakpoints.

### Documentation
* **Logical Workflows**: ✅ Verified. System flowcharts fully trace processes.
* **Logical Data Flow**: ✅ Verified. Context and Level 1 DFDs align with schemas.
* **Schema Blueprint**: ✅ Verified. Active ERDs match PostgreSQL structure.
