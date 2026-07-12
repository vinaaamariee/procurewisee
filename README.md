# 🏛️ ProcureWise

### An Intelligent Procurement Analytics and Automated Canvassing System with Best-Value Recommendation Engine

**Capstone Project for Batanes State College**

---

## 🌟 Overview

ProcureWise is a modern web application built to streamline and automate the public procurement process at Batanes State College. By replacing manual paperwork and convoluted spreadsheets with structured workflows, automated canvassing, and objective scoring, the system ensures transparency, speeds up purchasing decisions, and optimizes government budget utilization.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.2.7 (Turbopack) & React 19
- **Language**: TypeScript (Strict Mode)
- **Authentication**: Supabase Auth (via `@supabase/ssr` cookies and edge proxy validation)
- **Database & ORM**: PostgreSQL hosted on Supabase, managed through **Prisma ORM** (generating client to standard `node_modules` path, imported via `@prisma/client`)
- **Styling**: Tailwind CSS & Vanilla CSS (with sleek transitions, gradients, and custom scrollbars)
- **Theming**: `next-themes` for high-performance Light/Dark Mode toggling

---

## 📊 Core Features & Functionality

### 1. Security & Role-Based Access Control (RBAC)

ProcureWise protects user access and ensures strict segregation of duties through a middleware-equivalent Edge Proxy (`src/proxy.ts`, which replaces the deprecated `src/middleware.ts` convention in Next.js 16):

> [!NOTE]
> In this Next.js 16 version, the Edge Proxy is defined at `src/proxy.ts` (replacing the traditional `middleware.ts`). To comply with Next.js 16 file conventions, this file must export the proxy function as a **default export** (i.e., `export default async function proxy(request: NextRequest)`). Named exports will fail to bind at runtime in production.

- **Authentication Gateway**: Prevents unauthenticated users from accessing any `/dashboard/*` paths, forcing a redirect back to `/` (login).
- **Disabled Supplier Self-Registration & Login**: The public self-registration flow ("Sign Up" tab on `/login`) has been deactivated and removed. Supplier accounts are strictly prohibited from logging into the dashboard. Existing supplier records remain in the database as static reference data (for RFQs, quotes, ratings, and canvassing audits) and cannot be authenticated.
- **Creation of Staff Accounts**: Creation of staff accounts (Procurement Officers and Administrative Approvers) is restricted to logged-in Administrative Approvers via a dedicated dashboard module, using a cookie-free Supabase client to prevent session invalidation.
- **Role Guards**: Extracts the user's validated database profile role and restricts route access. If an authorized user tries to access a path outside their authorized scope, they are redirected to their appropriate home dashboard:
  - **Procurement Officer** $\rightarrow$ `/dashboard/officer`
  - **Administrative Approver** $\rightarrow$ `/dashboard/approver`
- **Account Deactivation**: Enforces checks for active status (`isActive`); deactivated profiles are immediately signed out.

### 2. Multi-Criteria Decision Making (MCDM) Engine

The highlight of the system is the **Best-Value Recommendation Engine**:

- Ranks bidding suppliers using a multi-criteria model (MCDM) analyzing three key pillars:
  1. **Price Score (50%)**: Normalized value comparing quotation price against the Approved Budget for the Contract (ABC) and competing bids.
  2. **Delivery Score (30%)**: Historical lead times compared against the supplier's commitment.
  3. **Reliability Score (20%)**: Based on quality compliance rates and historical feedback ratings.
- **Justification Logs**: Generates human-readable compliance logs justifying why a specific supplier has been recommended for the award.

### 3. Price Comparison & Canvassing Dashboard (`/price-comparison`)

Allows officers to conduct real-time market surveys and compare supplier quotes:

- **KPI Metrics**: Real-time cards showing items compared, suppliers evaluated, average savings potential, and the overall budget savings opportunity.
- **Interactive Table**:
  - Currency formatted in Philippine Pesos (₱).
  - Color-coded price highlights (Emerald Green = Best-value/lowest quote, Light Red = Highest quote).
  - Inventory availability badges (_In Stock_, _Limited_, _Unavailable_).
  - Dynamic sorting by column.
  - Expandable detail rows displaying lead times and item-specific notes.
- **Filter Engine**: Real-time matching by search query, product category, and multi-select supplier checkboxes.
- **CSS Price Chart**: Responsive horizontal bar charts visualizing price differences between suppliers, auto-highlighting the best-value quote.

### 4. Dynamic Theming (Light & Dark Mode)

A polished design matching modern application standards:

- **Theme Toggle**: Fast, client-side toggle switch (with Sun/Moon icons) matching user system settings.
- **Adaptive Variables**: Color variables (`--bg-deep`, `--text-primary`, `--border`) transition fluidly from a clean light slate to a deep indigo slate-black background.
- **Autofill Overrides**: Clean overrides for browser inputs preventing the native bright-yellow or black autofill boxes from breaking the glassmorphic aesthetics.

### 5. Supplier Quote Submission System (Manual & Excel)

A complete workflow for registered suppliers to submit and review bids:

- **Option A: Manual Submission**: An interactive online form resembling the Batanes State College RFQ document, calculating live totals, showing itemized line costs, and enforcing budget limit constraints (ABC).
- **Option B: Excel Integration**: Direct integration with spreadsheet templates using `xlsx`. Suppliers download an automated `.xlsx` template pre-filled with RFQ items, fill details offline, and upload it to auto-populate prices and parse availability in real-time.
- **Server Action Validation**: A secure Next.js Server Action (`src/app/actions/quotes.ts`) processes transactions, computes total bids, and updates database records inside a clean transaction block.

### 6. Modular Server Actions Layer

All database and authentication operations are managed through Next.js Server Actions, providing secure, type-safe API gateways:

- **User Profile Actions (`src/app/actions/users.ts`)**: Creates user profiles post-signup, retrieves profile details for role-based routing, and toggles profile activation state.
- **Supplier Actions (`src/app/actions/suppliers.ts`)**: Manages supplier database records, fetches alphabetically ordered lists, and toggles supplier verification status.
- **RFQ Actions (`src/app/actions/rfq.ts` & `src/app/actions/rfq-actions.ts`)**: Auto-generates incremental, first-come first-served RFQ references in the format `[YYYY]-[XXX]` (e.g. `2026-001`), manages state transitions (`Draft` $\rightarrow$ `Published` $\rightarrow$ `Closed`), and retrieves full RFQ records. Supports manually overriding the sequential numbering with a mandatory justification reason.
- **Quotation Actions (`src/app/actions/quotes.ts`)**: Validates submitted bid prices against the RFQ budget limits (ABC), processes multi-row quotation lists, and handles transaction-safe updates.
- **Recommendation Actions (`src/app/actions/recommendations.ts`)**: Runs the MCDM algorithm to normalize price and lead times, fetches reliability rates, ranks suppliers, writes detailed text justifications, and transitions the RFQ status to `Evaluated`. Includes client-side interactive approval triggers (`src/app/dashboard/approver/approve-button.tsx`) with confirmation dialogs, transition loading states, and error handling.

