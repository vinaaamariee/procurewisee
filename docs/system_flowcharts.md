# ProcureWise System Flowcharts

> [!NOTE]
> This document presents the logical workflows of the ProcureWise Procurement Management System. Certain implementation details such as middleware execution, validation routines, API layers, and database transactions have been abstracted for clarity while preserving the actual business workflow.

This document consolidates the system workflows and process architectures of the **ProcureWise Procurement Management System** at Batanes State College. These flowcharts are designed to be thesis-ready, professional, fully connected, and directly representative of the actual system implementation.

---

## 📋 Diagram Verification Standards

Every flowchart in this documentation adheres to the following strict modeling criteria:
* **Start / End**: Represented by a Terminator `([Start])` / `([End])`. Exactly one Start and one End node are present per diagram.
* **Process**: Represented by a Rectangle `[Process]`.
* **Decision**: Represented by a Diamond `{"Decision?"}`. All decisions contain explicit `Yes` and `No` (or equivalent logical selection) branches.
* **Input / Output**: Represented by a Parallelogram `[\Input / Output/]` for data exchange or document generation.
* **Database**: Represented by a Cylinder `[(Database)]` when reading or writing persistent database records.
* **Structure**: Clean, top-to-bottom layout with zero orphan/floating nodes and no crossing connectors.

---

## 1. Overall ProcureWise System Workflow
This master workflow maps the high-level stages of the complete procurement lifecycle, branching into planned or public requisition paths before compiling purchase requests, solicitude RFQs, recommendations, delivery, and time-series forecasting.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    IdentifyNeed[Identify Procurement Need]
    DecideRoute{"Planned Procurement (PPMP)?"}
    PPMP[PPMP Planning]
    Requisition[Public Requisition]
    PurchaseRequest[Purchase Request]
    RFQ[Request for Quotation - RFQ]
    SupQuotes[[\Supplier Quotations/]]
    BestValueRecommend[Best-Value Recommendation]
    GenPO[Generate Purchase Order]
    Deliver[Supplier Delivery & Inspection]
    Evaluate[Supplier Evaluation]
    PriceUpdate[Historical Price Update]
    AnalyticsForecast[Analytics & Forecasting]
    EndNode([End])

    %% Connections
    StartNode --> IdentifyNeed
    IdentifyNeed --> DecideRoute
    DecideRoute -->|Yes| PPMP
    DecideRoute -->|No| Requisition
    PPMP --> PurchaseRequest
    Requisition --> PurchaseRequest
    PurchaseRequest --> RFQ
    RFQ --> SupQuotes
    SupQuotes --> BestValueRecommend
    BestValueRecommend --> GenPO
    GenPO --> Deliver
    Deliver --> Evaluate
    Evaluate --> PriceUpdate
    PriceUpdate --> AnalyticsForecast
    AnalyticsForecast --> EndNode
```

---

## 2. Procurement Workflow
This diagram illustrates the detailed operational procurement pipeline, incorporating the planning, approval, canvassing, scoring, and performance evaluation stages.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    IdentifyNeed[Identify Procurement Need]
    CreatePPMP[Create PPMP]
    DecidePPMP{"PPMP Approved?"}
    ReturnPPMP[Return PPMP for Revision]
    
    CreatePR[Create Purchase Request]
    DecidePR{"Purchase Request Approved?"}
    ReturnPR[Return PR for Revision]
    
    CreateRFQ[Create RFQ]
    ReceiveQuotes[[\Receive Supplier Quotations/]]
    GenAbstract[Generate Canvas Abstract]
    RunMCDM[Run MCDM Recommendation Engine]
    
    DecideRec{"Recommendation Approved?"}
    ReturnOfficer[Return to Procurement Officer for Revision]
    
    GenPO[Generate Purchase Order]
    Delivery[Supplier Delivery]
    Receipt[[\Acknowledgement Receipt/]]
    Evaluate[Supplier Evaluation]
    UpdateRating[Update Supplier Rating]
    UpdatePrice[Historical Price Update]
    DB_Price[(Historical Prices Database)]
    ForecastRefresh[Analytics & Forecast Refresh]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> IdentifyNeed
    IdentifyNeed --> CreatePPMP
    CreatePPMP --> DecidePPMP
    
    DecidePPMP -->|Yes| CreatePR
    DecidePPMP -->|No| ReturnPPMP
    ReturnPPMP --> CreatePPMP
    
    CreatePR --> DecidePR
    DecidePR -->|Yes| CreateRFQ
    DecidePR -->|No| ReturnPR
    ReturnPR --> CreatePR
    
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
    Evaluate --> UpdateRating
    UpdateRating --> UpdatePrice
    UpdatePrice --> DB_Price
    DB_Price --> ForecastRefresh
    ForecastRefresh --> EndNode
```

---

