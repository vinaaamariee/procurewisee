# ProcureWise System Flowcharts

This document consolidates the system workflows and process architectures of the **ProcureWise Procurement Management System** at Batanes State College. These flowcharts are designed to be thesis-ready, professional, fully connected, and directly representative of the actual system implementation.

---

## 📋 Diagram Verification Standards

Every flowchart in this documentation adheres to the following strict modeling criteria:
* **Start / End**: Represented by a Terminator `([Start])` / `([End])`. Exactly one Start and one End node are present per diagram.
* **Process**: Represented by a Rectangle `[Process]`.
* **Decision**: Represented by a Diamond `{"Decision?"}`. All decisions contain explicit `Yes` and `No` branches (or equivalent logical binaries).
* **Input / Output**: Represented by a Parallelogram `[\Input / Output/]` for data exchange or document generation.
* **Database**: Represented by a Cylinder `[(Database)]` when reading or writing persistent database records.
* **Structure**: Clean, top-to-bottom layout with zero orphan/floating nodes and no crossing connectors.

---

## 1. Overall ProcureWise System Workflow
This master workflow maps the entire procurement lifecycle from initial user entry down to forecasting updates and analytics.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    Access[User Accesses ProcureWise Portal]
    
    %% Decision Chain for Entry Mode
    DecidePublic{"Choose Public Requisition?"}
    DecidePPMP{"Choose PPMP Planning?"}
    DecideOfficer{"Choose Officer Operations?"}
    DecideSupplier{"Choose Supplier Quotation?"}
    
    %% Branch Paths
    PubReq[[\Submit Public Requisition/]]
    PPMPPlan[[\Draft & Submit PPMP/]]
    OffOps[Review Requisitions & Manage RFQs]
    SupQuot[[\Submit Supplier Quotations/]]
    
    %% Requisition/Planning to PR
    GenPR[Generate Purchase Request]
    CreateRFQ[Create RFQ Solicitation]
    PublishRFQ[Publish RFQ to Suppliers]
    
    %% Canvassing and Recommendation
    MCDMEval[Run MCDM Evaluation Engine]
    DecideApprove{"Is Recommendation Approved?"}
    GenPO[Generate Purchase Order]
    Deliver[Supplier Delivery & Inspection]
    Evaluate[Perform Supplier Evaluation]
    RecordPrice[Record Historical Price]
    DB_Price[(historical_prices DB)]
    ARIMAForecast[Run ARIMA Price Forecasting]
    UpdateDash[Update Analytics Dashboard]
    
    Revise[Return to Procurement Officer for Revision]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> Access
    Access --> DecidePublic
    
    DecidePublic -->|Yes| PubReq
    DecidePublic -->|No| DecidePPMP
    
    DecidePPMP -->|Yes| PPMPPlan
    DecidePPMP -->|No| DecideOfficer
    
    DecideOfficer -->|Yes| OffOps
    DecideOfficer -->|No| DecideSupplier
    
    DecideSupplier -->|Yes| SupQuot
    DecideSupplier -->|No| EndNode
    
    PubReq --> GenPR
    PPMPPlan --> GenPR
    GenPR --> CreateRFQ
    
    OffOps --> CreateRFQ
    CreateRFQ --> PublishRFQ
    
    PublishRFQ --> SupQuot
    SupQuot --> MCDMEval
    
    MCDMEval --> DecideApprove
    
    DecideApprove -->|Yes| GenPO
    DecideApprove -->|No| Revise
    
    Revise --> OffOps
    
    GenPO --> Deliver
    Deliver --> Evaluate
    Evaluate --> RecordPrice
    RecordPrice --> DB_Price
    DB_Price --> ARIMAForecast
    ARIMAForecast --> UpdateDash
    UpdateDash --> EndNode