### 7. Supplier Directory & Performance Audit UI (Branch: `feature/supplier-profiles-ui`)

A polished administrative dashboard at `/dashboard/supplier-profiles` that allows Procurement Officers and Administrative Approvers to audit all registered suppliers:

- **Interactive Client Search & Filtering**: Real-time supplier search by company name, contact, or address, along with filter tabs for verification status (All, Verified, Unverified) and sorting dropdowns (Name, Reliability, Quality, and Lead Time).
- **Role-Restricted Verification Toggle**: A secure toggle action linked to the `verifySupplier` Server Action. Only Procurement Officers can verify or revoke verification for a vendor; for other roles, the action is disabled.
- **Performance Intelligence Visualizations**: Renders color-coded metrics highlighting supplier reliability ratings (0.00-5.00), quality compliance percentages, and average lead delivery times.

### 8. Centralized Product Catalog & Solicitation Pre-fill

A standard supplies and equipment database that streamlines RFQ creation and provides specification references:

- **Procurement Officer Administration**: A full management interface at `/dashboard/officer/catalog` that allows officers to Add standard catalog items (setting SKU, category, name, unit, and estimated costs), Edit specifications, and Deactivate catalog items.
- **Solicitation Pre-fill**: When creating a new RFQ, Procurement Officers can select standard products from the catalog via the requisition table. Selecting an item automatically pre-populates description specifications and units.
- **Universal Catalog Browser**: A read-only browser at `/dashboard/catalog` accessible by all roles (Officers, Suppliers, and Approvers) supporting real-time keywords search and category filtering.
- **Server Action Management**: All operations are powered by secure Next.js Server Actions (`src/app/actions/catalog.ts`).

### 9. RFQ Publishing Engine & E2E Testing

Allows Procurement Officers to draft RFQs and publish them. To ensure the reliability of this core logic:

- **E2E Integration Verification**: Created a robust standalone E2E integration test script at `scripts/test-rfq-engine.ts` to programmatically verify the full solicitation flow, including RFQ drafting, pre-filling items from the product catalog, setting ABC limits, database persistence, and status transitions.

### 10. Immutable Audit Trail ("The Security Guard")

A forensic tracking mechanism designed to enforce regulatory compliance and prevent budget creep:

- **Background Logging**: Executes asynchronously via Next.js 16's stable `after()` scheduler, ensuring logging actions never block client responses or degrade transaction performance.
- **State Snapshots**: Automatically records structural JSON representations of `oldState` and `newState` for key operations:
  - **RFQ Transactions**: Logs on `CREATE_RFQ`, `PUBLISH_RFQ`, `CLOSE_RFQ`, and `RFQ_NUMBER_OVERRIDE` (recording the expected number, overwritten number, and override reason).
  - **Supplier Bidding**: Logs on `SUBMIT_BID` (capturing overwrites of existing bids).
  - **Evaluated Recommendations**: Logs on `APPROVE_RECOMMENDATION` status changes.
- **Audit Metadata**: Automatically stamps records with the active user session ID (fetched inside the `after` callback context) and the requester's IP address (resolved via async `headers()`).

### 11. Frictionless Department Requisitions & Tracking (No-Login)

Simplifies the purchase request process for departments by removing authentication barriers:

- **End-User Shopping Catalog**: Department employees browse the products catalog, adjust quantities in a local cart drawer, and submit the request by entering Name, Email, and Department.
- **Secure Cryptographic Tracking**: Upon submission, the system generates a secure tracking token (`/track/req_[uuid]`) and a reference code (`PR-2026-X8Y7`). Requesters use this secure link to view request progress.
- **PO Handoff & Revision Loop**: If a Procurement Officer rejects a request, the rejection count is incremented, and detailed remarks are logged. Requesters see this history on their tracking page, allowing them to adjust items and resubmit.
- **Budget Compliance**: Requisitions are validated against allocated department budgets (`DepartmentBudget`) to prevent over-allocation.
- **Public PPMP Planning**: Allows departmental personnel to prepare, save, and manage Project Procurement Management Plans (PPMPs) without logging in. Users select their department to load allocated budget tracking, and build PPMP drafts from the live product catalog. Saved drafts can be submitted directly for review.

### 12. End-User Requisitions Tracker

A dashboard page at `/dashboard/end-user/pr` that lists all Purchase Requests submitted by the requisitioner:
- **Interactive Multi-Step Validation**: Requisitioners can submit draft PRs for officer audits, monitor validation steps (Draft &rarr; Submitted &rarr; Received &rarr; Under Review &rarr; Approved), view standard SLA turnaround durations under each status node (e.g. Within 24h, 1-2 Days, 2-3 Days, 3-5 Days), and consult an **Estimated SLA Turnaround Timeline** guidance banner.
- **Assigned Officer Status**: Shows the name, email, and status of the Procurement Officer assigned to audit the request.
- **Revision Logs**: Displays a history of comments and return reasons logged by the officer during reviews.

### 13. End-User Supplier Evaluation Sheet

A performance evaluation form at `/dashboard/end-user/evaluation` enabling requisitioners to rate suppliers:
- **7-Criteria Grading Form**: Evaluates suppliers on a 1-4 scale (Poor, Fair, Good, Excellent) across: Product Quality, Delivery Compliance, Order Accuracy, Responsiveness, Communication Flow, Cost Effectiveness, and Overall Satisfaction.
- **Verification Signatures**: Requires typed signature block confirmation before submitting, dynamically logging reviews and recalculating the supplier's overall reliability rating, quality compliance percentage, and delivery rates.

### 14. Officer Requisition Auditing Hub

