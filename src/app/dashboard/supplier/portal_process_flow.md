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
    Link_SubmitBid --> Route_BidPage["/dashboard/supplier/rfq/:id"]
    
    %% Bid Submission Action
    Route_BidPage --> Form_Submit[Enter Unit Prices & Delivery Days]
    Form_Submit --> Btn_Submit[Click Submit Quote]
    Btn_Submit --> Action_SubmitQuote[Run submitQuoteAction()]
```

---

## 📈 System Processes & Subsystem Integrations

The Supplier's dashboard workflow is organized into two major processes linked by a logical connector:

### 1. Security & RBAC Gate (Portal Entry)
* **Enforcer**: `requireRole('Supplier')` is executed server-side.
* **Mechanism**: Reads session cookies, decodes the Supabase auth profile, and checks that the user's role equals `Supplier`.
* **Profile Resolution**: Queries the `suppliers` database table by filtering:
  `companyName == profile.fullName` OR `contactPerson == profile.fullName`. If no matches are found, it queries the first supplier record as a fallback for development.

### 2. Process 1: Dashboard Loading & Data Queries (Left Diagram)
Upon mounting the Supplier Dashboard, the system initiates three parallel branches of queries:
* **Branch 1: Fetch Statistics Summary**:
  * Runs concurrent Prisma queries to count/query:
    * **Query Published RFQs**: Checks for active RFQs in the system.
    * **Query Supplier Quotes**: Checks for quotes submitted by this specific supplier.
* **Branch 2: Query Open Solicitations**:
  * Fetches solicitations in a `Published` state.
  * **Show RFQ Card**: Renders the RFQ list with details (deadlines, budgets).
  * **Click Submit Quotation**: Directs the user to the bid form, routing execution to **Connector A**.
* **Branch 3: Query My Submitted Bids**:
  * Retrieves historical and active bid entries to monitor their status (e.g., Submitted, Under Review, Accepted, Rejected).

### 3. Process 2: Quotation Submission Workflow — Connector A (Right Diagram)
Continuing from the dashboard's solicitation selection (**Connector A**):
* **Routing**: Directs the supplier to the dedicated RFQ form at `/dashboard/supplier/rfq/:id`.
* **Data Entry**: The supplier enters their offered unit prices, stock availability, and delivery days.
* **Submission**: The user clicks the **Submit Quote** button.
* **Server Action Execution**: Triggers the `submitQuoteAction()` Server Action which writes transaction-safe records to the `supplier_quotes` and `quote_details` tables in the database.
* **Completion**: Once finished, the process ends and the user is redirected back to the dashboard.
