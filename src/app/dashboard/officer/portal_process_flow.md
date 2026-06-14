# Procurement Officer Portal Process Flow

This document details the system workflow and process architecture of the **Procurement Officer Portal** at `/dashboard/officer`.

---

## 🔄 Portal Workflow & System Flow Diagram

The diagram below maps the processes, decisions, and system gates available to a Procurement Officer within the portal:

```mermaid
flowchart TD
    %% Portal Entry
    Start([👤 Logged in as User]) --> AuthGate{Edge Guard:<br/>Role Check}
    AuthGate -->|Not Officer| Redirect[Redirect to corresponding portal]
    AuthGate -->|Officer Verified| P_Dashboard[Load Officer Dashboard]

    %% Dashboard Processes
    subgraph DashboardModules [Officer Dashboard Options]
        P_Dashboard --> ActionStats[Fetch Statistics Summary]
        P_Dashboard --> ActionRecent[Query Last 5 RFQ Records]
        P_Dashboard --> ActionQuick[Expose Quick Actions Menu]
    end

    %% Database queries for Stats
    ActionStats --> DB_Stats{Prisma Queries}
    DB_Stats -->|Count rows| Data_Rfqs[(requests_for_quote)]
    DB_Stats -->|Count rows| Data_Supps[(suppliers)]
    DB_Stats -->|Count rows| Data_App[(app_items)]

    %% Quick Actions navigation
    ActionQuick --> Action_NewRFQ{Action Selected?}
    
    Action_NewRFQ -->|Create RFQ| Route_NewRFQ[/dashboard/officer/rfq/new]
    Action_NewRFQ -->|View Suppliers| Route_Suppliers[/dashboard/supplier-profiles]
    Action_NewRFQ -->|Catalog Admin| Route_Catalog[/dashboard/catalog]
    Action_NewRFQ -->|Price Canvassing| Route_Comparison[/price-comparison]
    Action_NewRFQ -->|Review Specific RFQ| Route_RFQDetails[/dashboard/officer/rfq/:id]

    %% RFQ Detailed Flow
    Route_RFQDetails --> ProcessRFQ{RFQ Status?}
    ProcessRFQ -->|Draft| RFQ_Publish[Publish Solicitation]
    ProcessRFQ -->|Published| RFQ_SubmitBids[Receive Supplier Bids]
    ProcessRFQ -->|Closed| RFQ_MCDM[Run MCDM Evaluation Engine]
    ProcessRFQ -->|Evaluated| RFQ_WaitApproval[Awaiting Approver Sign-off]
```

---

## 📈 System Processes & Subsystem Integrations

### 1. Security & RBAC Gate
* **Enforcer**: `requireRole('Procurement Officer')` is executed server-side.
* **Mechanism**: Verifies active cookies, decodes the Supabase JWT session, reads the matched database profile in the `user_profiles` table, and verifies that the `role` enum equals `ProcurementOfficer`.

### 2. Metrics & Dashboard Summary
* Runs parallel queries (`Promise.all`) via the Prisma client:
  1. Queries all `requests_for_quote` status tags to calculate the total and active (Published) count.
  2. Counts registered records in `suppliers`.
  3. Counts active items in `app_items`.
* Displays results in glassmorphic cards styled with theme accents.

### 3. Solicitations & Bidding Administration
The main table displays the last 5 solicitations. Selecting a solicitation initiates detailed workflows based on status:
* **Draft**: The officer can review specifications and update status to `Published`.
* **Published**: Solicitations are open to suppliers. Bids can be uploaded manually or via Excel parse processes.
* **Closed**: The solicitation is locked. The officer can trigger the **MCDM best-value engine** to calculate candidate ranks and forward them to the Approver.
* **Evaluated/Awarded**: Displays composite ranking outputs and approver review decisions.

### 4. Auxiliary Portals & Integrations
* **Supplier Profiles Directory (`/dashboard/supplier-profiles`)**: Allows auditing active vendors, verifying reliability, and toggling business verification flags.
* **Product Catalog (`/dashboard/catalog`)**: Allows catalog updates to ensure standardized specs are used in solicitations.
* **Price Comparison (`/price-comparison`)**: Cross-compares catalog pricing ranges and saves market survey data.