```

---

## 2. Procurement Workflow
This diagram illustrates the unified, continuous procurement pipeline: planning (PPMP), purchase requesting (PR), solicitation (RFQ), bidding, objective scoring (MCDM), purchasing (PO), delivery, evaluation, and pricing audits.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    IdentifyNeed[Identify Procurement Need]
    CreatePPMP[Create Project Procurement Management Plan]
    DecidePPMP{"Is PPMP Approved?"}
    ReturnPPMP[Return PPMP for Revision]
    
    GenPR[[\Generate Purchase Request/]]
    DecidePR{"Is Purchase Request Approved?"}
    ReturnPR[Return PR for Revision]
    
    CreateRFQ[Create Request for Quotation]
    ReceiveQuotes[[\Receive Supplier Quotations/]]
    GenAbstract[Generate Canvas Abstract]
    RunMCDM[Run MCDM Recommendation Engine]
    
    DecideRec{"Is Recommendation Approved?"}
    ReturnOfficer[Return to Procurement Officer for Revision]
    
    GenPO[Generate Purchase Order]
    Delivery[Supplier Delivery & Inspection]
    Receipt[[\Acknowledgement Receipt/]]
    Evaluate[Perform Supplier Evaluation]
    UpdatePrice[Update Historical Price]
    DB_Price[(historical_prices DB)]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> IdentifyNeed
    IdentifyNeed --> CreatePPMP
    CreatePPMP --> DecidePPMP
    
    DecidePPMP -->|Yes| GenPR
    DecidePPMP -->|No| ReturnPPMP
    ReturnPPMP --> CreatePPMP
    
    GenPR --> DecidePR
    DecidePR -->|Yes| CreateRFQ
    DecidePR -->|No| ReturnPR
    ReturnPR --> GenPR
    
    CreateRFQ --> ReceiveQuotes
    ReceiveQuotes --> GenAbstract
    GenAbstract --> RunMCDM
    RunMCDM --> DecideRec
    
    DecideRec -->|Yes| GenPO
    DecideRec -->|No| ReturnOfficer
    ReturnOfficer --> CreateRFQ
    
    GenPO --> Delivery
    Delivery --> Receipt
    Receipt --> Evaluate
    Evaluate --> UpdatePrice
    UpdatePrice --> DB_Price
    DB_Price --> EndNode
```

---

## 3. Intelligent Procurement Analytics Workflow
This diagram isolates the forecasting and analytical components, illustrating how historical price feeds are parsed, validated using MAPE backtesting, and evaluated for purchasing optimization.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    POCompleted[Purchase Order Completed]
    StorePrice[Record Historical Price]
    DB_Price[(historical_prices DB)]
    UpdateDataset[Update Historical Dataset]
    
    DecideData{"Enough Historical Records? >= 6 Months"}
    FallbackPrice[Use Current Estimated Cost from Catalog]
    
    FitARIMA[Fit ARIMA Model]
    RunForecast[Run ARIMA Forecast Pipeline]
    CalcMAPE[Calculate MAPE via Backtesting]
    Confidence[Determine Forecast Confidence Tier]
    Trend[Generate Forecast Trend]
    DecisionEngine[Run Strategic Decision Engine]
    UpdateDash[Update Analytics Dashboard]
    Recommend[Provide Strategic Procurement Recommendation]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> POCompleted
    POCompleted --> StorePrice
    StorePrice --> DB_Price
    DB_Price --> UpdateDataset
    UpdateDataset --> DecideData
    
    DecideData -->|Yes| FitARIMA
    DecideData -->|No| FallbackPrice
    
    FitARIMA --> RunForecast
    RunForecast --> CalcMAPE
    CalcMAPE --> Confidence
    Confidence --> Trend
    Trend --> DecisionEngine
    DecisionEngine --> UpdateDash
    UpdateDash --> Recommend
    Recommend --> EndNode
    
    FallbackPrice --> UpdateDash