An audit interface at `/dashboard/officer/pr` where Procurement Officers review submitted requisitions:
- **Lightweight Cards Grid & Search**: Displays incoming requisitions as a clean, searchable list of cards linking to individual details.
- **Dynamic Route Details (`/dashboard/officer/pr/[id]`)**: Renders full auditing workflows, department budget balance monitors, and tracking trails on a dedicated details page, featuring an interactive horizontal workflow progress timeline (Draft &rarr; Submitted &rarr; Received &rarr; Under Review &rarr; Approved/Returned/Rejected) with status highlights and review remarks card placement, complete with skeleton loading states, error boundaries, and breadcrumb context.
- **Quantity & Specs Checklist**: Requires auditing item descriptions and quantities against specifications before final approval.
- **Inline Corrections (UOM Conversion)**: Enforces validation rules enabling officers to edit items inline (e.g. converting "1 piece alcohol" to "500 mL alcohol", adjusting quantities, or correcting brands), which automatically recalculates PR totals and modifies department budget spent.
- **Status Gates**: Officers can mark PRs "Under Review", return them to the requisitioner for corrections (providing feedback remarks), or approve them to issue a unique `PROC-YYYY-XXXX` tracking reference.

### 15. Officer Purchase Order drafting Workspace

A contract drafting workspace at `/dashboard/officer/po` where officers draft and approve Purchase Orders:
- **Drafting Queue**: Retrieves approved RFQ Canvas recommendations and drafts POs with pre-filled details (supplier, items, and pricing) and automatically redirects the user to the details page upon creation.
- **Lightweight Registry Cards**: Lists drafted POs as clickable cards that lift on hover and redirect to their dynamic details page.
- **Dynamic PO Details (`/dashboard/officer/po/[id]`)**: Displays a dedicated government Purchase Order layout (Appendix 61 / standard Philippine Government PO format) complete with conformes, penalty clauses, and signature slots for print-preview or physical printing.
- **Interactive Clause Editor**: Enables configuring delivery and payment terms directly on the details page.

### 16. Supplier Contract & Delivery Acknowledgment Portal

A dedicated contract interface at `/dashboard/supplier/po` that allows suppliers to review and acknowledge POs:
- **Registry & Print View**: Suppliers list awarded POs and open high-fidelity print layouts of the contract terms.
- **Receipt Conforme**: Direct upload/form inputs to document Courier/Receiver name, delivery status (Complete, Partial, Rejected, etc.), and digital conforme signatures, moving the PO status to `Delivered`.

### 17. Supplier Performance Scorecard (Supplier View)

A private visual workspace at `/dashboard/supplier/scorecard` displaying supplier metrics:
- **Key Performance Ratings**: Displays overall reliability rating (out of 5 stars), quality compliance rate (%), and on-time delivery rates (%).
- **Scorecard Breakdown**: Summarizes requisitioner satisfaction averages vs. office compliance indices, along with a historical review feed of comments from college personnel.

### 18. Streamlined Dashboard Navigation

Each role dashboard has been cleaned up to show only relevant, functional links:

- **Procurement Officer**: Overview &rarr; Purchase Requests &rarr; Purchase Orders
  - **Overview Dashboard**: Integrates system counter statistics (Total RFQs, Open/Active, Registered Suppliers) with a prominent **Today's Action Items** dashboard panel displaying real-time metrics of Purchase Requests awaiting audit, RFQs expiring today, and POs awaiting signature, complete with navigation shortcuts.
- **Administrative Approver**: Overview only (MCDM approval queue, audit trail, and staff management are all on the overview page)
- **End User**: Overview → My PPMPs → Purchase Requests
  - **Overview Dashboard**: Features a Department Fiscal Budget Tracker with real-time progress indicators, quick statistics summaries, recent PR history, and an interactive **My Pending Actions** panel displaying status badges, short descriptions, and action buttons for draft/returned PPMPs, returned PRs, and pending supplier evaluations.
- **Supplier**: Overview → Purchase Orders → My Scorecard

### 19. Professional Government Procurement Landing Page (Sprint 2.1)

A professional portal homepage at `/` showcasing Batanes State College procurement:
- **Hero & Search**: High-impact split-column brand section mapping dynamically to the **blue-and-white ProcureWise design system** in light mode (and Maroon/Gold on dark theme), college seal style branding, a functional product search bar redirecting to `/catalog`, and a dynamic **BSC Info Center** panel displaying active RFQs (from the database), system announcements, and news feeds.
- **Database Statistics**: Dynamic counter cards showing live database counts for active products, registered vendors, unique categories, and pricing updates.
- **Category Navigation Grid**: Responsive grid displaying product categories with counts, linking directly to filtered views in the catalog.
- **Recently Updated Products**: Showcases the 8 most recently updated active products in the database with their current canvassed/estimated pricing and last-update timestamp indicators.
- **Quick Actions & Footer**: Reusable actions panel linking to core workflows (Planning, Requesting, and Request Tracking) and a comprehensive government footer.

### 20. Public Procurement Marketplace (Sprint 2.2)

A guest-accessible, no-login marketplace at `/catalog` and `/catalog/[id]` allowing end-users and the public to browse and audit procurement materials, compare prices, and explore historical trends:

- **Universal Search & Multi-Filters**: Real-time debounced keyword search on product titles, categories, and brands, paired with a scrollable **top horizontal category filter** pill-bar, category sidebar, brand filter, price range slider, and multiple sorting options (Lowest Price, Highest Price, Recently Added, Recently Updated, and Most Requested), with expanded card grid gaps for enhanced readability.
- **URL-Based Pagination**: Clean URL-state persistence of search query, filters, and page numbers ensuring direct link-sharing and navigation persistence.
- **Procurement Information & Badges**: Displays detailed cards for each product including product image preview (or generic package fallback), the Estimated Unit Cost, Latest Canvassed Price, Preferred Supplier, Available Supplier Count, Last Updated time, and a dynamic Market Availability badge (Available, Limited, Unavailable).
- **SVG Historical Price Trend Chart**: A pure-SVG rendering of historical price adjustments derived from the procurement database without external library overhead, supporting responsive sizing.
- **Direct Creation Flow Hooks**: Provides direct links to create requisitions for a specific product, linking to `/ppmp/create?product={id}` and `/purchase-request/create?product={id}`.
- **Relational Schema Migrations & Backward Compatibility**: Converted flat schema fields to relational tables (`Category`, `Brand`, `UnitOfMeasure`, `SupplierProductPrice`) while resolving legacy string fields on the server action layer to keep existing dashboard components unbroken.

### 21. Project Procurement Management Plan (PPMP) (Sprint 3)

An interactive, marketplace-first procurement planning workspace at `/dashboard/end-user/ppmp` enabling department employees to prepare annual purchase plans with decision support:

