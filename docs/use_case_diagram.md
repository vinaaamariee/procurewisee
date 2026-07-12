# ProcureWise UML Use Case Diagram & Actor Specifications

> [!NOTE]
> This document details the UML Use Case Diagram, actor specifications, and use case definitions for the **ProcureWise Procurement Management System** at Batanes State College. It maps the system boundaries and interactions based directly on the actual implemented state of the codebase.

---

## 1. Introduction

The UML Use Case Diagram presents the functional requirements of the ProcureWise Procurement Management System from the users' perspective. It identifies the system actors, their interactions with the system, and the major services provided by the application. The diagram serves as a high-level representation of the system's functional behavior without describing internal implementation details.

---

## 2. System Actors & Use Cases

This section lists the system actors defined in ProcureWise and details the specific use cases each actor performs.

### 👤 Public User
* **Description**: Browse the procurement catalog, submit purchase requisitions, and track requisition status using the tracking code.
* **Use Cases**:
  * **UC-01: Browse Catalog**: Browse available procurement items, categories, brands, and units of measure.
  * **UC-02: Submit Purchase Requisition**: Submit initial purchase requisitions outlining needed quantities, specifications, and estimated costs.
  * **UC-03: Track Requisition Status**: Input a cryptographically secure tracking UUID to monitor the approval progress of their submitted requisitions.

### 👤 End User (Department Personnel)
* **Description**: Prepare PPMPs, monitor procurement requests, and submit supplier evaluations.
* **Use Cases**:
  * **UC-04: Prepare PPMP Draft**: Draft the Project Procurement Management Plan (PPMP) for the department, specifying quantities linked to standard catalog items.
  * **UC-05: View PPMP and Purchase Request Status**: Monitor the status of department PPMPs and Purchase Requests from their dashboard.
  * **UC-06: Submit Supplier Evaluation**: Rate supplier performance post-delivery on a 7-criteria scorecard to update supplier metrics.

### 💼 Procurement Officer (Staff)
* **Description**: Manage the procurement catalog, review purchase requests, prepare RFQs, record supplier quotations, generate best-value recommendations, generate purchase orders, and view procurement analytics.
* **Use Cases**:
  * **UC-07: Manage Product Catalog**: Curate, add, update, and delete supply products, categories, brands, and units of measure in the central database.
  * **UC-08: Review Purchase Requests**: Inspect incoming department requisitions, adjust specifications or UOMs, edit budget spent allocations, check budget limits, and forward approved requests to the bidding pipeline.
  * **UC-09: Prepare & Publish RFQs**: Set deadlines and publish Requests for Quotation (RFQs) featuring sequential reference numbering.
  * **UC-10: Record Supplier Quotations**: Encode quotes or upload and parse Excel quote spreadsheets submitted offline by suppliers.
  * **UC-11: Prepare Abstract of Quotations (Canvass Abstract)**: Consolidate active bids, pricing tiers, and delivery parameters into a canvas board.
  * **UC-12: Generate Best-Value Recommendation**: Run the Multi-Criteria Decision-Making (MCDM) scoring engine to generate ranked recommendations and compliance justifications.
  * **UC-13: Generate & Print Purchase Orders**: Draft standard government Purchase Orders (Appendix 61) with custom clauses and record conforme statuses.
  * **UC-14: View Procurement Analytics**: Analyze spending trends, budget utilization, radar profile spider charts, and ARIMA forecast alerts.

### ⚖️ Administrative Approver (Staff)
* **Description**: Approve PPMPs, approve Purchase Requests, approve Best-Value Recommendations, and review procurement reports.
* **Use Cases**:
  * **UC-15: Approve PPMPs**: Review, approve, or return department-level PPMPs for revision.
  * **UC-16: Approve Purchase Requests**: Authorize purchase requisitions, moving them forward to RFQ status.
  * **UC-17: Approve Best-Value Recommendations**: Sign off on MCDM-generated abstracts, officially awarding procurement contracts.
  * **UC-18: Review Procurement Reports**: View executive analytics and download CSV data exports.

