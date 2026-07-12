# Administrative Approver Portal Process Flow

This document details the system workflow and process architecture of the **Administrative Approver Portal** at `/dashboard/approver`.

---

## 🔄 Portal Workflow & System Flow Diagram

The diagram below maps the processes, decisions, and system gates available to an Administrative Approver:

```mermaid
flowchart TD
    %% Portal Entry
    Start([👤 Logged in as User]) --> AuthGate{Edge Guard:<br/>Role Check}
    AuthGate -->|Not Approver| Redirect[Redirect to corresponding portal]
    AuthGate -->|Approver Verified| A_Dashboard[Load Approver Dashboard]

    %% Dashboard Options
    subgraph ApproverModules [Approver Dashboard Options]
        A_Dashboard --> ActionStats[Fetch Statistics Summary]
        A_Dashboard --> ActionRecs[Query Pending Recommendations]
        A_Dashboard --> ActionAudit[Query Recent Audit Trails]
        A_Dashboard --> ActionAddStaff[Mount Add System User Form]
    end

    %% Database queries for Stats & Lists
    ActionStats --> DB_Stats{Prisma Queries}
    DB_Stats -->|Count rows| Data_Canvas[(canvas_abstracts)]
    DB_Stats -->|Count Pending| Data_Recs[(recommendations)]
    DB_Stats -->|Fetch Last 5| Data_Audit[(audit_trails)]

    %% Review and Approval Flow
    ActionRecs --> DisplayRecs[Show Ranked Bids & Justifications]
    DisplayRecs --> Btn_Approve{User clicks Approve?}
    Btn_Approve -->|Yes| Form_Approve[Submit Server Action Form]
    Form_Approve --> Action_Approve[Run approveRecommendation()]
    Action_Approve --> DB_Tx[DB Transaction: Update Recommendation status = 'Approved']
    DB_Tx --> Log_Audit[Asynchronously invoke after(logAuditTrail)]

    %% Add Staff Account Flow
    ActionAddStaff --> Form_Input[User enters: FullName, Username, Email, Password, Role]
    Form_Input --> Btn_Create[Submit Account Form]
    Btn_Create --> Action_CreateStaff[Run createStaffAccount()]
    Action_CreateStaff --> SupabaseAuth[Create Auth User via Supabase Admin Client]
    SupabaseAuth --> SyncProfile[Trigger database sync to user_profiles table]
```

---

## 📈 System Processes & Subsystem Integrations

The Administrative Approver's dashboard workflow is organized into three major processes linked by logical connectors:

### 1. Security & RBAC Gate (Portal Entry)
* **Enforcer**: `requireRole('Administrative Approver')` is executed server-side.
* **Mechanism**: Validates current session cookies, decodes the Supabase JWT token, reads the matched database profile in `user_profiles`, and confirms the `role` enum equals `AdministrativeApprover`. If verification fails, the user is signed out and redirected.

### 2. Process 1: Dashboard Loading & Statistics Queries (Left Diagram)
Upon mounting the Approver Dashboard, the system initiates four parallel components:
* **Fetch Statistics Summary**: Triggers parallel Prisma queries to query and count:
  * **Count canvas_abstracts**: Totals the abstract sheets in the system.
  * **Count pending recommendations**: Computes the number of MCDM evaluations awaiting review.
  * **Fetch last 5 audit_trails**: Retrieves security/audit records.
* **Query Pending Recommendations**: Queries MCDM outputs and routes to **Connector B** for review.
* **Query Recent Audit Trails**: Retrieves the last 5 security events to monitor activities.
* **Mount Add System User Form**: Displays the administrative onboarding interface, routing execution to **Connector C**.

### 3. Process 2: Canvassing Sign-off & Recommendation Approval — Connector B (Middle Diagram)
When managing pending approvals (**Connector B**):
* **Review Stage**: Displays ranked bids, quote amounts, and natural language justifications.
* **Decision Gate**: The user is presented with a choice to approve:
  * **No**: The approval action is cancelled and the dashboard state is preserved.
  * **Yes**: Submits the Server Action form which:
    1. Invokes the `approveRecommendation()` Server Action.
    2. Updates the `approvalStatus` to `Approved` in the database.
    3. Asynchronously triggers `after(logAuditTrail)` to write an `APPROVE_RECOMMENDATION` event to the `audit_trails` table.
    4. Completes the approval, triggering route/cache revalidation to refresh dashboard metrics.

### 4. Process 3: Staff Account Registration Portal — Connector C (Right Diagram)
To onboard new system staff without invalidating the active session (**Connector C**):
* **Data Entry**: The Administrative Approver fills out the form (`fullName`, `username`, `email`, `password`, `role`).
* **Form Submission**: Submits the registration request.
* **Server Action**: Invokes the `createStaffAccount()` Server Action.
* **User Provisioning**: Uses a cookie-free Supabase client (preventing session hijacking/override) to register the user credential with Supabase Auth.
* **Profile Synchronization**: Automatically creates the user profile record in the database `user_profiles` table, completing the onboarding workflow.