- **Marketplace-First Flow**: Users browse standard catalog products, query detailed specifications, analyze pricing trends, and click "Add to PPMP" to build their draft cart. Selected products are locked to catalog specifications (no free-text entries).
- **Historical Price Intelligence**: Displays latest unit cost, lowest price, average historical price, supplier counts, and monthly price trends (e.g. `Jan: ₱235 ... Apr: ₱229` with trend indicators `↓ -2.4%`) on every product card.
- **Budget Utilization Widget**: Computes Allocated, Already Planned, Current Draft, Remaining Budget, and Utilization % (e.g. `54.3%`) dynamically to prevent over-allocation.
- **Workflow Approval Timeline**: Each planning log displays an active status tracker: `○ Draft` $\rightarrow$ `● Submitted` $\rightarrow$ `● Under Review` $\rightarrow$ `● Approved` $\rightarrow$ `● Converted to PR`.
- **Automatic Purchase Request (PR) Conversion**: Approved PPMPs show a button to automatically duplicate items into a newly generated `PurchaseRequest` (with unique reference PR-2026-X) and display a direct tracking link on the timeline.

> [!NOTE]
> Features such as Workflow Builder (`/dashboard/approver/workflows`), Form Template Customizer (`/dashboard/approver/forms`), and Reports Export (`/dashboard/approver/reports`) exist in the codebase but have been **unlinked from navigation** to reduce confusion. They can be re-enabled by adding their links back to the `navLinks` object in `src/app/dashboard/layout.tsx`.


---

## 💾 Database Schema Details

The database is built on **PostgreSQL** using the following schema mappings (`prisma/schema.prisma`):

[📥 Download Schema Diagram (White Background)](/schema.png)

```mermaid
erDiagram
    UserProfile ||--o{ AppItem : "creates"
    UserProfile ||--o{ RequestForQuote : "creates"
    UserProfile ||--o{ CanvasAbstract : "compiles"
    UserProfile ||--o{ Recommendation : "reviews"
    UserProfile ||--o{ AuditTrail : "performs"
    Supplier ||--o{ SupplierQuote : "submits"
    Supplier ||--o{ Recommendation : "recommended"
    AppItem ||--o{ RfqItem : "maps to"
    RequestForQuote ||--o{ RfqItem : "contains"
    RequestForQuote ||--o{ SupplierQuote : "has"
    RequestForQuote ||--o{ CanvasAbstract : "has"
    SupplierQuote ||--o{ QuoteDetail : "details"
    SupplierQuote ||--o{ Recommendation : "awarded"
    RfqItem ||--o{ QuoteDetail : "gets price"
    CanvasAbstract ||--o{ Recommendation : "recommends"
```

- **`UserProfile`**: Stores usernames, emails, roles, and status. Extends Supabase's internal auth table.
- **`Supplier`**: Holds company name, TIN, contact details, business address, reliability rating, compliance rate, and verification badge.
- **`AppItem`**: Annual Procurement Plan items mapping PAP codes, object codes, estimated budget, end-user units, and funding source.
- **`RequestForQuote`**: Master RFQ tracker (Draft, Published, Closed, Evaluated statuses) including title, ABC budget limit, and deadline.
- **`SupplierQuote`**: Captures quotation amounts, delivery day commitments, and bid evaluation states.
- **`CanvasAbstract`**: Stores summary files, opening location, and date of bids.
- **`Recommendation`**: Stores weighted composite scores, ranks, and justifications generated by the MCDM system.
- **`AuditTrail`**: Logs system mutations (`actionType`, `tableAffected`, `newState`, `ipAddress`) for strict accountability.
- **`CatalogProduct`**: A centralized repository of standard office items, school supplies, and hardware specifications with benchmark costs.
- **`Requisition`**: Tracks unauthenticated department purchase requests, metadata, and status.
- **`RequisitionItem`**: Line item breakdowns for requisitions.
- **`RequisitionStatusHistory`**: Chronological log of comments and state changes for requisitions.
- **`DepartmentBudget`**: Fiscal budget allocations and spending tracker per department.
- **`Ppmp`**: Master Project Procurement Management Plan tracker containing title, budget, funding source, preparer, status, and items.
- **`PpmpItem`**: Individual line items linked to the plan referencing specific `CatalogProduct` objects.


---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Connection (Transaction Pooler for Prisma)
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/postgres"

# Supabase Auth Settings
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

### 3. Installation & Run

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
npx prisma generate

# Populate database mock values & suppliers
npx prisma db seed

# Spin up local development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the login portal.

### 🏛️ Login Portal Visual Enhancements
The authentication portal layout features:
- **Split-Screen Layout**: Modern UI split-screen styling, featuring a dynamic network constellation visualizer on the left representing bid and price correlations, and a glassmorphic login card on the right.
- **Identity & Subtitle Branding**: Displays the "ProcureWise" brand with sub-titles "Procurement Management System" and "Batanes State College".
- **Product Scope Summary**: Includes a clear system summary outlining the streamlining of planning, bidding, supplier evaluation, and purchase order management.
- **Premium Spacing & Typography**: Integrated Google Font 'Outfit' for titles and headers, refined form group spacing, and added an interactive gold-ring focus glow state to form fields.

---

## ⚠️ Troubleshooting & Production Deployment

### P1001: Can't reach database server at `db.tfswokhkuxwvpcpxekso.supabase.co`

If you encounter a `P1001` database connection error in production (e.g., on Vercel), it is because Supabase direct connections (`db.[project-id].supabase.co` on port `5432`) use **IPv6-only** resolution. Most serverless hosting providers (including Vercel) do not support IPv6-only database connections out-of-the-box.

#### Solution (Automatic & Manual):
1. **Automatic Runtime Safety Net (Code-level)**:
   The application now includes built-in routing logic in `src/lib/prisma.ts` that automatically intercepts direct IPv6 Supabase connection strings (`db.[project-ref].supabase.co`) at runtime and rewrites them to the IPv4-compatible transaction pooler (`aws-1-ap-southeast-1.pooler.supabase.com:6543`). This prevents runtime P1001 crashes out of the box.