### ⚙️ Administrator (IT Admin)
* **Description**: Manage user accounts, manage departments, manage system configuration, and view system reports.
* **Use Cases**:
  * **UC-19: Manage User Accounts**: Register staff, activate or deactivate user accounts, and monitor user roles.
  * **UC-20: Manage Departments**: Create, update, and manage departmental profiles and units.
  * **UC-21: Manage System Configuration**: Configure system-wide parameters, workflow routes, and form templates.
  * **UC-22: View System Reports**: View system reports, user activities, and administrative logs.

### 🏢 Supplier (External / Secondary Actor)
* **Description**: Provide supplier quotations through the procurement process (encoded into the system by the Procurement Officer) and acknowledge approved Purchase Orders and deliveries.
* **Use Cases**:
  * **UC-09: Respond to Published RFQs** *(Secondary)*: Submit quotations for published Requests for Quotation.
  * **UC-10: Record Supplier Quotations** *(Secondary)*: Submit quotations to be input into the system.
  * **UC-13: Receive Purchase Orders** *(Secondary)*: Receive approved Purchase Orders, acknowledge them through conforme, and deliver awarded items.

---

## 3. Use Case Description Table

The following table provides detailed descriptions of all system use cases, identifying their primary actors.

| Use Case ID | Use Case Name | Primary Actor | Description |
| :--- | :--- | :--- | :--- |
| **UC-01** | Browse Catalog | Public User | Allows users to browse available procurement items, categories, and prices. |
| **UC-02** | Submit Purchase Requisition | Public User | Allows users to submit procurement requisitions outlining needed quantities and specs. |
| **UC-03** | Track Requisition Status | Public User | Allows users to track the status of requisitions using a secure tracking code. |
| **UC-04** | Prepare PPMP Draft | End User | Allows department representatives to prepare annual procurement plans (PPMP). |
| **UC-05** | View PPMP and PR Status | End User | Allows department representatives to view the status of their PPMPs and PRs. |
| **UC-06** | Submit Supplier Evaluation | End User | Allows department personnel to rate supplier performance post-delivery. |
| **UC-07** | Manage Product Catalog | Procurement Officer | Allows the officer to manage items, categories, and units in the catalog. |
| **UC-08** | Review Purchase Requests | Procurement Officer | Allows the officer to review, process, and adjust incoming purchase requests. |
| **UC-09** | Prepare & Publish RFQs | Procurement Officer | Allows the officer to create and publish RFQs for supplier bidding. |
| **UC-10** | Record Supplier Quotations | Procurement Officer | Allows the officer to encode quotations and parse uploaded Excel bid sheets. |
| **UC-11** | Prepare Abstract of Quotations (Canvass Abstract) | Procurement Officer | Allows the officer to generate canvas sheets comparing bids. |
| **UC-12** | Generate Best-Value Recommendation | Procurement Officer | Allows the officer to run the MCDM engine and generate recommended awards. |
| **UC-13** | Generate & Print Purchase Orders | Procurement Officer | Allows the officer to draft, manage conforme for, and print Purchase Orders. |
| **UC-14** | View Procurement Analytics | Procurement Officer | Allows the officer to view spending, budget utilization, and price forecasts. |
| **UC-15** | Approve PPMPs | Administrative Approver | Allows the approver to review and approve departmental PPMPs. |
| **UC-16** | Approve Purchase Requests | Administrative Approver | Allows the approver to review and approve purchase requests (PRs). |
| **UC-17** | Approve Recommendations | Administrative Approver | Allows the approver to sign off on recommended supplier awards. |
| **UC-18** | Review Procurement Reports | Administrative Approver | Allows the approver to view system reports and export CSV data dumps. |
| **UC-19** | Manage User Accounts | Administrator | Allows the IT admin to create, edit, and toggle activation of user accounts. |
| **UC-20** | Manage Departments | Administrator | Allows the IT admin to configure departments and academic units. |
| **UC-21** | Manage System Configuration | Administrator | Allows the IT admin to configure system settings, workflow pathways, and templates. |
| **UC-22** | View System Reports | Administrator | Allows the IT admin to view system reports, user activities, and administrative logs. |

---

## 4. Traceability Matrix

The following matrix maps the defined ProcureWise system Use Cases to their corresponding user roles, system modules, flowcharts, and Data Flow Diagram (DFD) processes.