```

---

## 4. Public User Workflow
This workflow displays the application paths accessible to public, unauthenticated end-users on the platform.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    OpenWeb[Open Website]
    BrowseCatalog[[\Browse Procurement Catalog/]]
    
    DecidePPMP{"Choose Action: Create PPMP?"}
    DecidePR{"Choose Action: Submit Purchase Request?"}
    DecideTrack{"Choose Action: Track Request?"}
    
    %% PPMP Branch
    SelectDeptPPMP[Select Department]
    AddProdPPMP[Add Products from Catalog]
    SubmitPPMP[[\Submit PPMP/]]
    
    %% PR Branch
    FillPR[Fill Request Information]
    AddProdPR[Add Products from Catalog]
    SubmitPR[[\Submit Requisition/]]
    ReceiveCode[[\Receive Tracking Code/]]
    
    %% Track Branch
    EnterCode[[\Enter Tracking Code/]]
    QueryDB[Retrieve Request Status]
    DB_Requisitions[(requisitions DB)]
    ShowTimeline[[\Display Timeline/]]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> OpenWeb
    OpenWeb --> BrowseCatalog
    BrowseCatalog --> DecidePPMP
    
    DecidePPMP -->|Yes| SelectDeptPPMP
    DecidePPMP -->|No| DecidePR
    
    SelectDeptPPMP --> AddProdPPMP
    AddProdPPMP --> SubmitPPMP
    SubmitPPMP --> EndNode
    
    DecidePR -->|Yes| FillPR
    DecidePR -->|No| DecideTrack
    
    FillPR --> AddProdPR
    AddProdPR --> SubmitPR
    SubmitPR --> ReceiveCode
    ReceiveCode --> EndNode
    
    DecideTrack -->|Yes| EnterCode
    DecideTrack -->|No| EndNode
    
    EnterCode --> QueryDB
    QueryDB --> DB_Requisitions
    DB_Requisitions --> ShowTimeline
    ShowTimeline --> EndNode
```

---

## 5. User Access Workflow
This flowchart maps the user roles authenticated by the security gateway, outlining the actions and dashboards each role can access.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    Access[Access ProcureWise Portal]
    DecideAuth{"Is User Authenticated?"}
    
    %% Public User Branch
    PublicPortal[Redirect to Public Portal]
    PublicActions[[\Browse Catalog, Submit PPMP/PR, & Track/]]
    
    %% Authenticated Branch
    GetRole[Retrieve User Profile & Role]
    DB_Profiles[(user_profiles DB)]
    
    DecideAdmin{"Is Role: Administrator?"}
    DecideOfficer{"Is Role: Procurement Officer?"}
    DecideApprover{"Is Role: Administrative Approver?"}
    DecideSupplier{"Is Role: Supplier?"}
    DecideEndUser{"Is Role: End User?"}
    
    AdminDash[Load Administrator Dashboard]
    AdminActions[Manage Users, Catalog, Budgets, & System Settings]
    
    OfficerDash[Load Officer Dashboard]
    OfficerActions[Review Requisitions, Manage PPMP, Create RFQs, Generate POs, & Manage Suppliers]
    
    ApproverDash[Load Approver Dashboard]
    ApproverActions[Approve PPMP, Approve PR, & Review/Approve Recommendations]
    
    SupplierDash[Load Supplier Portal]
    SupplierActions[View RFQs, Submit Quotations, & Track Purchase Orders]
    
    EndUserDash[Load End User Dashboard]
    EndUserActions[Manage PPMP, View Requests, & Evaluate Suppliers]
    
    AccessDenied[Access Denied / Redirect to Login]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> Access
    Access --> DecideAuth
    
    DecideAuth -->|No| PublicPortal
    DecideAuth -->|Yes| GetRole
    
    PublicPortal --> PublicActions
    PublicActions --> EndNode
    
    GetRole --> DB_Profiles
    DB_Profiles --> DecideAdmin
    
    DecideAdmin -->|Yes| AdminDash
    DecideAdmin -->|No| DecideOfficer
    
    AdminDash --> AdminActions
    AdminActions --> EndNode
    
    DecideOfficer -->|Yes| OfficerDash
    DecideOfficer -->|No| DecideApprover
    
    OfficerDash --> OfficerActions
    OfficerActions --> EndNode
    
    DecideApprover -->|Yes| ApproverDash
    DecideApprover -->|No| DecideSupplier
    
    ApproverDash --> ApproverActions
    ApproverActions --> EndNode
    
    DecideSupplier -->|Yes| SupplierDash
    DecideSupplier -->|No| DecideEndUser
    
    SupplierDash --> SupplierActions
    SupplierActions --> EndNode
    
    DecideEndUser -->|Yes| EndUserDash
    DecideEndUser -->|No| AccessDenied
    
    EndUserDash --> EndUserActions
    EndUserActions --> EndNode
    
    AccessDenied --> EndNode
```