## 3. Intelligent Procurement Analytics Workflow
This diagram illustrates the time-series pricing analysis and decision support system workflow, verifying the minimum historical dataset before executing the ARIMA forecasting model.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    POCompleted[Purchase Order Completed]
    RecordPrice[Record Historical Price]
    DB_Price[(Historical Prices Database)]
    
    DecideData{"Minimum Historical Data Available?"}
    EstimatedCost[Use Estimated Catalog Cost]
    
    RunARIMA[Run ARIMA]
    GenForecast[Generate Forecast]
    Trend[Generate Trend]
    CalcMAPE[Calculate MAPE]
    Confidence[Determine Confidence Tier]
    DecisionEngine[Strategic Decision Engine]
    UpdateDash[Update Analytics Dashboard]
    Recommend[Generate Procurement Recommendation]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> POCompleted
    POCompleted --> RecordPrice
    RecordPrice --> DB_Price
    DB_Price --> DecideData
    
    DecideData -->|Yes| RunARIMA
    DecideData -->|No| EstimatedCost
    
    RunARIMA --> GenForecast
    GenForecast --> Trend
    Trend --> CalcMAPE
    CalcMAPE --> Confidence
    Confidence --> DecisionEngine
    DecisionEngine --> UpdateDash
    UpdateDash --> Recommend
    Recommend --> EndNode
    
    EstimatedCost --> UpdateDashNo[Update Analytics Dashboard]
    UpdateDashNo --> EndNode
```

---

## 4. Public User Workflow
This flowchart outlines the transaction routes available to public, unauthenticated platform visitors: catalog browsing, drafting plans, requisitions, and checking tracking status.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    OpenWeb[Open Website]
    BrowseCatalog[[\Browse Procurement Catalog/]]
    DecideTx{"Select Transaction"}
    
    %% PPMP Branch
    DeptSelect[Department Selection]
    AddProdPPMP[Add Products]
    SubmitPPMP[[\Submit PPMP/]]
    
    %% PR Branch
    FillReqInfo[Fill Request Information]
    AddProdPR[Add Products]
    SubmitReq[[\Submit Requisition/]]
    ReceiveTrackCode[[\Receive Tracking Code/]]
    
    %% Track Branch
    EnterTrackCode[[\Enter Tracking Code/]]
    RetrieveReq[Retrieve Request]
    DB_Requisitions[(Requisitions Database)]
    DisplayTracking[[\Display Requisition Tracking Page/]]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> OpenWeb
    OpenWeb --> BrowseCatalog
    BrowseCatalog --> DecideTx
    
    DecideTx -->|Create PPMP| DeptSelect
    DecideTx -->|Submit Purchase Request| FillReqInfo
    DecideTx -->|Track Request| EnterTrackCode
    
    DeptSelect --> AddProdPPMP
    AddProdPPMP --> SubmitPPMP
    SubmitPPMP --> EndNode
    
    FillReqInfo --> AddProdPR
    AddProdPR --> SubmitReq
    SubmitReq --> ReceiveTrackCode
    ReceiveTrackCode --> EndNode
    
    EnterTrackCode --> RetrieveReq
    RetrieveReq --> DB_Requisitions
    DB_Requisitions --> DisplayTracking
    DisplayTracking --> EndNode
```

---

## 5. User Access Workflow
This flowchart details user dashboard routing based on role credentials resolved by the secure database profile gate.

```mermaid
flowchart TD
    %% Node Definitions
    StartNode([Start])
    AccessPortal[Access ProcureWise Portal]
    DecideAuth{"Is User Authenticated?"}
    
    %% Unauthenticated Path
    RedirectLogin[Redirect to Login / Public Portal]
    PublicActions[[\Public Actions/]]
    
    %% Authenticated Path
    RetrieveProfile[Retrieve User Profile]
    DB_Profiles[(User Profiles Database)]
    DetermineRole[Determine User Role]
    
    %% Admin Branch
    AdminDash[Administrator Dashboard]
    AdminActions[Administrator Actions]
    
    %% Officer Branch
    OfficerDash[Officer Dashboard]
    OfficerActions[Officer Actions]
    
    %% Approver Branch
    ApproverDash[Approver Dashboard]
    ApproverActions[Approver Actions]
    
    %% Supplier Branch
    SupplierDash[Supplier Dashboard]
    SupplierActions[Supplier Actions]
    
    %% End User Branch
    EndUserDash[Load End User Dashboard]
    EndUserActions[End User Actions]
    
    EndNode([End])

    %% Flow Connections
    StartNode --> AccessPortal
    AccessPortal --> DecideAuth
    
    DecideAuth -->|No| RedirectLogin
    DecideAuth -->|Yes| RetrieveProfile
    
    RedirectLogin --> PublicActions
    PublicActions --> EndNode
    
    RetrieveProfile --> DB_Profiles
    DB_Profiles --> DetermineRole
    
    DetermineRole -->|Administrator| AdminDash
    DetermineRole -->|Procurement Officer| OfficerDash
    DetermineRole -->|Administrative Approver| ApproverDash
    DetermineRole -->|Supplier| SupplierDash
    DetermineRole -->|End User| EndUserDash
    
    AdminDash --> AdminActions
    AdminActions --> EndNode
    
    OfficerDash --> OfficerActions
    OfficerActions --> EndNode
    
    ApproverDash --> ApproverActions
    ApproverActions --> EndNode
    
    SupplierDash --> SupplierActions
    SupplierActions --> EndNode
    
    EndUserDash --> EndUserActions
    EndUserActions --> EndNode
```
