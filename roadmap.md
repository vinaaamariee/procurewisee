# 🗺️ ProcureWise Project Roadmap

Based on the current architecture, completed components, and the system's goals outlined in the `README.md`, here is the comprehensive project roadmap showing our current implementation state.

---

## ✅ Phase 1: Core Foundation & Architecture (Completed)
This phase established the security, database model, and visual guidelines.
- `[x]` **Database Schema Design:** Fully mapped `schema.prisma` covering Users, Suppliers, RFQs, Quotes, MCDM Recommendations, and Audit Trails.
- `[x]` **Authentication & RBAC:** Supabase Auth integration, edge proxy middleware for route protection, and role-based redirects.
- `[x]` **Separated Registration:** Secure public portal restricted to Suppliers; internal staff creation restricted to the Administrative Approver dashboard.
- `[x]` **UI/UX Foundations:** Glassmorphic design system, Tailwind setup, and `next-themes` Light/Dark mode toggling.

---

## ✅ Phase 2: Procurement Workflows (Completed)
This phase focuses on the day-to-day operations of the Procurement Officers.
- `[x]` **Centralized Product Catalog:** Dashboard (`/dashboard/officer/catalog`) to manage standard office supplies, hardware, and specs.
- `[x]` **Supplier Directory & Auditing:** UI to search, filter, and verify suppliers, displaying performance metrics (Reliability, Quality, and Lead Time).
- `[x]` **Server Actions Layer:** Robust, type-safe server actions for auth, user profiles, catalog, and suppliers.
- `[x]` **RFQ Publishing Engine:** Full end-to-end testing of drafting an RFQ, pre-filling items from the catalog, and setting ABC limits (validated by `scripts/test-rfq-engine.ts`).

---

## ✅ Phase 3: Supplier Engagement & Bidding (Completed)
This phase builds out the interfaces where external suppliers interact with the published RFQs.
- `[x]` **Supplier Dashboard:** A portal for suppliers to view open RFQs publicly available or invited.
- `[x]` **Manual Quote Submission:** An interactive online form for suppliers to bid on line items, adhering to ABC constraints.
- `[x]` **Excel Quote Integration:** Allowing suppliers to download an `.xlsx` template, fill it offline, and upload it to automatically parse prices into the system in real-time.
- `[x]` **Document Branding (Header & Footer):** Extracted reusable official document layout components (`DocumentHeader.tsx` and `DocumentFooter.tsx`) with high-fidelity Batanes State College branding.

---

## ✅ Phase 4: Decision Engine & Awards (Completed)
The intelligence layer of the application that replaces manual canvassing calculations.
- `[x]` **Price Comparison Canvassing Board:** The `/price-comparison` UI featuring color-coded tables, CSS price charts, and inventory badges.
- `[x]` **MCDM Engine Integration:** Running the multi-criteria algorithm (Price 50%, Delivery 30%, Reliability 20%) against the submitted supplier quotes.
- `[x]` **Justification Generation:** System-generated logs explaining *why* a specific supplier won the rank #1 position.
- `[x]` **Approver Sign-off Flow:** The UI for Administrative Approvers to review the MCDM recommendations and officially approve the Canvas Abstract.

---

## 🟡 Phase 5: Polish & Production (Next Steps)
Final touches needed before deploying to Batanes State College.
- `[ ]` **PDF Export / Print:** Support exporting the finalized Canvas Abstract and Purchase Order to a printable PDF format for physical signatures.
- `[ ]` **Email Notifications:** Utilizing Resend or Supabase Edge Functions to email suppliers when they win a bid or when a new RFQ is published.
- `[ ]` **Comprehensive Audit Trail UI:** Providing a user interface for admins to filter and search through historical system actions for compliance auditing.
- `[ ]` **Production Deployment:** Final deployment on Vercel with production Supabase keys and database backups enabled.
