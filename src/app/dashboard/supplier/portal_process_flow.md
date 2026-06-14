# Supplier Portal Process Flow

This document details the system workflow and process architecture of the **Supplier Portal** at `/dashboard/supplier`.

---

## 🔄 Portal Workflow & System Flow Diagram

The diagram below maps the processes, decisions, and system gates available to a registered Supplier:

```mermaid
flowchart TD
    %% Portal Entry
    Start([👤 Logged in as User]) --> AuthGate{Edge Guard:<br/>Role Check}
    AuthGate -->|Not Supplier| Redirect[Redirect to corresponding portal]
    AuthGate -->|Supplier Verified| ProfileMatch[Resolve Supplier Profile]

    %% Match Profile Flow
    ProfileMatch -->|Match by Company/Contact| FetchPortal[Load Supplier Dashboard]
    ProfileMatch -->|No direct match| DevFallback[Fallback to First Supplier in DB]
    DevFallback --> FetchPortal

    %% Dashboard Options
    subgraph SupplierModules [Supplier Dashboard Options]
        FetchPortal --> ActionStats[Fetch Statistics Summary]
        FetchPortal --> ActionOpenRFQs[Query Open Solicitations]
        FetchPortal --> ActionMyQuotes[Query My Submitted Bids]
    end

    %% Database queries
    ActionStats --> DB_Stats{Prisma Queries}
    DB_Stats -->|Query Published| Data_RFQs[(requests_for_quote)]
    DB_Stats -->|Query Supplier quotes| Data_Quotes[(supplier_quotes)]

    %% Bid Submission Navigation
    ActionOpenRFQs --> Card_RFQ[Show RFQ Card with Budget & Deadline]
    Card_RFQ --> Link_SubmitBid[Click Submit Quotation]
    Link_SubmitBid --> Route_BidPage[/dashboard/supplier/rfq/:id]
    
    %% Bid Submission Action
    Route_BidPage --> Form_Submit[Enter Unit Prices & Delivery Days]
    Form_Submit --> Btn_Submit[Click Submit Quote]
    Btn_Submit --> Action_SubmitQuote[Run submitQuoteAction()]
```

---

## 📈 System Processes & Subsystem Integrations

### 1. Security & RBAC Gate
* **Enforcer**: `requireRole('Supplier')` is executed server-side.
* **Mechanism**: Reads session cookies, decodes the Supabase auth profile, and checks that the user's role equals `Supplier`.

### 2. Supplier Profile Mapping
* **Matching**: Queries the `suppliers` database table by filtering:
  `companyName == profile.fullName` OR `contactPerson == profile.fullName`
* **Fallback**: If no matches are found, it queries the first supplier record ordered by ID as a fallback for testing.

### 3. Open Solicitations & Bids Tracking
* **Fetch Open RFQs**: Queries the `requests_for_quote` table for records where `status == 'Published'`.
* **Quote Status Monitoring**: Gathers all quotations submitted by the supplier and lists them with color-coded status badges:
  - **Submitted**: Bids logged, waiting for canvass opening.
  - **Under Review**: Abstract canvass opened; evaluation is active.
  - **Accepted**: Recommendation approved by administrative approver (successful award).
  - **Rejected**: Bid completed evaluation but did not win.

### 4. Requisition Bidding Engine
* Clicking "Submit Quotation" redirects to `/dashboard/supplier/rfq/${rfq.id}`. Here, the supplier can:
  1. Review line items requested in the solicitation.
  2. Input individual item prices and availability status.
  3. Enter delivery time commitments.
  4. Submit to create a transaction-safe record in `supplier_quotes` and `quote_details`.
