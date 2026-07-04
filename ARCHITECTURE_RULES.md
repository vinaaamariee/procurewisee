# ProcureWise Architecture Rules

## Folder Structure

Use feature-based architecture.

Example

src/

features/

catalog/

ppmp/

purchase-request/

rfq/

dashboard/

recommendation/

---

## Components

Prefer reusable components.

Never duplicate cards.

Never duplicate buttons.

Never duplicate dialogs.

---

## Database

Use Prisma only.

No raw SQL.

No duplicated queries.

---

## React

Prefer Server Components.

Client Components only for

- Forms

- Search

- Charts

- Dialogs

---

## Styling

TailwindCSS

shadcn/ui

No Bootstrap

No Material UI

No Chakra UI

---

## Design

Government portal.

Professional.

Modern.

Not e-commerce.

Shopping-inspired only.

---

## Data

Never hardcode.

Always fetch from Prisma.

If no data exists

Show elegant Empty State.

---

## Naming

Use PascalCase for components.

camelCase for functions.

No abbreviations.

---

## APIs

RESTful.

Reusable.

Typed.

Validate using Zod.

---

## Quality

Production-ready code only.

No TODO comments.

No placeholder text.

No fake data.

Explain every created or modified file.