2. **Manual Configuration (Recommended for performance)**:
   It is still recommended to update the environment variables in your production hosting platform (e.g., Vercel Project Settings) to point directly to the **Supavisor Connection Pooler URL** to ensure optimal connection pooling behavior:

   - **`DATABASE_URL`**: Update this in your production environment settings to point to the Transaction Pooler (port `6543`):
     ```env
     DATABASE_URL="postgresql://postgres.tfswokhkuxwvpcpxekso:[YOUR_DATABASE_PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
     ```
   - **`DIRECT_URL`**: Update this to also use the IPv4-compatible pooler URL (or transaction/session pooler) to ensure build/migration scripts run without network timeouts:
     ```env
     DIRECT_URL="postgresql://postgres.tfswokhkuxwvpcpxekso:[YOUR_DATABASE_PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
     ```

### Runtime Database Error Feedback UI
To prevent generic 500 "Server Error" pages (e.g., Error: 2369467324) when database tables are missing or connection errors occur in production, pages fetching data via Prisma (such as RFQ Creation and Catalog Management) now wrap queries in standard try-catch handlers. If a database query fails, they render a clean diagnostic view showing the exact PostgreSQL error message (such as missing relations/tables or pooler connection timeouts) so they can be fixed immediately without needing to search server logs.

---

## 📈 Historical Price Engine (Sprint 3.5)

The Historical Price Engine processes legacy procurement records from Batanes State College and provides advanced historical price analytics.

### 1. Database Schema
Adds the `HistoricalPrice` model linked to the main catalog entities:
- `productId` (nullable FK to `CatalogProduct`, with a `matchedAt` timestamp)
- `supplierId` (nullable FK to `Supplier`)
- `unitId` (nullable FK to `UnitOfMeasure`)
- Fields for raw values: `rawProductName`, `supplierName`, `unit`, `procurementNumber`, `procurementDate`, `quantity`, `unitPrice`, `totalPrice`, `sourceMonth`, `sourceYear`.
- Enforces uniqueness via a composite index on `(procurementNumber, rawProductName)` and indexing on `procurementDate` for quick duration queries.

### 2. High-Performance Excel Importer (`scripts/import-historical-prices.ts`)
An intelligent script to import Excel sheets from the `historical data/` directory:
- **Fast In-Memory Cache**: Loads suppliers, units of measure, existing keys, and catalog products to perform lookup resolution in memory, minimizing database latency.
- **Idempotency**: Implements `upsert` queries to safely run the importer repeatedly without creating duplicates.
- **Fuzzy Catalog Matching**: Uses Descriptive Token Intersection (ignoring noise/stop words) and Substring Matching to map raw product names to Catalog Products.
- **Dynamic Growth**: If an item name cannot be fuzzy-matched to any catalog product, the importer automatically inserts a new `CatalogProduct` record in the database under the "Uncategorized" category and caches it, growing the product catalog organically.
- **Detailed Development Logging**: Generates file-by-file metrics (rows read, imported, skipped, failed, matched counts) and a failure summary grouped by exact Postgres error reasons.

### 3. Catalog Seeder (`scripts/seed-catalog-from-historical.ts`)
A dedicated script to bootstrap the database catalog:
- Iterates over all historical Excel documents.
- Extracts unique items, normalizes them, and filters out existing catalog items.
- Inserts new products in optimized batches of 500 using `createMany` to avoid parameter limit restrictions.

### 4. Analytic Queries Helper (`src/lib/historical-price-queries.ts`)
Exposes 10 optimized, type-safe API helper queries:
1. `getAveragePrice(productId)`
2. `getLowestPrice(productId)`
3. `getHighestPrice(productId)`
4. `getLatestPrice(productId)`
5. `getSupplierCount(productId)`
6. `getMonthlyTrend(productId)`
7. `getPriceVariance(productId)`
8. `getPriceHistory(productId)`
9. `getMonthlyAverage(productId)`
10. `getYearlyAverage(productId)`

### 5. UI Integration (Sprint 4.1)
Integrates legacy procurement records and analytics directly into the Product Details page (`/catalog/[id]`):
- **Procurement Information Panel**: Shows Current Price, Average Price, Lowest Price, Highest Price, and Supplier Count using live server-side database queries.
- **HistoricalPriceCard Component**: Displays a grid summarizing the current cost, average/lowest/highest historical prices, unique suppliers, and the latest procurement transaction date.
- **PriceTrend Component**: Visualizes monthly pricing chronologically over the latest 12 months, calculating the overall percentage change and rendering indicators (`↑ increasing`, `↓ decreasing`, or `→ stable`) styled to match the dark/light mode dashboard theme.
- **SupplierStatistics Component**: Displays a tabular list of detailed historical transactions showing date, supplier name, quantity, and unit price.
- **Graceful Fallbacks**: Renders a custom message `"No historical procurement records found."` when there is no historical data available for a catalog product, instead of crashing the page.
- **Zero Client-Side Overhead**: Data fetching is executed completely on the server-side within Next.js Server Components.

---

## 📐 Time Series Analytics Infrastructure (Sprint 4.2 — Phase 1)

Prepares ProcureWise for ARIMA-based procurement price forecasting. All files live in `src/lib/forecast/`.

### `forecast-types.ts`
Shared TypeScript interfaces used across the entire forecasting pipeline:
- `HistoricalPoint` — `{ date, value }` observation
- `ForecastPoint` — `{ date, value, lower, upper }` with confidence bounds
- `ForecastResult` — full forecast run output including trend direction and model used
- `TrendDirection` — `"increasing" | "decreasing" | "stable"`
- `StationarityResult` — stationarity verdict with reason and optional rolling stats
- `DifferencedSeries` — differenced values with the applied order `d`

### `time-series.ts`
- **`getHistoricalSeries(productId)`** — queries `HistoricalPrice` grouped by `sourceYear`/`sourceMonth`, converts each month-year pair to a `Date`, and returns an array of `HistoricalPoint[]` sorted **oldest → newest**.

### `stationarity.ts`
Heuristic stationarity check (not ADF — used as a pre-differencing signal):
- **`calculateMean(values)`** — arithmetic mean
- **`calculateVariance(values)`** — population variance
- **`calculateRollingMean(values, window)`** — sliding window average
- **`calculateRollingVariance(values, window)`** — sliding window variance
- **`isApproximatelyStationary(points, window=3)`** — returns `{ stationary, reason, rollingMeans, rollingVariances }`. Series is deemed stationary when rolling mean drift ≤ 30% of global mean **and** rolling variance CV < 1.0.

### `differencing.ts`
- **`differenceSeries(values)`** — first-order differencing (`Δyₜ = yₜ − yₜ₋₁`), returns `DifferencedSeries`
- **`differenceSeriesOfOrder(values, d)`** — applies d-th order differencing for ARIMA(p,d,q)
- **`invertDifference(differenced, origin)`** — reconstructs the original scale from differenced forecasts

