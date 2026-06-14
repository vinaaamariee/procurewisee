# Request for Quotation (RFQ) Creation Process Flow

This document outlines the detailed system and data workflow behind the RFQ Creation Page located at [new/page.tsx](file:///c:/Users/sy/procurewise/src/app/dashboard/officer/rfq/new/page.tsx) and [RfqCreationForm.tsx](file:///c:/Users/sy/procurewise/src/components/officer/RfqCreationForm.tsx).

---

## 🔄 Lifecycle & State Flow Diagram

The lifecycle of an RFQ starting from page initialization to draft/publishing submission is illustrated below:

```mermaid
stateDiagram-v2
    [*] --> PageLoad : Access /dashboard/officer/rfq/new
    
    state PageLoad {
        [*] --> RoleCheck
        RoleCheck --> FetchData : RequireRole('Procurement Officer')
        FetchData --> FormInit : Load AppItems & CatalogProducts
    }

    state FormInit {
        [*] --> GenRfqNo : Format: YYMM-GAS1-[Random]
        GenRfqNo --> CalcDeadline : Today + 7 Calendar Days
        CalcDeadline --> MountFirstRow : Default Item #001
    }

    FormInit --> FormEditing : User Interaction
    
    state FormEditing {
        [*] --> SelectAppItem : Prefills particulars from APP
        [*] --> SelectCatalog : Prefills name, SKU, and unit from Catalog
        [*] --> AddRow : Re-sequence item numbers (001, 002...)
        [*] --> DeleteRow : Remove item & adjust sequencing
    }

    FormEditing --> Validation : Click Save Draft / Publish
    
    state Validation {
        [*] --> FieldPresence : Check RFQ#, Title, ABC, Deadline
        FieldPresence --> BudgetCheck : Verify ABC > 0
        BudgetCheck --> LineItemCheck : Particulars cannot be empty, Qty >= 1
    }

    Validation --> FailState : Validation Errors
    FailState --> FormEditing : Display Alert message to User

    Validation --> ServerAction : Pass Validation
    
    state ServerAction {
        [*] --> DB_Tx : Invoke createRfqAction()
        DB_Tx --> SaveRfq : Insert requests_for_quote
        SaveRfq --> SaveItems : Insert rfq_items (Cascade)
        SaveItems --> AuditLog : Asynchronously invoke after(logAuditTrail)
    }

    ServerAction --> RedirectState : Return Success
    RedirectState --> [*] : Redirect to /dashboard/officer (Revalidate Path)
```

---

## 📋 Comprehensive Phase Details

### 1. Verification & Pre-fetching Phase
* **Access Control**: The edge route first executes `requireRole('Procurement Officer')`. If the active session is not mapped to an officer role, they are redirected to their corresponding home dashboard or unauthorized gate page.
* **Pre-loading Lists**: The page pre-loads active **Annual Procurement Plan (APP)** and **Product Catalog** records, mapping attributes like `papCode`, `generalDescription`, `sku`, `unitOfMeasure`, and `estimatedUnitCost` so they are immediately available to pre-fill rows.

### 2. Auto-Generation & Initial Setup Phase
* **Reference Generator**: Initializes `rfqNumber` using a standard format: `[YY][MM]-GAS1-[3-Digit-Random]` (e.g. `2606-GAS1-482`).
* **Initial Deadline**: Automatically computes a default deadline date set to **7 calendar days** from today.
* **Grid Initialization**: Mounts the requisition form with one empty row containing index `001`, unit `pcs`, and quantity `1`.

### 3. User Input & Linking Logic
* **APP Linking**: Selecting an APP project code dynamically copies the general description of the approved requisition to the row particulars field.
* **Catalog Linking**: Selecting a product from the central catalog pulls the pre-approved standard specifications, SKU, and default units (e.g., *ream*, *box*, *lot*), maintaining name uniformity across procurements.
* **Re-sequencing Grid**: Adding or removing rows invokes a layout helper that recalculates sequence indices (e.g. `001`, `002`, `003`...) dynamically.

### 4. Validation Rules & Constraints
Before hitting the DB, client-side safety checks enforce the following criteria:
* **RFQ Reference**: Must be filled and unique.
* **Approved Budget for Contract (ABC)**: Enforces decimal validation and must be greater than zero.
* **Deadline Date**: Must be selected.
* **Item Properties**: Every row must have non-empty description specs, quantity greater than or equal to 1, and a valid unit.

### 5. Server Action & Auditing Transaction
* **Server Action**: When the officer submits, `createRfqAction` executes within a database transaction block (`prisma.$transaction`).
* **Auditing**: On transaction success, the audit logger intercepts the creation snapshot and asynchronously adds an audit trail record mapping the IP address, user UUID, and state changes to the `audit_trails` table.
* **Revalidation**: Runs `revalidatePath('/dashboard/officer')` before forcing a browser redirect to show the newly created draft/published solicitation.
