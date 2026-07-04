# Sprint 3

## Module

Project Procurement Management Plan (PPMP)

---

# Objective

Develop a complete PPMP module that allows end-users to prepare, save, submit, and monitor their annual procurement plans.

The PPMP must integrate directly with the Procurement Marketplace.

Products should come from the Procurement Marketplace instead of manual encoding.

---

# Business Context

Current Process

Employee

↓

Searches products manually

↓

Encodes PPMP

↓

Submits to Procurement

ProcureWise Process

Browse Procurement Marketplace

↓

Select Product

↓

Add to PPMP

↓

Complete PPMP

↓

Budget Validation

↓

Submit

↓

Procurement Review

↓

Approval

↓

Generate Purchase Request

---

# Route

/ppmp

/ppmp/create

/ppmp/[id]

/ppmp/[id]/edit

---

# PPMP Dashboard

Display

Draft PPMP

Submitted PPMP

Approved PPMP

Rejected PPMP

Archived PPMP

Each card displays

PPMP Number

Department

Fiscal Year

Status

Estimated Budget

Last Updated

---

# Create PPMP

Sections

General Information

Products

Budget Summary

Attachments

Remarks

---

# General Information

PPMP Number

Project Title

Department

Office

Funding Source

Fiscal Year

Prepared By

Procurement Schedule

Remarks

---

# Product List

Products must originate from the Procurement Marketplace.

Columns

Product

Brand

Category

Quantity

Unit

Estimated Unit Cost

Estimated Total Cost

Schedule

Actions

Users can

Increase Quantity

Remove Item

Update Schedule

---

# Budget Summary

Display

Estimated Budget

Total Estimated Cost

Remaining Budget

Budget Status

Warnings

Over Budget

Within Budget

---

# Validation

Prevent

Duplicate Products

Zero Quantity

Negative Budget

Inactive Products

Missing Required Fields

---

# Status Workflow

Draft

↓

Submitted

↓

Reviewed

↓

Approved

OR

Rejected

---

# Approval History

Display

Status

Date

Reviewed By

Remarks

Rejection Reason

---

# Integration

Marketplace

↓

PPMP

↓

Purchase Request

Generate Purchase Request automatically after approval.

---

# Database

Use

Ppmp

PpmpItem

CatalogProduct

Category

UnitOfMeasure

DepartmentBudget

AuditTrail

---

# Components

PPMPDashboard

PPMPCard

PPMPForm

PPMPItemsTable

BudgetSummary

ApprovalHistory

StatusBadge

EmptyState

LoadingSkeleton

---

# Technical Requirements

Next.js 15

Server Components

Server Actions

Prisma

TailwindCSS

shadcn/ui (if installed)

Zod Validation

React Hook Form

---

# Business Rules

Only Procurement/Admin can approve.

Drafts are editable.

Approved PPMP cannot be edited.

Rejected PPMP can be revised.

Every status change creates an Audit Log.

---

# Definition of Done

Create PPMP.

Edit PPMP.

Delete Draft.

Submit.

Approve.

Reject.

Budget Validation.

Audit Logging.

Marketplace Integration.

Generate Purchase Request.

Responsive.

Production Ready.