### Verification
Run `scratch/test-forecast.ts` to print the full diagnostic report for the most data-rich product in the database:
```bash
npx tsx scratch/test-forecast.ts
```

---

## 🤖 ARIMA Forecasting Engine (Sprint 4.3)

Implements a dependency-free ARIMA(p,d,q) forecasting pipeline integrated into the Product Details page.

### `autocorrelation.ts`
- **`calculateACF(values, maxLag)`** — sample autocorrelation function via cross-correlation formula
- **`calculatePACF(values, maxLag)`** — partial autocorrelation via Durbin-Levinson recursion (removes intermediate lag influence)
- **`estimateP(pacf, n)`** — AR order from PACF using `2/√N` significance threshold (cap 4)
- **`estimateQ(acf, n)`** — MA order from ACF using `2/√N` significance threshold (cap 3)

### `arima.ts`
- **`fitARIMA(diffValues, p, d, q)`** — fits ARIMA on a pre-differenced series:
  - AR(p): Yule-Walker equations solved with partial-pivot Gauss-Jordan elimination
  - MA(q): residual OLS — regresses AR residuals on lagged residuals via normal equations
  - Outputs: `arCoeffs`, `maCoeffs`, `intercept`, `sigma²`, AIC, in-sample fitted values, residuals
- **`forecastARIMA(fit, diffValues, horizon)`** — h-step ahead point forecasts with 95% confidence intervals (`±1.96·√(σ²·h)`)

### `engine.ts`
- **`forecastProductPrice(productId, horizon=3)`** — full 9-step pipeline:
  1. Fetch `getHistoricalSeries` → bail with `null` if `< 6` monthly points
  2. `isApproximatelyStationary` → choose `d` (0, 1, or 2)
  3. `differenceSeries` as needed
  4. `calculateACF / calculatePACF` → estimate `p` and `q`
  5. `fitARIMA(p, d, q)`
  6. `forecastARIMA` → 3-month point + CI forecasts
  7. `invertDifference` back to peso scale (handles d=1 and d=2)
  8. Price clamping (no negatives)
  9. Trend detection → `ForecastResult`

### `ForecastCard.tsx`
A premium UI card on the Product Details page displaying:
- **Trend badge**: `↑ Increasing`, `↓ Decreasing`, or `→ Stable`
- **Forecast – Next Month**: point estimate vs current price (with % change)
- **Forecast – Next 3 Months**: projected price with target date
- **Monthly Breakdown**: per-month forecast + 95% confidence interval
- **Recommendation**: `Purchase Now` (increasing), `Delay Purchase` (decreasing), or `Monitor` (stable)
- **Graceful fallback**: `"Not enough historical data to generate a forecast."` when fewer than 6 monthly data points exist

