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

### 1. Security & RBAC Gate
* **Enforcer**: `requireRole('Administrative Approver')` is executed server-side.
* **Mechanism**: Validates current session cookies, decodes the Supabase JWT token, reads the matched database profile in `user_profiles`, and confirms the `role` enum equals `AdministrativeApprover`.

### 2. Canvassing Sign-off & Recommendation Approval
* **Review Stage**: Displays the candidate lists evaluated by the MCDM best-value engine (composite score, total quote amount, and natural language justification).
* **Approval execution**: When the Approver authorizes a vendor's recommendation:
  1. Calls the `approveRecommendation` Server Action.
  2. Updates `approvalStatus` to `Approved` in the database.
  3. Records the approver's user ID as `reviewedById`.
  4. Triggers the audit tracker asynchronously using Next.js 16's `after()` scheduler to record the action (`APPROVE_RECOMMENDATION`) in `audit_trails`.
  5. Clears page caches via `revalidatePath('/dashboard/approver')` to immediately update metrics.

### 3. Asynchronous Security Audit logs
* Queries the `audit_trails` database table to display the last 5 security events (actionType, timestamp) to monitor configuration adjustments, bids, or RFQ publishes.

### 4. Admin Staff Registration Portal (`add-staff-form`)
* **Objective**: Allows an Administrative Approver to create new staff accounts (e.g. Procurement Officers and other Approvers) without invalidating the active session.
* **Action**: Invokes `createStaffAccount` Server Action which uses a service-role Supabase client (cookie-free) to register the user in Supabase Auth and save profile records to `user_profiles`.

#### Authentication & Authorization Mechanism
During this process:
1. **Authentication**: The system validates session cookies via the server-side Supabase client. It decodes and verifies the Supabase JWT token against the GoTrue authentication service using `supabase.auth.getUser()`. If the session is invalid or expired, the user is redirected to the login/landing portal.
2. **Authorization**: Once the user identity is validated, the system performs a database lookup on the `user_profiles` table matching the authenticated user's ID (`user.id`). It verifies the account's active status (`profile.isActive === true`) and executes the `requireRole('Administrative Approver')` gate server-side to ensure their `role` matches the expected role. If unauthorized, they are signed out and redirected accordingly.