| Use Case ID | Use Case Name | Primary Actor(s) | Secondary Actor(s) | System Module | Mapped System Flowchart (`docs/system_flowcharts.md`) | Mapped DFD Process (`docs/data_flow_diagrams.md`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Browse Catalog | Public User | — | Catalog Module | Section 4: Public User Workflow | DFD 1.0 |
| **UC-02** | Submit Purchase Requisition | Public User | — | Requisitions Module | Section 4: Public User Workflow | DFD 2.0 |
| **UC-03** | Track Requisition Status | Public User | — | Requisitions Module | Section 4: Public User Workflow | DFD 2.0 |
| **UC-04** | Prepare PPMP Draft | End User | — | Planning Module | Section 4: Public User Workflow | DFD 1.0 |
| **UC-05** | View PPMP and PR Status | End User | — | Requisitions Module | Section 5: User Access Workflow | DFD 2.0 |
| **UC-06** | Submit Supplier Evaluation | End User | — | Evaluation Module | Section 2: Procurement Workflow | DFD 5.0 |
| **UC-07** | Manage Product Catalog | Procurement Officer | — | Catalog Module | Section 5: User Access Workflow | DFD 1.0 |
| **UC-08** | Review Purchase Requests | Procurement Officer | — | Requisitions Module | Section 2: Procurement Workflow | DFD 2.0 |
| **UC-09** | Prepare & Publish RFQs | Procurement Officer | Supplier | RFQ Module | Section 2: Procurement Workflow | DFD 3.0 |
| **UC-10** | Record Supplier Quotations | Procurement Officer | Supplier | Bidding Module | Section 2: Procurement Workflow | DFD 3.0 |
| **UC-11** | Prepare Abstract of Quotations (Canvass Abstract) | Procurement Officer | — | Canvassing Module | Section 2: Procurement Workflow | DFD 4.0 |
| **UC-12** | Generate Best-Value Recommendation | Procurement Officer | — | Decision Engine | Section 2: Procurement Workflow | DFD 4.0 |
| **UC-13** | Generate & Print Purchase Orders | Procurement Officer | Supplier | Purchase Order Module | Section 2: Procurement Workflow | DFD 5.0 |
| **UC-14** | View Procurement Analytics | Procurement Officer | — | Analytics Module | Section 3: Intelligent Analytics | DFD 6.0 |
| **UC-15** | Approve PPMPs | Administrative Approver | — | Planning Module | Section 2: Procurement Workflow | DFD 1.0 |
| **UC-16** | Approve Purchase Requests | Administrative Approver | — | Requisitions Module | Section 2: Procurement Workflow | DFD 2.0 |
| **UC-17** | Approve Recommendations| Administrative Approver | — | Decision Engine | Section 2: Procurement Workflow | DFD 4.0 |
| **UC-18** | Review Procurement Reports | Administrative Approver | — | Reports Module | Section 5: User Access Workflow | DFD 6.0 |
| **UC-19** | Manage User Accounts | Administrator | — | Admin Module | Section 5: User Access Workflow | DFD 2.0 |
| **UC-20** | Manage Departments | Administrator | — | Catalog Module | Section 5: User Access Workflow | DFD 1.0 |
| **UC-21** | Manage System Configuration | Administrator | — | Admin Module | Section 5: User Access Workflow | DFD 1.0 |
| **UC-22** | View System Reports | Administrator | — | Admin Module | Section 5: User Access Workflow | DFD 2.0 |

---

## 5. Academic Thesis Guidelines

> [!TIP]
> **Thesis Manuscript Recommendation**: The official Use Case Diagram included in the thesis should be created using standard UML notation in a professional diagramming tool such as Draw.io, Visual Paradigm, or StarUML. This ensures compliance with academic UML standards:
>
> 1. Use standard stick figure icons for the five primary actors and secondary external actor. Use oval shapes for all use cases following standard UML Use Case Diagram notation.
> 2. Model the system boundary as a clean rectangle housing all the ovals representing use cases.
> 3. Connect primary actors using standard solid lines (association relationships).
> 4. Represent secondary external actors on the right side of the system boundary.