### Verification
```bash
npx tsx scratch/test-arima.ts
```
Prints: selected product → series → stationarity → differenced series → ACF/PACF → estimated p/q → 3-month forecast with confidence intervals → model summary.
```


## 🏆 Best-Value Recommendation Engine (Sprint 5)

Implements a Multi-Criteria Decision-Making (MCDM) Weighted Scoring Model that evaluates suppliers across multiple procurement factors rather than selecting solely based on the lowest quotation.

### Criteria & Weightings
- **Price (40%)**: Scale to lowest active bid: `(minPrice / bid) * 100`.
- **Delivery Speed & On-Time (20%)**: Speed score (comparative or absolute fallback) + On-time delivery rate (delivered / total deliveries).
- **Historical Reliability (20%)**: Rescaled reliability rating (0-5 to 0-100) + PO completion rate + average evaluation score.
- **Regulatory Compliance (10%)**: Accreditation (`isVerified`) + required documents + status completeness.
- **Historical Performance (10%)**: Price stability (coefficient of variation) + price variance + ARIMA forecast trend support.

### Robust Fallbacks & Graceful Recovery
- **No delivery history**: Defaults to `70/100` and adjusts confidence downward.
- **No evaluation history**: Falls back to rescaled profile rating or a neutral `75/100` score.
- **No historical prices**: Defaults price stability and variance scores to `100/100`.
- **No forecast**: ARIMA trend contribution falls back to neutral `75/100`.
- **Confidence Rating (0-100%)**: Dynamically evaluated based on completeness of supplier info, historical prices, delivery history, and evaluation history.

### User Interface Presentation
- **`RecommendationCard.tsx`** renders on the product detail page, showing:
  - Top Recommended Supplier company info and overall score.
  - Bullet-pointed justification log reasons.
  - Explainable contribution scores (e.g. Price 39/40, Delivery 18/20, etc.).
  - Confidence meter and ARIMA trend indicator.
  - Top 5 alternative suppliers sorted highest to lowest.

---

## ⚖️ RFQ Canvassing & Sensitivity Analysis Integration (Sprint 6.1)

Integrates the MCDM Best-Value Recommendation Engine directly into the Request for Quote (RFQ) procurement canvassing workflow.

### New Components
- **`RecommendationPanel.tsx`**: Renders recommended supplier metrics, MCDM score, data confidence (High, Medium, Low), ARIMA forecasts, dynamic justifications, and a functional button to draft formal Purchase Orders from the award.
- **`SupplierRankingTable.tsx`**: Renders all bidding suppliers sorted by overall MCDM score, complete with interactive horizontal progress bars displaying the breakdown of individual criterion contributions.
- **`RecommendationReason.tsx`**: Automatically translates individual scores into dynamic natural-language explanations (e.g. "Lowest evaluated price among suppliers", "Excellent delivery performance").

### Canvass Evaluation & Sensitivity Analysis
- Located at `/dashboard/officer/rfq/[id]`.
- Enforces Procurement Officer access.
- Allows interactive weighting adjusters (sliders for Price, Delivery, Reliability, Compliance, and Historical Performance) that automatically normalize weights.
- Recalculates scores and rankings on the client side instantly.
- Generates a print-ready BAC procurement report view for BAC secretariat and administrative approvals.
- Stores the full audit trail snapshot (JSON format containing weights, scores, and confidence) inside the `justificationLog` column.

---

## 🔮 Procurement Forecasting & Decision Intelligence (Sprint 6.2)

Transforms ARIMA time-series predictions into interactive procurement decision support.

### Decision Engine & Formatter Core
- **`decision-engine.ts`**: Evaluates forecast trends against standard budgets to yield procurement strategies (`BUY_NOW` if expected inflation > 1.5%, `WAIT_FOR_PRICE_DROP` if expected decrease < -1.5%, `MONITOR_MARKET`, and `INSUFFICIENT_DATA`).
- **`forecast-summary.ts`**: Produces human-readable summaries containing current price, forecasted price, percent expected change, and strategy text.
- **`forecast-alerts.ts`**: Calculates price volatility using the Coefficient of Variation (standard deviation / mean). Classifies series as `Highly Volatile` if variance exceeds 15%; otherwise defaults to ARIMA trend directions.

### Visual Integrations
- **Catalog Cards (`ProductCard.tsx`)**: Renders inline trend badges showing price directions and expected change percentages (e.g., `↑ INCREASING (+3.2%)`) directly below the item price.
- **Recommendation Cards (`RecommendationCard.tsx`)**: Integrates strategic procurement advice messages and rebrands the final MCDM criterion as `Historical Procurement Intelligence`.
- **Officer Dashboard Widgets (`page.tsx`)**: Integrates expected price increases (inflation warnings), expected price decreases (savings opportunities), and total potential procurement savings. Includes dynamic decision tip alerts.

---

## 📈 Intelligent Procurement Analytics Dashboard (Sprint 6.3)

Consolidates all transactional databases and ARIMA models into a centralized executive analytics portal.

### Aggregation API
- **`analytics.ts`**: Aggregates Monthly, Quarterly, and Yearly spending trends, departmental allocations, category metrics, supplier rankings, historical price distributions, and workflow cycle KPIs in parallel.

### Executive UI
- **Sub-navigation link**: Placed under `/dashboard/officer/analytics` and exposed to both Procurement Officers and Administrative Approvers.
- **Spending & Budget Overview**: Includes a responsive SVG line chart representing monthly spending trends, utilization tracking, and alerts for overspent budgets.
- **Supplier Scorecard**: Captures top awardees, delivery times, verification status counts, and on-time ratios.
- **Market Intelligence**: Renders historical pricing charts, ARIMA forecasts, expected change percentages, and recommended procurement actions.
- **Performance metrics**: Details processing speeds, End-to-End procurement cycle times, and registry volume counts.
- **Explainable Recommendations (`RecommendationCard.tsx`)**: Generates natural-language bullet points dynamically from bidded criteria scores (e.g. price competitiveness, compliance checks, and ARIMA buying windows).
- **Forecast Accuracy Backtesting (MAPE)**: Integrates dynamic cross-validation backtesting against price histories. Fits ARIMA models on first $N-3$ observations to project final points, computing Mean Absolute Percentage Error (MAPE) diagnostic error rates.
- **Cost Savings Ledger**: Formulates cost savings as `(Historical Average - Awarded Price) * Quantity`, detailing largest saver, largest overspend, and annual totals.
- **Supplier Radar Chart (SVG)**: Renders a responsive pure-SVG spider chart mapping bidded criteria profiles.
- **Dashboard Filters & Exporter**: Adds reactive filters (department, category, supplier, timeframes) and Excel spreadsheet downloads.
- **Procurement Insights Panel**: Generates rules-based alerts highlighting spend distributions and inflation warnings.
- **Forecast Confidence Tiers**: Categorizes ARIMA forecast confidence levels: `High` (MAPE < 10%), `Medium` (10-20%), or `Low` (MAPE > 20%).
- **Supplier Risk Classification**: Classifies suppliers into `LOW`, `MEDIUM`, or `HIGH` risk categories based on delivery, reliability, and compliance metrics.
- **Procurement Scenario Comparison**: Compares bidded costs against recommended MCDM supplier costs to calculate delta and potential savings.
- **MCDM Stability Indicator**: Evaluates recommendation rankings under $\pm 10\%$ criteria weight shifts to determine if the choice is `Stable` or `Sensitive`.
- **Budget Health Tiers**: Translates budget utilization rates into `Healthy` (0-70%), `Watch` (70-90%), or `Critical` (> 90%) status badges.
- **Dashed Forecast Visualization**: Extends the SVG trend charts to append forecasted prices as dashed line segments.
- **PDF Report Exporter**: Implements an printable executive PDF layout containing all summary charts, rankings, and cost savings ledgers.

---

## 🔒 Security, Routing & Production Readiness (Sprint 7)

A comprehensive stabilization phase addressing application routing, input validation, server security, and data consistency.

### 1. Centralized Routing & Tracking Portal
- **Dashboard Gatekeeper**: Added `/dashboard/page.tsx` redirecting logged-in users to their role-specific dashboard (e.g. `/dashboard/end-user`, `/dashboard/officer`, `/dashboard/approver`) to prevent raw `/dashboard` 404s.
- **Requisition Tracking Portal**: Implemented `/track` routing and [TrackingForm.tsx](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/src/app/track/TrackingForm.tsx) to query requisitions by human-readable tracking codes and securely redirect to the `/[secureToken]` route without exposing database primary keys.
- **Audited Navigation Links**: Resolved broken CTA links on the catalog details page (`Add to PPMP` and `Create PR`) to map to active `/dashboard/end-user/ppmp?add_product=ID` and `/end-user?product=ID` endpoints.

### 2. Strict Input Validation & Loading Feedback
- Enforced bounds checking (e.g., quantities must be $\ge 1$) across deep-linked modals and requisition carts.
- Added disable-state mechanisms on all primary buttons during server actions to block duplicate submissions.
- Integrated interactive submitting indicators and spinners on all major transaction flows (Draft PPMP, submit PR, PO creation).

### 3. Server-Side Role Access Enforcement
- Hardened all server actions inside `src/app/actions/` (`ppmp.ts`, `pr.ts`, `po.ts`) to validate user authorization via `requireRole` on the server layer, preventing client-side bypasses.

### 4. Recalculation & Data Integrity
- Recalculated PPMP budgets server-side dynamically from line items to guard against spoofed client payloads.
- **Realigned Budget Commitment System**: Adjusted department budget allocation rules so that budget spent is only committed (incremented) upon official PR approval or receipt. Budgets are no longer reserved on submission, meaning no decrement occurs when requests are rejected or returned.

---

## 🔄 Advanced Procurement Approval & Resubmission Workflow (Sprint 8)

A high-fidelity enhancement to the procurement approval process, establishing full accountability and process alignment for Administrative Approvers and Procurement Officers:

### 1. Unified Requisitions Workflow Center
- **Approver History Log (`/dashboard/approver/history`)**: Implemented a comprehensive history board categorized into five tabs: **`Pending`**, **`Under Review`**, **`Approved`**, **`Returned`**, and **`Rejected`** for full process visibility.
- **Workflow Detail & Action Panel (`/dashboard/approver/history/[id]`)**: Developed a deep-linked detail page where Administrative Approvers can inspect PR items, check department budget balance, view the chronological timeline, and perform action reviews.
- **Dynamic Decision Controls**: Added transitions supporting:
  - **Start Review**: Moves `Submitted` PRs to `Under Review` to indicate the evaluation has started.
  - **Approve**: Updates status to `Approved` with optional remarks.
  - **Return for Revision**: Open modal gathering mandatory revision remarks, transitioning PR to `ReturnedForRevision` and releasing the reserved budget.
  - **Reject**: Open modal gathering mandatory rejection remarks, transitioning PR to `Rejected` and releasing the reserved budget.

### 2. End-User Resubmission Workflow
- **Revision and Resubmit Panel**: In the requisitioner tracker (`PrTrackerClient.tsx`), when a request is returned for revision, an editing mode is unlocked inline.
- **Budget Adjustments**: When resubmitting, the department's `spentBudget` is automatically re-reserved and adjusted based on the new computed total cost difference.
- **Chronological Feedback Logs**: Decision history and comments are permanently recorded in `PurchaseRequestStatusHistory` and rendered chronologically for requisitioners and auditing officers.

### 3. Procurement Officer Integration & Bidding Restrictions
- **Active Queue Restrictions**: Modified the officer's Requisitions Auditing Hub (`/dashboard/officer/pr`) and dropdowns to filter out `Returned` or `Rejected` requests, ensuring only `Approved` and `Received` PRs proceed to RFQ drafting and bidding.
- **Approved PR Receiving**: Officers can now only mark PRs as `Received` once approved by the Administrative Approver, ensuring correct hierarchical alignment.

### 4. Unified Public Tracking
- **Search and Tracking Integration**: Hardened the public `/track` portal search engine and token pages to support searching and tracking both `Requisitions` and official `PurchaseRequests` using a single lookup interface.

---

## 🖨️ Unified Document Branding, Print Engine & Realigned Budgets (Sprint 9)

A comprehensive upgrade to the document output and budget tracking pipeline to mirror official Batanes State College administrative guidelines:

### 1. Realigned Budget Spent Logic
- **Commit on Approval**: Realigned budget tracking so that department spent budgets are only committed (incremented) when a Purchase Request is officially approved by the Administrative Approver or marked as received.
- **No Pre-Reservation**: Submission of PR drafts and revisions does not alter the spent budget. If a PR is rejected or returned while in review/draft, the budget remains untouched.

### 2. Full-Lifecycle Status Audit Trails
- **Chronological Logs**: Every state change (Draft, Submitted, UnderReview, ReturnedForRevision (mapped to `"Returned for Revision"`), Approved, Received, and Rejected) now records a corresponding status log inside `PurchaseRequestStatusHistory`, detailing the review comments, dates, and active actor names.

### 3. Unified Print Layout Engine
- **Fixed Branding Headers/Footers**: Introduced a graphic layout wrapper (`DocumentLayout.tsx`) utilizing College branding assets (`bsc-header.png` and `bsc-footer.png`) which automatically repeat at the top and bottom of every printed page.
- **Overflow Prevention**: Defined strict CSS printing layout rules ensuring that content margins and print boundaries align beautifully without text page overlapping.
- **Target Views Integration**: Integrated the branding layout into the following printable items, keeping them clean and dashboard-only on the screen view:
  - Purchase Orders (Appendix 61) (`PoDetailsClient.tsx`)
  - BAC Procurement Recommendation Report (`RfqEvaluationClient.tsx`)
  - Executive Procurement Analytics Reports (`AnalyticsDashboardClient.tsx`)
  - Purchase Requests (Appendix 60) for End-Users, Officers, and Approvers (`PrTrackerClient.tsx`, `PrDetailsClient.tsx`, `PrReviewClient.tsx`)

### 4. Direct Action Controls & Approval cards
- **Action buttons**: Added print action buttons to the Requisition tracker, Officer detail, and Approver history views.
- **Approval Cards**: Added high-visibility "Approval / Review Details" alerts displaying status comments, reviewer names, and decision timestamps on processed Purchase Requests.

### 5. Re-Branded status "Returned for Revision"
- **Clearer Nomenclature**: Renamed the database status map, badges, timelines, tracker view, history tab, and reports from `"Returned"` to `"Returned for Revision"` to reassure requisitioners that their requests only need corrections.

---

## 🔄 System Flowcharts & Process Architecture

ProcureWise's system workflows and operational logic are documented in a centralized, thesis-ready format. This resource includes comprehensive Mermaid flowcharts adhering to strict modeling standards (Start/End terminators, process rectangles, decision diamonds, input/output parallelograms, and database cylinders with Yes/No branches).

The flowcharts include:
1. **Overall ProcureWise System Workflow**: Master procurement lifecycle from public user entry to time-series forecasting.
2. **Procurement Workflow**: Continuous process detailing planning (PPMP), requisitions (PR), solicitations (RFQ), scoring (MCDM), purchasing (PO), delivery, evaluation, and price updates.
3. **Intelligent Procurement Analytics Workflow**: Focused workflow of time-series feeds, ARIMA pipeline execution, MAPE validation, confidence tiers, and strategic recommendation output.
4. **Public User Workflow**: Browse Catalog, Create PPMP Planning Draft, Submit Purchase Requisition, Track Requisition Status.
5. **User Access Workflow**: Authenticated system entry mapping roles (Administrator, Procurement Officer, Administrative Approver, Supplier, and End User) to dashboard options.

Access the full interactive flowcharts here:
* [ProcureWise System Flowcharts](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/system_flowcharts.md)
* [Archived Legacy Flowcharts](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/archived-flowcharts/)

---

## 📚 System Documentation

The system workflows, database relationships, logical data flows, and use case diagrams are documented in the following reference guides:
* [System Flowcharts](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/system_flowcharts.md)
* [Entity Relationship Diagram](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/erd.md)
* [Data Flow Diagrams](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/data_flow_diagrams.md)
* [UML Use Case Diagram](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/use_case_diagram.md)
* [Development Roadmap](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/development_roadmap.md)
* [Final Development Roadmap](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/final_development_roadmap.md)
* [System Audit & Production Readiness Report](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/system_audit_report.md)
* [Sprint 9 Walkthrough & Validation](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/docs/walkthrough.md)










