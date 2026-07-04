# PROCUREWISE

Title:

PROCUREWISE: An Intelligent Procurement Analytics and Automated Canvassing System with Best-Value Recommendation Engine

Institution:

Batanes State College

Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui
- Prisma
- PostgreSQL
- Supabase
- React Hook Form
- Zod
- Recharts

----------------------------------------

PROJECT GOAL

ProcureWise digitizes the procurement process of Batanes State College.

Procurement Workflow

Market Scoping

↓

Pre-Canvassing

↓

PPMP

↓

Purchase Request

↓

Procurement Review

↓

Tracking Number

↓

RFQ

↓

Supplier Quotations

↓

Canvas Abstract

↓

Best Value Recommendation

↓

Purchase Order

↓

Acknowledgement Receipt

↓

Reports

----------------------------------------

SYSTEM USERS

Administrator

- Manage users
- Manage forms
- Manage audit logs
- Manage workflows

Procurement Officer

- Manage catalog
- Manage PPMP
- Manage PR
- Manage RFQ
- Encode quotations
- Generate recommendations
- Generate PO

Administrative Approver

- Review recommendations
- Approve procurement

End User

NO LOGIN REQUIRED

Can

- Browse catalog
- Search products
- Compare prices
- Create PPMP
- Create Purchase Request
- Track requests

Supplier

DOES NOT LOGIN.

Supplier prices are encoded by Procurement Office.

----------------------------------------

DESIGN GOALS

Professional

Government

Modern

Shopping-style

Minimal

Responsive

Use shadcn/ui components.

Never use Bootstrap.

----------------------------------------

Always follow the existing Prisma schema.

When implementing features:

- Use Zod for runtime validation and type safety
- Use React Hook Form for all forms
- Use TailwindCSS classes directly (no CSS modules)
- Use shadcn/ui components for UI elements
- Use Recharts for all data visualizations