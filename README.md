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
- **Database & ORM**: PostgreSQL hosted on Supabase, managed through **Prisma ORM**
- **Styling**: Tailwind CSS & Vanilla CSS (with sleek transitions, gradients, and custom scrollbars)
- **Theming**: `next-themes` for high-performance Light/Dark Mode toggling

---

## 📊 Core Features & Functionality

### 1. Security & Role-Based Access Control (RBAC)

ProcureWise protects user access and ensures strict segregation of duties through a middleware-equivalent Edge Proxy (`src/proxy.ts`, which replaces the deprecated `src/middleware.ts` convention in Next.js 16):

> [!NOTE]
> In this Next.js 16 version, the Edge Proxy is defined at `src/proxy.ts` (replacing the traditional `middleware.ts`). To comply with Next.js 16 file conventions, this file must export the proxy function as a **default export** (i.e., `export default async function proxy(request: NextRequest)`). Named exports will fail to bind at runtime in production.

- **Authentication Gateway**: Prevents unauthenticated users from accessing any `/dashboard/*` paths, forcing a redirect back to `/` (login).
- **Separated Registration Flows**: The public registration portal is strictly for Suppliers. Creation of staff accounts (Procurement Officers and Approvers) is restricted to logged-in Administrative Approvers via a dedicated dashboard module, using a cookie-free Supabase client to prevent session invalidation.
- **Role Guards**: Extracts the user's validated database profile role and restricts route access. If a user tries to access a path outside their authorized scope, they are redirected to their appropriate home dashboard:
  - **Procurement Officer** $\rightarrow$ `/dashboard/officer`
  - **Administrative Approver** $\rightarrow$ `/dashboard/approver`
  - **Supplier** $\rightarrow$ `/dashboard/supplier`
- **Profile Synchronization**: PostgreSQL triggers (`on_auth_user_created` running `handle_new_user()`) dynamically sync Supabase Auth sign-ups into the `user_profiles` table, maintaining strict database integrity.
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
- **RFQ Actions (`src/app/actions/rfq.ts`)**: Auto-generates incremental RFQ references (e.g. `RFQ-2026-06-001`), manages state transitions (`Draft` $\rightarrow$ `Published` $\rightarrow$ `Closed`), and retrieves full RFQ records with nested supplier bids.
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
  - **RFQ Transactions**: Logs on `CREATE_RFQ`, `PUBLISH_RFQ`, and `CLOSE_RFQ`.
  - **Supplier Bidding**: Logs on `SUBMIT_BID` (capturing overwrites of existing bids).
  - **Evaluated Recommendations**: Logs on `APPROVE_RECOMMENDATION` status changes.
- **Audit Metadata**: Automatically stamps records with the active user session ID (fetched inside the `after` callback context) and the requester's IP address (resolved via async `headers()`).

### 11. Frictionless Department Requisitions & Tracking (No-Login)

Simplifies the purchase request process for departments by removing authentication barriers:

- **End-User Shopping Catalog**: Department employees browse the products catalog, adjust quantities in a local cart drawer, and submit the request by entering Name, Email, and Department.
- **Secure Cryptographic Tracking**: Upon submission, the system generates a secure tracking token (`/track/req_[uuid]`) and a reference code (`PR-2026-X8Y7`). Requesters use this secure link to view request progress.
- **PO Handoff & Revision Loop**: If a Procurement Officer rejects a request, the rejection count is incremented, and detailed remarks are logged. Requesters see this history on their tracking page, allowing them to adjust items and resubmit.
- **Budget Compliance**: Requisitions are validated against allocated department budgets (`DepartmentBudget`) to prevent over-allocation.

### 12. End-User Requisitions Tracker

A dashboard page at `/dashboard/end-user/pr` that lists all Purchase Requests submitted by the requisitioner:
- **Interactive Multi-Step Validation**: Requisitioners can submit draft PRs for officer audits and monitor validation steps (Draft -> Submitted -> Audited & Approved -> Received/PROC Number Issued).
- **Assigned Officer Status**: Shows the name, email, and status of the Procurement Officer assigned to audit the request.
- **Revision Logs**: Displays a history of comments and return reasons logged by the officer during reviews.

### 13. End-User Supplier Evaluation Sheet

A performance evaluation form at `/dashboard/end-user/evaluation` enabling requisitioners to rate suppliers:
- **7-Criteria Grading Form**: Evaluates suppliers on a 1-4 scale (Poor, Fair, Good, Excellent) across: Product Quality, Delivery Compliance, Order Accuracy, Responsiveness, Communication Flow, Cost Effectiveness, and Overall Satisfaction.
- **Verification Signatures**: Requires typed signature block confirmation before submitting, dynamically logging reviews and recalculating the supplier's overall reliability rating, quality compliance percentage, and delivery rates.

### 14. Officer Requisition Auditing Hub

An audit interface at `/dashboard/officer/pr` where Procurement Officers review submitted requisitions:
- **Quantity & Specs Checklist**: Requires auditing item descriptions and quantities against specifications before final approval.
- **Inline Corrections (UOM Conversion)**: Enforces validation rules enabling officers to edit items inline (e.g. converting "1 piece alcohol" to "500 mL alcohol", adjusting quantities, or correcting brands), which automatically recalculates PR totals and modifies department budget spent.
- **Status Gates**: Officers can mark PRs "Under Review", return them to the requisitioner for corrections (providing feedback remarks), or approve them to issue a unique `PROC-YYYY-XXXX` tracking reference.

### 15. Officer Purchase Order drafting Workspace

A contract drafting workspace at `/dashboard/officer/po` where officers draft and approve Purchase Orders:
- **Award Queue**: Retrieves approved RFQ Canvas recommendations and drafts POs with pre-filled details (supplier, items, and pricing).
- **Interactive Clause Editor**: Enables drafting delivery and payment terms directly on the contract.
- **High-Fidelity Appendix 61 Layout**: Renders standard government Purchase Order layouts (Appendix 61 / standard Philippine Government PO format) complete with conformes, penalty clauses, and signature slots for print-preview or physical printing.

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

- **Procurement Officer**: Overview → Purchase Requests → Purchase Orders (Quick Actions on overview page still link to RFQ creation, Supplier Directory, Product Catalog, and Price Comparison)
- **Administrative Approver**: Overview only (MCDM approval queue, audit trail, and staff management are all on the overview page)
- **End User**: Overview → My PPMPs → Purchase Requests
- **Supplier**: Overview → Purchase Orders → My Scorecard

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

